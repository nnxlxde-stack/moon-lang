import MoonAST
import MoonMoonfile
import MoonPlanner

func executeDag(_ dag: ExecutionDag, _ block: DoBlock, _ ctx: RuntimeContext) async throws {
    var completed = Set<String>()
    var pending = Set(dag.nodes.map(\.id))

    while !pending.isEmpty {
        let ready = dag.nodes.filter { node in
            pending.contains(node.id) && node.dependencies.allSatisfy { completed.contains($0) }
        }

        if ready.isEmpty {
            throw RuntimeError("DAG deadlock — cyclic dependencies")
        }

        try await withThrowingTaskGroup(of: String.self) { group in
            for node in ready {
                group.addTask {
                    try await executeDagNode(node, dag, block, ctx)
                    return node.id
                }
            }

            for try await nodeId in group {
                pending.remove(nodeId)
                completed.insert(nodeId)
            }
        }
    }

    ctx.env["_result"] = .null
}

private func executeDagNode(
    _ node: DagNode,
    _ dag: ExecutionDag,
    _ block: DoBlock,
    _ ctx: RuntimeContext
) async throws {
    let stmt = block.statements[node.stmtIndex]

    if node.kind == .mapM, case .bind(_, let expr, _, _) = stmt {
        if let mapM = detectMapM(expr), let listVar = node.mapMListVar {
            let list = ctx.env[listVar] ?? .array([])
            let fn = try await evalExpr(mapM.funcExpr, ctx)
            let tier = tierForMapM(node.mapMFunc ?? "", ctx)

            let results: [RuntimeValue]
            if case .array(let items) = list {
                results = try await ctx.pool.runAll(tier, items.map { item in
                    { try await applyFn(fn, item, ctx) }
                })
            } else {
                results = []
            }

            ctx.env["__mapM_\(node.id)"] = .array(results)
            return
        }
    }

    if node.kind == .mapM_join {
        let parent = dag.nodes.first { $0.kind == .mapM && node.dependencies.contains($0.id) }
        let results = parent.flatMap { ctx.env["__mapM_\($0.id)"] } ?? .array([])
        if let bindVar = node.bindVar {
            ctx.env[bindVar] = results
        }
        return
    }

    switch stmt {
    case .storm:
        let value = try await runStormStmt(stmt, ctx)
        if let bindVar = node.bindVar {
            ctx.env[bindVar] = value
        }
    case .bind(let pattern, let expr, let config, _):
        var value = try await evalExprWithConfig(expr, ctx, config: config)
        value = try await applyBindConfig(value, config, ctx)
        if let bindVar = node.bindVar {
            ctx.env[bindVar] = value
        } else {
            bindPattern(pattern, value, ctx)
        }
    default:
        _ = try await runDoStmt(stmt, ctx)
    }
}

private func tierForMapM(_ mapMFunc: String, _ ctx: RuntimeContext) -> ModelTier {
    let candidates = mapMFunc.split(whereSeparator: { !$0.isLetter && !$0.isNumber }).map(String.init)
    for name in candidates where name.first?.isUppercase == true {
        if let agent = ctx.agents[name] {
            return modelToTier(agentModel(agent))
        }
    }
    return .pro
}

func applyFn(_ fn: RuntimeValue, _ arg: RuntimeValue, _ ctx: RuntimeContext) async throws -> RuntimeValue {
    if case .callable(let box) = fn {
        return try await box.fn(arg, ctx)
    }
    return try await applyValue(fn, arg, ctx)
}

public struct ProgramRunOptions: Sendable {
    public var functionName: String
    public var entryPath: String?
    public var projectRoot: String?
    public var overrides: RuntimeConfigOverrides
    public var llm: LlmClient?
    public var workerPool: WorkerPool?
    public var traceLlm: Bool
    public var traceDir: String?

    public init(
        functionName: String = "main",
        entryPath: String? = nil,
        projectRoot: String? = nil,
        overrides: RuntimeConfigOverrides = RuntimeConfigOverrides(),
        llm: LlmClient? = nil,
        workerPool: WorkerPool? = nil,
        traceLlm: Bool = false,
        traceDir: String? = nil
    ) {
        self.functionName = functionName
        self.entryPath = entryPath
        self.projectRoot = projectRoot
        self.overrides = overrides
        self.llm = llm
        self.workerPool = workerPool
        self.traceLlm = traceLlm
        self.traceDir = traceDir
    }
}

public func runProgram(_ program: Program, options: ProgramRunOptions = ProgramRunOptions()) async throws -> ProgramRunResult {
    let functionName = options.functionName
    guard let dag = planFunction(program, functionName: functionName) else {
        throw RuntimeError("Function not found: \(functionName)")
    }
    guard let block = findFunction(program, name: functionName) else {
        throw RuntimeError("Function body not found: \(functionName)")
    }

    var mergedOverrides = options.overrides
    if let projectRoot = options.projectRoot,
       let moonfilePath = findMoonfile(startDir: projectRoot),
       let moonfile = try? loadMoonfile(path: moonfilePath) {
        mergedOverrides = mergeRuntimeOverrides(
            runtimeOverrides(from: moonfileToRuntimeOverrides(moonfile)),
            mergedOverrides
        )
    }
    let runtimeConfig = loadRuntimeConfig(overrides: mergedOverrides)
    configureTokenizer(path: runtimeConfig.tokenizerPath)
    let metrics = MetricsCollector(pricing: runtimeConfig.pricing)

    var llm: LlmClient = options.llm ?? createLlmClient(config: runtimeConfig, metrics: metrics)
    if options.traceLlm {
        let writer = try await LlmTraceWriter.create(baseDir: options.traceDir)
        llm = TracingLlmClient(client: llm, writer: writer)
    }

    let pool = options.workerPool ?? WorkerPool(config: WorkerPoolConfig(
        flashConcurrency: runtimeConfig.flashConcurrency,
        proConcurrency: runtimeConfig.proConcurrency,
        onAcquire: { tier, active in metrics.recordWorkerStart(tier: tier, concurrent: active) }
    ))

    let ctx = RuntimeContext(
        program: program,
        agents: collectAgents(program),
        builtins: builtinsFromImports(program),
        llm: llm,
        memory: MemoryManager(longTermPath: runtimeConfig.longTermMemoryPath, metrics: metrics),
        pool: pool,
        metrics: metrics,
        schemas: compiledSchemasForRuntime(program),
        systemSuffix: runtimeConfig.systemSuffix
    )

    try await executeDag(dag, block, ctx)

    return ProgramRunResult(
        value: ctx.env["_result"] ?? .null,
        effects: ctx.effects,
        dag: dag,
        metrics: metrics.snapshot()
    )
}
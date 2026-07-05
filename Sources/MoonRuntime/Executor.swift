import MoonAST
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

        for node in ready {
            let stmt = block.statements[node.stmtIndex]

            if node.kind == .mapM, case .bind(_, let expr, _, _) = stmt {
                if let mapM = detectMapM(expr), let listVar = node.mapMListVar {
                    let list = ctx.env[listVar] ?? .array([])
                    let fn = try await evalExpr(mapM.funcExpr, ctx)
                    var results: [RuntimeValue] = []
                    if case .array(let items) = list {
                        for item in items {
                            results.append(try await applyFn(fn, item, ctx))
                        }
                    }
                    ctx.env["__mapM_\(node.id)"] = .array(results)
                    pending.remove(node.id)
                    completed.insert(node.id)
                    continue
                }
            }

            if node.kind == .mapM_join {
                let parent = dag.nodes.first { $0.kind == .mapM && node.dependencies.contains($0.id) }
                let results = parent.flatMap { ctx.env["__mapM_\($0.id)"] } ?? .array([])
                if let bindVar = node.bindVar {
                    ctx.env[bindVar] = results
                }
                pending.remove(node.id)
                completed.insert(node.id)
                continue
            }

            switch stmt {
            case .storm:
                throw RuntimeError("Storm statements are not yet supported")
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

            pending.remove(node.id)
            completed.insert(node.id)
        }
    }

    ctx.env["_result"] = .null
}

private func applyFn(_ fn: RuntimeValue, _ arg: RuntimeValue, _ ctx: RuntimeContext) async throws -> RuntimeValue {
    if case .callable(let box) = fn {
        return try await box.fn(arg, ctx)
    }
    return try await applyValue(fn, arg, ctx)
}

public func runProgram(_ program: Program, options: RunOptions = RunOptions()) async throws -> ProgramRunResult {
    let functionName = options.entryFunction
    guard let dag = planFunction(program, functionName: functionName) else {
        throw RuntimeError("Function not found: \(functionName)")
    }
    guard let block = findFunction(program, name: functionName) else {
        throw RuntimeError("Function body not found: \(functionName)")
    }

    let llm: LlmClient = options.llm ?? MockLlmClient()
    let ctx = RuntimeContext(
        program: program,
        agents: collectAgents(program),
        builtins: builtinsFromImports(program),
        llm: llm
    )

    try await executeDag(dag, block, ctx)

    return ProgramRunResult(
        value: ctx.env["_result"] ?? .null,
        effects: ctx.effects,
        dag: dag,
        metrics: RunMetrics(llmCalls: 0)
    )
}
import Foundation
import MoonAST
import MoonMoonfile

public func isAppMainProgram(_ program: Program) -> Bool {
    guard let decl = findUserFunction(program, "main"),
          let eq = decl.equations.first(where: { $0.name == "main" }) else {
        return false
    }
    if case .expression = eq.body { return true }
    return false
}

public func evaluateAppMain(
    _ program: Program,
    options: ProgramRunOptions = ProgramRunOptions()
) async throws -> RuntimeValue {
    guard let mainDecl = findUserFunction(program, "main") else {
        throw RuntimeError("Function not found: main")
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
    let metrics = MetricsCollector(pricing: runtimeConfig.pricing)
    var llm: LlmClient = options.llm ?? createLlmClient(config: runtimeConfig, metrics: metrics)
    if options.traceLlm {
        let writer = try await LlmTraceWriter.create(baseDir: options.traceDir)
        llm = TracingLlmClient(client: llm, writer: writer)
    }

    let ctx = RuntimeContext(
        program: program,
        agents: collectAgents(program),
        builtins: builtinsFromImports(program),
        constructors: collectDataConstructors(program),
        llm: llm,
        memory: MemoryManager(longTermPath: runtimeConfig.longTermMemoryPath, metrics: metrics),
        pool: options.workerPool ?? WorkerPool(config: WorkerPoolConfig(
            flashConcurrency: runtimeConfig.flashConcurrency,
            proConcurrency: runtimeConfig.proConcurrency
        )),
        metrics: metrics,
        schemas: compiledSchemasForRuntime(program),
        systemSuffix: runtimeConfig.systemSuffix
    )

    return try await callUserFunction(mainDecl, args: [], ctx: ctx)
}

public func applyRuntimeFunction(
    _ fn: RuntimeValue,
    _ arg: RuntimeValue,
    ctx: RuntimeContext
) async throws -> RuntimeValue {
    try await applyFn(fn, arg, ctx)
}
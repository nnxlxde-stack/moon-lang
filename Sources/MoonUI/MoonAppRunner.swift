import Foundation
import MoonAST
import MoonRuntime

public final class MoonAppSession: @unchecked Sendable {
    public let ctx: RuntimeContext
    public let updateFn: RuntimeValue
    public let viewFn: RuntimeValue
    public var model: RuntimeValue
    public let options: MoonUIRunOptions

    init(
        ctx: RuntimeContext,
        updateFn: RuntimeValue,
        viewFn: RuntimeValue,
        model: RuntimeValue,
        options: MoonUIRunOptions
    ) {
        self.ctx = ctx
        self.updateFn = updateFn
        self.viewFn = viewFn
        self.model = model
        self.options = options
    }
}

public struct MoonAppRunner {
    public init() {}

    public func load(program: Program, options: MoonUIRunOptions) async throws -> MoonAppSession {
        let appValue = try await evaluateAppMain(
            program,
            options: ProgramRunOptions(overrides: RuntimeConfigOverrides(mock: options.mock))
        )
        guard case .record(let typeName, let fields) = appValue, typeName == "App" else {
            throw MoonUIError.invalidApp("main must evaluate to App {...}")
        }

        guard let initValue = fields["init"],
              let updateFn = fields["update"],
              let viewFn = fields["view"] else {
            throw MoonUIError.invalidApp("App must provide init, update, and view")
        }

        let (model, _) = try unpackInit(initValue)
        let ctx = try await makeRuntimeContext(program: program, options: options)
        return MoonAppSession(
            ctx: ctx,
            updateFn: updateFn,
            viewFn: viewFn,
            model: model,
            options: options
        )
    }

    private func makeRuntimeContext(program: Program, options: MoonUIRunOptions) async throws -> RuntimeContext {
        let runtimeConfig = loadRuntimeConfig(overrides: RuntimeConfigOverrides(mock: options.mock))
        let metrics = MetricsCollector(pricing: runtimeConfig.pricing)
        let llm = createLlmClient(config: runtimeConfig, metrics: metrics)
        return RuntimeContext(
            program: program,
            agents: collectAgents(program),
            builtins: builtinsFromImports(program),
            llm: llm,
            memory: MemoryManager(longTermPath: runtimeConfig.longTermMemoryPath, metrics: metrics),
            pool: WorkerPool(config: WorkerPoolConfig(
                flashConcurrency: runtimeConfig.flashConcurrency,
                proConcurrency: runtimeConfig.proConcurrency
            )),
            metrics: metrics,
            schemas: compiledSchemasForRuntime(program),
            systemSuffix: runtimeConfig.systemSuffix
        )
    }

    private func unpackInit(_ value: RuntimeValue) throws -> (RuntimeValue, RuntimeValue) {
        if case .array(let items) = value, items.count >= 2 {
            return (items[0], items[1])
        }
        if case .record(_, let fields) = value,
           let model = fields["model"] ?? fields["fst"],
           let cmd = fields["cmd"] ?? fields["snd"] {
            return (model, cmd)
        }
        throw MoonUIError.invalidApp("App.init must be a (model, Cmd) pair")
    }
}

extension MoonAppSession {
    func viewElement() async throws -> RuntimeValue {
        try await applyRuntimeFunction(viewFn, model, ctx: ctx)
    }

    func dispatchMessage(_ msg: RuntimeValue) async throws {
        let updateApplied = try await applyRuntimeFunction(updateFn, msg, ctx: ctx)
        let pair = try await applyRuntimeFunction(updateApplied, model, ctx: ctx)
        if case .array(let items) = pair, items.count >= 2 {
            model = items[0]
            let dispatcher = CmdDispatcher(ctx: ctx)
            if let nextMsg = await dispatcher.dispatch(items[1]) {
                try await dispatchMessage(nextMsg)
            }
            return
        }
        throw MoonUIError.invalidApp("update must return (model, Cmd)")
    }

    func buildScene(width: Float, height: Float) async throws -> SceneNode {
        let element = try await viewElement()
        return try SceneBuilder.build(element: element, viewportWidth: width, viewportHeight: height)
    }
}
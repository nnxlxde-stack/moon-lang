import MoonAST
import MoonPlanner

public enum MoonRuntimeVersion {
    public static let current = "0.4.0"
}

public struct RunOptions: Sendable {
    public var mock: Bool
    public var entryFunction: String
    public var traceLlm: Bool
    public var showMetrics: Bool
    public var llm: LlmClient?

    public init(
        mock: Bool = true,
        entryFunction: String = "main",
        traceLlm: Bool = false,
        showMetrics: Bool = false,
        llm: LlmClient? = nil
    ) {
        self.mock = mock
        self.entryFunction = entryFunction
        self.traceLlm = traceLlm
        self.showMetrics = showMetrics
        self.llm = llm
    }
}

public struct RunResult: Sendable {
    public var success: Bool
    public var message: String
    public var effects: [RuntimeEffect]
    public var dag: ExecutionDag?
    public var metrics: RunMetrics?

    public init(
        success: Bool,
        message: String,
        effects: [RuntimeEffect] = [],
        dag: ExecutionDag? = nil,
        metrics: RunMetrics? = nil
    ) {
        self.success = success
        self.message = message
        self.effects = effects
        self.dag = dag
        self.metrics = metrics
    }
}

public struct MoonRuntime {
    public init() {}

    public func run(program: Program, options: RunOptions = RunOptions()) async -> RunResult {
        do {
            let result = try await runProgram(program, options: ProgramRunOptions(
                functionName: options.entryFunction,
                overrides: RuntimeConfigOverrides(mock: options.mock),
                llm: options.llm,
                traceLlm: options.traceLlm
            ))
            var message = "OK (\(result.dag.nodes.count) DAG nodes)"
            if options.showMetrics {
                message += "\n" + formatMetrics(result.metrics)
            }
            return RunResult(
                success: true,
                message: message,
                effects: result.effects,
                dag: result.dag,
                metrics: result.metrics
            )
        } catch {
            return RunResult(success: false, message: error.localizedDescription)
        }
    }
}
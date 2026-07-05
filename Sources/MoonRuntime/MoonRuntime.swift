import MoonAST
import MoonPlanner

public enum MoonRuntimeVersion {
    public static let current = "0.3.0"
}

public struct RunOptions: Sendable {
    public var mock: Bool
    public var entryFunction: String
    public var llm: LlmClient?

    public init(mock: Bool = true, entryFunction: String = "main", llm: LlmClient? = nil) {
        self.mock = mock
        self.entryFunction = entryFunction
        self.llm = mock ? (llm ?? MockLlmClient()) : llm
    }
}

public struct RunResult: Sendable {
    public var success: Bool
    public var message: String
    public var effects: [RuntimeEffect]
    public var dag: ExecutionDag?

    public init(success: Bool, message: String, effects: [RuntimeEffect] = [], dag: ExecutionDag? = nil) {
        self.success = success
        self.message = message
        self.effects = effects
        self.dag = dag
    }
}

public struct MoonRuntime {
    public init() {}

    public func run(program: Program, options: RunOptions = RunOptions()) async -> RunResult {
        do {
            let result = try await runProgram(program, options: options)
            let effectKinds = result.effects.map(\.kind).joined(separator: ", ")
            return RunResult(
                success: true,
                message: "OK (\(result.dag.nodes.count) DAG nodes, effects: \(effectKinds))",
                effects: result.effects,
                dag: result.dag
            )
        } catch {
            return RunResult(success: false, message: error.localizedDescription)
        }
    }
}
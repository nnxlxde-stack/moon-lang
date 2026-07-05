import Foundation
import MoonAST
import MoonPlanner

public struct RuntimeEffect: Sendable, Equatable {
    public var kind: String
    public var detail: [String: String]

    public init(kind: String, detail: [String: String] = [:]) {
        self.kind = kind
        self.detail = detail
    }
}

public enum RuntimeValue: Sendable {
    case null
    case bool(Bool)
    case int(Int)
    case double(Double)
    case string(String)
    case array([RuntimeValue])
    case record(typeName: String?, fields: [String: RuntimeValue])
    case symbol(String)
    case agentMethod(agent: String, method: String)
    case callable(RuntimeCallableBox)
}

public final class RuntimeCallableBox: @unchecked Sendable {
    public let fn: @Sendable (RuntimeValue, RuntimeContext) async throws -> RuntimeValue

    public init(_ fn: @escaping @Sendable (RuntimeValue, RuntimeContext) async throws -> RuntimeValue) {
        self.fn = fn
    }
}

public final class RuntimeContext: @unchecked Sendable {
    public var program: Program
    public var agents: [String: AgentDecl]
    public var env: [String: RuntimeValue]
    public var effects: [RuntimeEffect]
    public var builtins: Set<String>
    public var llm: LlmClient
    public var memory: MemoryManager
    public var pool: WorkerPool
    public var metrics: MetricsCollector?

    public init(
        program: Program,
        agents: [String: AgentDecl],
        env: [String: RuntimeValue] = [:],
        effects: [RuntimeEffect] = [],
        builtins: Set<String>,
        llm: LlmClient,
        memory: MemoryManager = MemoryManager(),
        pool: WorkerPool = WorkerPool(),
        metrics: MetricsCollector? = nil
    ) {
        self.program = program
        self.agents = agents
        self.env = env
        self.effects = effects
        self.builtins = builtins
        self.llm = llm
        self.memory = memory
        self.pool = pool
        self.metrics = metrics
    }

    public func childEnv(_ bindings: [String: RuntimeValue]) -> RuntimeContext {
        var merged = env
        for (k, v) in bindings { merged[k] = v }
        return RuntimeContext(
            program: program,
            agents: agents,
            env: merged,
            effects: effects,
            builtins: builtins,
            llm: llm,
            memory: memory,
            pool: pool,
            metrics: metrics
        )
    }
}

public struct LlmRequest: Sendable {
    public var agent: String
    public var model: String
    public var input: RuntimeValue
    public var schema: JsonSchema

    public init(agent: String, model: String, input: RuntimeValue, schema: JsonSchema) {
        self.agent = agent
        self.model = model
        self.input = input
        self.schema = schema
    }
}

public protocol LlmClient: Sendable {
    func complete(_ request: LlmRequest) async throws -> RuntimeValue
}

public indirect enum JsonSchema: Sendable, Equatable {
    case object(
        properties: [String: JsonSchema]? = nil,
        required: [String]? = nil
    )
    case array(items: JsonSchema? = nil)
    case string(enumValues: [String]? = nil)
    case integer
    case number(minimum: Double? = nil, maximum: Double? = nil)
    case boolean

    public var typeName: String? {
        switch self {
        case .object: return "object"
        case .array: return "array"
        case .string: return "string"
        case .integer: return "integer"
        case .number: return "number"
        case .boolean: return "boolean"
        }
    }
}

public struct RunMetrics: Sendable, Equatable {
    public var llmCalls: Int
    public var tokens: TokenUsage
    public var costUsd: Double
    public var memory: MemoryMetrics
    public var worker: WorkerMetrics
    public var byModel: [String: ModelMetrics]

    public init(
        llmCalls: Int = 0,
        tokens: TokenUsage = TokenUsage(),
        costUsd: Double = 0,
        memory: MemoryMetrics = MemoryMetrics(),
        worker: WorkerMetrics = WorkerMetrics(),
        byModel: [String: ModelMetrics] = [:]
    ) {
        self.llmCalls = llmCalls
        self.tokens = tokens
        self.costUsd = costUsd
        self.memory = memory
        self.worker = worker
        self.byModel = byModel
    }
}

public struct ProgramRunResult: Sendable {
    public var value: RuntimeValue
    public var effects: [RuntimeEffect]
    public var dag: ExecutionDag
    public var metrics: RunMetrics

    public init(value: RuntimeValue, effects: [RuntimeEffect], dag: ExecutionDag, metrics: RunMetrics) {
        self.value = value
        self.effects = effects
        self.dag = dag
        self.metrics = metrics
    }
}

public struct RuntimeError: Error, CustomStringConvertible {
    public var message: String

    public init(_ message: String) {
        self.message = message
    }

    public var description: String { message }
}
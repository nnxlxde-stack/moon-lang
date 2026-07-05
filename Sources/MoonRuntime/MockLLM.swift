import Foundation

public func fixtureFromSchema(_ schema: JsonSchema, path: String = "root") -> RuntimeValue {
    switch schema {
    case .string(let enumValues):
        if let first = enumValues?.first { return .string(first) }
        return .string("mock-\(path)")
    case .integer:
        return .int(1)
    case .number(let minimum, _):
        return .double(minimum ?? 0.5)
    case .boolean:
        return .bool(true)
    case .array(let items):
        if let items {
            return .array([fixtureFromSchema(items, path: "\(path)[0]")])
        }
        return .array([])
    case .object(let properties, _):
        var fields: [String: RuntimeValue] = [:]
        if let properties {
            for (key, prop) in properties {
                fields[key] = fixtureFromSchema(prop, path: "\(path).\(key)")
            }
        }
        return .record(typeName: nil, fields: fields)
    }
}

public final class MockLlmClient: LlmClient, @unchecked Sendable {
    public private(set) var callCount: Int = 0
    private let metrics: MetricsCollector?
    private let pricing: PricingTable?

    public init(metrics: MetricsCollector? = nil, pricing: PricingTable? = nil) {
        self.metrics = metrics
        self.pricing = pricing
    }

    public func complete(_ request: LlmRequest) async throws -> RuntimeValue {
        callCount += 1
        let output = fixtureFromSchema(request.schema)

        if let metrics, let pricing {
            let promptText = (request.messages ?? buildMessages(request))
                .map(\.content)
                .joined(separator: "\n")
            let outputText = runtimeValueDescription(output)
            let promptTokens = countTokens(promptText, model: request.model, pricing: pricing)
            let completionTokens = countTokens(outputText, model: request.model, pricing: pricing)
            metrics.recordLlmUsage(
                model: request.model,
                usage: TokenUsage(
                    prompt: promptTokens,
                    completion: completionTokens,
                    cacheHit: 0,
                    cacheMiss: promptTokens
                )
            )
        }

        return output
    }
}
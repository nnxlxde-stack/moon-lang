import Foundation
#if canImport(FoundationNetworking)
import FoundationNetworking
#endif

public struct DeepSeekClientConfig: Sendable {
    public var apiKey: String
    public var baseUrl: String?
    public var apiFormat: DeepSeekApiFormat?
    public var useBeta: Bool?
    public var maxRepairAttempts: Int
    public var metrics: MetricsCollector?
    public var pricing: PricingTable?

    public init(
        apiKey: String,
        baseUrl: String? = nil,
        apiFormat: DeepSeekApiFormat? = nil,
        useBeta: Bool? = nil,
        maxRepairAttempts: Int = 1,
        metrics: MetricsCollector? = nil,
        pricing: PricingTable? = nil
    ) {
        self.apiKey = apiKey
        self.baseUrl = baseUrl
        self.apiFormat = apiFormat
        self.useBeta = useBeta
        self.maxRepairAttempts = maxRepairAttempts
        self.metrics = metrics
        self.pricing = pricing
    }
}

public final class DeepSeekClient: LlmClient, @unchecked Sendable {
    private let config: DeepSeekClientConfig
    private let api: ResolvedDeepSeekApi
    private let session: URLSession
    public private(set) var attempts: Int = 0

    public init(config: DeepSeekClientConfig, session: URLSession = .shared) {
        self.config = config
        self.api = resolveDeepSeekApi(
            baseUrl: config.baseUrl,
            apiFormat: config.apiFormat,
            useBeta: config.useBeta
        )
        self.session = session
    }

    public func complete(_ request: LlmRequest) async throws -> RuntimeValue {
        let messages = buildMessages(request)
        var lastError: LlmValidationError?
        var repairHint: String?

        for attempt in 0...config.maxRepairAttempts {
            attempts += 1
            let attemptCount = attempts

            let raw: String
            let usage: TokenUsage
            if api.format == .anthropic {
                let (payload, content) = try await callAnthropic(request, messages: messages, repairHint: repairHint)
                raw = content
                usage = usageFromAnthropic(payload, request: request, rawOutput: raw)
            } else {
                let (payload, content) = try await callOpenAi(request, messages: messages, repairHint: repairHint)
                raw = content
                usage = usageFromOpenAi(payload, request: request, rawOutput: raw)
            }

            do {
                let parsed = try parseJsonContent(raw)
                try validateAgainstSchema(request.schema, parsed)
                config.metrics?.recordLlmUsage(model: request.model, usage: usage, attempts: attemptCount)
                return parsed
            } catch let err as LlmValidationError {
                lastError = err
                repairHint = err.message
                if attempt >= config.maxRepairAttempts { break }
            }
        }

        throw lastError ?? LlmValidationError("Failed to obtain valid LLM response")
    }

    private func callOpenAi(
        _ request: LlmRequest,
        messages: [LlmChatMessage],
        repairHint: String?
    ) async throws -> ([String: Any], String) {
        let body = buildOpenAiRequestBody(request, messages: messages, repairHint: repairHint)
        let data = try JSONSerialization.data(withJSONObject: body)
        let url = URL(string: api.baseUrl + api.endpoint)!
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(config.apiKey)", forHTTPHeaderField: "Authorization")
        req.httpBody = data

        let (responseData, response) = try await session.data(for: req)
        guard let http = response as? HTTPURLResponse else {
            throw LlmApiError("Invalid HTTP response")
        }
        if http.statusCode >= 400 {
            let text = String(data: responseData, encoding: .utf8) ?? ""
            throw LlmApiError("DeepSeek API error \(http.statusCode): \(text)", status: http.statusCode)
        }

        let payload = (try JSONSerialization.jsonObject(with: responseData) as? [String: Any]) ?? [:]
        return (payload, extractOpenAiContent(payload))
    }

    private func callAnthropic(
        _ request: LlmRequest,
        messages: [LlmChatMessage],
        repairHint: String?
    ) async throws -> ([String: Any], String) {
        let body = buildAnthropicRequestBody(request, messages: messages, repairHint: repairHint)
        let data = try JSONSerialization.data(withJSONObject: body)
        let url = URL(string: api.baseUrl + api.endpoint)!
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue(config.apiKey, forHTTPHeaderField: "x-api-key")
        req.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")
        req.httpBody = data

        let (responseData, response) = try await session.data(for: req)
        guard let http = response as? HTTPURLResponse else {
            throw LlmApiError("Invalid HTTP response")
        }
        if http.statusCode >= 400 {
            let text = String(data: responseData, encoding: .utf8) ?? ""
            throw LlmApiError("DeepSeek Anthropic API error \(http.statusCode): \(text)", status: http.statusCode)
        }

        let payload = (try JSONSerialization.jsonObject(with: responseData) as? [String: Any]) ?? [:]
        return (payload, extractAnthropicContent(payload))
    }
}

func buildMessages(_ request: LlmRequest) -> [LlmChatMessage] {
    if let messages = request.messages, !messages.isEmpty {
        return messages
    }
    let system = request.systemPrompt
        ?? "You are a Moon language agent. Respond with JSON only, matching the provided schema."
    let user = (try? encodeRuntimeValueJSON([
        "input": runtimeValueToJSON(request.input),
        "config": request.config.mapValues(runtimeValueToJSON),
    ])) ?? "{}"
    return [
        LlmChatMessage(role: "system", content: system),
        LlmChatMessage(role: "user", content: user),
    ]
}

func buildOpenAiRequestBody(
    _ request: LlmRequest,
    messages: [LlmChatMessage],
    repairHint: String?
) -> [String: Any] {
    var finalMessages = messages.map { ["role": $0.role, "content": $0.content] }
    if let repairHint {
        finalMessages.append([
            "role": "user",
            "content": "Your previous response failed validation: \(repairHint). Return ONLY valid JSON matching the schema.",
        ])
    }

    let temperature = request.temperature ?? configDouble(request.config["temperature"]) ?? 0.25
    var body: [String: Any] = [
        "model": request.model,
        "messages": finalMessages,
        "temperature": temperature,
        "response_format": [
            "type": "json_schema",
            "json_schema": [
                "name": "\(request.agent)Output",
                "strict": true,
                "schema": toStrictJsonSchema(request.schema),
            ],
        ],
    ]
    if let maxTokens = configInt(request.config["maxTokens"]) {
        body["max_tokens"] = maxTokens
    }
    return body
}

func buildAnthropicRequestBody(
    _ request: LlmRequest,
    messages: [LlmChatMessage],
    repairHint: String?
) -> [String: Any] {
    let systemParts = messages.filter { $0.role == "system" }.map(\.content)
    let userParts = messages.filter { $0.role != "system" }
    let schemaHint = "Respond with valid JSON only, matching this schema:\n"
        + ((try? String(data: JSONSerialization.data(withJSONObject: toStrictJsonSchema(request.schema), options: [.prettyPrinted]), encoding: .utf8)) ?? "{}")
    let system = (systemParts + [schemaHint]).joined(separator: "\n\n")

    var anthropicMessages: [[String: Any]] = userParts.map {
        [
            "role": $0.role == "assistant" ? "assistant" : "user",
            "content": [["type": "text", "text": $0.content]],
        ]
    }
    if let repairHint {
        anthropicMessages.append([
            "role": "user",
            "content": [["type": "text", "text": "Your previous response failed validation: \(repairHint). Return ONLY valid JSON."]],
        ])
    }

    let temperature = request.temperature ?? configDouble(request.config["temperature"]) ?? 0.25
    let maxTokens = configInt(request.config["maxTokens"]) ?? 4096
    return [
        "model": request.model,
        "max_tokens": maxTokens,
        "system": system,
        "messages": anthropicMessages,
        "temperature": temperature,
    ]
}

func extractOpenAiContent(_ payload: [String: Any]) -> String {
    guard let choices = payload["choices"] as? [[String: Any]],
          let message = choices.first?["message"] as? [String: Any] else {
        return ""
    }
    if let content = message["content"] as? String, !content.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
        return content.trimmingCharacters(in: .whitespacesAndNewlines)
    }
    if let reasoning = message["reasoning_content"] as? String, !reasoning.isEmpty {
        return reasoning.trimmingCharacters(in: .whitespacesAndNewlines)
    }
    if let reasoning = message["reasoning"] as? String, !reasoning.isEmpty {
        return reasoning.trimmingCharacters(in: .whitespacesAndNewlines)
    }
    return ""
}

func extractAnthropicContent(_ payload: [String: Any]) -> String {
    guard let content = payload["content"] as? [[String: Any]] else { return "" }
    return content
        .filter { ($0["type"] as? String) == "text" }
        .compactMap { $0["text"] as? String }
        .joined(separator: "\n")
        .trimmingCharacters(in: .whitespacesAndNewlines)
}

func usageFromOpenAi(_ payload: [String: Any], request: LlmRequest, rawOutput: String) -> TokenUsage {
    guard let usage = payload["usage"] as? [String: Any] else {
        return TokenUsage()
    }
    let cacheHit = usage["prompt_cache_hit_tokens"] as? Int ?? 0
    let cacheMiss = usage["prompt_cache_miss_tokens"] as? Int
        ?? max(0, (usage["prompt_tokens"] as? Int ?? 0) - cacheHit)
    return TokenUsage(
        prompt: usage["prompt_tokens"] as? Int ?? cacheHit + cacheMiss,
        completion: usage["completion_tokens"] as? Int ?? 0,
        cacheHit: cacheHit,
        cacheMiss: cacheMiss
    )
}

func usageFromAnthropic(_ payload: [String: Any], request: LlmRequest, rawOutput: String) -> TokenUsage {
    guard let usage = payload["usage"] as? [String: Any] else {
        return TokenUsage()
    }
    let cacheHit = usage["cache_read_input_tokens"] as? Int ?? 0
    let prompt = usage["input_tokens"] as? Int ?? 0
    return TokenUsage(
        prompt: prompt,
        completion: usage["output_tokens"] as? Int ?? 0,
        cacheHit: cacheHit,
        cacheMiss: max(0, prompt - cacheHit)
    )
}

public func toStrictJsonSchema(_ schema: JsonSchema) -> [String: Any] {
    switch schema {
    case .object(let properties, let required):
        var result: [String: Any] = ["type": "object", "additionalProperties": false]
        if let properties {
            var props: [String: Any] = [:]
            for (key, value) in properties {
                props[key] = toStrictJsonSchema(value)
            }
            result["properties"] = props
            result["required"] = required ?? Array(properties.keys)
        }
        return result
    case .array(let items):
        var result: [String: Any] = ["type": "array"]
        if let items { result["items"] = toStrictJsonSchema(items) }
        return result
    case .string(let enumValues):
        var result: [String: Any] = ["type": "string"]
        if let enumValues { result["enum"] = enumValues }
        return result
    case .integer:
        return ["type": "integer"]
    case .number(let minimum, let maximum):
        var result: [String: Any] = ["type": "number"]
        if let minimum { result["minimum"] = minimum }
        if let maximum { result["maximum"] = maximum }
        return result
    case .boolean:
        return ["type": "boolean"]
    }
}

private func configDouble(_ value: RuntimeValue?) -> Double? {
    switch value {
    case .double(let d): return d
    case .int(let n): return Double(n)
    default: return nil
    }
}

private func configInt(_ value: RuntimeValue?) -> Int? {
    switch value {
    case .int(let n): return n
    case .double(let d): return Int(d)
    default: return nil
    }
}

private func runtimeValueToJSON(_ value: RuntimeValue) -> Any {
    switch value {
    case .null: return NSNull()
    case .bool(let b): return b
    case .int(let n): return n
    case .double(let d): return d
    case .string(let s): return s
    case .symbol(let s): return s
    case .array(let items): return items.map(runtimeValueToJSON)
    case .record(_, let fields):
        return fields.mapValues(runtimeValueToJSON)
    case .agentMethod(let agent, let method): return "\(agent).\(method)"
    case .callable: return "<fn>"
    }
}

private func encodeRuntimeValueJSON(_ object: [String: Any]) throws -> String {
    let data = try JSONSerialization.data(withJSONObject: object, options: [.prettyPrinted])
    return String(data: data, encoding: .utf8) ?? "{}"
}
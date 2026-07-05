import Foundation

public final class TracingLlmClient: LlmClient, @unchecked Sendable {
    private let client: LlmClient
    private let writer: LlmTraceWriter

    public init(client: LlmClient, writer: LlmTraceWriter) {
        self.client = client
        self.writer = writer
    }

    public func complete(_ request: LlmRequest) async throws -> RuntimeValue {
        let start = Date()
        let messages = request.messages ?? buildMessages(request)
        do {
            let response = try await client.complete(request)
            try await writer.record(
                agent: request.agent,
                model: request.model,
                messages: messages,
                schema: request.schema,
                response: response,
                stormRound: request.stormRound,
                delegateChain: request.delegateChain,
                durationMs: Int(Date().timeIntervalSince(start) * 1000)
            )
            return response
        } catch {
            try? await writer.record(
                agent: request.agent,
                model: request.model,
                messages: messages,
                schema: request.schema,
                error: String(describing: error),
                stormRound: request.stormRound,
                delegateChain: request.delegateChain,
                durationMs: Int(Date().timeIntervalSince(start) * 1000)
            )
            throw error
        }
    }
}
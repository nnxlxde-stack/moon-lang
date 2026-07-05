import Foundation

public struct PromptChatMessage: Sendable, Equatable {
    public var role: String
    public var content: String

    public init(role: String, content: String) {
        self.role = role
        self.content = content
    }
}

public struct AssemblyInput: Sendable {
    public var agent: String
    public var model: String
    public var systemPrompt: String?
    public var role: String?
    public var focus: [String]?
    public var input: String
    public var config: [String: String]
    public var systemSuffix: String?
    public var peerOutputs: [(agent: String, summary: String)]?
    public var delegateFrom: String?

    public init(
        agent: String,
        model: String,
        systemPrompt: String? = nil,
        role: String? = nil,
        focus: [String]? = nil,
        input: String,
        config: [String: String] = [:],
        systemSuffix: String? = nil,
        peerOutputs: [(agent: String, summary: String)]? = nil,
        delegateFrom: String? = nil
    ) {
        self.agent = agent
        self.model = model
        self.systemPrompt = systemPrompt
        self.role = role
        self.focus = focus
        self.input = input
        self.config = config
        self.systemSuffix = systemSuffix
        self.peerOutputs = peerOutputs
        self.delegateFrom = delegateFrom
    }
}

public struct AssembledPrompt: Sendable, Equatable {
    public var messages: [PromptChatMessage]
    public var temperature: Double
    public var maxTokens: Int?

    public init(messages: [PromptChatMessage], temperature: Double, maxTokens: Int? = nil) {
        self.messages = messages
        self.temperature = temperature
        self.maxTokens = maxTokens
    }
}

public func assemblePrompt(_ req: AssemblyInput) -> AssembledPrompt {
    var systemParts: [String] = []
    if let systemPrompt = req.systemPrompt { systemParts.append(systemPrompt) }
    if let role = req.role { systemParts.append("Role: \(role)") }
    if let focus = req.focus, !focus.isEmpty {
        systemParts.append("Focus on: \(focus.joined(separator: ", "))")
    }
    systemParts.append(req.systemSuffix ?? "Respond with JSON only matching the provided schema.")

    var userParts = ["## Input", req.input]
    if let context = req.config["context"] {
        userParts.append("## Project context")
        userParts.append(context)
    }
    if let previous = req.config["previousVersion"] {
        userParts.append("## Previous version")
        userParts.append(previous)
    }
    if let peers = req.peerOutputs, !peers.isEmpty {
        userParts.append("## Peer perspectives")
        for peer in peers {
            userParts.append("### \(peer.agent)")
            userParts.append(peer.summary)
        }
    }
    if let delegateFrom = req.delegateFrom {
        let delegated = req.config["delegated_input"] ?? req.config["context"] ?? ""
        userParts.append("## Delegated from \(delegateFrom)")
        userParts.append(delegated)
    }

    var extra = req.config
    for key in ["context", "previousVersion", "delegated_input", "focus", "maxTokens", "temperature"] {
        extra.removeValue(forKey: key)
    }
    if !extra.isEmpty {
        userParts.append("## Additional config")
        userParts.append(serializeConfigBlock(extra))
    }

    let temperature = Double(req.config["temperature"] ?? "") ?? 0.25
    let maxTokens = Int(req.config["maxTokens"] ?? "")

    return AssembledPrompt(
        messages: [
            PromptChatMessage(role: "system", content: systemParts.joined(separator: "\n\n")),
            PromptChatMessage(role: "user", content: userParts.joined(separator: "\n\n")),
        ],
        temperature: temperature,
        maxTokens: maxTokens
    )
}

private func serializeConfigBlock(_ config: [String: String]) -> String {
    let lines = config.keys.sorted().map { "\($0): \(config[$0] ?? "")" }
    return lines.joined(separator: "\n")
}
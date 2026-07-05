import MoonAST

public func collectAgents(_ program: Program) -> [String: AgentDecl] {
    var agents: [String: AgentDecl] = [:]
    for decl in program.declarations {
        if case .agent(let agentDecl, _) = decl {
            agents[agentDecl.name] = agentDecl
        }
    }
    return agents
}

public func agentModel(_ agent: AgentDecl) -> String {
    for item in agent.config {
        if item.key == "model", case .lit(.string(let model, _), _) = item.value {
            return model
        }
    }
    return "deepseek-v4-pro"
}

public let analyzeOutputSchema = JsonSchema.object(
    properties: [
        "findings": .array(items: .object()),
        "summary": .string(),
        "confidence": .number(minimum: 0, maximum: 1),
    ],
    required: ["findings", "summary", "confidence"]
)

public func agentRole(_ agent: AgentDecl) -> String? {
    for item in agent.config where item.key == "role" {
        if case .lit(.string(let text, _), _) = item.value { return text }
    }
    return nil
}

public func agentFocus(_ agent: AgentDecl) -> [String]? {
    for item in agent.config where item.key == "focus" {
        if case .list(let elements, _) = item.value {
            let values = elements.compactMap { el -> String? in
                if case .lit(.string(let text, _), _) = el { return text }
                return nil
            }
            return values.isEmpty ? nil : values
        }
    }
    return nil
}

public func schemaForAgent(_ agent: AgentDecl, schemas: [String: JsonSchema] = [:]) -> JsonSchema {
    if case .con(let name, _, _) = agent.type, name == "Reviewer" {
        return schemas["ReviewResult"] ?? analyzeOutputSchema
    }
    return analyzeOutputSchema
}
import MoonAST

func runStormStmt(_ stmt: DoStatement, _ ctx: RuntimeContext) async throws -> RuntimeValue {
    guard case .storm(_, let inputExpr, let config, _) = stmt else {
        throw RuntimeError("Expected storm statement")
    }

    let input = try await evalExpr(inputExpr, ctx)
    let configValues = try await evalStormConfig(config, ctx)

    guard let panel = configValues["panel"], case .array(let panelItems) = panel, !panelItems.isEmpty else {
        throw RuntimeError("storm requires panel: [Agent, ...]")
    }

    let panelAgents = panelItems.compactMap(agentNameFromValue)
    guard !panelAgents.isEmpty else {
        throw RuntimeError("storm requires panel: [Agent, ...]")
    }

    guard let synthesizer = configValues["synthesizer"].flatMap(agentNameFromValue) else {
        throw RuntimeError("storm requires synthesizer: AgentName")
    }

    let rounds: Int
    if let roundsValue = configValues["rounds"] {
        switch roundsValue {
        case .int(let n): rounds = max(1, n)
        case .double(let d): rounds = max(1, Int(d))
        default: rounds = 1
        }
    } else {
        rounds = 1
    }

    let stormContext = configValues["context"]
    var peerOutputs: [(agent: String, summary: String)] = []

    for round in 1...rounds {
        let tier = highestStormTier(panelAgents, ctx)
        let peersForRound = round > 1 ? peerOutputs : nil
        let roundResults = try await ctx.pool.runAll(tier, panelAgents.map { agentName in
            let peers = peersForRound
            return {
                var extra = configValues
                if let stormContext { extra["context"] = stormContext }
                return try await runAgentAnalyze(
                    agentName,
                    input,
                    config: config,
                    ctx: ctx,
                    options: AgentAnalyzeOptions(
                        stormRound: round,
                        peerOutputs: peers,
                        configOverride: extra
                    )
                )
            }
        })

        peerOutputs = zip(panelAgents, roundResults).map { agent, output in
            (agent: agent, summary: summarizeStormOutput(output))
        }
    }

    var synthExtra = configValues
    if let stormContext { synthExtra["context"] = stormContext }

    return try await runAgentAnalyze(
        synthesizer,
        input,
        config: config,
        ctx: ctx,
        options: AgentAnalyzeOptions(
            stormRound: rounds + 1,
            peerOutputs: peerOutputs,
            configOverride: synthExtra
        )
    )
}

private func evalStormConfig(_ config: [ConfigItem], _ ctx: RuntimeContext) async throws -> [String: RuntimeValue] {
    var values: [String: RuntimeValue] = [:]
    for item in config {
        values[item.key] = try await evalExpr(item.value, ctx)
    }
    return values
}

private func agentNameFromValue(_ value: RuntimeValue) -> String? {
    switch value {
    case .symbol(let name): return name
    case .string(let name): return name
    default: return nil
    }
}

private func summarizeStormOutput(_ value: RuntimeValue) -> String {
    if case .string(let text) = value { return text }
    return runtimeValueDescription(value)
}

private func highestStormTier(_ agents: [String], _ ctx: RuntimeContext) -> ModelTier {
    var tier: ModelTier = .flash
    for name in agents {
        if let agent = ctx.agents[name], modelToTier(agentModel(agent)) == .pro {
            tier = .pro
        }
    }
    return tier
}
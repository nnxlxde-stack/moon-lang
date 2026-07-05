import MoonAST
import MoonPrompt

func evalExpr(_ expr: Expression, _ ctx: RuntimeContext) async throws -> RuntimeValue {
    switch expr {
    case .lit(let value, _):
        return literalValue(value)
    case .varRef(let name, _):
        if let value = ctx.env[name] { return value }
        if isTypeValue(name) { return .symbol(name) }
        if isBuiltin(name, ctx) { return .symbol(name) }
        if ctx.agents[name] != nil { return .symbol(name) }
        if findUserFunction(ctx.program, name) != nil { return .symbol(name) }
        throw RuntimeError("Unbound variable: \(name)")
    case .app(let fn, let arg, _):
        let fnVal = try await evalExpr(fn, ctx)
        let argVal = try await evalExpr(arg, ctx)
        return try await applyValue(fnVal, argVal, ctx)
    case .infix(let op, let left, let right, _):
        if op == "$" {
            let fnVal = try await evalExpr(left, ctx)
            let argVal = try await evalExpr(right, ctx)
            return try await applyValue(fnVal, argVal, ctx)
        }
        if op == ">>=" {
            let io = try await evalExpr(left, ctx)
            let fnVal = try await evalExpr(right, ctx)
            return try await applyValue(fnVal, io, ctx)
        }
        if op == "." {
            let f = try await evalExpr(left, ctx)
            let g = try await evalExpr(right, ctx)
            return .callable(RuntimeCallableBox { x, ctx in
                let gx = try await applyValue(g, x, ctx)
                return try await applyValue(f, gx, ctx)
            })
        }
        throw RuntimeError("Unsupported operator: \(op)")
    case .fieldAccess(let object, let field, _):
        let obj = try await evalExpr(object, ctx)
        if case .record(_, let fields) = obj, let value = fields[field] {
            return value
        }
        if case .symbol(let agentName) = obj, ctx.agents[agentName] != nil {
            return .agentMethod(agent: agentName, method: field)
        }
        if case .string(let agentName) = obj, ctx.agents[agentName] != nil {
            return .agentMethod(agent: agentName, method: field)
        }
        return .agentMethod(agent: runtimeValueDescription(obj), method: field)
    case .record(let name, let fields, _):
        var record: [String: RuntimeValue] = [:]
        for field in fields {
            record[field.name] = try await evalExpr(field.value, ctx)
        }
        return .record(typeName: name, fields: record)
    case .list(let elements, _):
        var items: [RuntimeValue] = []
        for el in elements {
            items.append(try await evalExpr(el, ctx))
        }
        return .array(items)
    case .tuple(let elements, _):
        if elements.isEmpty { return .null }
        var items: [RuntimeValue] = []
        for el in elements {
            items.append(try await evalExpr(el, ctx))
        }
        return .array(items)
    case .paren(let inner, _):
        return try await evalExpr(inner, ctx)
    case .doExpr(let block, _):
        return try await runDoBlock(block, ctx)
    case .ifExpr(let condition, let thenBranch, let elseBranch, _):
        let cond = try await evalExpr(condition, ctx)
        if case .bool(true) = cond {
            return try await evalExpr(thenBranch, ctx)
        }
        return try await evalExpr(elseBranch, ctx)
    case .prefix(let op, let operand, _):
        if op == "not" {
            if case .bool(let b) = try await evalExpr(operand, ctx) { return .bool(!b) }
            return .bool(false)
        }
        if case .int(let n) = try await evalExpr(operand, ctx) { return .int(-n) }
        if case .double(let d) = try await evalExpr(operand, ctx) { return .double(-d) }
        throw RuntimeError("Unsupported prefix: \(op)")
    case .agent, .model:
        throw RuntimeError("Agent/model expressions are not executable")
    case .lambda:
        throw RuntimeError("Lambda evaluation not yet supported")
    }
}

func applyValue(
    _ fn: RuntimeValue,
    _ arg: RuntimeValue,
    _ ctx: RuntimeContext,
    config: [ConfigItem] = []
) async throws -> RuntimeValue {
    if case .agentMethod(let agent, let method) = fn {
        if method == "analyze" {
            return try await runAgentAnalyze(agent, arg, config: config, ctx: ctx)
        }
        throw RuntimeError("Unknown agent method: \(method)")
    }

    if case .callable(let box) = fn {
        return try await box.fn(arg, ctx)
    }

    if case .symbol(let name) = fn, isBuiltin(name, ctx) {
        return try await runBuiltin(name, arg, ctx)
    }

    if case .symbol(let name) = fn, let decl = findUserFunction(ctx.program, name) {
        return try await callUserFunction(decl, args: [arg], ctx: ctx, config: config)
    }

    throw RuntimeError("Cannot apply: \(runtimeValueDescription(fn))")
}

func evalExprWithConfig(_ expr: Expression, _ ctx: RuntimeContext, config: [ConfigItem]) async throws -> RuntimeValue {
    if case .app(let fn, let arg, _) = expr, case .fieldAccess = fn {
        let callee = try await evalExpr(fn, ctx)
        let input = try await evalExpr(arg, ctx)
        return try await applyValue(callee, input, ctx, config: config)
    }
    return try await evalExpr(expr, ctx)
}

func applyBindConfig(_ value: RuntimeValue, _ config: [ConfigItem], _ ctx: RuntimeContext) async throws -> RuntimeValue {
    var result = value
    for item in config where item.key == "filter" {
        guard case .array(let entries) = result else { continue }
        let predicate = try await evalExpr(item.value, ctx)
        var kept: [RuntimeValue] = []
        for entry in entries {
            let pass = try await applyValue(predicate, entry, ctx)
            if case .bool(true) = pass { kept.append(entry) }
        }
        result = .array(kept)
    }
    return result
}

func runDoBlock(_ block: DoBlock, _ ctx: RuntimeContext) async throws -> RuntimeValue {
    var last: RuntimeValue = .null
    for stmt in block.statements {
        last = try await runDoStmt(stmt, ctx)
    }
    return last
}

func runDoStmt(_ stmt: DoStatement, _ ctx: RuntimeContext) async throws -> RuntimeValue {
    switch stmt {
    case .letBind(let pattern, let expr, _):
        let value = try await evalExpr(expr, ctx)
        bindPattern(pattern, value, ctx)
        return value
    case .bind(let pattern, let expr, let config, _):
        var value = try await evalExprWithConfig(expr, ctx, config: config)
        value = try await applyBindConfig(value, config, ctx)
        bindPattern(pattern, value, ctx)
        return value
    case .storm:
        let value = try await runStormStmt(stmt, ctx)
        if case .storm(let pattern, _, _, _) = stmt {
            bindPattern(pattern, value, ctx)
        }
        return value
    case .action(let expr, _, _):
        return try await evalExpr(expr, ctx)
    }
}

struct AgentAnalyzeOptions: Sendable {
    var stormRound: Int?
    var peerOutputs: [(agent: String, summary: String)]?
    var configOverride: [String: RuntimeValue]?
    var delegateFrom: String?
    var delegateChain: [String]?
    var skipDelegate: Bool = false
}

func runAgentAnalyze(
    _ agentName: String,
    _ input: RuntimeValue,
    config: [ConfigItem],
    ctx: RuntimeContext,
    options: AgentAnalyzeOptions = AgentAnalyzeOptions()
) async throws -> RuntimeValue {
    guard let agent = ctx.agents[agentName] else {
        throw RuntimeError("Unknown agent: \(agentName)")
    }

    let model = agentModel(agent)
    let tier = modelToTier(model)
    let schema = schemaForAgent(agent, schemas: ctx.schemas)

    var configValues = options.configOverride ?? [:]
    for item in agent.config where item.key == "temperature" {
        if case .lit(.float(let value, _), _) = item.value { configValues["temperature"] = .double(value) }
        if case .lit(.int(let value, _), _) = item.value { configValues["temperature"] = .int(value) }
    }
    for item in config {
        configValues[item.key] = try await evalExpr(item.value, ctx)
    }

    let delegateChain = options.delegateChain ?? [agentName]
    var focus = agentFocus(agent)
    if focus == nil, case .array(let items) = configValues["focus"] {
        focus = items.compactMap { value -> String? in
            if case .string(let text) = value { return text }
            return nil
        }
    }

    let assembled = assemblePrompt(AssemblyInput(
        agent: agentName,
        model: model,
        systemPrompt: agentSystemPrompt(agent),
        role: agentRole(agent),
        focus: focus,
        input: runtimeValueDescription(input),
        config: runtimeConfigStrings(configValues),
        systemSuffix: ctx.systemSuffix,
        peerOutputs: options.peerOutputs,
        delegateFrom: options.delegateFrom
    ))

    let messages = assembled.messages.map { LlmChatMessage(role: $0.role, content: $0.content) }
    let requestConfig = configValues

    var result = try await ctx.pool.run(tier) {
        try await ctx.llm.complete(LlmRequest(
            agent: agentName,
            model: model,
            input: input,
            schema: schema,
            config: requestConfig,
            messages: messages,
            temperature: assembled.temperature,
            stormRound: options.stormRound,
            delegateChain: delegateChain
        ))
    }

    if let delegateName = agent.routesTo, !options.skipDelegate {
        var delegateConfig = configValues
        delegateConfig["delegated_input"] = result
        result = try await runAgentAnalyze(delegateName, input, config: config, ctx: ctx, options: AgentAnalyzeOptions(
            stormRound: options.stormRound,
            peerOutputs: options.peerOutputs,
            configOverride: delegateConfig,
            delegateFrom: agentName,
            delegateChain: delegateChain + [delegateName],
            skipDelegate: true
        ))
    }

    return result
}

private func runtimeConfigStrings(_ config: [String: RuntimeValue]) -> [String: String] {
    config.mapValues(runtimeValueDescription)
}

func agentSystemPrompt(_ agent: AgentDecl) -> String {
    for item in agent.config where item.key == "systemPrompt" {
        if case .lit(.string(let text, _), _) = item.value {
            return text
        }
    }
    return "You are the \(agent.name) agent. Respond with JSON matching the schema."
}

private func configDouble(_ value: RuntimeValue?) -> Double? {
    switch value {
    case .double(let d): return d
    case .int(let n): return Double(n)
    default: return nil
    }
}

func findUserFunction(_ program: Program, _ name: String) -> FunctionDecl? {
    for decl in program.declarations {
        if case .function(let fnDecl, _) = decl,
           fnDecl.equations.contains(where: { $0.name == name }) {
            return fnDecl
        }
    }
    return nil
}

func callUserFunction(
    _ decl: FunctionDecl,
    args: [RuntimeValue],
    ctx: RuntimeContext,
    config: [ConfigItem] = []
) async throws -> RuntimeValue {
    guard let eq = decl.equations.first else {
        throw RuntimeError("Function has no equations")
    }

    if args.count < eq.patterns.count {
        let captured = args
        return .callable(RuntimeCallableBox { next, ctx in
            try await callUserFunction(decl, args: captured + [next], ctx: ctx, config: config)
        })
    }

    var local: [String: RuntimeValue] = [:]
    for (index, pattern) in eq.patterns.enumerated() {
        bindPattern(pattern, args[index], bindings: &local)
    }

    let child = ctx.childEnv(local)
    switch eq.body {
    case .doBlock(let block):
        return try await runDoBlock(block, child)
    case .expression(let expr):
        return try await evalExpr(expr, child)
    }
}

func bindPattern(_ pattern: Pattern, _ value: RuntimeValue, _ ctx: RuntimeContext) {
    if case .pVar(let name, _) = pattern {
        ctx.env[name] = value
    }
}

private func bindPattern(_ pattern: Pattern, _ value: RuntimeValue, bindings: inout [String: RuntimeValue]) {
    if case .pVar(let name, _) = pattern {
        bindings[name] = value
    }
}
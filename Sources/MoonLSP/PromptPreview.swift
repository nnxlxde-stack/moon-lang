import Foundation
import MoonAST
import MoonPrompt
import MoonSchemaCompiler

public struct PromptSite: Sendable, Equatable {
    public var line: Int
    public var endLine: Int
    public var kind: String
    public var agent: String
    public var title: String

    public init(line: Int, endLine: Int, kind: String, agent: String, title: String) {
        self.line = line
        self.endLine = endLine
        self.kind = kind
        self.agent = agent
        self.title = title
    }
}

public struct PromptPreviewResult: Sendable, Equatable {
    public var site: PromptSite
    public var assembled: AssembledPrompt
    public var markdown: String

    public init(site: PromptSite, assembled: AssembledPrompt, markdown: String) {
        self.site = site
        self.assembled = assembled
        self.markdown = markdown
    }
}

public func findPromptSites(_ program: Program) -> [PromptSite] {
    var sites: [PromptSite] = []
    for decl in program.declarations {
        guard case .function(let fn, _) = decl else { continue }
        for eq in fn.equations {
            guard case .doBlock(let block) = eq.body else { continue }
            for stmt in block.statements {
                if case .bind(_, let expr, _, let span) = stmt,
                   let call = findAnalyzeCall(expr) {
                    sites.append(PromptSite(
                        line: span.start.line - 1,
                        endLine: span.end.line - 1,
                        kind: "analyze",
                        agent: call.agent,
                        title: "Preview prompt: \(call.agent)"
                    ))
                }
                if case .storm(_, _, let config, let span) = stmt {
                    let synthesizer = configString(config, key: "synthesizer") ?? "Synthesizer"
                    sites.append(PromptSite(
                        line: span.start.line - 1,
                        endLine: span.end.line - 1,
                        kind: "storm",
                        agent: synthesizer,
                        title: "Preview storm: \(synthesizer)"
                    ))
                }
            }
        }
    }
    return sites
}

public func buildPromptPreview(_ program: Program, line: Int) -> PromptPreviewResult? {
    let sites = findPromptSites(program)
    guard let site = sites.first(where: { $0.line == line }) else { return nil }
    let agents = collectPreviewAgents(program)
    let schemas = compileSchemas(program).schemas

    if site.kind == "storm" {
        return buildStormPreview(program, site: site, agents: agents, schemas: schemas)
    }
    return buildAnalyzePreview(program, site: site, agents: agents, schemas: schemas)
}

private func buildAnalyzePreview(
    _ program: Program,
    site: PromptSite,
    agents: [String: AgentDecl],
    schemas: [String: MoonJsonSchema]
) -> PromptPreviewResult? {
    guard let agent = agents[site.agent],
          let bind = findBindAtLine(program, line: site.line),
          case .bind(_, let expr, let bindConfig, _) = bind,
          let call = findAnalyzeCall(expr) else { return nil }

    let config = configStringMap(bindConfig)
    let bindFocus = config["focus"].map { $0.split(separator: ",").map(String.init) }
    let assembled = assemblePrompt(AssemblyInput(
        agent: site.agent,
        model: previewAgentModel(agent),
        systemPrompt: previewAgentSystemPrompt(agent),
        role: previewAgentRole(agent),
        focus: previewAgentFocus(agent) ?? bindFocus,
        input: call.input,
        config: config
    ))

    return PromptPreviewResult(
        site: site,
        assembled: assembled,
        markdown: formatPreviewMarkdown(site: site, assembled: assembled)
    )
}

private func buildStormPreview(
    _ program: Program,
    site: PromptSite,
    agents: [String: AgentDecl],
    schemas: [String: MoonJsonSchema]
) -> PromptPreviewResult? {
    guard let storm = findStormAtLine(program, line: site.line),
          case .storm(_, let input, let stormConfig, _) = storm else { return nil }
    let config = configStringMap(stormConfig)
    let synthesizerName = configString(stormConfig, key: "synthesizer") ?? site.agent
    guard let agent = agents[synthesizerName] else { return nil }

    let panel = (config["panel"] ?? "").split(separator: ",").map { $0.trimmingCharacters(in: .whitespaces) }
    let assembled = assemblePrompt(AssemblyInput(
        agent: synthesizerName,
        model: previewAgentModel(agent),
        systemPrompt: previewAgentSystemPrompt(agent),
        role: previewAgentRole(agent),
        focus: previewAgentFocus(agent),
        input: exprPlaceholder(input),
        config: config,
        peerOutputs: panel.map { ($0, "<peer output after panel round>") }
    ))

    let stormNote = "**Storm panel:** \(panel.joined(separator: ", "))\n\n"
    return PromptPreviewResult(
        site: site,
        assembled: assembled,
        markdown: stormNote + formatPreviewMarkdown(site: site, assembled: assembled)
    )
}

public func formatPreviewMarkdown(site: PromptSite, assembled: AssembledPrompt) -> String {
    var parts = [
        "# \(site.title)",
        "",
        "**Temperature:** \(assembled.temperature)\(assembled.maxTokens.map { " · max \($0) tokens" } ?? "")",
        "",
    ]
    for msg in assembled.messages {
        parts.append("## \(msg.role.uppercased())")
        parts.append("")
        parts.append("```")
        parts.append(msg.content)
        parts.append("```")
        parts.append("")
    }
    return parts.joined(separator: "\n")
}

private struct AnalyzeCall {
    var agent: String
    var input: String
}

private func findAnalyzeCall(_ expr: MoonAST.Expression) -> AnalyzeCall? {
    switch expr {
    case .app(let fn, let arg, _):
        if case .fieldAccess(let object, let field, _) = fn, field == "analyze",
           let agent = exprName(object) {
            return AnalyzeCall(agent: agent, input: exprPlaceholder(arg))
        }
    case .fieldAccess(let object, let field, _):
        if field == "analyze", let agent = exprName(object) {
            return AnalyzeCall(agent: agent, input: "<input>")
        }
    default:
        break
    }
    return nil
}

private func findBindAtLine(_ program: Program, line: Int) -> DoStatement? {
    for decl in program.declarations {
        guard case .function(let fn, _) = decl else { continue }
        for eq in fn.equations {
            guard case .doBlock(let block) = eq.body else { continue }
            for stmt in block.statements {
                if case .bind = stmt, stmt.span.start.line - 1 == line {
                    return stmt
                }
            }
        }
    }
    return nil
}

private func findStormAtLine(_ program: Program, line: Int) -> DoStatement? {
    for decl in program.declarations {
        guard case .function(let fn, _) = decl else { continue }
        for eq in fn.equations {
            guard case .doBlock(let block) = eq.body else { continue }
            for stmt in block.statements {
                if case .storm = stmt, stmt.span.start.line - 1 == line {
                    return stmt
                }
            }
        }
    }
    return nil
}

private func collectPreviewAgents(_ program: Program) -> [String: AgentDecl] {
    var agents: [String: AgentDecl] = [:]
    for decl in program.declarations {
        if case .agent(let agent, _) = decl {
            agents[agent.name] = agent
        }
    }
    return agents
}

private func exprName(_ expr: MoonAST.Expression) -> String? {
    switch expr {
    case .varRef(let name, _): return name
    case .paren(let inner, _): return exprName(inner)
    default: return nil
    }
}

private func exprPlaceholder(_ expr: MoonAST.Expression) -> String {
    switch expr {
    case .lit(.string(let text, _), _): return text
    case .lit(.int(let n, _), _): return String(n)
    case .lit(.float(let f, _), _): return String(f)
    case .lit(.bool(let b, _), _): return String(b)
    case .varRef(let name, _): return "<\(name)>"
    case .list(let elements, _): return elements.map(exprPlaceholder).joined(separator: ", ")
    case .record(let name, let fields, _):
        let parts = fields.map { "\($0.name)=\(exprPlaceholder($0.value))" }
        return "\(name){\(parts.joined(separator: ", "))}"
    default: return "<expr>"
    }
}

private func configStringMap(_ config: [ConfigItem]) -> [String: String] {
    var out: [String: String] = [:]
    for item in config {
        out[item.key] = exprPlaceholder(item.value)
    }
    return out
}

private func configString(_ config: [ConfigItem], key: String) -> String? {
    guard let item = config.first(where: { $0.key == key }) else { return nil }
    if case .varRef(let name, _) = item.value { return name }
    if case .lit(.string(let text, _), _) = item.value { return text }
    return nil
}

private func previewAgentModel(_ agent: AgentDecl) -> String {
    for item in agent.config where item.key == "model" {
        if case .lit(.string(let model, _), _) = item.value { return model }
    }
    return "deepseek-v4-pro"
}

private func previewAgentSystemPrompt(_ agent: AgentDecl) -> String? {
    for item in agent.config where item.key == "systemPrompt" {
        if case .lit(.string(let text, _), _) = item.value { return text }
    }
    return nil
}

private func previewAgentRole(_ agent: AgentDecl) -> String? {
    for item in agent.config where item.key == "role" {
        if case .lit(.string(let text, _), _) = item.value { return text }
    }
    return nil
}

private func previewAgentFocus(_ agent: AgentDecl) -> [String]? {
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

private extension DoStatement {
    var span: Span {
        switch self {
        case .bind(_, _, _, let span): return span
        case .storm(_, _, _, let span): return span
        case .letBind(_, _, let span): return span
        case .action(_, _, let span): return span
        }
    }
}
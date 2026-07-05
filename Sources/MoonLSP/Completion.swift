import Foundation
import MoonAST
import MoonMoonfile
import MoonResolver

public enum CompletionItemKind: Int, Sendable {
    case text = 1
    case method = 2
    case function = 3
    case variable = 6
    case `class` = 7
    case module = 9
    case property = 10
    case keyword = 14
    case enumMember = 13
    case file = 17
}

public struct MoonCompletionItem: Sendable, Equatable {
    public var label: String
    public var kind: Int
    public var detail: String?

    public init(label: String, kind: Int, detail: String? = nil) {
        self.label = label
        self.kind = kind
        self.detail = detail
    }
}

public enum CompletionContextKind: Sendable {
    case `import`
    case importCore
    case member
    case config
    case agentConfig
    case type
    case name
    case declaration
    case expression
}

public struct CompletionContext: Sendable {
    public var kind: CompletionContextKind
    public var prefix: String
    public var objectName: String?

    public init(kind: CompletionContextKind, prefix: String, objectName: String? = nil) {
        self.kind = kind
        self.prefix = prefix
        self.objectName = objectName
    }
}

public func detectCompletionContext(_ text: String, line: Int, character: Int) -> CompletionContext {
    let lines = text.split(separator: "\n", omittingEmptySubsequences: false).map(String.init)
    let row = line >= 0 && line < lines.count ? lines[line] : ""
    let before = String(row.prefix(character))
    let prefix = prefixAtPosition(text, line: line, character: character)

    if before.range(of: #"\bimport\s+Core\.[\w.-]*$"#, options: .regularExpression) != nil
        || before.hasSuffix("import Core.") {
        let corePrefix = prefix.components(separatedBy: ".").last ?? prefix
        return CompletionContext(kind: .importCore, prefix: corePrefix)
    }
    if before.range(of: #"\bimport\s+[\w.-]*$"#, options: .regularExpression) != nil {
        return CompletionContext(kind: .import, prefix: prefix)
    }

    if let match = before.range(of: #"([A-Za-z][A-Za-z0-9_]*)\.([A-Za-z0-9_]*)$"#, options: .regularExpression) {
        let snippet = String(before[match])
        let parts = snippet.split(separator: ".", maxSplits: 1).map(String.init)
        if parts.count == 2 {
            return CompletionContext(kind: .member, prefix: parts[1], objectName: parts[0])
        }
    }

    if before.hasSuffix("with") || before.range(of: #"^\s{4,}\w*:?\s*$"#, options: .regularExpression) != nil {
        return CompletionContext(kind: .config, prefix: prefix)
    }

    if isAgentConfigLine(text: text, line: line, before: before) {
        return CompletionContext(kind: .agentConfig, prefix: prefix)
    }

    if before.range(of: #"::\s*[\w.[\]]*$"#, options: .regularExpression) != nil {
        let typePrefix = before.range(of: #"::\s*([\w.[\]]*)$"#, options: .regularExpression)
            .map { String(before[$0]).replacingOccurrences(of: "::", with: "").trimmingCharacters(in: .whitespaces) } ?? prefix
        return CompletionContext(kind: .type, prefix: typePrefix)
    }

    if before.trimmingCharacters(in: .whitespaces).isEmpty
        || before.range(of: #"^\s*(main|agent|model|data)\b"#, options: .regularExpression) != nil {
        return CompletionContext(kind: .declaration, prefix: prefix)
    }

    if !prefix.isEmpty {
        return CompletionContext(kind: .name, prefix: prefix)
    }

    return CompletionContext(kind: .expression, prefix: prefix)
}

public func getCompletions(
    _ program: Program,
    entryPath: String,
    text: String,
    line: Int,
    character: Int
) -> [MoonCompletionItem] {
    let ctx = detectCompletionContext(text, line: line, character: character)
    let table = buildSymbolTable(program, entryPath: entryPath, source: text)
    let agents = program.declarations.compactMap { decl -> String? in
        if case .agent(let a, _) = decl { return a.name }
        return nil
    }

    switch ctx.kind {
    case .import:
        return importCompletions(prefix: ctx.prefix, entryPath: entryPath)
    case .importCore:
        return coreSubmoduleCompletions(prefix: ctx.prefix)
    case .member:
        return memberCompletions(objectName: ctx.objectName ?? "", prefix: ctx.prefix, agents: agents, table: table)
    case .config:
        return configCompletions(prefix: ctx.prefix)
    case .agentConfig:
        return agentConfigCompletions(prefix: ctx.prefix)
    case .type:
        return typeCompletions(prefix: ctx.prefix)
    case .name, .expression:
        return nameCompletions(program: program, table: table, prefix: ctx.prefix)
    case .declaration:
        return declarationCompletions()
    }
}

public func getPartialCompletions(
    _ text: String,
    entryPath: String,
    line: Int,
    character: Int
) -> [MoonCompletionItem] {
    let ctx = detectCompletionContext(text, line: line, character: character)
    switch ctx.kind {
    case .import:
        return importCompletions(prefix: ctx.prefix, entryPath: entryPath)
    case .importCore:
        return coreSubmoduleCompletions(prefix: ctx.prefix)
    case .member:
        return memberCompletions(objectName: ctx.objectName ?? "", prefix: ctx.prefix, agents: [], table: [:])
    case .config:
        return configCompletions(prefix: ctx.prefix)
    case .agentConfig:
        return agentConfigCompletions(prefix: ctx.prefix)
    case .type:
        return typeCompletions(prefix: ctx.prefix)
    case .declaration:
        return declarationCompletions()
    case .name, .expression:
        var items = declarationCompletions()
        for kw in doKeywords where matchesCompletionPrefix(kw, prefix: ctx.prefix) {
            items.append(MoonCompletionItem(label: kw, kind: CompletionItemKind.keyword.rawValue))
        }
        for path in allCoreModulePaths() where matchesCompletionPrefix(path, prefix: ctx.prefix) {
            items.append(MoonCompletionItem(label: path, kind: CompletionItemKind.module.rawValue, detail: "Core stdlib (import required)"))
        }
        return items
    }
}

private func importCompletions(prefix: String, entryPath: String) -> [MoonCompletionItem] {
    let projectRoot = findProjectRoot(entryPath: entryPath)
    var items = allCoreModulePaths().map {
        MoonCompletionItem(label: $0, kind: CompletionItemKind.module.rawValue, detail: "Core module")
    }
    let libDir = URL(fileURLWithPath: projectRoot).appendingPathComponent("lib")
    if let files = try? FileManager.default.contentsOfDirectory(atPath: libDir.path) {
        for file in files where file.hasSuffix(".moon") {
            let name = String(file.dropLast(5))
            items.append(MoonCompletionItem(label: name, kind: CompletionItemKind.file.rawValue, detail: "local module"))
        }
    }
    return filterPrefix(items, prefix: prefix)
}

private func coreSubmoduleCompletions(prefix: String) -> [MoonCompletionItem] {
    let modules = allCoreModulePaths().map { $0.replacingOccurrences(of: "Core.", with: "") }
    return filterPrefix(modules.map {
        MoonCompletionItem(label: $0, kind: CompletionItemKind.module.rawValue, detail: "Core.\($0)")
    }, prefix: prefix)
}

private func memberCompletions(
    objectName: String,
    prefix: String,
    agents: [String],
    table: [String: SymbolInfo]
) -> [MoonCompletionItem] {
    if agents.contains(objectName) {
        return filterPrefix([
            MoonCompletionItem(label: "analyze", kind: CompletionItemKind.method.rawValue, detail: "agent method"),
        ], prefix: prefix)
    }
    if let info = table[objectName], info.type.contains("->") {
        return filterPrefix([
            MoonCompletionItem(label: objectName, kind: CompletionItemKind.function.rawValue, detail: info.type),
        ], prefix: prefix)
    }
    return []
}

private func nameCompletions(
    program: Program,
    table: [String: SymbolInfo],
    prefix: String
) -> [MoonCompletionItem] {
    var items: [MoonCompletionItem] = []
    var seen = Set<String>()

    for decl in program.declarations {
        switch decl {
        case .model(let m, _):
            add(&items, &seen, m.name, .class, "model")
        case .agent(let a, _):
            add(&items, &seen, a.name, .class, "agent")
        case .function(let f, _):
            if let sig = f.signature {
                add(&items, &seen, sig.name, .function, "function")
            }
        case .data(let d, _):
            add(&items, &seen, d.name, .class, "data")
            for ctor in d.constructors {
                add(&items, &seen, ctor.name, .enumMember, "constructor")
            }
        default:
            break
        }
    }

    for (name, info) in table.sorted(by: { $0.key < $1.key }) {
        add(&items, &seen, name, .function, info.type)
    }

    return filterPrefix(items, prefix: prefix)
}

private func add(
    _ items: inout [MoonCompletionItem],
    _ seen: inout Set<String>,
    _ label: String,
    _ kind: CompletionItemKind,
    _ detail: String
) {
    guard !seen.contains(label) else { return }
    seen.insert(label)
    items.append(MoonCompletionItem(label: label, kind: kind.rawValue, detail: detail))
}

private let doKeywords = ["do", "let", "with", "storm", "pure", "when", "if", "then", "else", "not"]
private let bindConfigKeys = ["context", "focus", "maxTokens", "previousVersion", "filter", "temperature"]
private let stormConfigKeys = ["panel", "synthesizer", "rounds", "context"]
private let agentConfigKeys = ["model", "temperature", "systemPrompt", "role", "focus", "style"]
private let typeNames = [
    "String", "Int", "Float", "Bool", "IO", "List", "Unit", "Code",
    "Documentation", "Requirements", "Entity", "Agent", "Scope", "Verdict",
    "Analyzer", "Reviewer", "LongTerm", "PullRequest", "ChangedFile",
]
private let modelNames = ["deepseek-v4-flash", "deepseek-v4-pro"]

private func declarationCompletions() -> [MoonCompletionItem] {
    ["import", "model", "agent", "data", "instance", "macro", "main"].map {
        MoonCompletionItem(label: $0, kind: CompletionItemKind.keyword.rawValue)
    }
}

private func configCompletions(prefix: String) -> [MoonCompletionItem] {
    let keys = bindConfigKeys + stormConfigKeys
    return filterPrefix(keys.map {
        MoonCompletionItem(label: "\($0):", kind: CompletionItemKind.property.rawValue, detail: "bind/storm config")
    }, prefix: prefix)
}

private func agentConfigCompletions(prefix: String) -> [MoonCompletionItem] {
    var items = filterPrefix(agentConfigKeys.map {
        MoonCompletionItem(label: "\($0):", kind: CompletionItemKind.property.rawValue, detail: "agent config")
    }, prefix: prefix)
    items.append(contentsOf: filterPrefix(modelNames.map {
        MoonCompletionItem(label: $0, kind: CompletionItemKind.enumMember.rawValue, detail: "model id")
    }, prefix: prefix))
    return items
}

private func typeCompletions(prefix: String) -> [MoonCompletionItem] {
    filterPrefix(typeNames.map {
        MoonCompletionItem(label: $0, kind: CompletionItemKind.class.rawValue, detail: "type")
    }, prefix: prefix)
}

private func isAgentConfigLine(text: String, line: Int, before: String) -> Bool {
    guard before.range(of: #"^\s+\w*:?\s*$"#, options: .regularExpression) != nil
        || before.range(of: #"^\s+\w+[\w-]*$"#, options: .regularExpression) != nil else {
        return false
    }
    let lines = text.split(separator: "\n", omittingEmptySubsequences: false).map(String.init)
    for i in stride(from: line, through: 0, by: -1) {
        let row = lines[i]
        if row.contains("agent ") { return true }
        if row.contains("model ") || row.contains("data ") { return false }
    }
    return false
}

private func matchesCompletionPrefix(_ label: String, prefix: String) -> Bool {
    prefix.isEmpty || label.lowercased().hasPrefix(prefix.lowercased())
}

private func filterPrefix(_ items: [MoonCompletionItem], prefix: String) -> [MoonCompletionItem] {
    guard !prefix.isEmpty else { return items }
    return items.filter { $0.label.lowercased().hasPrefix(prefix.lowercased()) }
}

private func findProjectRoot(entryPath: String) -> String {
    var dir = URL(fileURLWithPath: entryPath).deletingLastPathComponent().standardizedFileURL
    while true {
        if findMoonfile(startDir: dir.path) != nil {
            return dir.path
        }
        let parent = dir.deletingLastPathComponent()
        if parent.path == dir.path { break }
        dir = parent
    }
    return URL(fileURLWithPath: entryPath).deletingLastPathComponent().path
}
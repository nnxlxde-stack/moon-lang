import Foundation
import MoonMoonfile
import MoonResolver

public func isMoonfileDocument(_ filePath: String) -> Bool {
    let name = URL(fileURLWithPath: filePath).lastPathComponent
    return name == "Moonfile" || name == "Moonfile.moon"
}

public enum MoonfileCompletionContextKind: Sendable {
    case section
    case dependency
    case targetName
    case path
    case providerKey
    case nestedKey
    case flatKey
    case envVar
    case apiFormat
    case model
    case boolean
    case nestedSection
    case package
}

public struct MoonfileCompletionContext: Sendable {
    public var kind: MoonfileCompletionContextKind
    public var prefix: String
    public var section: String?
    public var nested: String?
    public var extensions: [String]?
    public var quoted: Bool?
    public var replaceStart: Int?

    public init(
        kind: MoonfileCompletionContextKind,
        prefix: String,
        section: String? = nil,
        nested: String? = nil,
        extensions: [String]? = nil,
        quoted: Bool? = nil,
        replaceStart: Int? = nil
    ) {
        self.kind = kind
        self.prefix = prefix
        self.section = section
        self.nested = nested
        self.extensions = extensions
        self.quoted = quoted
        self.replaceStart = replaceStart
    }
}

private let topSections = [
    "dependencies", "targets", "providers", "paths", "models", "prompts", "runtime",
]
private let providerKeys = ["api_key", "base_url", "api_format", "use_beta"]
private let pathKeys = ["pricing", "tokenizer"]
private let modelKeys = ["default_flash", "default_pro"]
private let promptKeys = ["default_system_suffix", "trace_by_default"]
private let stormKeys = ["default_rounds", "max_panel_size"]
private let workerKeys = ["flash_concurrency", "pro_concurrency"]
private let memoryKeys = ["long_term_backend"]
private let retryKeys = ["max_repair_attempts"]
private let modelValues = ["deepseek-v4-flash", "deepseek-v4-pro"]
private let apiFormatValues = ["openai", "anthropic"]
private let booleanValues = ["true", "false"]

public func collectMoonfileDiagnostics(_ text: String) -> [MoonDiagnostic] {
    do {
        _ = try MoonMoonfileParser().parse(text)
        return []
    } catch let err as MoonMoonfileParseError {
        let line = max(0, err.line - 1)
        let row = text.split(separator: "\n", omittingEmptySubsequences: false).map(String.init)
        let endChar = line < row.count ? max(1, row[line].count) : 1
        return [MoonDiagnostic(
            message: err.description,
            line: line,
            character: 0,
            endCharacter: endChar,
            source: "moonfile"
        )]
    } catch {
        return [MoonDiagnostic(message: String(describing: error), line: 0, character: 0, endCharacter: 1, source: "moonfile")]
    }
}

public func detectMoonfileContext(_ text: String, line: Int, character: Int) -> MoonfileCompletionContext {
    let row = moonfileRowAt(text, line: line)
    let before = String(row.prefix(character))
    let prefix = moonfilePrefixAt(text, line: line, character: character)
    let sectionCtx = findMoonfileSectionContext(text, lineNo: line)

    if row.hasPrefix("package ") && !before.contains("\"") {
        return MoonfileCompletionContext(kind: .package, prefix: prefix)
    }

    if let envRange = before.range(of: #"env\(\s*"([^"]*)$"#, options: .regularExpression) {
        let captured = String(before[envRange]).replacingOccurrences(of: #"env\(\s*""#, with: "", options: .regularExpression)
        return MoonfileCompletionContext(kind: .envVar, prefix: captured)
    }

    let valueMatch = row.range(of: #"^\s*([a-zA-Z0-9_.-]+):"#, options: .regularExpression)
    if let valueMatch, let pathCtx = moonfilePathValueContext(row: row, before: before, character: character) {
        let key = String(row[valueMatch]).replacingOccurrences(of: ":", with: "").trimmingCharacters(in: .whitespaces)
        if sectionCtx.section == "targets" || (sectionCtx.section == "paths" && pathKeys.contains(key)) {
            return MoonfileCompletionContext(
                kind: .path,
                prefix: pathCtx.prefix,
                section: sectionCtx.section,
                extensions: sectionCtx.section == "targets" ? [".moon"] : nil,
                quoted: pathCtx.quoted,
                replaceStart: pathCtx.replaceStart
            )
        }
        if sectionCtx.section == "providers", sectionCtx.nested == "deepseek", key == "api_format" {
            return MoonfileCompletionContext(kind: .apiFormat, prefix: prefix)
        }
        if sectionCtx.section == "providers", sectionCtx.nested == "deepseek", key == "use_beta" {
            return MoonfileCompletionContext(kind: .boolean, prefix: prefix)
        }
        if sectionCtx.section == "models", modelKeys.contains(key) {
            return MoonfileCompletionContext(kind: .model, prefix: prefix)
        }
        if sectionCtx.section == "prompts", key == "trace_by_default" {
            return MoonfileCompletionContext(kind: .boolean, prefix: prefix)
        }
    }

    if sectionCtx.section == "dependencies", before.trimmingCharacters(in: .whitespaces).isEmpty || before.range(of: #"^\s+[A-Za-z0-9_.]*$"#, options: .regularExpression) != nil {
        return MoonfileCompletionContext(kind: .dependency, prefix: prefix.replacingOccurrences(of: "Core.", with: ""))
    }

    if sectionCtx.section == "targets", !row.contains(":") {
        return MoonfileCompletionContext(kind: .targetName, prefix: prefix)
    }

    if ["providers", "prompts", "runtime"].contains(sectionCtx.section),
       sectionCtx.nested == nil,
       before.trimmingCharacters(in: .whitespaces).isEmpty {
        return MoonfileCompletionContext(kind: .nestedSection, prefix: prefix, section: sectionCtx.section)
    }

    if sectionCtx.section == "providers", sectionCtx.nested == "deepseek", !row.contains(":") {
        return MoonfileCompletionContext(kind: .providerKey, prefix: prefix)
    }
    if sectionCtx.section == "paths", !row.contains(":") {
        return MoonfileCompletionContext(kind: .flatKey, prefix: prefix, section: sectionCtx.section)
    }
    if sectionCtx.section == "models", !row.contains(":") {
        return MoonfileCompletionContext(kind: .flatKey, prefix: prefix, section: sectionCtx.section)
    }
    if sectionCtx.section == "prompts", sectionCtx.nested == "storm", !row.contains(":") {
        return MoonfileCompletionContext(kind: .nestedKey, prefix: prefix, section: sectionCtx.section, nested: sectionCtx.nested)
    }
    if sectionCtx.section == "prompts", sectionCtx.nested == nil, !row.contains(":") {
        return MoonfileCompletionContext(kind: .flatKey, prefix: prefix, section: sectionCtx.section)
    }
    if sectionCtx.section == "runtime", sectionCtx.nested != nil, !row.contains(":") {
        return MoonfileCompletionContext(kind: .nestedKey, prefix: prefix, section: sectionCtx.section, nested: sectionCtx.nested)
    }

    return MoonfileCompletionContext(kind: .section, prefix: prefix)
}

public func getMoonfileCompletions(
    _ text: String,
    line: Int,
    character: Int,
    projectRoot: String
) -> [MoonCompletionItem] {
    let ctx = detectMoonfileContext(text, line: line, character: character)
    switch ctx.kind {
    case .package:
        return [MoonCompletionItem(label: #"package "${1:name}""#, kind: CompletionItemKind.keyword.rawValue, detail: "project package name")]
    case .section:
        var items: [MoonCompletionItem] = []
        if !text.contains(#"package ""#) {
            items.append(MoonCompletionItem(label: #"package "${1:name}""#, kind: CompletionItemKind.keyword.rawValue, detail: "declare package name"))
        }
        for section in topSections where matchesMoonfilePrefix(section, prefix: ctx.prefix) {
            items.append(MoonCompletionItem(label: "\(section):", kind: CompletionItemKind.keyword.rawValue, detail: moonfileSectionDocs[section]))
        }
        return items
    case .dependency:
        return allCoreModulePaths()
            .filter { matchesMoonfilePrefix($0, prefix: ctx.prefix) || matchesMoonfilePrefix($0.replacingOccurrences(of: "Core.", with: ""), prefix: ctx.prefix) }
            .map { MoonCompletionItem(label: $0, kind: CompletionItemKind.module.rawValue, detail: "Core stdlib module") }
    case .targetName:
        return listMoonfilePathCompletions(projectRoot: projectRoot, partial: ctx.prefix, extensions: [".moon"], line: line, character: character, replaceStart: max(0, character - ctx.prefix.count))
    case .nestedSection:
        let nestedBySection: [String: [String]] = [
            "providers": ["deepseek"],
            "prompts": ["storm"],
            "runtime": ["worker_pool", "memory", "retries"],
        ]
        return (nestedBySection[ctx.section ?? ""] ?? [])
            .filter { matchesMoonfilePrefix($0, prefix: ctx.prefix) }
            .map { MoonCompletionItem(label: "\($0):", kind: CompletionItemKind.keyword.rawValue, detail: "\(ctx.section ?? "") subsection") }
    case .path:
        return listMoonfilePathCompletions(
            projectRoot: projectRoot,
            partial: ctx.prefix,
            extensions: ctx.extensions,
            line: line,
            character: character,
            replaceStart: ctx.replaceStart ?? max(0, character - ctx.prefix.count),
            quoted: ctx.quoted ?? false
        )
    case .providerKey:
        return providerKeys
            .filter { matchesMoonfilePrefix($0, prefix: ctx.prefix) }
            .map { MoonCompletionItem(label: "\($0): ", kind: CompletionItemKind.property.rawValue, detail: lookupMoonfileDoc(section: "providers", nested: "deepseek", key: $0)) }
    case .flatKey:
        let keys = ctx.section == "paths" ? pathKeys : ctx.section == "models" ? modelKeys : promptKeys
        return keys
            .filter { matchesMoonfilePrefix($0, prefix: ctx.prefix) }
            .map { MoonCompletionItem(label: "\($0): ", kind: CompletionItemKind.property.rawValue, detail: lookupMoonfileDoc(section: ctx.section ?? "", nested: nil, key: $0)) }
    case .nestedKey:
        let keys: [String]
        switch ctx.nested {
        case "storm": keys = stormKeys
        case "worker_pool": keys = workerKeys
        case "memory": keys = memoryKeys
        case "retries": keys = retryKeys
        default: keys = providerKeys
        }
        return keys
            .filter { matchesMoonfilePrefix($0, prefix: ctx.prefix) }
            .map { MoonCompletionItem(label: "\($0): ", kind: CompletionItemKind.property.rawValue, detail: lookupMoonfileDoc(section: ctx.section ?? "", nested: ctx.nested, key: $0)) }
    case .envVar:
        return suggestMoonfileEnvVars(prefix: ctx.prefix)
    case .apiFormat:
        return suggestMoonfileValues(apiFormatValues, prefix: ctx.prefix)
    case .model:
        return suggestMoonfileValues(modelValues, prefix: ctx.prefix)
    case .boolean:
        return suggestMoonfileValues(booleanValues, prefix: ctx.prefix)
    }
}

public func getMoonfileHover(_ text: String, line: Int, character: Int) -> String? {
    let row = moonfileRowAt(text, line: line)
    let word = moonfilePrefixAt(text, line: line, character: character)
    let sectionCtx = findMoonfileSectionContext(text, lineNo: line)

    if let keyRange = row.range(of: #"^\s*([a-zA-Z0-9_.-]+):"#, options: .regularExpression) {
        let key = String(row[keyRange]).replacingOccurrences(of: ":", with: "").trimmingCharacters(in: .whitespaces)
        if word == key || row.contains(": \(word)"),
           let doc = lookupMoonfileDoc(section: sectionCtx.section, nested: sectionCtx.nested, key: key) {
            let type = sectionCtx.nested.map { "\(sectionCtx.section).\($0).\(key)" } ?? "\(sectionCtx.section).\(key)"
            return formatMoonfileHover(label: key, type: type, docs: doc)
        }
    }

    if let doc = moonfileSectionDocs[word] {
        return formatMoonfileHover(label: word, type: "section", docs: doc)
    }

    if word.hasPrefix("Core.") {
        return formatMoonfileHover(label: word, type: "Core module", docs: "Core stdlib module dependency.")
    }

    return nil
}

private struct MoonfileSectionContext {
    var section: String
    var nested: String?
}

private struct MoonfilePathContext {
    var prefix: String
    var quoted: Bool
    var replaceStart: Int
}

private func moonfileRowAt(_ text: String, line: Int) -> String {
    let lines = text.split(separator: "\n", omittingEmptySubsequences: false).map(String.init)
    guard line >= 0, line < lines.count else { return "" }
    return lines[line]
}

private func moonfilePrefixAt(_ text: String, line: Int, character: Int) -> String {
    let row = moonfileRowAt(text, line: line)
    let before = String(row.prefix(character))
    if let pathCtx = moonfilePathValueContext(row: row, before: before, character: character) {
        return pathCtx.prefix
    }
    if let range = before.range(of: #"[A-Za-z0-9_.-]*$"#, options: .regularExpression) {
        return String(before[range])
    }
    return ""
}

private func moonfilePathValueContext(row: String, before: String, character: Int) -> MoonfilePathContext? {
    guard let colonIdx = row.firstIndex(of: ":") else { return nil }
    let colonOffset = row.distance(from: row.startIndex, to: colonIdx)
    guard character > colonOffset else { return nil }

    if let quotedRange = before.range(of: #":\s*"([^"]*)$"#, options: .regularExpression) {
        let captured = String(before[quotedRange])
        let inner = captured.replacingOccurrences(of: #"^:\s*""#, with: "", options: .regularExpression)
        let quoteStart = before.lastIndex(of: "\"").map { before.distance(from: before.startIndex, to: $0) } ?? before.count
        return MoonfilePathContext(prefix: inner, quoted: true, replaceStart: quoteStart + 1)
    }

    if let unquotedRange = before.range(of: #":\s*([A-Za-z0-9_./\\-]*)$"#, options: .regularExpression) {
        let captured = String(before[unquotedRange])
        let inner = captured.replacingOccurrences(of: #"^:\s*"#, with: "", options: .regularExpression)
        return MoonfilePathContext(prefix: inner, quoted: false, replaceStart: before.count - inner.count)
    }

    return nil
}

private func findMoonfileSectionContext(_ text: String, lineNo: Int) -> MoonfileSectionContext {
    let lines = text.split(separator: "\n", omittingEmptySubsequences: false).map(String.init)
    var section = ""
    var nested = ""
    var sectionIndent = 0

    for i in 0...min(lineNo, lines.count - 1) {
        let raw = lines[i]
        let trimmed = raw.trimmingCharacters(in: .whitespaces)
        if trimmed.isEmpty || trimmed.hasPrefix("#") || trimmed.hasPrefix("--") { continue }
        if trimmed.hasPrefix(#"package ""#) { continue }
        let indent = raw.prefix(while: { $0 == " " || $0 == "\t" }).count
        guard trimmed.hasSuffix(":"), !trimmed.contains(" "), !trimmed.contains("\"") else { continue }
        let name = String(trimmed.dropLast())
        if indent == 0 {
            section = name
            nested = ""
            sectionIndent = 0
        } else if !section.isEmpty, indent > sectionIndent {
            nested = name
        }
    }
    return MoonfileSectionContext(section: section, nested: nested.isEmpty ? nil : nested)
}

private func matchesMoonfilePrefix(_ label: String, prefix: String) -> Bool {
    label.lowercased().hasPrefix(prefix.lowercased())
}

private func suggestMoonfileEnvVars(prefix: String) -> [MoonCompletionItem] {
    let common = ["DEEPSEEK_API_KEY", "DEEPSEEK_BASE_URL", "DEEPSEEK_USE_BETA", "MOON_MEMORY_PATH"]
    let fromEnv = ProcessInfo.processInfo.environment.keys.sorted()
    let all = Array(Set(common + fromEnv)).sorted()
    return all
        .filter { matchesMoonfilePrefix($0, prefix: prefix) }
        .map { MoonCompletionItem(label: #"env("\#($0)")"#, kind: CompletionItemKind.enumMember.rawValue, detail: "environment variable") }
}

private func suggestMoonfileValues(_ values: [String], prefix: String) -> [MoonCompletionItem] {
    values
        .filter { matchesMoonfilePrefix($0, prefix: prefix) }
        .map { MoonCompletionItem(label: $0, kind: CompletionItemKind.enumMember.rawValue) }
}

private func listMoonfilePathCompletions(
    projectRoot: String,
    partial: String,
    extensions: [String]?,
    line: Int,
    character: Int,
    replaceStart: Int,
    quoted: Bool = false
) -> [MoonCompletionItem] {
    let normalized = partial.replacingOccurrences(of: "\\", with: "/")
    let parts = normalized.split(separator: "/").map(String.init)
    let filePrefix = parts.last ?? ""
    var dirParts = parts
    if !partial.hasSuffix("/") { _ = dirParts.popLast() }

    var current = URL(fileURLWithPath: projectRoot)
    for part in dirParts where !part.isEmpty && part != "." {
        current = current.appendingPathComponent(part)
        guard FileManager.default.fileExists(atPath: current.path) else { return [] }
    }

    guard let entries = try? FileManager.default.contentsOfDirectory(atPath: current.path) else { return [] }
    let dirPrefix = dirParts.isEmpty ? "" : dirParts.joined(separator: "/") + "/"
    var items: [MoonCompletionItem] = []

    for entry in entries.sorted() where !entry.hasPrefix(".") {
        let full = current.appendingPathComponent(entry)
        var isDir = false
        if let values = try? full.resourceValues(forKeys: [.isDirectoryKey]) {
            isDir = values.isDirectory == true
        }
        if isDir {
            guard matchesMoonfilePrefix(entry, prefix: filePrefix) else { continue }
            let rel = "\(dirPrefix)\(entry)/"
            items.append(MoonCompletionItem(label: rel, kind: CompletionItemKind.file.rawValue, detail: "directory"))
            continue
        }
        if let extensions, !extensions.contains(where: { entry.hasSuffix($0) }) { continue }
        guard matchesMoonfilePrefix(entry, prefix: filePrefix) else { continue }
        let rel = "\(dirPrefix)\(entry)"
        let insert = quoted ? rel : "\"\(rel)\""
        _ = insert
        _ = replaceStart
        _ = line
        _ = character
        items.append(MoonCompletionItem(label: rel, kind: CompletionItemKind.file.rawValue, detail: "file"))
    }
    return items
}
import Foundation
import MoonAST
import MoonMoonfile
import MoonParser
import MoonResolver
import MoonTypechecker
import MoonTypes

public enum SymbolKind: String, Codable, Sendable {
    case function
    case agent
    case model
    case data
    case constructor
    case type
    case value
}

public struct SymbolRange: Codable, Sendable, Equatable {
    public var start: Position
    public var end: Position

    public struct Position: Codable, Sendable, Equatable {
        public var line: Int
        public var character: Int
    }
}

public struct SymbolEntry: Codable, Sendable, Equatable {
    public var name: String
    public var kind: SymbolKind
    public var module: String
    public var type: String
    public var file: String
    public var range: SymbolRange
    public var docs: String?
}

public struct MoonSymbolsFile: Codable, Sendable, Equatable {
    public var version: Int
    public var updatedAt: String
    public var projectRoot: String
    public var symbols: [SymbolEntry]
}

public func spanToRange(_ span: Span, name: String) -> SymbolRange {
    let line = max(0, span.start.line - 1)
    let character = max(0, span.start.column - 1)
    return SymbolRange(
        start: .init(line: line, character: character),
        end: .init(line: line, character: character + name.count)
    )
}

public func indexProgram(
    _ program: Program,
    source: String,
    filePath: String,
    moduleName: String
) -> [SymbolEntry] {
    let abs = URL(fileURLWithPath: filePath).standardizedFileURL.path
    var entries: [SymbolEntry] = []

    func push(_ name: String, _ kind: SymbolKind, _ span: Span, _ type: String, _ docs: String? = nil) {
        entries.append(SymbolEntry(
            name: name,
            kind: kind,
            module: moduleName,
            type: type,
            file: abs,
            range: spanToRange(span, name: name),
            docs: docs ?? extractMoonDocs(source, declLine: span.start.line)
        ))
    }

    for decl in program.declarations {
        switch decl {
        case .model(let m, let span):
            push(m.name, .model, span, "model \(m.name)")
            for field in m.fields {
                push(field.name, .type, field.span, formatType(instantiate(typeSpecToScheme(field.type), supply: freshVar)))
            }
        case .agent(let a, let span):
            push(a.name, .agent, span, "agent \(a.name)")
        case .data(let d, let span):
            push(d.name, .data, span, "data \(d.name)")
            for ctor in d.constructors {
                push(ctor.name, .constructor, ctor.span, ctor.name)
            }
        case .function(let f, _):
            if let sig = f.signature {
                push(sig.name, .function, sig.span, formatType(instantiate(typeSpecToScheme(sig.type), supply: freshVar)))
            }
            for eq in f.equations {
                if f.signature?.name == eq.name { continue }
                push(eq.name, .function, eq.span, eq.name)
            }
        default:
            break
        }
    }
    return entries
}

public func indexStdlibSymbols() -> [SymbolEntry] {
    var entries: [SymbolEntry] = []
    for modulePath in allCoreModulePaths() {
        let parts = modulePath.split(separator: ".").map(String.init)
        guard let stdlibPath = resolveStdlibPath(modulePath: parts),
              let source = try? String(contentsOfFile: stdlibPath, encoding: .utf8) else { continue }
        if let program = try? MoonParser().parse(source) {
            entries.append(contentsOf: indexProgram(program, source: source, filePath: stdlibPath, moduleName: modulePath))
        }
    }
    return entries
}

public func indexPreludeSymbols() -> [SymbolEntry] {
    let prelude = buildPrelude()
    return prelude.values.map { name, scheme in
        SymbolEntry(
            name: name,
            kind: .type,
            module: "Moon.Prelude",
            type: formatType(instantiate(scheme, supply: freshVar)),
            file: "",
            range: SymbolRange(start: .init(line: 0, character: 0), end: .init(line: 0, character: name.count)),
            docs: "Moon prelude builtin"
        )
    }
}

public func indexWorkspaceSymbols(projectRoot: String) -> [SymbolEntry] {
    let libDir = URL(fileURLWithPath: projectRoot).appendingPathComponent("lib")
    guard let files = try? FileManager.default.contentsOfDirectory(atPath: libDir.path) else { return [] }
    var entries: [SymbolEntry] = []
    for file in files where file.hasSuffix(".moon") {
        let path = libDir.appendingPathComponent(file).path
        guard let source = try? String(contentsOfFile: path, encoding: .utf8),
              let program = try? MoonParser().parse(source) else { continue }
        let moduleName = String(file.dropLast(5))
        entries.append(contentsOf: indexProgram(program, source: source, filePath: path, moduleName: moduleName))
    }
    return entries
}

public func buildSymbolIndex(projectRoot: String, extraFiles: [String] = []) -> [SymbolEntry] {
    var seen = Set<String>()
    var out: [SymbolEntry] = []

    func add(_ entry: SymbolEntry) {
        let key = "\(entry.module)::\(entry.name)::\(entry.file)"
        guard !seen.contains(key) else { return }
        seen.insert(key)
        out.append(entry)
    }

    for entry in indexPreludeSymbols() { add(entry) }
    for entry in indexStdlibSymbols() { add(entry) }
    for entry in indexWorkspaceSymbols(projectRoot: projectRoot) { add(entry) }

    for filePath in extraFiles {
        guard FileManager.default.fileExists(atPath: filePath),
              let source = try? String(contentsOfFile: filePath, encoding: .utf8),
              let program = try? MoonParser().parse(source) else { continue }
        let moduleName = URL(fileURLWithPath: filePath).deletingPathExtension().lastPathComponent
        for entry in indexProgram(program, source: source, filePath: filePath, moduleName: moduleName) {
            add(entry)
        }
    }

    return out.sorted { a, b in
        let byName = a.name.localizedCaseInsensitiveCompare(b.name)
        if byName != .orderedSame { return byName == .orderedAscending }
        return a.module.localizedCaseInsensitiveCompare(b.module) == .orderedAscending
    }
}

public func findProjectRootFromPath(_ entryPath: String) -> String {
    var dir = URL(fileURLWithPath: entryPath).standardizedFileURL
    if dir.pathExtension == "moon" {
        dir = dir.deletingLastPathComponent()
    }
    while true {
        if findMoonfile(startDir: dir.path) != nil { return dir.path }
        let parent = dir.deletingLastPathComponent()
        if parent.path == dir.path { break }
        dir = parent
    }
    return URL(fileURLWithPath: entryPath).deletingLastPathComponent().path
}
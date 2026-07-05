import Foundation
import MoonAST
import MoonMoonfile
import MoonParser
import MoonResolver
import MoonTypechecker
import MoonTypes

public struct SymbolInfo: Sendable, Equatable {
    public var name: String
    public var type: String
    public var module: String?
    public var filePath: String?
    public var line: Int?
    public var character: Int?
    public var range: SymbolRange?
    public var docs: String?

    public init(
        name: String,
        type: String,
        module: String? = nil,
        filePath: String? = nil,
        line: Int? = nil,
        character: Int? = nil,
        range: SymbolRange? = nil,
        docs: String? = nil
    ) {
        self.name = name
        self.type = type
        self.module = module
        self.filePath = filePath
        self.line = line
        self.character = character
        self.range = range
        self.docs = docs
    }
}

public struct DefinitionTarget: Sendable, Equatable {
    public var uri: String
    public var line: Int
    public var character: Int
    public var endLine: Int
    public var endCharacter: Int
}

public func buildSymbolTable(
    _ program: Program,
    entryPath: String,
    db: SymbolDatabase? = nil,
    source: String? = nil
) -> [String: SymbolInfo] {
    var table: [String: SymbolInfo] = [:]
    let entryURL = URL(fileURLWithPath: entryPath).standardizedFileURL
    let projectRoot = findMoonfile(startDir: entryURL.deletingLastPathComponent().path)
        .map { URL(fileURLWithPath: $0).deletingLastPathComponent().path }
        ?? entryURL.deletingLastPathComponent().path

    let prelude = buildPrelude()
    for (name, scheme) in prelude.values {
        let entry = db?.lookup(name: name, module: "Moon.Prelude")
        table[name] = SymbolInfo(
            name: name,
            type: formatType(instantiate(scheme, supply: freshVar)),
            module: "Moon.Prelude",
            range: entry?.range,
            docs: entry?.docs
        )
    }

    let resolved = resolveImports(program, options: ResolveOptions(
        entryPath: entryURL.path,
        projectRoot: projectRoot
    ))
    for imp in resolved.imports {
        for (name, scheme) in imp.schemes {
            let entry = db?.lookup(name: name, module: imp.pathKey, file: imp.filePath)
            table[name] = SymbolInfo(
                name: name,
                type: formatType(instantiate(scheme, supply: freshVar)),
                module: imp.pathKey,
                filePath: imp.filePath,
                range: entry?.range,
                docs: entry?.docs
            )
        }
    }

    let src = source ?? (try? String(contentsOf: entryURL, encoding: .utf8)) ?? ""
    for entry in indexProgramSymbols(program, source: src, filePath: entryURL.path) {
        if table[entry.name] == nil {
            table[entry.name] = entry
        }
    }

    for decl in program.declarations {
        if case .function(let fn, _) = decl, let sig = fn.signature, table[sig.name] == nil {
            table[sig.name] = SymbolInfo(
                name: sig.name,
                type: formatType(instantiate(typeSpecToScheme(sig.type), supply: freshVar)),
                filePath: entryURL.path,
                line: max(0, sig.span.start.line - 1),
                character: max(0, sig.span.start.column - 1),
                range: spanToRange(sig.span, name: sig.name)
            )
        }
        if case .agent(let agent, let span) = decl, table[agent.name] == nil {
            table[agent.name] = SymbolInfo(
                name: agent.name,
                type: "agent \(agent.name)",
                filePath: entryURL.path,
                line: max(0, span.start.line - 1),
                character: max(0, span.start.column - 1),
                range: spanToRange(span, name: agent.name)
            )
        }
        if case .data(let d, _) = decl {
            for ctor in d.constructors where table[ctor.name] == nil {
                table[ctor.name] = SymbolInfo(
                    name: ctor.name,
                    type: ctor.name,
                    filePath: entryURL.path,
                    line: max(0, ctor.span.start.line - 1),
                    character: max(0, ctor.span.start.column - 1),
                    range: spanToRange(ctor.span, name: ctor.name)
                )
            }
        }
    }

    return table
}

public func lookupSymbol(
    _ program: Program,
    entryPath: String,
    name: String,
    db: SymbolDatabase? = nil,
    source: String? = nil
) -> SymbolInfo? {
    buildSymbolTable(program, entryPath: entryPath, db: db, source: source)[name]
}

public func definitionLocation(
    _ program: Program,
    entryPath: String,
    name: String,
    db: SymbolDatabase? = nil,
    source: String = ""
) -> DefinitionTarget? {
    if let db, let entry = db.lookupScoped(program: program, entryPath: entryPath, name: name),
       let target = db.toLocation(entry) {
        return target
    }

    if let info = lookupSymbol(program, entryPath: entryPath, name: name, db: db, source: source) {
        if let range = info.range, let filePath = info.filePath {
            return DefinitionTarget(
                uri: URL(fileURLWithPath: filePath).absoluteURL.absoluteString,
                line: range.start.line,
                character: range.start.character,
                endLine: range.end.line,
                endCharacter: range.end.character
            )
        }
        if let filePath = info.filePath {
            let line = info.line ?? findSymbolLine(in: filePath, name: name) ?? 0
            let character = info.character ?? 0
            return DefinitionTarget(
                uri: URL(fileURLWithPath: filePath).absoluteURL.absoluteString,
                line: line,
                character: character,
                endLine: line,
                endCharacter: character + name.count
            )
        }
    }

    for modulePath in allCoreModulePaths() {
        guard let schemes = coreModuleSchemes(modulePath), schemes[name] != nil else { continue }
        if let entry = db?.lookup(name: name, module: modulePath) {
            return db?.toLocation(entry)
        }
        let parts = modulePath.split(separator: ".").map(String.init)
        guard let stdlibPath = resolveStdlibPath(modulePath: parts) else { continue }
        let line = findSymbolLine(in: stdlibPath, name: name) ?? 0
        return DefinitionTarget(
            uri: URL(fileURLWithPath: stdlibPath).absoluteURL.absoluteString,
            line: line,
            character: 0,
            endLine: line,
            endCharacter: name.count
        )
    }

    return nil
}

private func indexProgramSymbols(_ program: Program, source: String, filePath: String) -> [SymbolInfo] {
    indexProgram(program, source: source, filePath: filePath, moduleName: URL(fileURLWithPath: filePath).deletingPathExtension().lastPathComponent)
        .map { entry in
            SymbolInfo(
                name: entry.name,
                type: entry.type,
                filePath: entry.file,
                line: entry.range.start.line,
                character: entry.range.start.character,
                range: entry.range,
                docs: entry.docs
            )
        }
}

private func findSymbolLine(in filePath: String, name: String) -> Int? {
    guard let text = try? String(contentsOfFile: filePath, encoding: .utf8) else { return nil }
    let pattern = #"(?m)^\s*\#(NSRegularExpression.escapedPattern(for: name))\b"#
    guard let regex = try? NSRegularExpression(pattern: pattern) else { return nil }
    let range = NSRange(text.startIndex..<text.endIndex, in: text)
    guard let match = regex.firstMatch(in: text, range: range),
          let swiftRange = Range(match.range, in: text) else { return nil }
    return text[..<swiftRange.lowerBound].filter { $0 == "\n" }.count
}
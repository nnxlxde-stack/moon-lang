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
}

public struct DefinitionTarget: Sendable, Equatable {
    public var uri: String
    public var line: Int
    public var character: Int
    public var endLine: Int
    public var endCharacter: Int
}

public func buildSymbolTable(_ program: Program, entryPath: String, source: String? = nil) -> [String: SymbolInfo] {
    var table: [String: SymbolInfo] = [:]
    let entryURL = URL(fileURLWithPath: entryPath).standardizedFileURL
    let projectRoot = findMoonfile(startDir: entryURL.deletingLastPathComponent().path)
        .map { URL(fileURLWithPath: $0).deletingLastPathComponent().path }
        ?? entryURL.deletingLastPathComponent().path

    let prelude = buildPrelude()
    for (name, scheme) in prelude.values {
        table[name] = SymbolInfo(
            name: name,
            type: formatType(instantiate(scheme, supply: freshVar)),
            module: "Moon.Prelude"
        )
    }

    let resolved = resolveImports(program, options: ResolveOptions(
        entryPath: entryURL.path,
        projectRoot: projectRoot
    ))
    for imp in resolved.imports {
        for (name, scheme) in imp.schemes {
            table[name] = SymbolInfo(
                name: name,
                type: formatType(instantiate(scheme, supply: freshVar)),
                module: imp.pathKey,
                filePath: imp.filePath
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
                character: max(0, sig.span.start.column - 1)
            )
        }
        if case .agent(let agent, let span) = decl, table[agent.name] == nil {
            table[agent.name] = SymbolInfo(
                name: agent.name,
                type: "agent \(agent.name)",
                filePath: entryURL.path,
                line: max(0, span.start.line - 1),
                character: max(0, span.start.column - 1)
            )
        }
    }

    return table
}

public func lookupSymbol(
    _ program: Program,
    entryPath: String,
    name: String,
    source: String? = nil
) -> SymbolInfo? {
    buildSymbolTable(program, entryPath: entryPath, source: source)[name]
}

public func definitionLocation(
    _ program: Program,
    entryPath: String,
    name: String,
    source: String = ""
) -> DefinitionTarget? {
    if let info = lookupSymbol(program, entryPath: entryPath, name: name, source: source),
       let filePath = info.filePath {
        let uri = URL(fileURLWithPath: filePath).absoluteURL.absoluteString
        let line = info.line ?? findSymbolLine(in: filePath, name: name) ?? 0
        let character = info.character ?? 0
        return DefinitionTarget(
            uri: uri,
            line: line,
            character: character,
            endLine: line,
            endCharacter: character + name.count
        )
    }

    for modulePath in allCoreModulePaths() {
        guard let schemes = coreModuleSchemes(modulePath), schemes[name] != nil else { continue }
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
    var entries: [SymbolInfo] = []
    for decl in program.declarations {
        switch decl {
        case .model(let m, let span):
            entries.append(symbolEntry(m.name, type: "model \(m.name)", span: span, filePath: filePath))
        case .agent(let a, let span):
            entries.append(symbolEntry(a.name, type: "agent \(a.name)", span: span, filePath: filePath))
        case .data(let d, let span):
            entries.append(symbolEntry(d.name, type: "data \(d.name)", span: span, filePath: filePath))
            for ctor in d.constructors {
                entries.append(symbolEntry(ctor.name, type: ctor.name, span: ctor.span, filePath: filePath))
            }
        case .function(let f, _):
            if let sig = f.signature {
                entries.append(symbolEntry(sig.name, type: formatType(instantiate(typeSpecToScheme(sig.type), supply: freshVar)), span: sig.span, filePath: filePath))
            }
        default:
            break
        }
    }
    return entries
}

private func symbolEntry(_ name: String, type: String, span: Span, filePath: String) -> SymbolInfo {
    SymbolInfo(
        name: name,
        type: type,
        filePath: filePath,
        line: max(0, span.start.line - 1),
        character: max(0, span.start.column - 1)
    )
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
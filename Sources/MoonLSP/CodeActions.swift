import Foundation
import MoonAST
import MoonResolver

public struct MoonCodeAction: Sendable, Equatable {
    public var title: String
    public var kind: String
    public var line: Int
    public var character: Int
    public var endLine: Int
    public var endCharacter: Int
    public var newText: String
    public var isPreferred: Bool

    public init(
        title: String,
        kind: String,
        line: Int,
        character: Int,
        endLine: Int,
        endCharacter: Int,
        newText: String,
        isPreferred: Bool = false
    ) {
        self.title = title
        self.kind = kind
        self.line = line
        self.character = character
        self.endLine = endLine
        self.endCharacter = endCharacter
        self.newText = newText
        self.isPreferred = isPreferred
    }
}

public func getCodeActions(
    _ program: Program,
    entryPath: String,
    diagnostic: MoonDiagnostic
) -> [MoonCodeAction] {
    var actions: [MoonCodeAction] = []
    let imports = existingImports(program)
    let table = buildSymbolTable(program, entryPath: entryPath)
    let allNames = Array(table.keys)

    if let name = extractUnknownVariable(diagnostic.message) {
        if let modulePath = moduleForSymbol(name), !imports.contains(modulePath) {
            let insertLine = lastImportLine(program)
            actions.append(MoonCodeAction(
                title: "Import \(modulePath)",
                kind: "quickfix",
                line: insertLine,
                character: 0,
                endLine: insertLine,
                endCharacter: 0,
                newText: "import \(modulePath)\n",
                isPreferred: true
            ))
        }
        if let suggestion = similarName(name, candidates: allNames) {
            actions.append(MoonCodeAction(
                title: "Use '\(suggestion)' instead",
                kind: "quickfix",
                line: diagnostic.line,
                character: diagnostic.character,
                endLine: diagnostic.line,
                endCharacter: diagnostic.endCharacter,
                newText: suggestion
            ))
        }
    }

    return actions
}

private func extractUnknownVariable(_ message: String) -> String? {
    guard let range = message.range(of: #"^Unknown variable (.+)$"#, options: .regularExpression) else {
        return nil
    }
    let name = String(message[range]).replacingOccurrences(of: "Unknown variable ", with: "")
    return name.isEmpty ? nil : name
}

private func existingImports(_ program: Program) -> Set<String> {
    var out = Set<String>()
    for decl in program.declarations {
        if case .importDecl(let path, _, _) = decl {
            out.insert(path.joined(separator: "."))
        }
    }
    return out
}

private func lastImportLine(_ program: Program) -> Int {
    var line = 0
    for decl in program.declarations {
        if case .importDecl(_, _, let span) = decl {
            line = max(line, span.end.line)
        }
    }
    return line
}

private func moduleForSymbol(_ name: String) -> String? {
    for modulePath in allCoreModulePaths() {
        if let schemes = coreModuleSchemes(modulePath), schemes[name] != nil {
            return modulePath
        }
    }
    return nil
}

private func similarName(_ name: String, candidates: [String]) -> String? {
    let lower = name.lowercased()
    var best: String?
    var bestDist = Int.max
    for candidate in candidates {
        let dist = levenshtein(lower, candidate.lowercased())
        if dist < bestDist && dist <= 2 && dist > 0 {
            bestDist = dist
            best = candidate
        }
    }
    return best
}

private func levenshtein(_ a: String, _ b: String) -> Int {
    let aChars = Array(a)
    let bChars = Array(b)
    var dp = Array(repeating: Array(repeating: 0, count: bChars.count + 1), count: aChars.count + 1)
    for i in 0...aChars.count { dp[i][0] = i }
    for j in 0...bChars.count { dp[0][j] = j }
    for i in 1...aChars.count {
        for j in 1...bChars.count {
            let cost = aChars[i - 1] == bChars[j - 1] ? 0 : 1
            dp[i][j] = min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
        }
    }
    return dp[aChars.count][bChars.count]
}
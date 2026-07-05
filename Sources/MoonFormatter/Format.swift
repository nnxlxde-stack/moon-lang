import Foundation
import MoonAST
import MoonParser

private let indentUnit = "    "

public func formatSource(_ source: String) -> String {
    do {
        let program = try MoonParser().parse(source)
        let formatted = formatProgram(program, source: source)
        _ = try MoonParser().parse(formatted)
        return formatted
    } catch {
        return source
    }
}

private func sliceSpan(_ source: String, _ span: Span) -> String {
    let utf8Count = source.utf8.count
    let startOffset = max(0, min(span.start.offset, utf8Count))
    let endOffset = max(startOffset, min(span.end.offset, utf8Count))
    guard startOffset < utf8Count else { return "" }
    let start = source.utf8.index(source.utf8.startIndex, offsetBy: startOffset)
    let end = source.utf8.index(source.utf8.startIndex, offsetBy: endOffset)
    return String(source.utf8[start..<end]) ?? ""
}

private func formatProgram(_ program: Program, source: String) -> String {
    let header = extractLeadingComments(source)
    var parts: [String] = []
    if !header.isEmpty { parts.append(header.trimmingCharacters(in: .newlines)) }

    for decl in program.declarations {
        parts.append(formatDeclaration(decl, source: source))
    }

    return parts.filter { !$0.isEmpty }.joined(separator: "\n\n") + "\n"
}

private func extractLeadingComments(_ source: String) -> String {
    var header: [String] = []
    for line in source.split(separator: "\n", omittingEmptySubsequences: false) {
        let text = String(line)
        let trimmed = text.trimmingCharacters(in: .whitespaces)
        if trimmed.isEmpty || trimmed.hasPrefix("--") {
            header.append(text)
        } else {
            break
        }
    }
    return header.joined(separator: "\n")
}

private func formatDeclaration(_ decl: Declaration, source: String) -> String {
    switch decl {
    case .importDecl(let path, let alias, _):
        var line = "import \(path.joined(separator: "."))"
        if let alias { line += " as \(alias)" }
        return line
    case .function(let fnDecl, _):
        return formatFunction(fnDecl, source: source)
    default:
        return trimTrailingWhitespace(sliceSpan(source, declarationSpan(decl)))
    }
}

private func formatFunction(_ decl: FunctionDecl, source: String) -> String {
    var lines: [String] = []
    if let signature = decl.signature {
        lines.append(sliceSpan(source, signature.span))
    }
    for eq in decl.equations {
        switch eq.body {
        case .doBlock(let block):
            lines.append(formatDoEquation(
                name: eq.name,
                patterns: eq.patterns,
                block: block,
                span: eq.span,
                source: source
            ))
        case .expression:
            lines.append(trimTrailingWhitespace(sliceSpan(source, eq.span)))
        }
    }
    return lines.joined(separator: "\n")
}

private func formatDoEquation(
    name: String,
    patterns: [Pattern],
    block: DoBlock,
    span: Span,
    source: String
) -> String {
    let raw = sliceSpan(source, span)
    let prefix = formatEquationPrefix(name: name, patterns: patterns, source: source, span: span, raw: raw)
    let body = formatDoBlock(block, source: source, depth: 1)
    return "\(prefix)\n\(body)"
}

private func formatEquationPrefix(
    name: String,
    patterns: [Pattern],
    source: String,
    span: Span,
    raw: String
) -> String {
    let patText = patterns
        .map { trimTrailingWhitespace(sliceSpan(source, patternSpan($0))) }
        .joined(separator: " ")
    if let range = raw.range(of: "= do") {
        return trimTrailingWhitespace(String(raw[..<range.upperBound]))
    }
    let patSuffix = patText.isEmpty ? "" : " \(patText)"
    return "\(name)\(patSuffix) = do"
}

private func formatDoBlock(_ block: DoBlock, source: String, depth: Int) -> String {
    block.statements
        .map { reindentBlock(sliceSpan(source, doStatementSpan($0)), depth: depth) }
        .joined(separator: "\n")
}

private func reindentBlock(_ text: String, depth: Int) -> String {
    let lines = text.split(separator: "\n", omittingEmptySubsequences: false).map(String.init)
    let nonempty = lines.filter { !$0.trimmingCharacters(in: .whitespaces).isEmpty }
    if nonempty.isEmpty { return "" }

    let baseIndent = nonempty.map { line in
        line.prefix(while: { $0 == " " || $0 == "\t" }).count
    }.min() ?? 0

    let pad = String(repeating: indentUnit, count: depth)
    return lines.map { line in
        if line.trimmingCharacters(in: .whitespaces).isEmpty { return "" }
        let content: String
        if line.count >= baseIndent {
            content = String(line.dropFirst(baseIndent))
        } else {
            content = line.trimmingCharacters(in: .whitespaces)
        }
        return pad + content
    }.joined(separator: "\n")
}

private func trimTrailingWhitespace(_ text: String) -> String {
    text
        .split(separator: "\n", omittingEmptySubsequences: false)
        .map { $0.replacingOccurrences(of: #"[ \t]+$"#, with: "", options: .regularExpression) }
        .joined(separator: "\n")
        .trimmingCharacters(in: .newlines)
        .trimmingCharacters(in: CharacterSet(charactersIn: " \t"))
}

private func declarationSpan(_ decl: Declaration) -> Span {
    switch decl {
    case .importDecl(_, _, let span): return span
    case .model(_, let span): return span
    case .agent(_, let span): return span
    case .data(_, let span): return span
    case .instance(_, let span): return span
    case .function(_, let span): return span
    case .macro(_, let span): return span
    }
}

private func patternSpan(_ pat: Pattern) -> Span {
    switch pat {
    case .pVar(_, let span): return span
    case .pWildcard(let span): return span
    case .pLit(_, let span): return span
    case .pCon(_, _, let span): return span
    case .pTuple(_, let span): return span
    case .pList(_, let span): return span
    }
}

private func doStatementSpan(_ stmt: DoStatement) -> Span {
    switch stmt {
    case .bind(_, _, _, let span): return span
    case .storm(_, _, _, let span): return span
    case .letBind(_, _, let span): return span
    case .action(_, _, let span): return span
    }
}
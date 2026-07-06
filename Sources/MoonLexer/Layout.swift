import Foundation

private struct SourceLine {
    var indent: Int
    var tokens: [Token]
}

private func lineIndent(source: String, tok: Token) -> Int {
    let scalars = Array(source.unicodeScalars)
    var pos = tok.offset - 1
    while pos >= 0 && scalars[pos] != "\n" && scalars[pos] != "\r" {
        pos -= 1
    }
    return getIndentAt(source: source, start: pos + 1)
}

private func getIndentAt(source: String, start: Int) -> Int {
    let scalars = Array(source.unicodeScalars)
    var col = 0
    var i = start
    while i < scalars.count {
        let ch = scalars[i]
        if ch == " " {
            col += 1
        } else if ch == "\t" {
            col += 4
        } else {
            break
        }
        i += 1
    }
    return col
}

private func groupLines(tokens: [Token]) -> [SourceLine] {
    var lines: [SourceLine] = []
    var current: [Token] = []

    for tok in tokens {
        if tok.kind == .newline {
            if !current.isEmpty {
                lines.append(SourceLine(indent: 0, tokens: current))
            }
            current = []
        } else if tok.kind != .eof {
            current.append(tok)
        }
    }
    if !current.isEmpty {
        lines.append(SourceLine(indent: 0, tokens: current))
    }
    return lines
}

private func synthetic(kind: TokenKind, ref: Token) -> Token {
    Token(kind: kind, value: nil, line: ref.line, column: ref.column, offset: ref.offset)
}

private func lineHasLayoutOpener(tokens: [Token]) -> Bool {
    tokens.contains { layoutOpeners.contains($0.kind) }
}

private func lineOpensImplicitConfig(tokens: [Token]) -> Bool {
    guard let first = tokens.first else { return false }
    if first.kind == .kwAgent || first.kind == .kwModel {
        return !tokens.contains { $0.kind == .kwWhere }
    }
    return false
}

public func applyLayout(source: String, rawTokens: [Token]) -> [Token] {
    let rawLines = groupLines(tokens: rawTokens)
    let lines = rawLines.map { line in
        SourceLine(
            indent: line.tokens.first.map { lineIndent(source: source, tok: $0) } ?? 0,
            tokens: line.tokens
        )
    }

    var result: [Token] = []
    var indentStack: [Int] = []
    var pendingLayout = false
    var pendingImplicit = false
    var firstInBlock = false

    func closeLayoutsAbove(_ indent: Int, ref: Token) {
        while let top = indentStack.last, top > indent {
            indentStack.removeLast()
            result.append(synthetic(kind: .rbrace, ref: ref))
            firstInBlock = false
        }
    }

    func openLayout(_ indent: Int, ref: Token) {
        indentStack.append(indent)
        result.append(synthetic(kind: .lbrace, ref: ref))
        firstInBlock = true
    }

    for (index, line) in lines.enumerated() {
        guard !line.tokens.isEmpty else { continue }

        let ref = line.tokens[0]
        closeLayoutsAbove(line.indent, ref: ref)

        if pendingLayout || pendingImplicit {
            if line.indent > (indentStack.last ?? -1) {
                openLayout(line.indent, ref: ref)
            }
            pendingLayout = false
            pendingImplicit = false
        } else if let top = indentStack.last, line.indent == top, !firstInBlock {
            result.append(synthetic(kind: .semi, ref: ref))
        }

        for tok in line.tokens {
            result.append(tok)
            if layoutOpeners.contains(tok.kind) {
                pendingLayout = true
            }
        }

        if lineOpensImplicitConfig(tokens: line.tokens) {
            let next = lines[safe: index + 1]
            if let next, !next.tokens.isEmpty, next.indent > line.indent {
                pendingImplicit = true
            }
        }

        if let top = indentStack.last, line.indent >= top {
            firstInBlock = false
        }
    }

    let eofRef = Token(kind: .eof, line: 0, column: 0, offset: source.count)
    closeLayoutsAbove(-1, ref: eofRef)
    result.append(eofRef)
    return result
}

private extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
import Foundation

public struct LexError: Error, CustomStringConvertible {
    public var message: String
    public var line: Int
    public var column: Int

    public init(_ message: String, line: Int, column: Int) {
        self.message = message
        self.line = line
        self.column = column
    }

    public var description: String {
        "\(message) at \(line):\(column)"
    }
}

private struct RawToken {
    var token: Token
    var hadSpaceBefore: Bool
    var hadSpaceAfter: Bool
}

private func isAsciiLetter(_ s: UnicodeScalar) -> Bool {
    (65...90).contains(s.value) || (97...122).contains(s.value)
}

private func isAsciiDigit(_ s: UnicodeScalar) -> Bool {
    (48...57).contains(s.value)
}

public func rawLex(_ source: String) throws -> [Token] {
    let scalars = Array(source.unicodeScalars)
    var tokens: [RawToken] = []
    var i = 0
    var line = 1
    var column = 1

    func peek(_ n: Int = 0) -> UnicodeScalar? {
        let idx = i + n
        guard idx < scalars.count else { return nil }
        return scalars[idx]
    }

    @discardableResult
    func advance() -> UnicodeScalar {
        let ch = scalars[i]
        i += 1
        if ch == "\n" {
            line += 1
            column = 1
        } else {
            column += 1
        }
        return ch
    }

    func makeToken(
        kind: TokenKind,
        value: String?,
        startLine: Int,
        startCol: Int,
        startOffset: Int,
        hadSpaceBefore: Bool,
        hadSpaceAfter: Bool
    ) -> RawToken {
        RawToken(
            token: Token(kind: kind, value: value, line: startLine, column: startCol, offset: startOffset),
            hadSpaceBefore: hadSpaceBefore,
            hadSpaceAfter: hadSpaceAfter
        )
    }

    func hasSpaceAfter() -> Bool {
        peek() == " " || peek() == "\t"
    }

    func skipComment() {
        _ = advance()
        while i < scalars.count {
            let ch = peek()!
            if ch == "\n" || ch == "\r" { break }
            _ = advance()
        }
    }

    func readString(startLine: Int, startCol: Int, startOffset: Int, hadSpaceBefore: Bool) throws {
        _ = advance()
        if peek() == "\"", peek(1) == "\"" {
            _ = advance()
            _ = advance()
            var value = ""
            while i < scalars.count {
                if peek() == "\"", peek(1) == "\"", peek(2) == "\"" {
                    _ = advance()
                    _ = advance()
                    _ = advance()
                    break
                }
                value.unicodeScalars.append(advance())
            }
            tokens.append(makeToken(
                kind: .string, value: value,
                startLine: startLine, startCol: startCol, startOffset: startOffset,
                hadSpaceBefore: hadSpaceBefore, hadSpaceAfter: hasSpaceAfter()
            ))
            return
        }

        var value = ""
        while i < scalars.count, peek() != "\"" {
            if peek() == "\\" {
                _ = advance()
                value.unicodeScalars.append(advance())
            } else {
                value.unicodeScalars.append(advance())
            }
        }
        guard peek() == "\"" else {
            throw LexError("Unterminated string", line: line, column: column)
        }
        _ = advance()
        tokens.append(makeToken(
            kind: .string, value: value,
            startLine: startLine, startCol: startCol, startOffset: startOffset,
            hadSpaceBefore: hadSpaceBefore, hadSpaceAfter: hasSpaceAfter()
        ))
    }

    func readNumber(startLine: Int, startCol: Int, startOffset: Int, hadSpaceBefore: Bool) {
        var num = ""
        while let ch = peek(), isAsciiDigit(ch) {
            num.unicodeScalars.append(advance())
        }
        if peek() == ".", let next = peek(1), isAsciiDigit(next) {
            num.unicodeScalars.append(advance())
            while let ch = peek(), isAsciiDigit(ch) {
                num.unicodeScalars.append(advance())
            }
            tokens.append(makeToken(
                kind: .float, value: num,
                startLine: startLine, startCol: startCol, startOffset: startOffset,
                hadSpaceBefore: hadSpaceBefore, hadSpaceAfter: hasSpaceAfter()
            ))
            return
        }
        tokens.append(makeToken(
            kind: .int, value: num,
            startLine: startLine, startCol: startCol, startOffset: startOffset,
            hadSpaceBefore: hadSpaceBefore, hadSpaceAfter: hasSpaceAfter()
        ))
    }

    func readIdent(startLine: Int, startCol: Int, startOffset: Int, hadSpaceBefore: Bool) {
        var ident = ""
        while let ch = peek(), isAsciiLetter(ch) || isAsciiDigit(ch) || ch == "_" || ch == "-" {
            ident.unicodeScalars.append(advance())
        }
        let spaceAfter = hasSpaceAfter()
        let peekChar: (Int) -> Character = { n in
            guard let s = peek(n) else { return "\0" }
            return Character(s)
        }
        if let kw = keywordKind(for: ident, peek: peekChar, hadSpaceAfter: spaceAfter) {
            tokens.append(makeToken(
                kind: kw, value: ident,
                startLine: startLine, startCol: startCol, startOffset: startOffset,
                hadSpaceBefore: hadSpaceBefore, hadSpaceAfter: spaceAfter
            ))
        } else {
            tokens.append(makeToken(
                kind: .ident, value: ident,
                startLine: startLine, startCol: startCol, startOffset: startOffset,
                hadSpaceBefore: hadSpaceBefore, hadSpaceAfter: spaceAfter
            ))
        }
    }

    func pushSimple(kind: TokenKind, len: Int, value: String?, startLine: Int, startCol: Int, startOffset: Int, hadSpaceBefore: Bool) {
        for _ in 0..<len { _ = advance() }
        tokens.append(makeToken(
            kind: kind, value: value,
            startLine: startLine, startCol: startCol, startOffset: startOffset,
            hadSpaceBefore: hadSpaceBefore, hadSpaceAfter: hasSpaceAfter()
        ))
    }

    func emitNewline(startLine: Int, startCol: Int, startOffset: Int) {
        if peek() == "\r" { _ = advance() }
        if peek() == "\n" { _ = advance() }
        tokens.append(makeToken(
            kind: .newline, value: nil,
            startLine: startLine, startCol: startCol, startOffset: startOffset,
            hadSpaceBefore: false, hadSpaceAfter: false
        ))
    }

    while i < scalars.count {
        guard let ch = peek() else { break }

        if ch == " " || ch == "\t" {
            _ = advance()
            continue
        }

        if ch == "\r" || ch == "\n" {
            let startLine = line
            let startCol = column
            let startOffset = i
            emitNewline(startLine: startLine, startCol: startCol, startOffset: startOffset)
            continue
        }

        let hadSpaceBefore = tokens.last?.hadSpaceAfter ?? false
        let startLine = line
        let startCol = column
        let startOffset = i

        if ch == "-", peek(1) == "-" {
            skipComment()
            continue
        }

        if ch == "\"" {
            try readString(startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
            continue
        }

        if isAsciiDigit(ch) {
            readNumber(startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
            continue
        }

        if isAsciiLetter(ch) || ch == "_" {
            readIdent(startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
            continue
        }

        let two: String = {
            guard let a = peek(), let b = peek(1) else { return String(ch) }
            return String(Character(a)) + String(Character(b))
        }()
        let three: String = {
            guard let a = peek(), let b = peek(1), let c = peek(2) else { return two }
            return two + String(Character(c))
        }()

        if three == "<-=" {
            throw LexError("Unexpected '<-='", line: startLine, column: startCol)
        }
        if two == "<-" { pushSimple(kind: .bind, len: 2, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore); continue }
        if three == ">>=" { pushSimple(kind: .seq, len: 3, value: ">>=", startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore); continue }
        if two == ">>" { pushSimple(kind: .seq, len: 2, value: ">>", startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore); continue }
        if two == "==" { pushSimple(kind: .eq, len: 2, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore); continue }
        if two == "/=" { pushSimple(kind: .neq, len: 2, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore); continue }
        if two == "<=" { pushSimple(kind: .le, len: 2, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore); continue }
        if two == ">=" { pushSimple(kind: .ge, len: 2, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore); continue }
        if two == "->" { pushSimple(kind: .arrow, len: 2, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore); continue }
        if two == "&&" { pushSimple(kind: .and, len: 2, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore); continue }
        if two == "||" { pushSimple(kind: .or, len: 2, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore); continue }

        if ch == "." {
            let spaceAfter = peek(1) == " " || peek(1) == "\t"
            if hadSpaceBefore && spaceAfter {
                pushSimple(kind: .composeDot, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
            } else {
                pushSimple(kind: .fieldDot, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
            }
            continue
        }

        if ch == "-" {
            let next = peek(1)
            if hadSpaceBefore || next == " " || next == "\t" || next == nil
                || !(next.map { isAsciiLetter($0) || isAsciiDigit($0) || $0 == "_" } ?? false) {
                pushSimple(kind: .minus, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
            } else {
                readIdent(startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
            }
            continue
        }

        switch ch {
        case "{": pushSimple(kind: .lbrace, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case "}": pushSimple(kind: .rbrace, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case ";": pushSimple(kind: .semi, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case "(": pushSimple(kind: .lparen, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case ")": pushSimple(kind: .rparen, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case "[": pushSimple(kind: .lbracket, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case "]": pushSimple(kind: .rbracket, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case ",": pushSimple(kind: .comma, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case ":": pushSimple(kind: .colon, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case "=": pushSimple(kind: .equals, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case "|": pushSimple(kind: .pipe, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case "\\": pushSimple(kind: .backslash, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case "$": pushSimple(kind: .dollar, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case "+": pushSimple(kind: .plus, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case "*": pushSimple(kind: .star, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case "/": pushSimple(kind: .slash, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case "<": pushSimple(kind: .lt, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        case ">": pushSimple(kind: .gt, len: 1, value: nil, startLine: startLine, startCol: startCol, startOffset: startOffset, hadSpaceBefore: hadSpaceBefore)
        default:
            throw LexError("Unexpected character '\(Character(ch))'", line: startLine, column: startCol)
        }
    }

    tokens.append(makeToken(
        kind: .eof, value: nil,
        startLine: line, startCol: column, startOffset: i,
        hadSpaceBefore: false, hadSpaceAfter: false
    ))
    return tokens.map(\.token)
}
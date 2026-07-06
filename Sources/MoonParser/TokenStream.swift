import MoonAST
import MoonLexer

public struct ParseError: Error, CustomStringConvertible {
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

public final class TokenStream: @unchecked Sendable {
    private let tokens: [Token]
    private var pos = 0
    public var stopAtEquation = false

    public init(_ tokens: [Token]) {
        self.tokens = tokens
    }

    public func peek(offset: Int = 0) -> Token {
        let idx = pos + offset
        if idx < tokens.count {
            return tokens[idx]
        }
        return tokens[tokens.count - 1]
    }

    @discardableResult
    public func advance() -> Token {
        let tok = peek()
        if tok.kind != .eof {
            pos += 1
        }
        return tok
    }

    public func at(_ kind: TokenKind) -> Bool {
        peek().kind == kind
    }

    public func check(_ kinds: TokenKind...) -> Bool {
        kinds.contains(peek().kind)
    }

    @discardableResult
    public func expect(_ kind: TokenKind) throws -> Token {
        let tok = peek()
        guard tok.kind == kind else {
            throw ParseError("Expected \(kind.rawValue), got \(tok.kind.rawValue)", line: tok.line, column: tok.column)
        }
        return advance()
    }

    @discardableResult
    public func skip(_ kind: TokenKind) -> Bool {
        if at(kind) {
            _ = advance()
            return true
        }
        return false
    }

    public func makeSpan(start: Token, end: Token) -> MoonAST.Span {
        MoonAST.Span(
            start: MoonAST.Position(line: start.line, column: start.column, offset: start.offset),
            end: MoonAST.Position(line: end.line, column: end.column, offset: end.offset)
        )
    }

    public func last() -> Token {
        if pos > 0 {
            return tokens[pos - 1]
        }
        return peek()
    }

    public func save() -> Int { pos }

    public func restore(_ saved: Int) {
        pos = saved
    }
}
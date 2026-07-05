import MoonAST
import MoonLexer

public enum MoonParserVersion {
    public static let current = "0.3.0"
}

public struct MoonParser {
    public init() {}

    public func parse(_ source: String, layout: Bool = true) throws -> Program {
        let tokens = try MoonLexer().lex(source, layout: layout)
        let ts = TokenStream(tokens)
        return try parseProgram(ts)
    }

    public func parseWithTokens(_ tokens: [Token]) throws -> Program {
        let ts = TokenStream(tokens)
        return try parseProgram(ts)
    }
}
import MoonAST

public enum MoonLexerVersion {
    public static let current = "0.3.0"
}

public struct MoonLexer {
    public init() {}

    public func lex(_ source: String, layout: Bool = true) throws -> [Token] {
        let raw = try rawLex(source)
        if !layout { return raw }
        return applyLayout(source: source, rawTokens: raw)
    }
}

public enum MoonLexerError: Error, CustomStringConvertible {
    case lex(LexError)

    public var description: String {
        switch self {
        case .lex(let err):
            err.description
        }
    }
}
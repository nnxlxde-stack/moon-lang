import Foundation

public enum TokenKind: String, Equatable, Sendable, CaseIterable {
    case eof = "EOF"
    case newline = "NEWLINE"
    case lbrace = "LBRACE"
    case rbrace = "RBRACE"
    case semi = "SEMI"
    case lparen = "LPAREN"
    case rparen = "RPAREN"
    case lbracket = "LBRACKET"
    case rbracket = "RBRACKET"
    case comma = "COMMA"
    case colon = "COLON"
    case equals = "EQUALS"
    case pipe = "PIPE"
    case backslash = "BACKSLASH"
    case fieldDot = "FIELD_DOT"
    case composeDot = "COMPOSE_DOT"
    case bind = "BIND"
    case seq = "SEQ"
    case arrow = "ARROW"
    case dollar = "DOLLAR"
    case eq = "EQ"
    case neq = "NEQ"
    case le = "LE"
    case ge = "GE"
    case lt = "LT"
    case gt = "GT"
    case plus = "PLUS"
    case minus = "MINUS"
    case star = "STAR"
    case slash = "SLASH"
    case and = "AND"
    case or = "OR"
    case ident = "IDENT"
    case string = "STRING"
    case int = "INT"
    case float = "FLOAT"
    case kwImport = "KW_IMPORT"
    case kwModel = "KW_MODEL"
    case kwAgent = "KW_AGENT"
    case kwData = "KW_DATA"
    case kwInstance = "KW_INSTANCE"
    case kwMacro = "KW_MACRO"
    case kwWhere = "KW_WHERE"
    case kwDo = "KW_DO"
    case kwLet = "KW_LET"
    case kwWith = "KW_WITH"
    case kwIf = "KW_IF"
    case kwThen = "KW_THEN"
    case kwElse = "KW_ELSE"
    case kwNot = "KW_NOT"
    case kwTrue = "KW_TRUE"
    case kwFalse = "KW_FALSE"
    case kwImplements = "KW_IMPLEMENTS"
    case kwRoutesTo = "KW_ROUTES_TO"
    case kwFor = "KW_FOR"
    case kwOptional = "KW_OPTIONAL"
    case kwConstraint = "KW_CONSTRAINT"
    case kwDefault = "KW_DEFAULT"
    case kwFetched = "KW_FETCHED"
    case kwFrom = "KW_FROM"
    case kwAs = "KW_AS"
    case kwPure = "KW_PURE"
    case kwStorm = "KW_STORM"
}

public struct Token: Equatable, Sendable {
    public var kind: TokenKind
    public var value: String?
    public var line: Int
    public var column: Int
    public var offset: Int

    public init(kind: TokenKind, value: String? = nil, line: Int, column: Int, offset: Int) {
        self.kind = kind
        self.value = value
        self.line = line
        self.column = column
        self.offset = offset
    }
}

public let moonKeywords: [String: TokenKind] = [
    "import": .kwImport,
    "model": .kwModel,
    "agent": .kwAgent,
    "data": .kwData,
    "instance": .kwInstance,
    "macro": .kwMacro,
    "where": .kwWhere,
    "do": .kwDo,
    "let": .kwLet,
    "with": .kwWith,
    "if": .kwIf,
    "then": .kwThen,
    "else": .kwElse,
    "not": .kwNot,
    "true": .kwTrue,
    "false": .kwFalse,
    "implements": .kwImplements,
    "routes_to": .kwRoutesTo,
    "for": .kwFor,
    "optional": .kwOptional,
    "constraint": .kwConstraint,
    "default": .kwDefault,
    "fetched": .kwFetched,
    "from": .kwFrom,
    "as": .kwAs,
    "pure": .kwPure,
    "storm": .kwStorm,
]

public let layoutOpeners: Set<TokenKind> = [.kwWhere, .kwDo, .kwWith]

private let modifierKeywords: Set<String> = ["constraint", "default", "optional", "fetched"]

public func keywordKind(for ident: String, peek: (Int) -> Character, hadSpaceAfter: Bool) -> TokenKind? {
    guard let kw = moonKeywords[ident] else { return nil }
    let isConfigKey = peek(0) == ":" && peek(1) != ":"
    if isConfigKey && !modifierKeywords.contains(ident) {
        return nil
    }
    return kw
}
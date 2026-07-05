import MoonAST
import MoonLexer

private struct InfixOp {
    var kind: String
    var precedence: Int
    var assoc: String
}

private let infixOps: [String: InfixOp] = [
    "$": InfixOp(kind: "$", precedence: 1, assoc: "right"),
    ">>=": InfixOp(kind: ">>=", precedence: 2, assoc: "left"),
    ">>": InfixOp(kind: ">>", precedence: 2, assoc: "left"),
    "||": InfixOp(kind: "||", precedence: 3, assoc: "left"),
    "&&": InfixOp(kind: "&&", precedence: 4, assoc: "left"),
    "==": InfixOp(kind: "==", precedence: 6, assoc: "left"),
    "/=": InfixOp(kind: "/=", precedence: 6, assoc: "left"),
    "<=": InfixOp(kind: "<=", precedence: 6, assoc: "left"),
    ">=": InfixOp(kind: ">=", precedence: 6, assoc: "left"),
    "<": InfixOp(kind: "<", precedence: 6, assoc: "left"),
    ">": InfixOp(kind: ">", precedence: 6, assoc: "left"),
    "+": InfixOp(kind: "+", precedence: 7, assoc: "left"),
    "-": InfixOp(kind: "-", precedence: 7, assoc: "left"),
    "*": InfixOp(kind: "*", precedence: 8, assoc: "left"),
    "/": InfixOp(kind: "/", precedence: 8, assoc: "left"),
    ".": InfixOp(kind: ".", precedence: 9, assoc: "left"),
]

private func tokenToOp(kind: TokenKind, value: String?) -> String? {
    switch kind {
    case .dollar: return "$"
    case .seq: return value ?? ">>"
    case .or: return "||"
    case .and: return "&&"
    case .eq: return "=="
    case .neq: return "/="
    case .le: return "<="
    case .ge: return ">="
    case .lt: return "<"
    case .gt: return ">"
    case .plus: return "+"
    case .minus: return "-"
    case .star: return "*"
    case .slash: return "/"
    case .composeDot: return "."
    default: return nil
    }
}

func parseExpression(_ ts: TokenStream) throws -> Expression {
    try parseDollar(ts)
}

private func parseDollar(_ ts: TokenStream) throws -> Expression {
    var left = try parseSeq(ts)
    while ts.at(.dollar) {
        let opTok = ts.advance()
        let right = try parseDollar(ts)
        left = .infix(op: "$", left: left, right: right, span: ts.makeSpan(start: opTok, end: ts.last()))
    }
    return left
}

private func parseSeq(_ ts: TokenStream) throws -> Expression {
    var left = try parseOr(ts)
    while ts.at(.seq) {
        let opTok = ts.advance()
        let op = opTok.value ?? ">>"
        let right = try parseOr(ts)
        left = .infix(op: op, left: left, right: right, span: ts.makeSpan(start: opTok, end: ts.last()))
    }
    return left
}

private func parseOr(_ ts: TokenStream) throws -> Expression {
    var left = try parseAnd(ts)
    while ts.at(.or) {
        let opTok = ts.advance()
        let right = try parseAnd(ts)
        left = .infix(op: "||", left: left, right: right, span: ts.makeSpan(start: opTok, end: ts.last()))
    }
    return left
}

private func parseAnd(_ ts: TokenStream) throws -> Expression {
    var left = try parseNot(ts)
    while ts.at(.and) {
        let opTok = ts.advance()
        let right = try parseNot(ts)
        left = .infix(op: "&&", left: left, right: right, span: ts.makeSpan(start: opTok, end: ts.last()))
    }
    return left
}

private func parseNot(_ ts: TokenStream) throws -> Expression {
    let start = ts.peek()
    if ts.at(.kwNot), ts.peek(offset: 1).kind != .composeDot {
        _ = ts.advance()
        let operand = try parseNot(ts)
        return .prefix(op: "not", operand: operand, span: ts.makeSpan(start: start, end: ts.last()))
    }
    return try parseCompare(ts)
}

private func parseCompare(_ ts: TokenStream) throws -> Expression {
    var left = try parseAdd(ts)
    if let op = tokenToOp(kind: ts.peek().kind, value: ts.peek().value),
       infixOps[op]?.precedence == 6 {
        let opTok = ts.advance()
        let right = try parseAdd(ts)
        left = .infix(op: op, left: left, right: right, span: ts.makeSpan(start: opTok, end: ts.last()))
    }
    return left
}

private func parseAdd(_ ts: TokenStream) throws -> Expression {
    var left = try parseMul(ts)
    while ts.check(.plus, .minus) {
        let opTok = ts.advance()
        let op = opTok.kind == .plus ? "+" : "-"
        let right = try parseMul(ts)
        left = .infix(op: op, left: left, right: right, span: ts.makeSpan(start: opTok, end: ts.last()))
    }
    return left
}

private func parseMul(_ ts: TokenStream) throws -> Expression {
    var left = try parseCompose(ts)
    while ts.check(.star, .slash) {
        let opTok = ts.advance()
        let op = opTok.kind == .star ? "*" : "/"
        let right = try parseCompose(ts)
        left = .infix(op: op, left: left, right: right, span: ts.makeSpan(start: opTok, end: ts.last()))
    }
    return left
}

private func parseCompose(_ ts: TokenStream) throws -> Expression {
    var left = try parseUnary(ts)
    while ts.at(.composeDot) {
        let opTok = ts.advance()
        let right = try parseUnary(ts)
        left = .infix(op: ".", left: left, right: right, span: ts.makeSpan(start: opTok, end: ts.last()))
    }
    return left
}

private func parseUnary(_ ts: TokenStream) throws -> Expression {
    let start = ts.peek()
    if ts.at(.minus) {
        _ = ts.advance()
        let operand = try parseUnary(ts)
        return .prefix(op: "-", operand: operand, span: ts.makeSpan(start: start, end: ts.last()))
    }
    return try parseApp(ts)
}

private func parseApp(_ ts: TokenStream) throws -> Expression {
    var expr = try parsePostfix(ts)
    while isPrimaryStart(ts) {
        let startPos: MoonAST.Position
        switch expr {
        case .lit(_, let span): startPos = span.start
        case .varRef(_, let span): startPos = span.start
        case .app(_, _, let span): startPos = span.start
        case .infix(_, _, _, let span): startPos = span.start
        case .prefix(_, _, let span): startPos = span.start
        case .fieldAccess(_, _, let span): startPos = span.start
        case .lambda(_, _, let span): startPos = span.start
        case .ifExpr(_, _, _, let span): startPos = span.start
        case .record(_, _, let span): startPos = span.start
        case .list(_, let span): startPos = span.start
        case .tuple(_, let span): startPos = span.start
        case .paren(_, let span): startPos = span.start
        case .doExpr(_, let span): startPos = span.start
        case .agent(_, let span): startPos = span.start
        case .model(_, let span): startPos = span.start
        }
        let arg = try parsePostfix(ts)
        let startTok = Token(kind: .ident, line: startPos.line, column: startPos.column, offset: startPos.offset)
        expr = .app(func: expr, arg: arg, span: ts.makeSpan(start: startTok, end: ts.last()))
    }
    return expr
}

private func parsePostfix(_ ts: TokenStream) throws -> Expression {
    var expr = try parsePrimary(ts)
    if case .varRef(let name, let span) = expr, ts.at(.lbrace), isUpperName(name) {
        expr = try parseRecordExpr(ts, name: name, start: Token(kind: .ident, line: span.start.line, column: span.start.column, offset: span.start.offset))
    }
    while ts.at(.fieldDot) {
        _ = ts.advance()
        let field = try ts.expect(.ident).value ?? ""
        let end = ts.last()
        let objectSpan: MoonAST.Span
        switch expr {
        case .lit(_, let s): objectSpan = s
        case .varRef(_, let s): objectSpan = s
        case .app(_, _, let s): objectSpan = s
        case .infix(_, _, _, let s): objectSpan = s
        case .prefix(_, _, let s): objectSpan = s
        case .fieldAccess(_, _, let s): objectSpan = s
        case .lambda(_, _, let s): objectSpan = s
        case .ifExpr(_, _, _, let s): objectSpan = s
        case .record(_, _, let s): objectSpan = s
        case .list(_, let s): objectSpan = s
        case .tuple(_, let s): objectSpan = s
        case .paren(_, let s): objectSpan = s
        case .doExpr(_, let s): objectSpan = s
        case .agent(_, let s): objectSpan = s
        case .model(_, let s): objectSpan = s
        }
        expr = .fieldAccess(
            object: expr,
            field: field,
            span: MoonAST.Span(
                start: objectSpan.start,
                end: MoonAST.Position(line: end.line, column: end.column, offset: end.offset)
            )
        )
    }
    return expr
}

private func isUpperName(_ name: String) -> Bool {
    guard let first = name.first else { return false }
    return first == first.uppercased().first
}

private func canStartPattern(_ ts: TokenStream) -> Bool {
    ts.check(.ident, .lparen, .lbracket, .string, .int, .float, .kwTrue, .kwFalse)
}

private func isPrimaryStart(_ ts: TokenStream) -> Bool {
    if ts.check(.semi, .rbrace, .eof, .rparen, .rbracket, .comma, .colon, .bind, .kwWith, .kwElse, .kwThen, .arrow) {
        return false
    }
    if ts.at(.ident), ts.peek(offset: 1).kind == .colon {
        return false
    }
    return ts.check(
        .ident, .string, .int, .float, .kwTrue, .kwFalse,
        .lparen, .lbracket, .backslash, .kwIf, .kwDo, .kwAgent, .kwModel,
        .minus, .kwPure
    )
}

private func parsePrimary(_ ts: TokenStream) throws -> Expression {
    let start = ts.peek()

    if ts.at(.kwPure) {
        _ = ts.advance()
        if ts.at(.dollar) {
            _ = ts.advance()
            let expr = try parseExpression(ts)
            return .app(
                func: .varRef(name: "pure", span: ts.makeSpan(start: start, end: start)),
                arg: expr,
                span: ts.makeSpan(start: start, end: ts.last())
            )
        }
        return .varRef(name: "pure", span: ts.makeSpan(start: start, end: ts.last()))
    }

    if ts.at(.kwNot) {
        let tok = ts.advance()
        return .varRef(name: "not", span: ts.makeSpan(start: start, end: tok))
    }

    if ts.check(.string, .int, .float, .kwTrue, .kwFalse) {
        let lit = try parseLiteral(ts)
        return .lit(value: lit, span: literalSpan(lit))
    }

    if ts.at(.ident) {
        let tok = ts.advance()
        if ts.at(.lbrace), isUpperName(tok.value ?? "") {
            return try parseRecordExpr(ts, name: tok.value ?? "", start: start)
        }
        return .varRef(name: tok.value ?? "", span: ts.makeSpan(start: start, end: tok))
    }

    if ts.at(.lparen) {
        _ = ts.advance()
        if ts.at(.rparen) {
            let end = ts.advance()
            return .tuple(elements: [], span: ts.makeSpan(start: start, end: end))
        }
        let expr = try parseExpression(ts)
        if ts.at(.rparen) {
            let end = ts.advance()
            return .paren(expr: expr, span: ts.makeSpan(start: start, end: end))
        }
        var elements = [expr]
        while ts.skip(.comma) {
            elements.append(try parseExpression(ts))
        }
        let end = try ts.expect(.rparen)
        if elements.count == 1 {
            return .paren(expr: elements[0], span: ts.makeSpan(start: start, end: end))
        }
        return .tuple(elements: elements, span: ts.makeSpan(start: start, end: end))
    }

    if ts.at(.lbracket) {
        _ = ts.advance()
        var elements: [Expression] = []
        if !ts.at(.rbracket) {
            elements.append(try parseExpression(ts))
            while ts.skip(.comma) {
                elements.append(try parseExpression(ts))
            }
        }
        let end = try ts.expect(.rbracket)
        return .list(elements: elements, span: ts.makeSpan(start: start, end: end))
    }

    if ts.at(.backslash) {
        _ = ts.advance()
        var params: [String] = []
        while ts.at(.ident) {
            params.append(ts.advance().value ?? "")
        }
        try ts.expect(.arrow)
        let body: LambdaBody
        if ts.at(.kwDo) {
            body = .doBlock(try parseDoBlock(ts))
        } else {
            body = .expression(try parseExpression(ts))
        }
        return .lambda(params: params, body: body, span: ts.makeSpan(start: start, end: ts.last()))
    }

    if ts.at(.kwIf) {
        _ = ts.advance()
        let condition = try parseExpression(ts)
        try ts.expect(.kwThen)
        let thenBranch = try parseExpression(ts)
        try ts.expect(.kwElse)
        let elseBranch = try parseExpression(ts)
        return .ifExpr(
            condition: condition,
            thenBranch: thenBranch,
            elseBranch: elseBranch,
            span: ts.makeSpan(start: start, end: ts.last())
        )
    }

    if ts.at(.kwDo) {
        let block = try parseDoBlock(ts)
        return .doExpr(block: block, span: block.span)
    }

    if ts.at(.kwAgent) {
        let decl = try parseAgentDecl(ts)
        return .agent(decl: decl, span: decl.span)
    }

    if ts.at(.kwModel) {
        let decl = try parseModelDecl(ts)
        return .model(decl: decl, span: decl.span)
    }

    throw ParseError("Expected expression", line: start.line, column: start.column)
}

private func parseRecordExpr(_ ts: TokenStream, name: String, start: Token) throws -> Expression {
    try ts.expect(.lbrace)
    var fields: [RecordField] = []

    while !ts.at(.rbrace), !ts.at(.eof) {
        if ts.skip(.semi) || ts.skip(.comma) { continue }
        let fieldStart = ts.peek()
        let fieldName = try ts.expect(.ident).value ?? ""
        try ts.expect(.equals)
        let value = try parseExpression(ts)
        fields.append(RecordField(name: fieldName, value: value, span: ts.makeSpan(start: fieldStart, end: ts.last())))
        if ts.skip(.comma) { continue }
        if ts.skip(.semi) { continue }
    }

    let end = try ts.expect(.rbrace)
    return Expression.record(name: name, fields: fields, span: ts.makeSpan(start: start, end: end))
}

func parseConfigItems(_ ts: TokenStream) throws -> [ConfigItem] {
    var items: [ConfigItem] = []

    while true {
        if ts.at(.lbrace) { _ = ts.advance() }
        guard ts.at(.ident), ts.peek(offset: 1).kind == .colon else { break }

        let keyStart = ts.peek()
        let key = ts.advance().value ?? ""
        try ts.expect(.colon)
        let value = try parseExpression(ts)
        items.append(ConfigItem(key: key, value: value, span: ts.makeSpan(start: keyStart, end: ts.last())))

        if ts.skip(.semi) { continue }
        if ts.at(.rbrace) {
            _ = ts.advance()
            break
        }
    }

    return items
}

func parseDoBlock(_ ts: TokenStream) throws -> DoBlock {
    let start = try ts.expect(.kwDo)
    if ts.at(.lbrace) { _ = ts.advance() }
    var statements: [DoStatement] = []

    while !ts.at(.rbrace), !ts.at(.eof) {
        if ts.skip(.semi) { continue }
        statements.append(try parseDoStatementFixed(ts))
    }

    if ts.at(.rbrace) { _ = ts.advance() }

    return DoBlock(statements: statements, span: ts.makeSpan(start: start, end: ts.last()))
}

private func parseTrailingConfig(_ ts: TokenStream) throws -> [ConfigItem] {
    if ts.at(.kwWith) {
        _ = ts.advance()
        return try parseConfigItems(ts)
    }
    if ts.at(.lbrace) || (ts.at(.ident) && ts.peek(offset: 1).kind == .colon) {
        return try parseConfigItems(ts)
    }
    return []
}

func parseDoStatementFixed(_ ts: TokenStream) throws -> DoStatement {
    let start = ts.peek()

    if ts.at(.kwLet) {
        _ = ts.advance()
        let pattern = try parsePattern(ts)
        try ts.expect(.equals)
        let expr = try parseExpression(ts)
        return .letBind(pattern: pattern, expr: expr, span: ts.makeSpan(start: start, end: ts.last()))
    }

    if canStartPattern(ts) {
        let saved = ts.save()
        let pattern = try parsePattern(ts)
        if ts.at(.bind) {
            _ = ts.advance()
            if ts.at(.kwStorm) {
                _ = ts.advance()
                let input = try parseExpression(ts)
                let config = try parseTrailingConfig(ts)
                return .storm(pattern: pattern, input: input, config: config, span: ts.makeSpan(start: start, end: ts.last()))
            }
            let expr = try parseExpression(ts)
            let config = try parseTrailingConfig(ts)
            return .bind(pattern: pattern, expr: expr, config: config, span: ts.makeSpan(start: start, end: ts.last()))
        }
        ts.restore(saved)
    }

    let expr = try parseExpression(ts)
    let config = try parseTrailingConfig(ts)
    return .action(expr: expr, config: config, span: ts.makeSpan(start: start, end: ts.last()))
}
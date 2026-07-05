import MoonAST
import MoonLexer

func parseLiteral(_ ts: TokenStream) throws -> Literal {
    let start = ts.peek()

    if ts.at(.string) {
        let tok = ts.advance()
        let span = ts.makeSpan(start: start, end: tok)
        return .string(tok.value ?? "", span: span)
    }
    if ts.at(.int) {
        let tok = ts.advance()
        let span = ts.makeSpan(start: start, end: tok)
        return .int(Int(tok.value ?? "0") ?? 0, span: span)
    }
    if ts.at(.float) {
        let tok = ts.advance()
        let span = ts.makeSpan(start: start, end: tok)
        return .float(Double(tok.value ?? "0") ?? 0, span: span)
    }
    if ts.at(.kwTrue) {
        let tok = ts.advance()
        let span = ts.makeSpan(start: start, end: tok)
        return .bool(true, span: span)
    }
    if ts.at(.kwFalse) {
        let tok = ts.advance()
        let span = ts.makeSpan(start: start, end: tok)
        return .bool(false, span: span)
    }

    throw ParseError("Expected literal", line: start.line, column: start.column)
}

func literalSpan(_ lit: Literal) -> MoonAST.Span {
    switch lit {
    case .string(_, let span): return span
    case .int(_, let span): return span
    case .float(_, let span): return span
    case .bool(_, let span): return span
    }
}
import MoonAST
import MoonLexer

struct ParsePatternOptions {
    var allowApp: Bool = true
}

func parsePattern(_ ts: TokenStream, options: ParsePatternOptions = ParsePatternOptions()) throws -> Pattern {
    if options.allowApp == false {
        return try parsePatternAtom(ts)
    }
    return try parsePatternApp(ts)
}

private func parsePatternApp(_ ts: TokenStream) throws -> Pattern {
    let start = ts.peek()
    let pat = try parsePatternAtom(ts)

    switch pat {
    case .pVar, .pCon:
        var args: [Pattern] = []
        while isPatternAtomStart(ts) {
            args.append(try parsePatternAtom(ts))
        }
        if !args.isEmpty {
            let name: String
            switch pat {
            case .pVar(let n, _): name = n
            case .pCon(let n, _, _): name = n
            default: name = ""
            }
            return .pCon(name: name, args: args, span: ts.makeSpan(start: start, end: ts.last()))
        }
    default:
        break
    }

    return pat
}

private func isPatternAtomStart(_ ts: TokenStream) -> Bool {
    ts.check(.ident, .lparen, .lbracket, .string, .int, .float, .kwTrue, .kwFalse)
}

private func parsePatternAtom(_ ts: TokenStream) throws -> Pattern {
    let start = ts.peek()

    if ts.at(.lparen) {
        _ = ts.advance()
        var elements: [Pattern] = []
        if !ts.at(.rparen) {
            elements.append(try parsePattern(ts))
            while ts.skip(.comma) {
                elements.append(try parsePattern(ts))
            }
        }
        let end = try ts.expect(.rparen)
        return .pTuple(elements: elements, span: ts.makeSpan(start: start, end: end))
    }

    if ts.at(.lbracket) {
        _ = ts.advance()
        var elements: [Pattern] = []
        if !ts.at(.rbracket) {
            elements.append(try parsePattern(ts))
            while ts.skip(.comma) {
                elements.append(try parsePattern(ts))
            }
        }
        let end = try ts.expect(.rbracket)
        return .pList(elements: elements, span: ts.makeSpan(start: start, end: end))
    }

    if ts.check(.string, .int, .float, .kwTrue, .kwFalse) {
        let lit = try parseLiteral(ts)
        return .pLit(value: lit, span: literalSpan(lit))
    }

    if ts.at(.ident) {
        let tok = ts.advance()
        let span = ts.makeSpan(start: start, end: tok)
        let value = tok.value ?? ""
        if value == "_" {
            return .pWildcard(span: span)
        }
        if let first = value.first, first.isUppercase {
            return .pCon(name: value, args: [], span: span)
        }
        return .pVar(name: value, span: span)
    }

    throw ParseError("Expected pattern", line: start.line, column: start.column)
}


import MoonAST
import MoonLexer

func parseTypeSpec(_ ts: TokenStream) throws -> TypeSpec {
    try parseTypeArrow(ts)
}

private func parseTypeArrow(_ ts: TokenStream) throws -> TypeSpec {
    let start = ts.peek()
    let left = try parseTypeApp(ts)

    if ts.at(.arrow) {
        _ = ts.advance()
        let right = try parseTypeArrow(ts)
        return .arrow(from: left, to: right, span: ts.makeSpan(start: start, end: ts.last()))
    }

    return left
}

private func isUpperName(_ name: String) -> Bool {
    guard let first = name.first else { return false }
    return first == first.uppercased().first
}

private func parseTypeApp(_ ts: TokenStream) throws -> TypeSpec {
    let start = ts.peek()
    let head = try parseTypeAtom(ts)
    var args: [TypeSpec] = []

    while true {
        if ts.at(.ident),
           !isUpperName(ts.peek().value ?? ""),
           (ts.peek(offset: 1).kind == .equals || ts.peek(offset: 2).kind == .equals) {
            break
        }
        if ts.at(.lparen) || ts.at(.lbracket) {
            args.append(try parseTypeAtom(ts))
            continue
        }
        if !ts.at(.ident) { break }
        let name = ts.peek().value ?? ""
        if isUpperName(name) || (name.count == 1 && name == name.lowercased()) {
            args.append(try parseTypeAtom(ts))
            continue
        }
        break
    }

    if !args.isEmpty {
        return .con(name: typeName(head), args: args, span: ts.makeSpan(start: start, end: ts.last()))
    }
    return head
}

private func typeName(_ t: TypeSpec) -> String {
    switch t {
    case .con(let name, _, _): return name
    case .varType(let name, _): return name
    default:
        fatalError("Invalid type atom")
    }
}

private func parseTypeAtom(_ ts: TokenStream) throws -> TypeSpec {
    let start = ts.peek()

    if ts.at(.lbracket) {
        _ = ts.advance()
        let element = try parseTypeSpec(ts)
        let end = try ts.expect(.rbracket)
        return .list(element: element, span: ts.makeSpan(start: start, end: end))
    }

    if ts.at(.lparen) {
        _ = ts.advance()
        var elements: [TypeSpec] = []
        if !ts.at(.rparen) {
            elements.append(try parseTypeSpec(ts))
            while ts.skip(.comma) {
                elements.append(try parseTypeSpec(ts))
            }
        }
        let end = try ts.expect(.rparen)
        if elements.count == 1 {
            return elements[0]
        }
        return .tuple(elements: elements, span: ts.makeSpan(start: start, end: end))
    }

    if ts.at(.ident) {
        let tok = ts.advance()
        return .varType(name: tok.value ?? "", span: ts.makeSpan(start: start, end: tok))
    }

    throw ParseError("Expected type", line: start.line, column: start.column)
}
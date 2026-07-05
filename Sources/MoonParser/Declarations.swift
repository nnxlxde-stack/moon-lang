import MoonAST
import MoonLexer

public func parseProgram(_ ts: TokenStream) throws -> Program {
    let start = ts.peek()
    var declarations: [Declaration] = []

    while !ts.at(.eof) {
        if ts.skip(.semi) { continue }
        declarations.append(try parseDeclaration(ts))
    }

    return Program(declarations: declarations, span: ts.makeSpan(start: start, end: ts.last()))
}

private func parseDeclaration(_ ts: TokenStream) throws -> Declaration {
    let start = ts.peek()

    if ts.at(.kwImport) {
        return try parseImport(ts)
    }
    if ts.at(.kwModel) {
        let decl = try parseModelDecl(ts)
        return .model(decl: decl, span: ts.makeSpan(start: start, end: ts.last()))
    }
    if ts.at(.kwAgent) {
        let decl = try parseAgentDecl(ts)
        return .agent(decl: decl, span: ts.makeSpan(start: start, end: ts.last()))
    }
    if ts.at(.kwData) {
        let decl = try parseDataDecl(ts)
        return .data(decl: decl, span: ts.makeSpan(start: start, end: ts.last()))
    }
    if ts.at(.kwInstance) {
        let decl = try parseInstanceDecl(ts)
        return .instance(decl: decl, span: ts.makeSpan(start: start, end: ts.last()))
    }
    if ts.at(.kwMacro) {
        let decl = try parseMacroDecl(ts)
        return .macro(decl: decl, span: ts.makeSpan(start: start, end: ts.last()))
    }
    if ts.at(.ident) || ts.at(.kwPure) {
        let decl = try parseFunctionDecl(ts)
        return .function(decl: decl, span: ts.makeSpan(start: start, end: ts.last()))
    }

    throw ParseError("Expected declaration", line: start.line, column: start.column)
}

private func parseImport(_ ts: TokenStream) throws -> Declaration {
    let start = try ts.expect(.kwImport)
    var path = [try ts.expect(.ident).value ?? ""]
    while ts.skip(.fieldDot) {
        path.append(try ts.expect(.ident).value ?? "")
    }
    var alias: String?
    if ts.skip(.kwAs) {
        alias = try ts.expect(.ident).value
    }
    return .importDecl(path: path, alias: alias, span: ts.makeSpan(start: start, end: ts.last()))
}

public func parseModelDecl(_ ts: TokenStream) throws -> ModelDecl {
    let start = try ts.expect(.kwModel)
    let name = try ts.expect(.ident).value ?? ""
    let typeParams = try parseTypeParams(ts)

    var implements: String?
    if ts.skip(.kwImplements) {
        implements = try ts.expect(.ident).value
    }

    var fields: [FieldDef] = []

    if ts.skip(.kwWhere) {
        if ts.at(.lbrace) { _ = ts.advance() }
        while !ts.at(.rbrace), !ts.at(.eof) {
            if ts.skip(.semi) { continue }
            fields.append(try parseFieldDef(ts))
        }
        if ts.at(.rbrace) { _ = ts.advance() }
    }

    return ModelDecl(
        name: name,
        typeParams: typeParams,
        implements: implements,
        fields: fields,
        span: ts.makeSpan(start: start, end: ts.last())
    )
}

private func parseFieldDef(_ ts: TokenStream) throws -> FieldDef {
    let start = ts.peek()
    let name = try ts.expect(.ident).value ?? ""
    try ts.expect(.colon)
    try ts.expect(.colon)
    let type = try parseTypeSpec(ts)
    let modifiers = try parseFieldModifiers(ts)
    return FieldDef(name: name, type: type, modifiers: modifiers, span: ts.makeSpan(start: start, end: ts.last()))
}

private func parseFieldModifiers(_ ts: TokenStream) throws -> [FieldModifier] {
    var mods: [FieldModifier] = []

    while true {
        if ts.at(.kwConstraint) {
            let s = ts.advance()
            try ts.expect(.colon)
            let expr = try parseExpression(ts)
            mods.append(.constraint(expr: expr, span: ts.makeSpan(start: s, end: ts.last())))
            continue
        }
        if ts.at(.kwDefault) {
            let s = ts.advance()
            try ts.expect(.colon)
            let expr = try parseExpression(ts)
            mods.append(.defaultValue(expr: expr, span: ts.makeSpan(start: s, end: ts.last())))
            continue
        }
        if ts.at(.kwFetched) {
            let s = ts.advance()
            try ts.expect(.kwFrom)
            let sources = try parseSourceSpecs(ts)
            mods.append(.fetchedFrom(sources: sources, span: ts.makeSpan(start: s, end: ts.last())))
            continue
        }
        if ts.at(.kwOptional) {
            let s = ts.advance()
            mods.append(.optional(span: ts.makeSpan(start: s, end: s)))
            continue
        }
        break
    }

    return mods
}

private func parseSourceSpecs(_ ts: TokenStream) throws -> [SourceSpec] {
    var specs: [SourceSpec] = []
    repeat {
        let start = ts.peek()
        let source = try ts.expect(.ident).value ?? ""
        try ts.expect(.colon)
        let field = try ts.expect(.ident).value ?? ""
        specs.append(SourceSpec(source: source, field: field, span: ts.makeSpan(start: start, end: ts.last())))
    } while ts.skip(.pipe)
    return specs
}

public func parseAgentDecl(_ ts: TokenStream) throws -> AgentDecl {
    let start = try ts.expect(.kwAgent)
    let name = try ts.expect(.ident).value ?? ""
    let typeParams = try parseTypeParams(ts)

    try ts.expect(.colon)
    try ts.expect(.colon)
    let type = try parseTypeSpec(ts)

    var routesTo: String?
    if ts.skip(.kwRoutesTo) {
        routesTo = try ts.expect(.ident).value
    }

    var config: [ConfigItem] = []

    if ts.skip(.kwWhere) {
        if ts.at(.lbrace) { _ = ts.advance() }
        config.append(contentsOf: try parseConfigBlock(ts))
        if ts.at(.rbrace) { _ = ts.advance() }
    } else {
        if ts.at(.lbrace) { _ = ts.advance() }
        if ts.at(.ident), ts.peek(offset: 1).kind == .colon {
            config.append(contentsOf: try parseConfigBlock(ts))
        }
        if ts.at(.rbrace) { _ = ts.advance() }
    }

    return AgentDecl(
        name: name,
        typeParams: typeParams,
        type: type,
        routesTo: routesTo,
        config: config,
        span: ts.makeSpan(start: start, end: ts.last())
    )
}

private func parseConfigBlock(_ ts: TokenStream) throws -> [ConfigItem] {
    var items: [ConfigItem] = []
    while !ts.at(.rbrace), !ts.at(.eof) {
        if ts.skip(.semi) { continue }
        guard ts.at(.ident), ts.peek(offset: 1).kind == .colon else { break }
        let keyStart = ts.peek()
        let key = ts.advance().value ?? ""
        try ts.expect(.colon)
        let value = try parseExpression(ts)
        items.append(ConfigItem(key: key, value: value, span: ts.makeSpan(start: keyStart, end: ts.last())))
        if ts.skip(.semi) { continue }
    }
    return items
}

private func parseDataDecl(_ ts: TokenStream) throws -> DataDecl {
    let start = try ts.expect(.kwData)
    let name = try ts.expect(.ident).value ?? ""
    let typeParams = try parseTypeParams(ts)
    try ts.expect(.equals)

    var constructors = [try parseConstructor(ts)]
    while ts.skip(.pipe) {
        constructors.append(try parseConstructor(ts))
    }

    return DataDecl(
        name: name,
        typeParams: typeParams,
        constructors: constructors,
        span: ts.makeSpan(start: start, end: ts.last())
    )
}

private func parseConstructor(_ ts: TokenStream) throws -> Constructor {
    let start = ts.peek()
    let name = try ts.expect(.ident).value ?? ""

    if ts.at(.lparen) {
        _ = ts.advance()
        var types: [TypeSpec] = []
        if !ts.at(.rparen) {
            types.append(try parseTypeSpec(ts))
            while ts.skip(.comma) {
                types.append(try parseTypeSpec(ts))
            }
        }
        let end = try ts.expect(.rparen)
        return Constructor(
            name: name,
            args: ConstructorArgs.positional(types: types, span: ts.makeSpan(start: start, end: end)),
            span: ts.makeSpan(start: start, end: end)
        )
    }

    if ts.at(.lbrace) {
        _ = ts.advance()
        var fields: [RecordFieldType] = []
        while !ts.at(.rbrace) {
            if ts.skip(.semi) || ts.skip(.comma) { continue }
            let fs = ts.peek()
            let fname = try ts.expect(.ident).value ?? ""
            try ts.expect(.colon)
            try ts.expect(.colon)
            let ftype = try parseTypeSpec(ts)
            fields.append(RecordFieldType(name: fname, type: ftype, span: ts.makeSpan(start: fs, end: ts.last())))
            if ts.skip(.comma) { continue }
            if ts.skip(.semi) { continue }
        }
        let end = try ts.expect(.rbrace)
        return Constructor(
            name: name,
            args: ConstructorArgs.record(fields: fields, span: ts.makeSpan(start: start, end: end)),
            span: ts.makeSpan(start: start, end: end)
        )
    }

    return Constructor(name: name, args: nil, span: ts.makeSpan(start: start, end: ts.last()))
}

private func parseInstanceDecl(_ ts: TokenStream) throws -> InstanceDecl {
    let start = try ts.expect(.kwInstance)
    let className = try ts.expect(.ident).value ?? ""
    try ts.expect(.kwFor)
    let type = try parseTypeSpec(ts)
    let typeParams = try parseTypeParams(ts)

    var functions: [FunctionDecl] = []
    try ts.expect(.kwWhere)
    if ts.at(.lbrace) { _ = ts.advance() }

    while !ts.at(.rbrace), !ts.at(.eof) {
        if ts.skip(.semi) { continue }
        functions.append(try parseFunctionDecl(ts))
    }
    if ts.at(.rbrace) { _ = ts.advance() }

    return InstanceDecl(
        className: className,
        type: type,
        typeParams: typeParams,
        functions: functions,
        span: ts.makeSpan(start: start, end: ts.last())
    )
}

private func parseMacroDecl(_ ts: TokenStream) throws -> MacroDecl {
    let start = try ts.expect(.kwMacro)
    let name = try ts.expect(.ident).value ?? ""
    let typeParams = try parseTypeParams(ts)
    let params = try parseParamList(ts)
    try ts.expect(.equals)
    let body = try parseDoBlock(ts)
    return MacroDecl(
        name: name,
        typeParams: typeParams,
        params: params,
        body: body,
        span: ts.makeSpan(start: start, end: ts.last())
    )
}

private func parseFunctionDecl(_ ts: TokenStream) throws -> FunctionDecl {
    let start = ts.peek()
    var signature: FunctionSignature?

    if isDeclNameStart(ts), ts.peek(offset: 1).kind == .colon, ts.peek(offset: 2).kind == .colon {
        let name = try parseDeclName(ts)
        try ts.expect(.colon)
        try ts.expect(.colon)
        let type = try parseTypeSpec(ts)
        signature = FunctionSignature(name: name, type: type, span: ts.makeSpan(start: start, end: ts.last()))
    }

    var equations = [try parseFunctionEquation(ts, expectedName: signature?.name)]
    while isDeclNameStart(ts), !isTypeSignatureStart(ts) {
        let nextName = ts.peek().value ?? "pure"
        let expected = signature?.name ?? equations[0].name
        if nextName != expected { break }
        equations.append(try parseFunctionEquation(ts, expectedName: expected))
    }

    return FunctionDecl(signature: signature, equations: equations, span: ts.makeSpan(start: start, end: ts.last()))
}

private func isDeclNameStart(_ ts: TokenStream) -> Bool {
    ts.at(.ident) || ts.at(.kwPure)
}

private func parseDeclName(_ ts: TokenStream) throws -> String {
    if ts.at(.kwPure) {
        return ts.advance().value ?? "pure"
    }
    return try ts.expect(.ident).value ?? ""
}

private func isTypeSignatureStart(_ ts: TokenStream) -> Bool {
    isDeclNameStart(ts) && ts.peek(offset: 1).kind == .colon && ts.peek(offset: 2).kind == .colon
}

private func parseFunctionEquation(_ ts: TokenStream, expectedName: String?) throws -> FunctionEquation {
    let start = ts.peek()
    let name = try parseDeclName(ts)
    if let expectedName, name != expectedName {
        throw ParseError("Expected equation for \(expectedName), got \(name)", line: start.line, column: start.column)
    }

    var patterns: [Pattern] = []
    while isPatternContinuer(ts) {
        patterns.append(try parsePattern(ts, options: ParsePatternOptions(allowApp: false)))
    }

    try ts.expect(.equals)

    let body: EquationBody
    if ts.at(.kwDo) {
        body = .doBlock(try parseDoBlock(ts))
    } else if ts.at(.kwAgent) {
        let decl = try parseAgentDecl(ts)
        body = .expression(.agent(decl: decl, span: ts.makeSpan(start: start, end: ts.last())))
    } else {
        body = .expression(try parseExpression(ts))
    }

    return FunctionEquation(name: name, patterns: patterns, body: body, span: ts.makeSpan(start: start, end: ts.last()))
}

private func isPatternContinuer(_ ts: TokenStream) -> Bool {
    if ts.at(.equals) || ts.at(.colon) { return false }
    return ts.check(.ident, .lparen, .lbracket, .string, .int, .float, .kwTrue, .kwFalse)
}

private func parseTypeParams(_ ts: TokenStream) throws -> [String] {
    var params: [String] = []
    while ts.at(.ident), !isDeclBoundary(ts) {
        let next = ts.peek(offset: 1).kind
        if next == .colon, ts.peek(offset: 2).kind == .colon {
            params.append(ts.advance().value ?? "")
            break
        }
        if next == .equals {
            params.append(ts.advance().value ?? "")
            break
        }
        params.append(ts.advance().value ?? "")
    }
    return params
}

private func isDeclBoundary(_ ts: TokenStream) -> Bool {
    ts.check(.kwWhere, .kwImplements, .kwRoutesTo, .equals, .eof, .semi, .rbrace)
}

private func parseParamList(_ ts: TokenStream) throws -> [ParamDef] {
    guard ts.at(.lparen) else { return [] }
    _ = ts.advance()
    var params: [ParamDef] = []
    if !ts.at(.rparen) {
        let pname = try ts.expect(.ident).value ?? ""
        try ts.expect(.colon)
        try ts.expect(.colon)
        params.append(ParamDef(name: pname, type: try parseTypeSpec(ts)))
        while ts.skip(.comma) {
            let n = try ts.expect(.ident).value ?? ""
            try ts.expect(.colon)
            try ts.expect(.colon)
            params.append(ParamDef(name: n, type: try parseTypeSpec(ts)))
        }
    }
    try ts.expect(.rparen)
    return params
}
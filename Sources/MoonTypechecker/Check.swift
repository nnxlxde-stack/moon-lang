import MoonAST
import MoonTypes

public struct TypeError: Error, CustomStringConvertible {
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

public struct CheckResult: Sendable {
    public var ok: Bool
    public var errors: [TypeError]
    public var env: TypeEnv

    public init(ok: Bool, errors: [TypeError], env: TypeEnv) {
        self.ok = ok
        self.errors = errors
        self.env = env
    }
}

private struct InferResult {
    var type: MoonType
    var subst: [Int: MoonType]
}

public func registerTopLevelDeclarations(_ program: Program, env: inout TypeEnv) {
    for decl in program.declarations {
        if case .model(let m, _) = decl { registerModel(&env, m) }
        if case .data(let d, _) = decl { registerData(&env, d) }
        if case .function(let f, _) = decl, f.signature != nil { registerFunctionSig(&env, f) }
    }
}

public func checkProgram(_ program: Program, env: inout TypeEnv) -> CheckResult {
    var errors: [TypeError] = []
    var subst: [Int: MoonType] = [:]

    func run<T>(_ span: Span, _ f: () throws -> T) -> T? {
        do {
            return try f()
        } catch let e as UnifyError {
            errors.append(TypeError(e.message, line: span.start.line, column: span.start.column))
            return nil
        } catch let e as TypeError {
            errors.append(e)
            return nil
        } catch {
            fatalError("\(error)")
        }
    }

    registerTopLevelDeclarations(program, env: &env)

    for decl in program.declarations {
        if case .agent(let a, let span) = decl {
            run(span) { registerAgent(&env, a) }
        }
    }

    for decl in program.declarations {
        switch decl {
        case .function(let f, let span):
            run(span) {
                subst = composeSubst(subst, try checkFunction(&env, f, &errors))
            }
        case .instance(let i, let span):
            run(span) { registerInstance(&env, i, &errors) }
        default:
            break
        }
    }

    return CheckResult(ok: errors.isEmpty, errors: errors, env: env)
}

private func registerModel(_ env: inout TypeEnv, _ decl: ModelDecl) {
    var paramSubst: [String: MoonType] = [:]
    for p in decl.typeParams {
        paramSubst[p] = freshVar()
    }
    let fields = decl.fields.map {
        MoonFieldType(name: $0.name, type: applyTypeParams(typeSpecToMoon($0.type), paramSubst))
    }
    env.constructors[decl.name] = TypeConstructor(
        name: decl.name,
        params: decl.typeParams,
        kind: .model,
        fields: fields
    )
    let vars = paramSubst.values.compactMap { t -> Int? in
        if case .typeVar(let id) = t { return id }
        return nil
    }
    env.values[decl.name] = Scheme(vars: vars, type: prim(decl.name, args: Array(paramSubst.values)))
}

private func registerData(_ env: inout TypeEnv, _ decl: DataDecl) {
    var paramSubst: [String: MoonType] = [:]
    for p in decl.typeParams {
        paramSubst[p] = freshVar()
    }

    let constructors: [DataConstructor] = decl.constructors.map { c in
        if case .record(let fields, _)? = c.args {
            return DataConstructor(
                name: c.name,
                fields: fields.map {
                    MoonFieldType(name: $0.name, type: applyTypeParams(typeSpecToMoon($0.type), paramSubst))
                },
                args: []
            )
        }
        let types: [MoonType]
        if case .positional(let ts, _)? = c.args {
            types = ts.map { applyTypeParams(typeSpecToMoon($0), paramSubst) }
        } else {
            types = []
        }
        return DataConstructor(name: c.name, fields: [], args: types)
    }

    env.constructors[decl.name] = TypeConstructor(
        name: decl.name,
        params: decl.typeParams,
        kind: .data,
        constructors: constructors
    )

    for c in constructors {
        let argTypes = c.args.isEmpty ? c.fields.map(\.type) : c.args
        let conType = argTypes.reversed().reduce(prim(decl.name, args: Array(paramSubst.values))) { acc, t in
            fn(t, acc)
        }
        env.values[c.name] = Scheme(vars: [], type: conType)
        if !c.fields.isEmpty {
            env.constructors[c.name] = TypeConstructor(
                name: c.name,
                params: decl.typeParams,
                kind: .data,
                fields: c.fields,
                dataParent: decl.name
            )
        }
    }
}

private func applyTypeParams(_ t: MoonType, _ subst: [String: MoonType]) -> MoonType {
    switch t {
    case .con(let name, let args) where args.isEmpty:
        if let mapped = subst[name] { return mapped }
        return prim(name)
    case .con(let name, let args):
        return prim(name, args: args.map { applyTypeParams($0, subst) })
    case .arrow(let from, let to):
        return fn(applyTypeParams(from, subst), applyTypeParams(to, subst))
    case .record(let name, let fields):
        return moonRecord(name, fields.map { MoonFieldType(name: $0.name, type: applyTypeParams($0.type, subst)) })
    case .tuple(let elements):
        return .tuple(elements: elements.map { applyTypeParams($0, subst) })
    case .typeVar:
        return t
    }
}

private func registerAgent(_ env: inout TypeEnv, _ decl: AgentDecl) {
    let agentType = typeSpecToMoon(decl.type)
    env.values[decl.name] = generalize(envVars: envVarIds(env), agentType)

    if case .con(let className, let args) = agentType {
        if let tc = env.classes[className] {
            var methods: [String: Scheme] = [:]
            for m in tc.methods {
                methods[m.name] = m.type
            }
            env.instances.append(Instance(className: className, types: args, methods: methods))
        }
    }
}

private func registerInstance(_ env: inout TypeEnv, _ decl: InstanceDecl, _ errors: inout [TypeError]) {
    let instanceType = typeSpecToMoon(decl.type)
    var methods: [String: Scheme] = [:]
    for f in decl.functions {
        if let sig = f.signature {
            let scheme = generalize(envVars: envVarIds(env), typeSpecToMoon(sig.type))
            methods[sig.name] = scheme
            env.values["\(decl.className).\(sig.name)"] = scheme
        }
        _ = try? checkFunction(&env, f, &errors)
    }
    env.instances.append(Instance(className: decl.className, types: [instanceType], methods: methods))
}

private func checkFunction(_ env: inout TypeEnv, _ decl: FunctionDecl, _ errors: inout [TypeError]) throws -> [Int: MoonType] {
    var subst: [Int: MoonType] = [:]
    let supply = { freshVar() }

    for eq in decl.equations {
        var local = env.values
        let expected: MoonType?
        if let sig = decl.signature {
            expected = instantiate(typeSpecToScheme(sig.type), supply: supply)
        } else if let scheme = local[eq.name] {
            expected = instantiate(scheme, supply: supply)
        } else {
            expected = nil
        }

        var patSubst: [Int: MoonType] = [:]
        var argTypes: [MoonType] = []
        for pat in eq.patterns {
            let pt = freshVar()
            argTypes.append(pt)
            patSubst = composeSubst(patSubst, try checkPattern(env, pat, pt, &errors))
        }

        let bodyType = freshVar()
        let lambdaType = argTypes.reversed().reduce(bodyType) { fn($1, $0) }

        if let expected {
            subst = composeSubst(subst, try unify(lambdaType, expected, span: eq.span))
        }

        var bodyEnv = env.copy(values: local)
        applyPatternBindings(&bodyEnv, eq.patterns, argTypes, patSubst)

        let bodyResult: InferResult
        switch eq.body {
        case .expression(let expr):
            bodyResult = try checkExpr(bodyEnv, expr, supply: supply)
        case .doBlock(let block):
            bodyResult = try checkDoBlock(bodyEnv, block, supply: supply)
        }

        subst = composeSubst(subst, composeSubst(patSubst, bodyResult.subst))
        subst = composeSubst(subst, try unify(applySubst(subst, bodyResult.type), bodyType, span: eq.span))

        if decl.signature == nil && eq.patterns.isEmpty {
            let gen = generalize(envVars: envVarIds(env), applySubst(subst, bodyResult.type))
            local[eq.name] = gen
            env.values[eq.name] = gen
        }
    }

    return subst
}

private func applyPatternBindings(
    _ env: inout TypeEnv,
    _ patterns: [Pattern],
    _ types: [MoonType],
    _ subst: [Int: MoonType]
) {
    for (pat, ty) in zip(patterns, types) {
        bindPattern(&env, pat, applySubst(subst, ty))
    }
}

private func bindPattern(_ env: inout TypeEnv, _ pat: Pattern, _ type: MoonType) {
    switch pat {
    case .pVar(let name, _):
        env.values[name] = Scheme(vars: [], type: type)
    case .pWildcard:
        break
    case .pCon(let name, let args, _):
        let dataTc = env.constructors.values.first {
            $0.constructors?.contains { $0.name == name } == true
        }
        let con = dataTc?.constructors?.first { $0.name == name }
        if let con, !args.isEmpty {
            if !con.fields.isEmpty {
                for (index, arg) in args.enumerated() {
                    bindPattern(&env, arg, con.fields[index].type)
                }
            } else {
                for (index, arg) in args.enumerated() {
                    let argType = index < con.args.count ? con.args[index] : type
                    bindPattern(&env, arg, argType)
                }
            }
        }
    default:
        break
    }
}

private func checkPattern(
    _ env: TypeEnv,
    _ pat: Pattern,
    _ expected: MoonType,
    _ errors: inout [TypeError]
) throws -> [Int: MoonType] {
    do {
        switch pat {
        case .pVar, .pWildcard:
            return [:]
        case .pLit(let value, let span):
            let litType: MoonType
            switch value {
            case .string: litType = prim("String")
            case .int: litType = prim("Int")
            case .float: litType = prim("Float")
            case .bool: litType = prim("Bool")
            }
            return try unify(litType, expected, span: span)
        case .pCon(let name, let args, let span):
            guard let scheme = env.values[name] else {
                errors.append(TypeError("Unknown constructor \(name)", line: span.start.line, column: span.start.column))
                return [:]
            }
            let supply = { freshVar() }
            let conType = instantiate(scheme, supply: supply)
            if args.isEmpty {
                return try unify(conType, expected, span: span)
            }
            var subst: [Int: MoonType] = [:]
            var cur = conType
            for arg in args {
                let argType = freshVar()
                subst = composeSubst(subst, try unify(cur, fn(argType, freshVar()), span: span))
                let arrow = applySubst(subst, cur)
                if case .arrow(let from, let to) = arrow {
                    subst = composeSubst(subst, try unify(from, argType, span: span))
                    cur = to
                    subst = composeSubst(subst, try checkPattern(env, arg, argType, &errors))
                }
            }
            subst = composeSubst(subst, try unify(applySubst(subst, cur), expected, span: span))
            return subst
        default:
            return [:]
        }
    } catch let e as UnifyError {
        let span: Span
        switch pat {
        case .pVar(_, let s), .pWildcard(let s), .pLit(_, let s), .pCon(_, _, let s), .pTuple(_, let s), .pList(_, let s):
            span = s
        }
        errors.append(TypeError(e.message, line: span.start.line, column: span.start.column))
        return [:]
    }
}

private func checkExpr(_ env: TypeEnv, _ expr: Expression, supply: @escaping () -> MoonType) throws -> InferResult {
    let span = exprSpan(expr)
    var subst: [Int: MoonType] = [:]

    switch expr {
    case .lit(let value, _):
        let t: MoonType
        switch value {
        case .string: t = prim("String")
        case .int: t = prim("Int")
        case .float: t = prim("Float")
        case .bool: t = prim("Bool")
        }
        return InferResult(type: t, subst: [:])

    case .varRef(let name, let s):
        guard let scheme = env.values[name] else {
            throw TypeError("Unknown variable \(name)", line: s.start.line, column: s.start.column)
        }
        return InferResult(type: instantiate(scheme, supply: supply), subst: [:])

    case .app(let fnExpr, let arg, _):
        let f = try checkExpr(env, fnExpr, supply: supply)
        let a = try checkExpr(env, arg, supply: supply)
        subst = composeSubst(subst, composeSubst(f.subst, a.subst))
        let ret = supply()
        subst = composeSubst(subst, try unify(applySubst(subst, f.type), fn(applySubst(subst, a.type), ret), span: span))
        return InferResult(type: ret, subst: subst)

    case .infix(let op, let left, let right, _):
        if op == "." {
            let f = try checkExpr(env, left, supply: supply)
            let g = try checkExpr(env, right, supply: supply)
            subst = composeSubst(subst, composeSubst(f.subst, g.subst))
            let ret = supply()
            let mid = supply()
            let arg = supply()
            subst = composeSubst(subst, try unify(applySubst(subst, g.type), fn(arg, mid), span: span))
            subst = composeSubst(subst, try unify(applySubst(subst, f.type), fn(mid, ret), span: span))
            return InferResult(type: fn(arg, ret), subst: subst)
        }
        if let opScheme = env.values[op] {
            let opType = instantiate(opScheme, supply: supply)
            let l = try checkExpr(env, left, supply: supply)
            let r = try checkExpr(env, right, supply: supply)
            subst = composeSubst(subst, composeSubst(l.subst, r.subst))
            subst = composeSubst(subst, try unify(
                opType,
                fn(applySubst(subst, l.type), fn(applySubst(subst, r.type), supply())),
                span: span
            ))
            let applied = applySubst(subst, opType)
            if case .arrow(let from, let to) = applied, case .arrow(_, let result) = to {
                _ = from
                return InferResult(type: result, subst: subst)
            }
        }
        let l = try checkExpr(env, left, supply: supply)
        let r = try checkExpr(env, right, supply: supply)
        subst = composeSubst(subst, composeSubst(l.subst, r.subst))
        let ret = supply()
        subst = composeSubst(subst, try unify(
            fn(applySubst(subst, l.type), fn(applySubst(subst, r.type), ret)),
            fn(prim("Bool"), fn(prim("Bool"), prim("Bool"))),
            span: span
        ))
        return InferResult(type: ret, subst: subst)

    case .prefix(let op, let operand, _):
        let result = try checkExpr(env, operand, supply: supply)
        subst = composeSubst(subst, result.subst)
        if op == "not" {
            subst = composeSubst(subst, try unify(result.type, prim("Bool"), span: span))
            return InferResult(type: prim("Bool"), subst: subst)
        }
        subst = composeSubst(subst, try unify(result.type, prim("Float"), span: span))
        return InferResult(type: prim("Float"), subst: subst)

    case .fieldAccess(let object, let field, _):
        let obj = try checkExpr(env, object, supply: supply)
        subst = composeSubst(subst, obj.subst)
        let objType = applySubst(subst, obj.type)
        if case .record(_, let fields) = objType, let fieldType = fields.first(where: { $0.name == field })?.type {
            return InferResult(type: fieldType, subst: subst)
        }
        if let methodType = resolveMethod(env, objType, field, supply: supply) {
            return InferResult(type: methodType, subst: subst)
        }
        let fieldType = supply()
        let rowType = moonRecord("_row", [MoonFieldType(name: field, type: fieldType)])
        subst = composeSubst(subst, try unify(objType, rowType, span: span))
        return InferResult(type: fieldType, subst: subst)

    case .record(let name, let fields, _):
        guard let tc = env.constructors[name], let tcFields = tc.fields else {
            throw TypeError("Unknown record type \(name)", line: span.start.line, column: span.start.column)
        }
        var paramSubst: [String: MoonType] = [:]
        let recType = supply()
        let typeArgs = tc.params.map { p -> MoonType in
            let v = supply()
            paramSubst[p] = v
            return v
        }
        subst = composeSubst(subst, try unify(recType, prim(name, args: typeArgs), span: span))
        let expectedFields = tcFields.map {
            MoonFieldType(name: $0.name, type: applyTypeParams($0.type, paramSubst))
        }
        for field in fields {
            let exp = try checkExpr(env, field.value, supply: supply)
            subst = composeSubst(subst, exp.subst)
            if let expected = expectedFields.first(where: { $0.name == field.name }) {
                subst = composeSubst(subst, try unify(applySubst(subst, exp.type), expected.type, span: field.span))
            }
        }
        let resultType: MoonType
        if let parent = tc.dataParent {
            resultType = prim(parent, args: tc.params.map { paramSubst[$0] ?? prim($0) })
        } else {
            resultType = prim(name, args: tc.params.map { paramSubst[$0] ?? prim($0) })
        }
        return InferResult(type: resultType, subst: subst)

    case .list(let elements, _):
        let elemType = supply()
        for el in elements {
            let e = try checkExpr(env, el, supply: supply)
            subst = composeSubst(subst, e.subst)
            subst = composeSubst(subst, try unify(applySubst(subst, e.type), elemType, span: exprSpan(el)))
        }
        return InferResult(type: listOf(applySubst(subst, elemType)), subst: subst)

    case .paren(let inner, _):
        return try checkExpr(env, inner, supply: supply)

    case .doExpr(let block, _):
        return try checkDoBlock(env, block, supply: supply)

    case .agent(let decl, _):
        return InferResult(type: typeSpecToMoon(decl.type), subst: [:])

    case .lambda(let params, let body, _):
        var local = env.copy(values: env.values)
        let paramTypes = params.map { _ in supply() }
        for (index, name) in params.enumerated() {
            local.values[name] = Scheme(vars: [], type: paramTypes[index])
        }
        let bodyResult: InferResult
        switch body {
        case .expression(let expr):
            bodyResult = try checkExpr(local, expr, supply: supply)
        case .doBlock(let block):
            bodyResult = try checkDoBlock(local, block, supply: supply)
        }
        subst = composeSubst(subst, bodyResult.subst)
        let lam = paramTypes.reversed().reduce(bodyResult.type) { fn($1, $0) }
        return InferResult(type: lam, subst: subst)

    case .ifExpr(let condition, let thenBranch, let elseBranch, _):
        let cond = try checkExpr(env, condition, supply: supply)
        let th = try checkExpr(env, thenBranch, supply: supply)
        let el = try checkExpr(env, elseBranch, supply: supply)
        subst = composeSubst(subst, composeSubst(cond.subst, composeSubst(th.subst, el.subst)))
        subst = composeSubst(subst, try unify(cond.type, prim("Bool"), span: span))
        subst = composeSubst(subst, try unify(th.type, el.type, span: span))
        return InferResult(type: applySubst(subst, th.type), subst: subst)

    default:
        return InferResult(type: supply(), subst: [:])
    }
}

private func exprSpan(_ expr: Expression) -> Span {
    switch expr {
    case .lit(_, let s), .varRef(_, let s), .app(_, _, let s), .infix(_, _, _, let s),
         .prefix(_, _, let s), .fieldAccess(_, _, let s), .lambda(_, _, let s),
         .ifExpr(_, _, _, let s), .record(_, _, let s), .list(_, let s),
         .tuple(_, let s), .paren(_, let s), .doExpr(_, let s), .agent(_, let s), .model(_, let s):
        return s
    }
}

private func resolveMethod(_ env: TypeEnv, _ objType: MoonType, _ method: String, supply: @escaping () -> MoonType) -> MoonType? {
    guard case .con(let name, _) = objType, let tc = env.classes[name],
          let m = tc.methods.first(where: { $0.name == method }) else { return nil }
    return specializeMethod(instantiate(m.type, supply: supply), objType)
}

private func specializeMethod(_ methodType: MoonType, _ objType: MoonType) -> MoonType? {
    guard case .arrow(let from, let to) = methodType else { return nil }
    do {
        let subst = try unify(from, objType)
        return applySubst(subst, to)
    } catch {
        return nil
    }
}

private func checkDoBlock(_ env: TypeEnv, _ block: DoBlock, supply: @escaping () -> MoonType) throws -> InferResult {
    var subst: [Int: MoonType] = [:]
    var local = env.copy(values: env.values)
    var lastType: MoonType = prim("Unit")

    for stmt in block.statements {
        let result = try checkDoStmt(&local, stmt, supply: supply)
        subst = composeSubst(subst, result.subst)
        lastType = applySubst(subst, result.type)
    }

    return InferResult(type: lastType, subst: subst)
}

private func checkDoStmt(_ env: inout TypeEnv, _ stmt: DoStatement, supply: @escaping () -> MoonType) throws -> InferResult {
    var subst: [Int: MoonType] = [:]

    switch stmt {
    case .letBind(let pattern, let expr, _):
        let result = try checkExpr(env, expr, supply: supply)
        subst = composeSubst(subst, result.subst)
        bindPattern(&env, pattern, applySubst(subst, result.type))
        return InferResult(type: prim("Unit"), subst: subst)

    case .bind(let pattern, let expr, _, let span):
        let result = try checkExpr(env, expr, supply: supply)
        subst = composeSubst(subst, result.subst)
        let inner = applySubst(subst, result.type)
        if case .con(let name, let args) = inner, name == "IO", let arg = args.first {
            bindPattern(&env, pattern, arg)
            return InferResult(type: prim("Unit"), subst: subst)
        }
        let ret = supply()
        subst = composeSubst(subst, try unify(inner, io(ret), span: span))
        bindPattern(&env, pattern, ret)
        return InferResult(type: prim("Unit"), subst: subst)

    case .storm(let pattern, let input, _, _):
        let result = try checkExpr(env, input, supply: supply)
        subst = composeSubst(subst, result.subst)
        let ret = supply()
        bindPattern(&env, pattern, ret)
        return InferResult(type: prim("Unit"), subst: subst)

    case .action(let expr, _, let span):
        let result = try checkExpr(env, expr, supply: supply)
        subst = composeSubst(subst, result.subst)
        let t = applySubst(subst, result.type)
        if case .con(let name, _) = t, name == "IO" {
            return InferResult(type: prim("Unit"), subst: subst)
        }
        subst = composeSubst(subst, try unify(t, io(prim("Unit")), span: span))
        return InferResult(type: prim("Unit"), subst: subst)
    }
}

private func registerFunctionSig(_ env: inout TypeEnv, _ decl: FunctionDecl) {
    guard let sig = decl.signature else { return }
    env.values[sig.name] = typeSpecToScheme(sig.type)
}
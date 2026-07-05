import MoonAST

func freeVarsExpr(_ expr: Expression, bound: Set<String> = []) -> Set<String> {
    switch expr {
    case .varRef(let name, _):
        return bound.contains(name) ? [] : [name]
    case .lit:
        return []
    case .app(let fn, let arg, _):
        return freeVarsExpr(fn, bound: bound).union(freeVarsExpr(arg, bound: bound))
    case .infix(_, let left, let right, _):
        return freeVarsExpr(left, bound: bound).union(freeVarsExpr(right, bound: bound))
    case .prefix(_, let operand, _):
        return freeVarsExpr(operand, bound: bound)
    case .fieldAccess(let object, _, _):
        return freeVarsExpr(object, bound: bound)
    case .lambda(let params, let body, _):
        var local = bound
        for p in params { local.insert(p) }
        switch body {
        case .expression(let e):
            return freeVarsExpr(e, bound: local)
        case .doBlock(let block):
            return freeVarsDoBlock(block, bound: local)
        }
    case .ifExpr(let condition, let thenBranch, let elseBranch, _):
        return freeVarsExpr(condition, bound: bound)
            .union(freeVarsExpr(thenBranch, bound: bound))
            .union(freeVarsExpr(elseBranch, bound: bound))
    case .record(_, let fields, _):
        return fields.reduce(into: Set<String>()) { acc, field in
            acc.formUnion(freeVarsExpr(field.value, bound: bound))
        }
    case .list(let elements, _):
        return elements.reduce(into: Set<String>()) { acc, el in
            acc.formUnion(freeVarsExpr(el, bound: bound))
        }
    case .tuple(let elements, _):
        return elements.reduce(into: Set<String>()) { acc, el in
            acc.formUnion(freeVarsExpr(el, bound: bound))
        }
    case .paren(let inner, _):
        return freeVarsExpr(inner, bound: bound)
    case .doExpr(let block, _):
        return freeVarsDoBlock(block, bound: bound)
    case .agent, .model:
        return []
    }
}

func freeVarsDoBlock(_ block: DoBlock, bound: Set<String> = []) -> Set<String> {
    var result = Set<String>()
    var local = bound

    for stmt in block.statements {
        switch stmt {
        case .letBind(let pattern, let expr, _):
            result.formUnion(freeVarsExpr(expr, bound: local))
            bindPatternVars(pattern, bound: &local)
        case .bind(let pattern, let expr, _, _):
            result.formUnion(freeVarsExpr(expr, bound: local))
            bindPatternVars(pattern, bound: &local)
        case .storm(let pattern, let input, let config, _):
            result.formUnion(freeVarsExpr(input, bound: local))
            for item in config {
                result.formUnion(freeVarsExpr(item.value, bound: local))
            }
            bindPatternVars(pattern, bound: &local)
        case .action(let expr, let config, _):
            result.formUnion(freeVarsExpr(expr, bound: local))
            for item in config {
                result.formUnion(freeVarsExpr(item.value, bound: local))
            }
        }
    }

    return result
}

private func bindPatternVars(_ pat: Pattern, bound: inout Set<String>) {
    switch pat {
    case .pVar(let name, _):
        bound.insert(name)
    case .pCon(_, let args, _):
        for arg in args { bindPatternVars(arg, bound: &bound) }
    case .pTuple(let elements, _):
        for el in elements { bindPatternVars(el, bound: &bound) }
    case .pList(let elements, _):
        for el in elements { bindPatternVars(el, bound: &bound) }
    case .pWildcard, .pLit:
        break
    }
}
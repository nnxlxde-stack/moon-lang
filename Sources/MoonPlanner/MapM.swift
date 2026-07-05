import MoonAST

public struct MapMCall: Sendable {
    public var funcExpr: Expression
    public var listVar: String
}

public func detectMapM(_ expr: Expression) -> MapMCall? {
    guard case .app(let outerFunc, let outerArg, _) = expr,
          case .app(let innerFunc, let innerArg, _) = outerFunc,
          case .varRef(let name, _) = innerFunc, name == "mapM",
          case .varRef(let listVar, _) = outerArg else {
        return nil
    }
    return MapMCall(funcExpr: innerArg, listVar: listVar)
}

func exprLabel(_ expr: Expression) -> String {
    switch expr {
    case .varRef(let name, _):
        return name
    case .lit(let value, _):
        switch value {
        case .string(let s, _):
            return "\"\(s)\""
        case .int(let n, _):
            return "\(n)"
        case .float(let f, _):
            return "\(f)"
        case .bool(let b, _):
            return "\(b)"
        }
    case .app(let fn, let arg, _):
        return "\(exprLabel(fn)) \(exprLabel(arg))"
    case .fieldAccess(let object, let field, _):
        return "\(exprLabel(object)).\(field)"
    case .paren(let inner, _):
        return "(\(exprLabel(inner)))"
    default:
        switch expr {
        case .infix: return "Infix"
        case .prefix: return "Prefix"
        case .lambda: return "Lambda"
        case .ifExpr: return "If"
        case .record: return "Record"
        case .list: return "List"
        case .tuple: return "Tuple"
        case .doExpr: return "Do"
        case .agent: return "Agent"
        case .model: return "Model"
        default: return "Expr"
        }
    }
}
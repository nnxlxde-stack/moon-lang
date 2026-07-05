import Foundation

/// Exports AST in TypeScript-compatible JSON shape (for golden test parity).
public enum MoonASTLegacyExport {
    public static func export(_ program: Program) -> [String: Any] {
        ["declarations": program.declarations.map { exportDecl($0) }]
    }

    public static func exportJSON(_ program: Program, pretty: Bool = true) throws -> String {
        let data = try JSONSerialization.data(
            withJSONObject: export(program),
            options: pretty ? [.prettyPrinted, .sortedKeys] : [.sortedKeys]
        )
        guard let str = String(data: data, encoding: .utf8) else {
            throw ExportError.encodingFailed
        }
        return str + "\n"
    }

    public enum ExportError: Error {
        case encodingFailed
    }

    private static func exportDecl(_ decl: Declaration) -> [String: Any] {
        switch decl {
        case .importDecl(let path, let alias, _):
            var d: [String: Any] = ["kind": "Import", "path": path]
            if let alias { d["alias"] = alias }
            return d
        case .model(let decl, _):
            return ["kind": "Model", "decl": exportModel(decl)]
        case .agent(let decl, _):
            return ["kind": "Agent", "decl": exportAgent(decl)]
        case .data(let decl, _):
            return ["kind": "Data", "decl": exportData(decl)]
        case .instance(let decl, _):
            return ["kind": "Instance", "decl": exportInstance(decl)]
        case .function(let decl, _):
            return ["kind": "Function", "decl": exportFunction(decl)]
        case .macro(let decl, _):
            return ["kind": "Macro", "decl": exportMacro(decl)]
        }
    }

    private static func exportModel(_ m: ModelDecl) -> [String: Any] {
        var d: [String: Any] = [
            "name": m.name,
            "typeParams": m.typeParams,
            "fields": m.fields.map { exportField($0) },
        ]
        if let impl = m.implements { d["implements"] = impl }
        return d
    }

    private static func exportField(_ f: FieldDef) -> [String: Any] {
        [
            "name": f.name,
            "type": exportType(f.type),
            "modifiers": f.modifiers.map { exportFieldModifier($0) },
        ]
    }

    private static func exportFieldModifier(_ m: FieldModifier) -> [String: Any] {
        switch m {
        case .constraint(let expr, _):
            return ["kind": "Constraint", "expr": exportExpr(expr)]
        case .defaultValue(let expr, _):
            return ["kind": "Default", "expr": exportExpr(expr)]
        case .fetchedFrom(let sources, _):
            return ["kind": "FetchedFrom", "sources": sources.map { exportSource($0) }]
        case .optional:
            return ["kind": "Optional"]
        }
    }

    private static func exportSource(_ s: SourceSpec) -> [String: Any] {
        ["source": s.source, "field": s.field]
    }

    private static func exportAgent(_ a: AgentDecl) -> [String: Any] {
        var d: [String: Any] = [
            "name": a.name,
            "typeParams": a.typeParams,
            "type": exportType(a.type),
            "config": a.config.map { exportConfig($0) },
        ]
        if let routes = a.routesTo { d["routesTo"] = routes }
        return d
    }

    private static func exportConfig(_ c: ConfigItem) -> [String: Any] {
        ["key": c.key, "value": exportExpr(c.value)]
    }

    private static func exportData(_ d: DataDecl) -> [String: Any] {
        [
            "name": d.name,
            "typeParams": d.typeParams,
            "constructors": d.constructors.map { exportConstructor($0) },
        ]
    }

    private static func exportConstructor(_ c: Constructor) -> [String: Any] {
        var d: [String: Any] = ["name": c.name]
        if let args = c.args {
            switch args {
            case .positional(let types, _):
                d["args"] = ["kind": "Positional", "types": types.map { exportType($0) }]
            case .record(let fields, _):
                d["args"] = [
                    "kind": "Record",
                    "fields": fields.map { ["name": $0.name, "type": exportType($0.type)] as [String: Any] },
                ]
            }
        }
        return d
    }

    private static func exportInstance(_ i: InstanceDecl) -> [String: Any] {
        [
            "className": i.className,
            "type": exportType(i.type),
            "typeParams": i.typeParams,
            "functions": i.functions.map { exportFunction($0) },
        ]
    }

    private static func exportFunction(_ f: FunctionDecl) -> [String: Any] {
        var d: [String: Any] = ["equations": f.equations.map { exportEquation($0) }]
        if let sig = f.signature {
            d["signature"] = ["name": sig.name, "type": exportType(sig.type)]
        }
        return d
    }

    private static func exportEquation(_ eq: FunctionEquation) -> [String: Any] {
        [
            "name": eq.name,
            "patterns": eq.patterns.map { exportPattern($0) },
            "body": exportEquationBody(eq.body),
        ]
    }

    private static func exportEquationBody(_ body: EquationBody) -> Any {
        switch body {
        case .expression(let expr): return exportExpr(expr)
        case .doBlock(let block): return exportDoBlock(block)
        }
    }

    private static func exportMacro(_ m: MacroDecl) -> [String: Any] {
        [
            "name": m.name,
            "typeParams": m.typeParams,
            "params": m.params.map { ["name": $0.name, "type": exportType($0.type)] as [String: Any] },
            "body": exportDoBlock(m.body),
        ]
    }

    private static func exportType(_ t: TypeSpec) -> [String: Any] {
        switch t {
        case .varType(let name, _):
            return ["kind": "Var", "name": name]
        case .con(let name, let args, _):
            return ["kind": "Con", "name": name, "args": args.map { exportType($0) }]
        case .list(let element, _):
            return ["kind": "List", "element": exportType(element)]
        case .tuple(let elements, _):
            return ["kind": "Tuple", "elements": elements.map { exportType($0) }]
        case .arrow(let from, let to, _):
            return ["kind": "Arrow", "from": exportType(from), "to": exportType(to)]
        }
    }

    private static func exportPattern(_ p: Pattern) -> [String: Any] {
        switch p {
        case .pVar(let name, _):
            return ["kind": "PVar", "name": name]
        case .pWildcard:
            return ["kind": "PWildcard"]
        case .pLit(let value, _):
            return ["kind": "PLit", "value": exportLiteral(value)]
        case .pCon(let name, let args, _):
            return ["kind": "PCon", "name": name, "args": args.map { exportPattern($0) }]
        case .pTuple(let elements, _):
            return ["kind": "PTuple", "elements": elements.map { exportPattern($0) }]
        case .pList(let elements, _):
            return ["kind": "PList", "elements": elements.map { exportPattern($0) }]
        }
    }

    private static func exportLiteral(_ lit: Literal) -> [String: Any] {
        switch lit {
        case .string(let v, _): return ["kind": "String", "value": v]
        case .int(let v, _): return ["kind": "Int", "value": v]
        case .float(let v, _): return ["kind": "Float", "value": v]
        case .bool(let v, _): return ["kind": "Bool", "value": v]
        }
    }

    private static func exportExpr(_ e: Expression) -> [String: Any] {
        switch e {
        case .lit(let value, _):
            return ["kind": "Lit", "value": exportLiteral(value)]
        case .varRef(let name, _):
            return ["kind": "Var", "name": name]
        case .app(let fn, let arg, _):
            return ["kind": "App", "func": exportExpr(fn), "arg": exportExpr(arg)]
        case .infix(let op, let left, let right, _):
            return ["kind": "Infix", "op": op, "left": exportExpr(left), "right": exportExpr(right)]
        case .prefix(let op, let operand, _):
            return ["kind": "Prefix", "op": op, "operand": exportExpr(operand)]
        case .fieldAccess(let object, let field, _):
            return ["kind": "FieldAccess", "object": exportExpr(object), "field": field]
        case .lambda(let params, let body, _):
            var d: [String: Any] = ["kind": "Lambda", "params": params]
            switch body {
            case .expression(let expr): d["body"] = exportExpr(expr)
            case .doBlock(let block): d["body"] = exportDoBlock(block)
            }
            return d
        case .ifExpr(let condition, let thenBranch, let elseBranch, _):
            return [
                "kind": "If",
                "condition": exportExpr(condition),
                "thenBranch": exportExpr(thenBranch),
                "elseBranch": exportExpr(elseBranch),
            ]
        case .record(let name, let fields, _):
            return [
                "kind": "Record",
                "name": name,
                "fields": fields.map { ["name": $0.name, "value": exportExpr($0.value)] as [String: Any] },
            ]
        case .list(let elements, _):
            return ["kind": "List", "elements": elements.map { exportExpr($0) }]
        case .tuple(let elements, _):
            return ["kind": "Tuple", "elements": elements.map { exportExpr($0) }]
        case .paren(let expr, _):
            return ["kind": "Paren", "expr": exportExpr(expr)]
        case .doExpr(let block, _):
            return ["kind": "Do", "block": exportDoBlock(block)]
        case .agent(let decl, _):
            return ["kind": "Agent", "decl": exportAgent(decl)]
        case .model(let decl, _):
            return ["kind": "Model", "decl": exportModel(decl)]
        }
    }

    private static func exportDoBlock(_ block: DoBlock) -> [String: Any] {
        ["statements": block.statements.map { exportDoStmt($0) }]
    }

    private static func exportDoStmt(_ s: DoStatement) -> [String: Any] {
        switch s {
        case .bind(let pattern, let expr, let config, _):
            return [
                "kind": "Bind",
                "pattern": exportPattern(pattern),
                "expr": exportExpr(expr),
                "config": config.map { exportConfig($0) },
            ]
        case .storm(let pattern, let input, let config, _):
            return [
                "kind": "Storm",
                "pattern": exportPattern(pattern),
                "input": exportExpr(input),
                "config": config.map { exportConfig($0) },
            ]
        case .letBind(let pattern, let expr, _):
            return ["kind": "Let", "pattern": exportPattern(pattern), "expr": exportExpr(expr)]
        case .action(let expr, let config, _):
            return [
                "kind": "Action",
                "expr": exportExpr(expr),
                "config": config.map { exportConfig($0) },
            ]
        }
    }
}
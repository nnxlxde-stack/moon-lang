import MoonAST

public func compileSchemas(_ program: Program) -> CompileResult {
    var schemas: [String: MoonJsonSchema] = [:]
    var warnings: [SchemaWarning] = []

    for decl in program.declarations {
        switch decl {
        case .model(let modelDecl, _):
            schemas[modelDecl.name] = compileModel(modelDecl, warnings: &warnings)
        case .data(let dataDecl, _):
            compileData(dataDecl, schemas: &schemas, warnings: &warnings)
        default:
            break
        }
    }

    return CompileResult(schemas: schemas, warnings: warnings)
}

private func compileData(_ decl: DataDecl, schemas: inout [String: MoonJsonSchema], warnings: inout [SchemaWarning]) {
    let nullary = decl.constructors.filter { ctor in
        guard let args = ctor.args else { return true }
        if case .positional(let types, _) = args { return types.isEmpty }
        return false
    }

    let allNullaryOrPositional = decl.constructors.allSatisfy { ctor in
        guard let args = ctor.args else { return true }
        if case .record = args { return false }
        return true
    }

    if !nullary.isEmpty && allNullaryOrPositional {
        schemas[decl.name] = MoonJsonSchema(enumValues: nullary.map(\.name))
    }

    for ctor in decl.constructors {
        if case .record(let fields, _) = ctor.args {
            schemas[ctor.name] = compileRecordFields(
                ctor.name,
                fields: fields.map { RecordFieldSpec(name: $0.name, type: $0.type, modifiers: []) },
                warnings: &warnings
            )
        }
    }
}

private struct RecordFieldSpec {
    var name: String
    var type: TypeSpec
    var modifiers: [FieldModifier]
}

private func compileModel(_ decl: ModelDecl, warnings: inout [SchemaWarning]) -> MoonJsonSchema {
    compileRecordFields(
        decl.name,
        fields: decl.fields.map { RecordFieldSpec(name: $0.name, type: $0.type, modifiers: $0.modifiers) },
        warnings: &warnings
    )
}

private func compileRecordFields(
    _ name: String,
    fields: [RecordFieldSpec],
    warnings: inout [SchemaWarning]
) -> MoonJsonSchema {
    var properties: [String: MoonJsonSchema] = [:]
    var required: [String] = []

    for field in fields {
        let optional = field.modifiers.contains { if case .optional = $0 { return true }; return false }
        var schema = compileType(field.type)

        for mod in field.modifiers {
            if case .constraint(let expr, let span) = mod {
                schema = applyConstraint(schema, expr: expr, warnings: &warnings, line: span.start.line, column: span.start.column)
            }
        }

        properties[field.name] = schema
        if !optional {
            required.append(field.name)
        }
    }

    return MoonJsonSchema(
        type: "object",
        properties: properties,
        required: required.isEmpty ? nil : required,
        description: name
    )
}

private func compileType(_ spec: TypeSpec) -> MoonJsonSchema {
    switch spec {
    case .varType(let name, _):
        return typeNameToSchema(name)
    case .list(let element, _):
        return MoonJsonSchema(type: "array", items: compileType(element))
    case .con(let name, let args, _):
        if args.isEmpty {
            return typeNameToSchema(name)
        }
        return MoonJsonSchema(
            type: "object",
            properties: [:],
            required: [],
            description: "\(name) \(args.map(typeLabel).joined(separator: " "))"
        )
    case .tuple(let elements, _):
        return MoonJsonSchema(
            type: "array",
            items: MoonJsonSchema(enumValues: elements.indices.map(String.init)),
            description: "tuple(\(elements.map(typeLabel).joined(separator: ", ")))"
        )
    case .arrow(let from, let to, _):
        return MoonJsonSchema(description: "\(typeLabel(from)) -> \(typeLabel(to))")
    }
}

private func typeLabel(_ spec: TypeSpec) -> String {
    switch spec {
    case .varType(let name, _):
        return name
    case .list(let element, _):
        return "[\(typeLabel(element))]"
    case .con(let name, let args, _):
        if args.isEmpty { return name }
        return "\(name) \(args.map(typeLabel).joined(separator: " "))"
    case .tuple(let elements, _):
        return "(\(elements.map(typeLabel).joined(separator: ", ")))"
    case .arrow(let from, let to, _):
        return "\(typeLabel(from)) -> \(typeLabel(to))"
    }
}

private func typeNameToSchema(_ name: String) -> MoonJsonSchema {
    switch name {
    case "String": return MoonJsonSchema(type: "string")
    case "Int": return MoonJsonSchema(type: "integer")
    case "Float": return MoonJsonSchema(type: "number")
    case "Bool": return MoonJsonSchema(type: "boolean")
    default: return MoonJsonSchema(description: name)
    }
}

private func applyConstraint(
    _ schema: MoonJsonSchema,
    expr: Expression,
    warnings: inout [SchemaWarning],
    line: Int,
    column: Int
) -> MoonJsonSchema {
    if let between = parseBetweenConstraint(expr) {
        var updated = schema
        updated.minimum = between.min
        updated.maximum = between.max
        return updated
    }

    if let length = parseLengthConstraint(expr) {
        var updated = schema
        if schema.type == "string" {
            updated.maxLength = length
        } else {
            updated.maxItems = length
        }
        return updated
    }

    warnings.append(SchemaWarning(
        message: "Unrecognized constraint: \(exprToString(expr))",
        line: line,
        column: column
    ))
    return schema
}

private func parseBetweenConstraint(_ expr: Expression) -> (min: Double, max: Double)? {
    guard case .app(let outerFunc, let outerArg, _) = expr,
          case .app(let innerFunc, let innerArg, _) = outerFunc,
          case .varRef(let name, _) = innerFunc, name == "between",
          let min = literalNumber(innerArg),
          let max = literalNumber(outerArg) else {
        return nil
    }
    return (min, max)
}

private func parseLengthConstraint(_ expr: Expression) -> Int? {
    guard case .infix(let op, let left, let right, _) = expr, op == "<=",
          case .varRef(let name, _) = left, name == "length",
          case .lit = right,
          let value = literalNumber(right) else {
        return nil
    }
    return Int(value)
}

private func literalNumber(_ expr: Expression) -> Double? {
    guard case .lit(let value, _) = expr else { return nil }
    switch value {
    case .int(let n, _): return Double(n)
    case .float(let f, _): return f
    default: return nil
    }
}

private func exprToString(_ expr: Expression) -> String {
    switch expr {
    case .varRef(let name, _):
        return name
    case .lit(let value, _):
        switch value {
        case .string(let s, _): return "\"\(s)\""
        case .int(let n, _): return "\(n)"
        case .float(let f, _): return "\(f)"
        case .bool(let b, _): return "\(b)"
        }
    case .app(let fn, let arg, _):
        return "\(exprToString(fn)) \(exprToString(arg))"
    case .infix(let op, let left, let right, _):
        return "\(exprToString(left)) \(op) \(exprToString(right))"
    default:
        return "Expr"
    }
}
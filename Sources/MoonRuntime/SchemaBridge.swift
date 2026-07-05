import MoonAST
import MoonSchemaCompiler

public func moonJsonSchemaToRuntime(_ schema: MoonJsonSchema) -> JsonSchema {
    if let enumValues = schema.enumValues {
        return .string(enumValues: enumValues)
    }
    switch schema.type {
    case "string":
        return .string(enumValues: schema.enumValues)
    case "integer":
        return .integer
    case "number":
        return .number(minimum: schema.minimum, maximum: schema.maximum)
    case "boolean":
        return .boolean
    case "array":
        if let items = schema.items {
            return .array(items: moonJsonSchemaToRuntime(items))
        }
        return .array()
    case "object":
        var properties: [String: JsonSchema] = [:]
        if let props = schema.properties {
            for (key, value) in props {
                properties[key] = moonJsonSchemaToRuntime(value)
            }
        }
        return .object(properties: properties, required: schema.required)
    default:
        if let properties = schema.properties {
            var props: [String: JsonSchema] = [:]
            for (key, value) in properties {
                props[key] = moonJsonSchemaToRuntime(value)
            }
            return .object(properties: props, required: schema.required)
        }
        return .object()
    }
}

public func compiledSchemasForRuntime(_ program: Program) -> [String: JsonSchema] {
    let compiled = compileSchemas(program)
    var result: [String: JsonSchema] = [:]
    for (name, schema) in compiled.schemas {
        result[name] = moonJsonSchemaToRuntime(schema)
    }
    return result
}
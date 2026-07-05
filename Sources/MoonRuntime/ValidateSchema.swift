import Foundation

public struct LlmValidationError: Error, CustomStringConvertible, Sendable {
    public var message: String
    public var raw: String?

    public init(_ message: String, raw: String? = nil) {
        self.message = message
        self.raw = raw
    }

    public var description: String { message }
}

public struct LlmApiError: Error, CustomStringConvertible, Sendable {
    public var message: String
    public var status: Int?

    public init(_ message: String, status: Int? = nil) {
        self.message = message
        self.status = status
    }

    public var description: String { message }
}

public func validateAgainstSchema(_ schema: JsonSchema, _ value: RuntimeValue) throws {
    try validateValue(schema, value, path: "root")
}

private func validateValue(_ schema: JsonSchema, _ value: RuntimeValue, path: String) throws {
    switch schema {
    case .object(let properties, let required):
        guard case .record(_, let fields) = value else {
            throw LlmValidationError("Schema validation failed: \(path) expected object")
        }
        if let required {
            for key in required where fields[key] == nil {
                throw LlmValidationError("Schema validation failed: \(path).\(key) is required")
            }
        }
        if let properties {
            for (key, propSchema) in properties {
                guard let fieldValue = fields[key] else { continue }
                try validateValue(propSchema, fieldValue, path: "\(path).\(key)")
            }
        }

    case .array(let items):
        guard case .array(let entries) = value else {
            throw LlmValidationError("Schema validation failed: \(path) expected array")
        }
        if let items {
            for (index, entry) in entries.enumerated() {
                try validateValue(items, entry, path: "\(path)[\(index)]")
            }
        }

    case .string(let enumValues):
        guard case .string(let text) = value else {
            throw LlmValidationError("Schema validation failed: \(path) expected string")
        }
        if let enumValues, !enumValues.contains(text) {
            throw LlmValidationError("Schema validation failed: \(path) must be one of \(enumValues.joined(separator: ", "))")
        }

    case .integer:
        guard case .int = value else {
            throw LlmValidationError("Schema validation failed: \(path) expected integer")
        }

    case .number(let minimum, let maximum):
        let number: Double
        switch value {
        case .int(let n): number = Double(n)
        case .double(let d): number = d
        default:
            throw LlmValidationError("Schema validation failed: \(path) expected number")
        }
        if let minimum, number < minimum {
            throw LlmValidationError("Schema validation failed: \(path) below minimum \(minimum)")
        }
        if let maximum, number > maximum {
            throw LlmValidationError("Schema validation failed: \(path) above maximum \(maximum)")
        }

    case .boolean:
        guard case .bool = value else {
            throw LlmValidationError("Schema validation failed: \(path) expected boolean")
        }
    }
}

public func parseJsonContent(_ raw: String) throws -> RuntimeValue {
    if raw.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
        throw LlmValidationError("Empty LLM response")
    }

    let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
    if let value = try? decodeRuntimeValue(from: trimmed) {
        return value
    }

    if let fenced = extractFencedJson(trimmed), let value = try? decodeRuntimeValue(from: fenced) {
        return value
    }

    if let start = trimmed.firstIndex(of: "{"), let end = trimmed.lastIndex(of: "}") , start < end {
        let slice = String(trimmed[start...end])
        if let value = try? decodeRuntimeValue(from: slice) {
            return value
        }
    }

    throw LlmValidationError("Response is not valid JSON", raw: raw)
}

private func extractFencedJson(_ text: String) -> String? {
    let pattern = #"```(?:json)?\s*([\s\S]*?)```"#
    guard let regex = try? NSRegularExpression(pattern: pattern, options: [.caseInsensitive]) else {
        return nil
    }
    let range = NSRange(text.startIndex..<text.endIndex, in: text)
    guard let match = regex.firstMatch(in: text, range: range),
          let capture = Range(match.range(at: 1), in: text) else {
        return nil
    }
    return String(text[capture]).trimmingCharacters(in: .whitespacesAndNewlines)
}

private func decodeRuntimeValue(from json: String) throws -> RuntimeValue {
    let data = Data(json.utf8)
    let object = try JSONSerialization.jsonObject(with: data)
    return runtimeValueFromJSON(object)
}

private func runtimeValueFromJSON(_ object: Any) -> RuntimeValue {
    switch object {
    case is NSNull:
        return .null
    case let bool as Bool:
        return .bool(bool)
    case let int as Int:
        return .int(int)
    case let double as Double:
        return .double(double)
    case let string as String:
        return .string(string)
    case let array as [Any]:
        return .array(array.map(runtimeValueFromJSON))
    case let dict as [String: Any]:
        var fields: [String: RuntimeValue] = [:]
        for (key, value) in dict {
            fields[key] = runtimeValueFromJSON(value)
        }
        return .record(typeName: nil, fields: fields)
    default:
        return .string(String(describing: object))
    }
}
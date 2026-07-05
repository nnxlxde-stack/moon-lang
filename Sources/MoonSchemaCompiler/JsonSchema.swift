import Foundation

public final class MoonJsonSchema: Codable, Equatable, @unchecked Sendable {
    public var type: String?
    public var properties: [String: MoonJsonSchema]?
    public var required: [String]?
    public var items: MoonJsonSchema?
    public var enumValues: [String]?
    public var minimum: Double?
    public var maximum: Double?
    public var maxLength: Int?
    public var maxItems: Int?
    public var description: String?

    public init(
        type: String? = nil,
        properties: [String: MoonJsonSchema]? = nil,
        required: [String]? = nil,
        items: MoonJsonSchema? = nil,
        enumValues: [String]? = nil,
        minimum: Double? = nil,
        maximum: Double? = nil,
        maxLength: Int? = nil,
        maxItems: Int? = nil,
        description: String? = nil
    ) {
        self.type = type
        self.properties = properties
        self.required = required
        self.items = items
        self.enumValues = enumValues
        self.minimum = minimum
        self.maximum = maximum
        self.maxLength = maxLength
        self.maxItems = maxItems
        self.description = description
    }

    enum CodingKeys: String, CodingKey {
        case type, properties, required, items, minimum, maximum, maxLength, maxItems, description
        case enumValues = "enum"
    }

    public static func == (lhs: MoonJsonSchema, rhs: MoonJsonSchema) -> Bool {
        lhs.type == rhs.type
            && lhs.required == rhs.required
            && lhs.enumValues == rhs.enumValues
            && lhs.minimum == rhs.minimum
            && lhs.maximum == rhs.maximum
            && lhs.maxLength == rhs.maxLength
            && lhs.maxItems == rhs.maxItems
            && lhs.description == rhs.description
            && lhs.properties == rhs.properties
            && lhs.items == rhs.items
    }
}

public struct SchemaWarning: Sendable, Equatable {
    public var message: String
    public var line: Int
    public var column: Int

    public init(message: String, line: Int, column: Int) {
        self.message = message
        self.line = line
        self.column = column
    }
}

public struct CompileResult: Sendable {
    public var schemas: [String: MoonJsonSchema]
    public var warnings: [SchemaWarning]

    public init(schemas: [String: MoonJsonSchema], warnings: [SchemaWarning]) {
        self.schemas = schemas
        self.warnings = warnings
    }
}
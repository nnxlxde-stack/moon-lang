import Foundation
import MoonAST

public enum MoonSchemaCompilerVersion {
    public static let current = "0.3.0"
}

public enum MoonSchemaCompilerExport {
    public static func toJSON(_ schemas: [String: MoonJsonSchema], pretty: Bool = true) throws -> String {
        let encoder = JSONEncoder()
        if pretty {
            encoder.outputFormatting = [.sortedKeys, .prettyPrinted]
        } else {
            encoder.outputFormatting = [.sortedKeys]
        }
        let data = try encoder.encode(schemas)
        guard let str = String(data: data, encoding: .utf8) else {
            throw MoonSchemaCompilerError.encodingFailed
        }
        return str
    }
}

public enum MoonSchemaCompilerError: Error, CustomStringConvertible {
    case encodingFailed

    public var description: String {
        switch self {
        case .encodingFailed: return "Failed to encode schemas as JSON"
        }
    }
}
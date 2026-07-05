import Foundation
import MoonAST

public enum MoonPlannerVersion {
    public static let current = "0.3.0"
}

public enum MoonPlannerExport {
    public static func toJSON(_ dag: ExecutionDag, pretty: Bool = true) throws -> String {
        let encoder = JSONEncoder()
        if pretty {
            encoder.outputFormatting = [.sortedKeys, .prettyPrinted]
        } else {
            encoder.outputFormatting = [.sortedKeys]
        }
        let data = try encoder.encode(dag)
        guard let str = String(data: data, encoding: .utf8) else {
            throw MoonPlannerError.encodingFailed
        }
        return str
    }
}

public enum MoonPlannerError: Error, CustomStringConvertible {
    case encodingFailed

    public var description: String {
        switch self {
        case .encodingFailed: return "Failed to encode execution DAG as JSON"
        }
    }
}
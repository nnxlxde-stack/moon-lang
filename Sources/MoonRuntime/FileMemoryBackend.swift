import Foundation

public final class FileMemoryBackend: @unchecked Sendable {
    private let rootDir: String

    public init(rootDir: String) {
        self.rootDir = rootDir
    }

    public func ensureReady() throws {
        try FileManager.default.createDirectory(atPath: rootDir, withIntermediateDirectories: true)
    }

    private func pathFor(_ key: String) -> String {
        let safe = key.replacingOccurrences(
            of: #"[^a-zA-Z0-9._-]"#,
            with: "_",
            options: .regularExpression
        )
        return (rootDir as NSString).appendingPathComponent("\(safe).txt")
    }

    public func getSync(_ key: String) -> String? {
        let path = pathFor(key)
        guard FileManager.default.fileExists(atPath: path),
              let data = FileManager.default.contents(atPath: path),
              let text = String(data: data, encoding: .utf8) else {
            return nil
        }
        return text
    }

    public func get(_ key: String) async -> String? {
        getSync(key)
    }

    public func set(_ key: String, _ value: String) async throws {
        try ensureReady()
        try value.write(toFile: pathFor(key), atomically: true, encoding: .utf8)
    }
}

public func parseMemoryBackendUri(_ uri: String) -> String {
    if uri.hasPrefix("file://") {
        return String(uri.dropFirst("file://".count))
    }
    return uri
}
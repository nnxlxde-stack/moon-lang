import Foundation

public struct MoonPkgManifest: Codable, Equatable, Sendable {
    public var name: String
    public var version: String
    public var moon: String
    public var exports: [String]

    public init(name: String, version: String, moon: String, exports: [String]) {
        self.name = name
        self.version = version
        self.moon = moon
        self.exports = exports
    }
}

public func loadMoonPkgManifest(at packageRoot: String) throws -> MoonPkgManifest {
    let path = URL(fileURLWithPath: packageRoot).appendingPathComponent("moon.pkg.json").path
    guard FileManager.default.fileExists(atPath: path) else {
        throw MoonPkgManifestError.notFound(path)
    }
    let data = try Data(contentsOf: URL(fileURLWithPath: path))
    let manifest = try JSONDecoder().decode(MoonPkgManifest.self, from: data)
    guard !manifest.name.isEmpty, !manifest.version.isEmpty, !manifest.exports.isEmpty else {
        throw MoonPkgManifestError.invalid("name, version, and exports are required")
    }
    return manifest
}

public enum MoonPkgManifestError: Error, CustomStringConvertible {
    case notFound(String)
    case invalid(String)

    public var description: String {
        switch self {
        case .notFound(let path): return "moon.pkg.json not found at \(path)"
        case .invalid(let message): return "Invalid moon.pkg.json: \(message)"
        }
    }
}

public func vendorDirectory(
    projectRoot: String,
    owner: String,
    repo: String,
    version: String,
    package: String? = nil
) -> String {
    var url = URL(fileURLWithPath: projectRoot)
        .appendingPathComponent(".moon/packages")
        .appendingPathComponent(owner)
        .appendingPathComponent(repo)
    if let package {
        url = url.appendingPathComponent(package)
    }
    return url.appendingPathComponent(version).standardizedFileURL.path
}
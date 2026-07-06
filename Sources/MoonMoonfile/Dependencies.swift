import Foundation

public enum MoonDependency: Equatable, Sendable, Codable {
    case core(String)
    case git(host: String, owner: String, repo: String, package: String?, version: String)

    public var key: String {
        switch self {
        case .core(let module):
            return module
        case .git(let host, let owner, let repo, let package, _):
            if let package {
                return "\(host)/\(owner)/\(repo)/\(package)"
            }
            return "\(host)/\(owner)/\(repo)"
        }
    }

    public var isCore: Bool {
        if case .core = self { return true }
        return false
    }

    public var isMonorepoPackage: Bool {
        if case .git(_, _, _, let package, _) = self {
            return package != nil
        }
        return false
    }

    public func moonfileLine() -> String {
        switch self {
        case .core(let module):
            return module
        case .git(let host, let owner, let repo, let package, let version):
            let path = if let package {
                "\(host)/\(owner)/\(repo)/\(package)"
            } else {
                "\(host)/\(owner)/\(repo)"
            }
            return "\(path): \"\(version)\""
        }
    }
}

public func parseGitDependencyKey(_ key: String, version: String) -> MoonDependency? {
    let parts = key.split(separator: "/", omittingEmptySubsequences: true).map(String.init)
    guard parts.count == 3 || parts.count == 4 else { return nil }
    if parts.count == 3 {
        return .git(host: parts[0], owner: parts[1], repo: parts[2], package: nil, version: version)
    }
    return .git(host: parts[0], owner: parts[1], repo: parts[2], package: parts[3], version: version)
}

public func parsePackageRef(_ ref: String) throws -> MoonDependency {
    let trimmed = ref.trimmingCharacters(in: .whitespaces)
    guard !trimmed.isEmpty else {
        throw MoonPackageRefError.empty
    }

    let atParts = trimmed.split(separator: "@", maxSplits: 1).map(String.init)
    if atParts.count == 2, atParts[1].contains("/") == false {
        guard let dep = parseGitDependencyKey(atParts[0], version: atParts[1]) else {
            throw MoonPackageRefError.invalid(trimmed)
        }
        return dep
    }

    if trimmed.contains("/") {
        let colonParts = trimmed.split(separator: ":", maxSplits: 1).map(String.init)
        if colonParts.count == 2 {
            let version = colonParts[1].trimmingCharacters(in: .whitespaces)
                .trimmingCharacters(in: CharacterSet(charactersIn: "\"'"))
            guard let dep = parseGitDependencyKey(colonParts[0], version: version) else {
                throw MoonPackageRefError.invalid(trimmed)
            }
            return dep
        }
        throw MoonPackageRefError.missingVersion(trimmed)
    }

    return .core(trimmed)
}

public enum MoonPackageRefError: Error, CustomStringConvertible {
    case empty
    case invalid(String)
    case missingVersion(String)

    public var description: String {
        switch self {
        case .empty:
            return "Package reference is empty"
        case .invalid(let ref):
            return "Invalid package reference: \(ref)"
        case .missingVersion(let ref):
            return "Git package reference requires version (@ or :): \(ref)"
        }
    }
}

public func importPathMatchesDependency(_ importPath: [String], dependency: MoonDependency) -> Bool {
    guard case .git(let host, let owner, let repo, let package, _) = dependency else { return false }
    let hostParts = host.split(separator: ".").map(String.init)
    var expected = hostParts + [owner, repo]
    if let package {
        expected.append(package)
    }
    return importPath == expected
}

public func dependencyForImportPath(_ path: [String], dependencies: [MoonDependency]) -> MoonDependency? {
    dependencies.first { importPathMatchesDependency(path, dependency: $0) }
}

public func gitTagForDependency(_ dependency: MoonDependency) -> String? {
    guard case .git(_, _, _, let package, let version) = dependency else { return nil }
    let semver = version.hasPrefix("v") ? version : "v\(version)"
    if let package {
        return "\(package)/\(semver)"
    }
    return semver
}

public func monorepoPackageSubpath(_ dependency: MoonDependency) -> String? {
    guard case .git(_, _, _, let package, _) = dependency, let package else { return nil }
    return "packages/\(package)"
}
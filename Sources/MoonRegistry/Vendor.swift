import Foundation
import MoonMoonfile

public struct VendorOptions: Sendable {
    public var localFixtureRoot: String?
    public var force: Bool

    public init(localFixtureRoot: String? = nil, force: Bool = false) {
        self.localFixtureRoot = localFixtureRoot
        self.force = force
    }
}

public struct VendorResult: Sendable, Equatable {
    public var dependency: MoonDependency
    public var destination: String
    public var action: VendorAction

    public init(dependency: MoonDependency, destination: String, action: VendorAction) {
        self.dependency = dependency
        self.destination = destination
        self.action = action
    }
}

public enum VendorAction: String, Sendable, Equatable {
    case copied
    case cloned
    case skipped
}

public enum VendorError: Error, CustomStringConvertible {
    case unsupportedDependency(String)
    case gitFailed(String)
    case copyFailed(String)

    public var description: String {
        switch self {
        case .unsupportedDependency(let key):
            return "Cannot vendor dependency: \(key)"
        case .gitFailed(let message):
            return "Git vendor failed: \(message)"
        case .copyFailed(let message):
            return "Vendor copy failed: \(message)"
        }
    }
}

public func vendorPackage(
    _ dependency: MoonDependency,
    projectRoot: String,
    options: VendorOptions = VendorOptions()
) throws -> VendorResult {
    guard case .git(let host, let owner, let repo, let version) = dependency else {
        throw VendorError.unsupportedDependency(dependency.key)
    }

    let destination = vendorDirectory(projectRoot: projectRoot, owner: owner, repo: repo, version: version)
    let manifestPath = URL(fileURLWithPath: destination).appendingPathComponent("moon.pkg.json").path

    if FileManager.default.fileExists(atPath: manifestPath), !options.force {
        return VendorResult(dependency: dependency, destination: destination, action: .skipped)
    }

    if options.force, FileManager.default.fileExists(atPath: destination) {
        try FileManager.default.removeItem(atPath: destination)
    }

    try FileManager.default.createDirectory(
        atPath: URL(fileURLWithPath: destination).deletingLastPathComponent().path,
        withIntermediateDirectories: true
    )

    if let fixtureRoot = options.localFixtureRoot {
        try copyFixture(from: fixtureRoot, to: destination)
        return VendorResult(dependency: dependency, destination: destination, action: .copied)
    }

    let repoURL = gitRemoteURL(host: host, owner: owner, repo: repo)
    let tag = version.hasPrefix("v") ? version : "v\(version)"
    try runGitClone(repoURL: repoURL, tag: tag, destination: destination)
    return VendorResult(dependency: dependency, destination: destination, action: .cloned)
}

public func vendorAll(
    moonfile: MoonfileDocument,
    projectRoot: String,
    options: VendorOptions = VendorOptions()
) throws -> [VendorResult] {
    var results: [VendorResult] = []
    for dep in moonfile.dependencies {
        guard case .git = dep else { continue }
        results.append(try vendorPackage(dep, projectRoot: projectRoot, options: options))
    }
    return results
}

private func copyFixture(from source: String, to destination: String) throws {
    let fm = FileManager.default
    if fm.fileExists(atPath: destination) {
        try fm.removeItem(atPath: destination)
    }
    try fm.createDirectory(atPath: destination, withIntermediateDirectories: true)
    let items = try fm.contentsOfDirectory(atPath: source)
    for item in items where item != ".git" {
        let from = URL(fileURLWithPath: source).appendingPathComponent(item).path
        let to = URL(fileURLWithPath: destination).appendingPathComponent(item).path
        try fm.copyItem(atPath: from, toPath: to)
    }
}

private func runGitClone(repoURL: String, tag: String, destination: String) throws {
    let process = Process()
    process.executableURL = URL(fileURLWithPath: "git")
    process.arguments = [
        "clone",
        "--depth", "1",
        "--branch", tag,
        repoURL,
        destination,
    ]

    let stderr = Pipe()
    process.standardError = stderr
    process.standardOutput = Pipe()

    do {
        try process.run()
    } catch {
        throw VendorError.gitFailed("git executable not found: \(error)")
    }
    process.waitUntilExit()

    if process.terminationStatus != 0 {
        let errData = stderr.fileHandleForReading.readDataToEndOfFile()
        let message = String(data: errData, encoding: .utf8) ?? "exit \(process.terminationStatus)"
        throw VendorError.gitFailed(message.trimmingCharacters(in: .whitespacesAndNewlines))
    }
}
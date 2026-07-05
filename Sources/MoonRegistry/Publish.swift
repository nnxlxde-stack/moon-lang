import Foundation
import MoonMoonfile

public struct PublishResult: Sendable, Equatable {
    public var packageName: String
    public var version: String
    public var tag: String
    public var createdTag: Bool

    public init(packageName: String, version: String, tag: String, createdTag: Bool) {
        self.packageName = packageName
        self.version = version
        self.tag = tag
        self.createdTag = createdTag
    }
}

public enum PublishError: Error, CustomStringConvertible {
    case notGitRepo
    case tagExists(String)
    case gitFailed(String)
    case moonfileMismatch(String)

    public var description: String {
        switch self {
        case .notGitRepo:
            return "Not a git repository"
        case .tagExists(let tag):
            return "Git tag already exists: \(tag)"
        case .gitFailed(let message):
            return "Git publish failed: \(message)"
        case .moonfileMismatch(let message):
            return message
        }
    }
}

public func publishPackage(
    projectRoot: String,
    toolchainVersion: String,
    createTag: Bool = true
) throws -> PublishResult {
    let moonfilePath = findMoonfile(startDir: projectRoot)
    guard let moonfilePath else {
        throw PublishError.moonfileMismatch("Moonfile not found")
    }

    let moonfile = try loadMoonfile(path: moonfilePath)
    let manifest = try MoonMoonfile.loadMoonPkgManifest(at: projectRoot)
    try validateMoonPkgManifest(manifest, toolchainVersion: toolchainVersion)

    if moonfile.package != manifest.name {
        throw PublishError.moonfileMismatch(
            "Moonfile package \"\(moonfile.package)\" does not match moon.pkg.json name \"\(manifest.name)\""
        )
    }

    let tag = manifest.version.hasPrefix("v") ? manifest.version : "v\(manifest.version)"
    var createdTag = false

    if createTag {
        guard isGitRepository(projectRoot) else {
            throw PublishError.notGitRepo
        }
        if gitTagExists(tag, projectRoot: projectRoot) {
            throw PublishError.tagExists(tag)
        }
        try runGitTag(tag, projectRoot: projectRoot)
        createdTag = true
    }

    return PublishResult(
        packageName: manifest.name,
        version: manifest.version,
        tag: tag,
        createdTag: createdTag
    )
}

private func isGitRepository(_ projectRoot: String) -> Bool {
    FileManager.default.fileExists(
        atPath: URL(fileURLWithPath: projectRoot).appendingPathComponent(".git").path
    )
}

private func gitTagExists(_ tag: String, projectRoot: String) -> Bool {
    let process = Process()
    process.currentDirectoryURL = URL(fileURLWithPath: projectRoot)
    process.executableURL = URL(fileURLWithPath: "git")
    process.arguments = ["rev-parse", "--verify", "refs/tags/\(tag)"]
    process.standardOutput = Pipe()
    process.standardError = Pipe()
    guard (try? process.run()) != nil else { return false }
    process.waitUntilExit()
    return process.terminationStatus == 0
}

private func runGitTag(_ tag: String, projectRoot: String) throws {
    let process = Process()
    process.currentDirectoryURL = URL(fileURLWithPath: projectRoot)
    process.executableURL = URL(fileURLWithPath: "git")
    process.arguments = ["tag", tag]
    let stderr = Pipe()
    process.standardError = stderr
    process.standardOutput = Pipe()
    try process.run()
    process.waitUntilExit()
    if process.terminationStatus != 0 {
        let errData = stderr.fileHandleForReading.readDataToEndOfFile()
        let message = String(data: errData, encoding: .utf8) ?? "exit \(process.terminationStatus)"
        throw PublishError.gitFailed(message.trimmingCharacters(in: .whitespacesAndNewlines))
    }
}
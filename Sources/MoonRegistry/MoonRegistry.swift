import Foundation
import MoonMoonfile

public enum MoonRegistryVersion {
    public static let current = "0.3.0"
}

public struct AddDependencyResult: Sendable, Equatable {
    public var dependency: MoonDependency
    public var moonfilePath: String
    public var addedToMoonfile: Bool
    public var vendor: VendorResult?

    public init(
        dependency: MoonDependency,
        moonfilePath: String,
        addedToMoonfile: Bool,
        vendor: VendorResult? = nil
    ) {
        self.dependency = dependency
        self.moonfilePath = moonfilePath
        self.addedToMoonfile = addedToMoonfile
        self.vendor = vendor
    }
}

public enum MoonRegistryError: Error, CustomStringConvertible {
    case moonfileNotFound

    public var description: String {
        switch self {
        case .moonfileNotFound:
            return "Moonfile not found"
        }
    }
}

public func addDependency(
    ref: String,
    projectRoot: String,
    vendorOptions: VendorOptions = VendorOptions()
) throws -> AddDependencyResult {
    let dependency = try parsePackageRef(ref)
    guard let moonfilePath = findMoonfile(startDir: projectRoot) else {
        throw MoonRegistryError.moonfileNotFound
    }

    let added = try appendDependencyLine(dependency, moonfilePath: moonfilePath)

    var vendorResult: VendorResult?
    if case .git = dependency {
        vendorResult = try vendorPackage(dependency, projectRoot: projectRoot, options: vendorOptions)
    }

    return AddDependencyResult(
        dependency: dependency,
        moonfilePath: moonfilePath,
        addedToMoonfile: added,
        vendor: vendorResult
    )
}

private func appendDependencyLine(_ dependency: MoonDependency, moonfilePath: String) throws -> Bool {
    var source = try String(contentsOfFile: moonfilePath, encoding: .utf8)
    let depLine = dependency.moonfileLine()
    if source.contains(depLine) {
        return false
    }

    let newLine = "  \(depLine)\n"
    if let range = source.range(of: "dependencies:") {
        var index = range.upperBound
        while index < source.endIndex {
            if source[index] == "\n" {
                index = source.index(after: index)
                break
            }
            index = source.index(after: index)
        }

        while index < source.endIndex {
            let lineStart = index
            var lineEnd = index
            while lineEnd < source.endIndex, source[lineEnd] != "\n" {
                lineEnd = source.index(after: lineEnd)
            }
            let line = String(source[lineStart..<lineEnd])
            let trimmed = line.trimmingCharacters(in: .whitespaces)

            if trimmed.isEmpty || trimmed.hasPrefix("--") || trimmed.hasPrefix("#") {
                index = lineEnd < source.endIndex ? source.index(after: lineEnd) : source.endIndex
                continue
            }
            if line.hasPrefix("  ") || line.hasPrefix("\t") {
                index = lineEnd < source.endIndex ? source.index(after: lineEnd) : source.endIndex
                continue
            }
            source.insert(contentsOf: newLine, at: lineStart)
            try source.write(toFile: moonfilePath, atomically: true, encoding: .utf8)
            return true
        }

        source.insert(contentsOf: newLine, at: index)
    } else {
        if !source.hasSuffix("\n") { source.append("\n") }
        source.append("dependencies:\n\(newLine)")
    }

    try source.write(toFile: moonfilePath, atomically: true, encoding: .utf8)
    return true
}
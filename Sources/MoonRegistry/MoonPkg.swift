import Foundation
import MoonMoonfile

public enum MoonPkgError: Error, CustomStringConvertible {
    case moonVersionMismatch(required: String, actual: String)

    public var description: String {
        switch self {
        case .moonVersionMismatch(let required, let actual):
            return "Package requires moon \(required), toolchain is \(actual)"
        }
    }
}

public func validateMoonPkgManifest(_ manifest: MoonPkgManifest, toolchainVersion: String) throws {
    guard semverSatisfies(toolchainVersion, constraint: manifest.moon) else {
        throw MoonPkgError.moonVersionMismatch(required: manifest.moon, actual: toolchainVersion)
    }
}

public func semverSatisfies(_ version: String, constraint: String) -> Bool {
    let normalized = normalizeSemver(version)
    let trimmed = constraint.trimmingCharacters(in: .whitespaces)
    if trimmed.hasPrefix(">=") {
        let required = normalizeSemver(String(trimmed.dropFirst(2)))
        return compareSemver(normalized, required) >= 0
    }
    if trimmed.hasPrefix("^") {
        let required = normalizeSemver(String(trimmed.dropFirst()))
        return compareSemver(normalized, required) >= 0
    }
    return normalized == normalizeSemver(trimmed)
}

private func normalizeSemver(_ version: String) -> String {
    version
        .replacingOccurrences(of: "-swift-phase[0-9]+", with: "", options: .regularExpression)
        .replacingOccurrences(of: "-swift", with: "")
        .split(separator: "-", maxSplits: 1).first.map(String.init) ?? version
}

private func compareSemver(_ lhs: String, _ rhs: String) -> Int {
    let la = lhs.split(separator: ".").map { Int($0) ?? 0 }
    let ra = rhs.split(separator: ".").map { Int($0) ?? 0 }
    let count = max(la.count, ra.count)
    for index in 0..<count {
        let l = index < la.count ? la[index] : 0
        let r = index < ra.count ? ra[index] : 0
        if l < r { return -1 }
        if l > r { return 1 }
    }
    return 0
}
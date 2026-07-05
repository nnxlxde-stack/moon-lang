import Foundation

public struct MoonfileDocument: Sendable, Equatable {
    public var package: String
    public var dependencies: [MoonDependency]
    public var targets: [String: String]

    public init(package: String, dependencies: [MoonDependency] = [], targets: [String: String] = [:]) {
        self.package = package
        self.dependencies = dependencies
        self.targets = targets
    }

    public func dependencyKeys() -> Set<String> {
        Set(dependencies.map(\.key))
    }

    public func containsDependency(_ key: String) -> Bool {
        dependencyKeys().contains(key)
    }
}

public enum MoonMoonfileVersion {
    public static let current = "0.3.0"
}

public struct MoonMoonfileParseError: Error, CustomStringConvertible {
    public var message: String
    public var line: Int

    public init(_ message: String, line: Int) {
        self.message = message
        self.line = line
    }

    public var description: String {
        "\(message) at line \(line)"
    }
}

private struct ParsedLine {
    var indent: Int
    var text: String
    var lineNo: Int
}

public struct MoonMoonfileParser {
    public init() {}

    public func parse(_ source: String) throws -> MoonfileDocument {
        var result = MoonfileDocument(package: "", dependencies: [], targets: [:])

        let lines = source
            .replacingOccurrences(of: "\r\n", with: "\n")
            .replacingOccurrences(of: "\r", with: "\n")
            .split(separator: "\n", omittingEmptySubsequences: false)
            .enumerated()
            .map { index, raw -> ParsedLine in
                let text = String(raw)
                let indent = text.prefix(while: { $0 == " " || $0 == "\t" }).count
                let trimmed = text.trimmingCharacters(in: .whitespaces)
                return ParsedLine(indent: indent, text: trimmed, lineNo: index + 1)
            }
            .filter { !$0.text.isEmpty && !$0.text.hasPrefix("#") && !$0.text.hasPrefix("--") }

        var index = 0
        while index < lines.count {
            let line = lines[index]

            if let match = line.text.firstMatch(of: /^package\s+"([^"]+)"/) {
                result.package = String(match.1)
                index += 1
                continue
            }

            if isNestedSectionHeader(line.text) {
                let section = String(line.text.dropLast())
                index = try parseSection(section, lines: lines, start: index + 1, parentIndent: line.indent, result: &result)
                index += 1
                continue
            }

            throw MoonMoonfileParseError("Unexpected top-level line: \(line.text)", line: line.lineNo)
        }

        guard !result.package.isEmpty else {
            throw MoonMoonfileParseError(#"Missing package "name" declaration"#, line: 1)
        }

        return result
    }

    private func isNestedSectionHeader(_ text: String) -> Bool {
        text.hasSuffix(":") && !text.contains(" ") && !text.contains("\"")
    }

    private func parseSection(
        _ section: String,
        lines: [ParsedLine],
        start: Int,
        parentIndent: Int,
        result: inout MoonfileDocument
    ) throws -> Int {
        var index = start
        while index < lines.count, lines[index].indent > parentIndent {
            let line = lines[index]

            if isNestedSectionHeader(line.text) {
                index = skipNested(lines: lines, start: index + 1, parentIndent: line.indent)
                continue
            }

            if let match = line.text.firstMatch(of: /^([^:]+):\s+(.+)$/) {
                let key = String(match.1).trimmingCharacters(in: .whitespaces)
                let value = stripQuotes(String(match.2).trimmingCharacters(in: .whitespaces))
                if section == "targets" {
                    result.targets[key] = value
                    index += 1
                    continue
                }
                if section == "dependencies", key.contains("/"), let dep = parseGitDependencyKey(key, version: value) {
                    result.dependencies.append(dep)
                    index += 1
                    continue
                }
            }

            if section == "dependencies" {
                let depText = line.text.hasPrefix("- ") ? String(line.text.dropFirst(2)) : line.text
                result.dependencies.append(.core(depText))
                index += 1
                continue
            }

            index += 1
        }
        return index - 1
    }

    private func skipNested(lines: [ParsedLine], start: Int, parentIndent: Int) -> Int {
        var index = start
        while index < lines.count, lines[index].indent > parentIndent {
            index += 1
        }
        return index
    }

    private func stripQuotes(_ value: String) -> String {
        if (value.hasPrefix("\"") && value.hasSuffix("\"")) || (value.hasPrefix("'") && value.hasSuffix("'")) {
            return String(value.dropFirst().dropLast())
        }
        return value
    }
}

public let moonfileNames = ["Moonfile", "Moonfile.moon"]

public func findMoonfile(startDir: String) -> String? {
    var dir = URL(fileURLWithPath: startDir).standardizedFileURL
    let fm = FileManager.default
    while true {
        for name in moonfileNames {
            let candidate = dir.appendingPathComponent(name)
            if fm.fileExists(atPath: candidate.path) {
                return candidate.path
            }
        }
        let parent = dir.deletingLastPathComponent()
        if parent.path == dir.path { return nil }
        dir = parent
    }
}

public func loadMoonfile(path: String) throws -> MoonfileDocument {
    let source = try String(contentsOfFile: path, encoding: .utf8)
    return try MoonMoonfileParser().parse(source)
}
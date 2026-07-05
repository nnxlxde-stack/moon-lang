import Foundation

public struct MoonfileDocument: Sendable, Equatable {
    public var package: String
    public var dependencies: [MoonDependency]
    public var targets: [String: String]
    public var models: MoonfileModels
    public var providers: MoonfileProviders
    public var paths: MoonfilePaths
    public var prompts: MoonfilePrompts
    public var runtime: MoonfileRuntime

    public init(
        package: String,
        dependencies: [MoonDependency] = [],
        targets: [String: String] = [:],
        models: MoonfileModels = MoonfileModels(),
        providers: MoonfileProviders = MoonfileProviders(),
        paths: MoonfilePaths = MoonfilePaths(),
        prompts: MoonfilePrompts = MoonfilePrompts(),
        runtime: MoonfileRuntime = MoonfileRuntime()
    ) {
        self.package = package
        self.dependencies = dependencies
        self.targets = targets
        self.models = models
        self.providers = providers
        self.paths = paths
        self.prompts = prompts
        self.runtime = runtime
    }

    public func dependencyKeys() -> Set<String> {
        Set(dependencies.map(\.key))
    }

    public func containsDependency(_ key: String) -> Bool {
        dependencyKeys().contains(key)
    }
}

public enum MoonMoonfileVersion {
    public static let current = "0.4.0"
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
        var result = MoonfileDocument(package: "")

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
                let nested = String(line.text.dropLast())
                index = try parseNestedSection(section, nested: nested, lines: lines, start: index + 1, parentIndent: line.indent, result: &result)
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
                applySectionValue(section: section, key: key, value: value, result: &result)
                index += 1
                continue
            }

            if section == "dependencies" {
                let depText = line.text.hasPrefix("- ") ? String(line.text.dropFirst(2)) : line.text
                result.dependencies.append(.core(depText))
                index += 1
                continue
            }

            throw MoonMoonfileParseError("Unexpected line in \(section)", line: line.lineNo)
        }
        return index - 1
    }

    private func parseNestedSection(
        _ section: String,
        nested: String,
        lines: [ParsedLine],
        start: Int,
        parentIndent: Int,
        result: inout MoonfileDocument
    ) throws -> Int {
        var index = start
        while index < lines.count, lines[index].indent > parentIndent {
            let line = lines[index]
            guard let match = line.text.firstMatch(of: /^([^:]+):\s+(.+)$/) else {
                throw MoonMoonfileParseError("Expected key: value in \(section).\(nested)", line: line.lineNo)
            }
            let key = String(match.1).trimmingCharacters(in: .whitespaces)
            let value = stripQuotes(String(match.2).trimmingCharacters(in: .whitespaces))
            try applyNestedValue(section: section, nested: nested, key: key, value: value, lineNo: line.lineNo, result: &result)
            index += 1
        }
        return index - 1
    }

    private func applySectionValue(section: String, key: String, value: String, result: inout MoonfileDocument) {
        switch section {
        case "models":
            if key == "default_flash" { result.models.defaultFlash = value }
            if key == "default_pro" { result.models.defaultPro = value }
        case "paths":
            if key == "pricing" { result.paths.pricing = value }
            if key == "tokenizer" { result.paths.tokenizer = value }
        case "prompts":
            if key == "default_system_suffix" { result.prompts.defaultSystemSuffix = value }
            if key == "trace_by_default" { result.prompts.traceByDefault = value == "true" }
        default:
            break
        }
    }

    private func applyNestedValue(
        section: String,
        nested: String,
        key: String,
        value: String,
        lineNo: Int,
        result: inout MoonfileDocument
    ) throws {
        if section == "providers", nested == "deepseek" {
            var ds = result.providers.deepseek ?? MoonfileDeepSeekProvider()
            switch key {
            case "api_key":
                let parsed = parseEnvRef(value)
                if let error = parsed.error { throw MoonMoonfileParseError(error, line: lineNo) }
                if let env = parsed.env { ds.apiKeyEnv = env }
                else if let literal = parsed.literal { ds.apiKey = literal }
            case "base_url":
                let parsed = parseEnvRef(value)
                if let env = parsed.env { ds.baseUrlEnv = env }
                else { ds.baseUrl = value }
            case "api_format":
                if value == "openai" || value == "anthropic" { ds.apiFormat = value }
            case "use_beta":
                ds.useBeta = value == "true"
            default:
                break
            }
            result.providers.deepseek = ds
            return
        }

        if section == "prompts", nested == "storm" {
            var storm = result.prompts.storm ?? MoonfileStormPrompts()
            if key == "default_rounds" { storm.defaultRounds = Int(value) }
            if key == "max_panel_size" { storm.maxPanelSize = Int(value) }
            result.prompts.storm = storm
            return
        }

        guard section == "runtime" else { return }

        switch nested {
        case "worker_pool":
            var pool = result.runtime.workerPool ?? MoonfileWorkerPool()
            if key == "flash_concurrency" { pool.flashConcurrency = Int(value) }
            if key == "pro_concurrency" { pool.proConcurrency = Int(value) }
            result.runtime.workerPool = pool
        case "memory":
            var memory = result.runtime.memory ?? MoonfileMemory()
            if key == "long_term_backend" { memory.longTermBackend = value }
            result.runtime.memory = memory
        case "retries":
            var retries = result.runtime.retries ?? MoonfileRetries()
            if key == "max_repair_attempts" { retries.maxRepairAttempts = Int(value) }
            result.runtime.retries = retries
        default:
            break
        }
    }

    private struct EnvRefParse {
        var env: String?
        var literal: String?
        var error: String?
    }

    private func parseEnvRef(_ value: String) -> EnvRefParse {
        if let match = value.firstMatch(of: /^env\("([^"]+)"\)$/) {
            return EnvRefParse(env: String(match.1))
        }
        if value.hasPrefix("sk-") {
            return EnvRefParse(error: #"Literal API keys are not allowed; use env("VAR")"#)
        }
        return EnvRefParse(literal: stripQuotes(value))
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
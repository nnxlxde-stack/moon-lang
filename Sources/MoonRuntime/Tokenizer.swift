import Foundation

private enum TokenizerMode: Sendable {
    case unset
    case script
    case estimate
}

private final class TokenizerState: @unchecked Sendable {
    private let lock = NSLock()
    var configuredPath: String?
    var mode: TokenizerMode = .unset

    func configure(path: String?) {
        lock.withLock {
            configuredPath = path
            mode = .unset
        }
    }

    func resolveMode(scriptPath: String) -> TokenizerMode {
        lock.withLock {
            if mode != .unset { return mode }
            let env = ProcessInfo.processInfo.environment
            let explicit = configuredPath != nil || env["MOON_TOKENIZER_PATH"] != nil || env["MOON_USE_TOKENIZER"] == "1"
            if explicit, FileManager.default.fileExists(atPath: scriptPath),
               countTokensViaScriptOnce(text: "ping", tokenizerDir: dirname(scriptPath)) != nil {
                mode = .script
            } else {
                mode = .estimate
            }
            return mode
        }
    }

    func forceEstimate() {
        lock.withLock { mode = .estimate }
    }

    func configuredTokenizerPath() -> String? {
        lock.withLock { configuredPath }
    }
}

private let tokenizerState = TokenizerState()

public func configureTokenizer(path: String?) {
    tokenizerState.configure(path: path)
}

public func defaultTokenizerPath() -> String {
    let env = ProcessInfo.processInfo.environment
    if let path = env["MOON_TOKENIZER_PATH"], !path.isEmpty {
        return path
    }
    var dir = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
    for _ in 0..<8 {
        let candidate = dir.appendingPathComponent("deepseek-tokenizer")
        if FileManager.default.fileExists(atPath: candidate.appendingPathComponent("tokenizer.json").path) {
            return candidate.path
        }
        let parent = dir.deletingLastPathComponent()
        if parent.path == dir.path { break }
        dir = parent
    }
    return URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
        .appendingPathComponent("deepseek-tokenizer")
        .path
}

public func estimateTokensFromText(_ text: String, model: String, pricing: PricingTable) -> Int {
    let rates = pricing[model]?.token
        ?? pricing["deepseek-v4-pro"]?.token
        ?? ModelPricing.TokenRates(english_character: 0.3, chinese_character: 0.6)

    var tokens = 0.0
    for char in text {
        if ("\u{4E00}"..."\u{9FFF}").contains(char) {
            tokens += rates.chinese_character
        } else {
            tokens += rates.english_character
        }
    }
    return Int(ceil(tokens))
}

public func countTokens(_ text: String, model: String, pricing: PricingTable) -> Int {
    let dir = tokenizerState.configuredTokenizerPath() ?? defaultTokenizerPath()
    let scriptPath = URL(fileURLWithPath: dir).appendingPathComponent("count_tokens.py").path
    let mode = tokenizerState.resolveMode(scriptPath: scriptPath)
    if mode == .script, let count = countTokensViaScriptOnce(text: text, tokenizerDir: dir) {
        return count
    }
    return estimateTokensFromText(text, model: model, pricing: pricing)
}

private func countTokensViaScriptOnce(text: String, tokenizerDir: String) -> Int? {
    let scriptPath = URL(fileURLWithPath: tokenizerDir)
        .appendingPathComponent("count_tokens.py")
        .path
    guard FileManager.default.fileExists(atPath: scriptPath) else { return nil }

    for python in pythonCandidates() {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: python)
        process.arguments = [scriptPath, tokenizerDir]

        let input = Pipe()
        let output = Pipe()
        process.standardInput = input
        process.standardOutput = output
        process.standardError = Pipe()

        do {
            try process.run()
            input.fileHandleForWriting.write(Data(text.utf8))
            try input.fileHandleForWriting.close()
            process.waitUntilExit()
            guard process.terminationStatus == 0 else { continue }
            let data = output.fileHandleForReading.readDataToEndOfFile()
            guard let value = String(data: data, encoding: .utf8)?
                .trimmingCharacters(in: .whitespacesAndNewlines),
                  let count = Int(value) else {
                continue
            }
            return count
        } catch {
            continue
        }
    }
    tokenizerState.forceEstimate()
    return nil
}

private func pythonCandidates() -> [String] {
    var candidates = [ProcessInfo.processInfo.environment["MOON_PYTHON"]]
        .compactMap { $0 }.filter { !$0.isEmpty }
    #if os(Windows)
    candidates.append(contentsOf: ["python", "python3", "py"])
    #else
    candidates.append(contentsOf: ["/usr/bin/python3", "/usr/local/bin/python3", "python3", "python"])
    #endif
    return candidates
}

private func dirname(_ path: String) -> String {
    URL(fileURLWithPath: path).deletingLastPathComponent().path
}

private extension NSLock {
    func withLock<T>(_ body: () -> T) -> T {
        lock()
        defer { unlock() }
        return body()
    }
}
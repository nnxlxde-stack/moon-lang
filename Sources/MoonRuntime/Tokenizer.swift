import Foundation

private enum TokenizerMode: Sendable {
    case unset
    case native
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

    func resolveMode(tokenizerDir: String) -> TokenizerMode {
        lock.withLock {
            if mode != .unset { return mode }
            let env = ProcessInfo.processInfo.environment
            let explicit = configuredPath != nil || env["MOON_TOKENIZER_PATH"] != nil || env["MOON_USE_TOKENIZER"] == "1"
            let jsonPath = URL(fileURLWithPath: tokenizerDir).appendingPathComponent("tokenizer.json").path
            if explicit || FileManager.default.fileExists(atPath: jsonPath),
               loadDeepSeekTokenizer(path: tokenizerDir) != nil {
                mode = .native
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
    let mode = tokenizerState.resolveMode(tokenizerDir: dir)
    if mode == .native, let tokenizer = loadDeepSeekTokenizer(path: dir) {
        let count = tokenizer.countTokens(text)
        if count > 0 { return count }
    }
    return estimateTokensFromText(text, model: model, pricing: pricing)
}

private extension NSLock {
    func withLock<T>(_ body: () -> T) -> T {
        lock()
        defer { unlock() }
        return body()
    }
}
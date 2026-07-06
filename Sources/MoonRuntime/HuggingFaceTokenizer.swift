import Foundation

final class HuggingFaceBPETokenizer: @unchecked Sendable {
    private let vocab: [String: Int]
    private let mergeRanks: [String: Int]
    private let byteEncoder: [UInt8: String]

    private init(vocab: [String: Int], mergeRanks: [String: Int], byteEncoder: [UInt8: String]) {
        self.vocab = vocab
        self.mergeRanks = mergeRanks
        self.byteEncoder = byteEncoder
    }

    static func load(from tokenizerJSONPath: String) -> HuggingFaceBPETokenizer? {
        guard let data = FileManager.default.contents(atPath: tokenizerJSONPath),
              let root = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let model = root["model"] as? [String: Any],
              (model["type"] as? String) == "BPE",
              let rawVocab = model["vocab"] as? [String: Any],
              let merges = model["merges"] as? [String] else {
            return nil
        }

        var vocab: [String: Int] = [:]
        vocab.reserveCapacity(rawVocab.count)
        for (token, value) in rawVocab {
            if let intValue = value as? Int {
                vocab[token] = intValue
            } else if let number = value as? NSNumber {
                vocab[token] = number.intValue
            }
        }
        guard !vocab.isEmpty else { return nil }

        var ranks: [String: Int] = [:]
        ranks.reserveCapacity(merges.count)
        for (index, merge) in merges.enumerated() {
            ranks[merge] = index
        }

        return HuggingFaceBPETokenizer(
            vocab: vocab,
            mergeRanks: ranks,
            byteEncoder: byteToUnicode()
        )
    }

    func countTokens(_ text: String) -> Int {
        encode(text).count
    }

    func encode(_ text: String) -> [Int] {
        var ids: [Int] = []
        ids.reserveCapacity(text.count / 2)
        for piece in pretokenize(text) {
            ids.append(contentsOf: encodePiece(piece))
        }
        return ids
    }

    private func pretokenize(_ text: String) -> [String] {
        let pattern = #"[^\r\n\p{L}\p{P}\p{S}]?[\p{L}\p{M}]+| ?[\p{P}\p{S}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+"#
        guard let regex = try? NSRegularExpression(pattern: pattern, options: []) else {
            return text.split(whereSeparator: { $0.isWhitespace }).map(String.init)
        }
        let range = NSRange(text.startIndex..<text.endIndex, in: text)
        let matches = regex.matches(in: text, options: [], range: range)
        if matches.isEmpty { return [byteEncode(text)] }
        return matches.compactMap { match in
            guard let swiftRange = Range(match.range, in: text) else { return nil }
            return byteEncode(String(text[swiftRange]))
        }
    }

    private func byteEncode(_ text: String) -> String {
        var out = ""
        out.reserveCapacity(text.utf8.count)
        for byte in text.utf8 {
            out.append(contentsOf: byteEncoder[byte] ?? String(UnicodeScalar(byte)))
        }
        return out
    }

    private func encodePiece(_ piece: String) -> [Int] {
        guard !piece.isEmpty else { return [] }
        var tokens = piece.map { String($0) }
        while tokens.count > 1 {
            var bestRank = Int.max
            var bestIndex = -1
            for index in 0..<(tokens.count - 1) {
                let pair = "\(tokens[index]) \(tokens[index + 1])"
                guard let rank = mergeRanks[pair], rank < bestRank else { continue }
                bestRank = rank
                bestIndex = index
            }
            if bestIndex < 0 { break }
            tokens[bestIndex] = tokens[bestIndex] + tokens[bestIndex + 1]
            tokens.remove(at: bestIndex + 1)
        }
        return tokens.compactMap { vocab[$0] }
    }
}

private func byteToUnicode() -> [UInt8: String] {
    var bs: [UInt8] = []
    for value in UInt8(ascii: "!")...UInt8(ascii: "~") { bs.append(value) }
    for value in 0xA1...0xAC { bs.append(UInt8(value)) }
    for value in 0xAE...0xFF { bs.append(UInt8(value)) }

    var cs = bs.map { String(UnicodeScalar($0)) }
    var next = 0
    for value in 0..<256 where !bs.contains(UInt8(value)) {
        bs.append(UInt8(value))
        cs.append(String(UnicodeScalar(256 + next)!))
        next += 1
    }
    return Dictionary(uniqueKeysWithValues: zip(bs, cs))
}

private final class TokenizerCache: @unchecked Sendable {
    private let lock = NSLock()
    private var cached: HuggingFaceBPETokenizer?
    private var loadedPath: String?
    private var loadFailed = false

    func tokenizer(for path: String) -> HuggingFaceBPETokenizer? {
        lock.lock()
        defer { lock.unlock() }
        if loadFailed { return nil }
        if let cached, loadedPath == path { return cached }
        guard let tokenizer = HuggingFaceBPETokenizer.load(from: path) else {
            loadFailed = true
            return nil
        }
        cached = tokenizer
        loadedPath = path
        return tokenizer
    }

    func reset() {
        lock.lock()
        defer { lock.unlock() }
        cached = nil
        loadedPath = nil
        loadFailed = false
    }
}

private let tokenizerCache = TokenizerCache()

func loadDeepSeekTokenizer(path: String? = nil) -> HuggingFaceBPETokenizer? {
    let jsonPath = URL(fileURLWithPath: path ?? defaultTokenizerPath())
        .appendingPathComponent("tokenizer.json")
        .path
    guard FileManager.default.fileExists(atPath: jsonPath) else { return nil }
    return tokenizerCache.tokenizer(for: jsonPath)
}

#if DEBUG
func resetTokenizerCacheForTests() {
    tokenizerCache.reset()
}
#endif
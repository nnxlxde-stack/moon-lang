import Foundation

public struct ModelPricing: Codable, Sendable, Equatable {
    public struct TokenRates: Codable, Sendable, Equatable {
        public var english_character: Double
        public var chinese_character: Double
    }

    public struct PriceByMillion: Codable, Sendable, Equatable {
        public var cache_hit: Double
        public var cache_miss: Double
        public var output: Double

        enum CodingKeys: String, CodingKey {
            case cache_hit = "cache-hit"
            case cache_miss = "cache-miss"
            case output
        }
    }

    public var token: TokenRates
    public var priceByMillion: PriceByMillion
    public var concurrencyLimit: Int

    enum CodingKeys: String, CodingKey {
        case token
        case priceByMillion = "price-by-million-tokens-in-dollars"
        case concurrencyLimit = "concurency-limit"
    }
}

public typealias PricingTable = [String: ModelPricing]

public struct TokenUsage: Sendable, Equatable {
    public var prompt: Int
    public var completion: Int
    public var cacheHit: Int
    public var cacheMiss: Int

    public init(prompt: Int = 0, completion: Int = 0, cacheHit: Int = 0, cacheMiss: Int = 0) {
        self.prompt = prompt
        self.completion = completion
        self.cacheHit = cacheHit
        self.cacheMiss = cacheMiss
    }
}

private let defaultPricing: PricingTable = [
    "deepseek-v4-flash": ModelPricing(
        token: .init(english_character: 0.3, chinese_character: 0.6),
        priceByMillion: .init(cache_hit: 0.0028, cache_miss: 0.14, output: 0.28),
        concurrencyLimit: 2500
    ),
    "deepseek-v4-pro": ModelPricing(
        token: .init(english_character: 0.3, chinese_character: 0.6),
        priceByMillion: .init(cache_hit: 0.003625, cache_miss: 0.435, output: 0.87),
        concurrencyLimit: 500
    ),
]

public func loadPricingTable(path: String? = nil) -> PricingTable {
    let resolved = path ?? defaultPricingPath()
    guard let data = try? Data(contentsOf: URL(fileURLWithPath: resolved)),
          let table = try? JSONDecoder().decode(PricingTable.self, from: data) else {
        return defaultPricing
    }
    return table
}

public func estimateCostUsd(_ model: String, _ usage: TokenUsage, _ pricing: PricingTable) -> Double {
    guard let rates = pricing[model]?.priceByMillion else { return 0 }
    let cacheHit = Double(usage.cacheHit)
    let cacheMiss = usage.cacheMiss > 0
        ? Double(usage.cacheMiss)
        : Double(max(0, usage.prompt - usage.cacheHit))
    let output = Double(usage.completion)
    return (cacheHit / 1_000_000) * rates.cache_hit
        + (cacheMiss / 1_000_000) * rates.cache_miss
        + (output / 1_000_000) * rates.output
}

public func concurrencyForModel(_ model: String, _ pricing: PricingTable, configured: Int) -> Int {
    let limit = pricing[model]?.concurrencyLimit ?? configured
    return min(configured, limit)
}

private func defaultPricingPath() -> String {
    let cwd = FileManager.default.currentDirectoryPath
    let candidate = (cwd as NSString).appendingPathComponent("docs/model-pricing.json")
    if FileManager.default.fileExists(atPath: candidate) {
        return candidate
    }
    return candidate
}
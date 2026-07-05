import Foundation
import MoonMoonfile

public struct RuntimeConfig: Sendable {
    public var useMock: Bool
    public var apiKey: String?
    public var baseUrl: String?
    public var apiFormat: DeepSeekApiFormat?
    public var useBeta: Bool
    public var maxRepairAttempts: Int
    public var longTermMemoryPath: String?
    public var flashConcurrency: Int
    public var proConcurrency: Int
    public var pricing: PricingTable
    public var pricingPath: String?
    public var tokenizerPath: String?
    public var systemSuffix: String?
    public var traceByDefault: Bool

    public init(
        useMock: Bool,
        apiKey: String? = nil,
        baseUrl: String? = nil,
        apiFormat: DeepSeekApiFormat? = nil,
        useBeta: Bool = false,
        maxRepairAttempts: Int = 1,
        longTermMemoryPath: String? = nil,
        flashConcurrency: Int = 20,
        proConcurrency: Int = 5,
        pricing: PricingTable,
        pricingPath: String? = nil,
        tokenizerPath: String? = nil,
        systemSuffix: String? = nil,
        traceByDefault: Bool = false
    ) {
        self.useMock = useMock
        self.apiKey = apiKey
        self.baseUrl = baseUrl
        self.apiFormat = apiFormat
        self.useBeta = useBeta
        self.maxRepairAttempts = maxRepairAttempts
        self.longTermMemoryPath = longTermMemoryPath
        self.flashConcurrency = flashConcurrency
        self.proConcurrency = proConcurrency
        self.pricing = pricing
        self.pricingPath = pricingPath
        self.tokenizerPath = tokenizerPath
        self.systemSuffix = systemSuffix
        self.traceByDefault = traceByDefault
    }
}

public struct RuntimeConfigOverrides: Sendable {
    public var mock: Bool?
    public var apiKey: String?
    public var baseUrl: String?
    public var apiFormat: DeepSeekApiFormat?
    public var useBeta: Bool?
    public var maxRepairAttempts: Int?
    public var memoryPath: String?
    public var pricingPath: String?
    public var tokenizerPath: String?
    public var flashConcurrency: Int?
    public var proConcurrency: Int?
    public var systemSuffix: String?
    public var traceByDefault: Bool?

    public init(
        mock: Bool? = nil,
        apiKey: String? = nil,
        baseUrl: String? = nil,
        apiFormat: DeepSeekApiFormat? = nil,
        useBeta: Bool? = nil,
        maxRepairAttempts: Int? = nil,
        memoryPath: String? = nil,
        pricingPath: String? = nil,
        tokenizerPath: String? = nil,
        flashConcurrency: Int? = nil,
        proConcurrency: Int? = nil,
        systemSuffix: String? = nil,
        traceByDefault: Bool? = nil
    ) {
        self.mock = mock
        self.apiKey = apiKey
        self.baseUrl = baseUrl
        self.apiFormat = apiFormat
        self.useBeta = useBeta
        self.maxRepairAttempts = maxRepairAttempts
        self.memoryPath = memoryPath
        self.pricingPath = pricingPath
        self.tokenizerPath = tokenizerPath
        self.flashConcurrency = flashConcurrency
        self.proConcurrency = proConcurrency
        self.systemSuffix = systemSuffix
        self.traceByDefault = traceByDefault
    }
}

public func runtimeOverrides(from moonfile: MoonfileRuntimeOverrides) -> RuntimeConfigOverrides {
    let apiFormat: DeepSeekApiFormat? = moonfile.apiFormat == "openai" ? .openai
        : moonfile.apiFormat == "anthropic" ? .anthropic
        : nil
    return RuntimeConfigOverrides(
        apiKey: moonfile.apiKey,
        baseUrl: moonfile.baseUrl,
        apiFormat: apiFormat,
        useBeta: moonfile.useBeta,
        maxRepairAttempts: moonfile.maxRepairAttempts,
        memoryPath: moonfile.memoryPath,
        pricingPath: moonfile.pricingPath,
        tokenizerPath: moonfile.tokenizerPath,
        flashConcurrency: moonfile.flashConcurrency,
        proConcurrency: moonfile.proConcurrency,
        systemSuffix: moonfile.systemSuffix,
        traceByDefault: moonfile.traceByDefault
    )
}

public func mergeRuntimeOverrides(_ base: RuntimeConfigOverrides, _ extra: RuntimeConfigOverrides) -> RuntimeConfigOverrides {
    RuntimeConfigOverrides(
        mock: extra.mock ?? base.mock,
        apiKey: extra.apiKey ?? base.apiKey,
        baseUrl: extra.baseUrl ?? base.baseUrl,
        apiFormat: extra.apiFormat ?? base.apiFormat,
        useBeta: extra.useBeta ?? base.useBeta,
        maxRepairAttempts: extra.maxRepairAttempts ?? base.maxRepairAttempts,
        memoryPath: extra.memoryPath ?? base.memoryPath,
        pricingPath: extra.pricingPath ?? base.pricingPath,
        tokenizerPath: extra.tokenizerPath ?? base.tokenizerPath,
        flashConcurrency: extra.flashConcurrency ?? base.flashConcurrency,
        proConcurrency: extra.proConcurrency ?? base.proConcurrency,
        systemSuffix: extra.systemSuffix ?? base.systemSuffix,
        traceByDefault: extra.traceByDefault ?? base.traceByDefault
    )
}

public func loadRuntimeConfig(overrides: RuntimeConfigOverrides = RuntimeConfigOverrides()) -> RuntimeConfig {
    let env = ProcessInfo.processInfo.environment
    let apiKey = overrides.apiKey ?? env["DEEPSEEK_API_KEY"]
    let forceMock = overrides.mock == true
    let useMock = forceMock || apiKey == nil

    let memoryUri = overrides.memoryPath
        ?? env["MOON_MEMORY_PATH"]
        ?? "file://.moon/memory"

    let pricingPath = overrides.pricingPath ?? env["MOON_PRICING_PATH"]
    let tokenizerPath = overrides.tokenizerPath ?? env["MOON_TOKENIZER_PATH"]
    let pricing = loadPricingTable(path: pricingPath)

    let flashRequested = overrides.flashConcurrency
        ?? Int(env["MOON_FLASH_CONCURRENCY"] ?? "")
        ?? 20
    let proRequested = overrides.proConcurrency
        ?? Int(env["MOON_PRO_CONCURRENCY"] ?? "")
        ?? 5

    let apiFormat = overrides.apiFormat
        ?? (env["DEEPSEEK_API_FORMAT"] == "openai" ? DeepSeekApiFormat.openai
            : env["DEEPSEEK_API_FORMAT"] == "anthropic" ? DeepSeekApiFormat.anthropic
            : nil)

    let useBeta = overrides.useBeta
        ?? (env["DEEPSEEK_USE_BETA"] == "true" || env["DEEPSEEK_USE_BETA"] == "1")

    return RuntimeConfig(
        useMock: useMock,
        apiKey: apiKey,
        baseUrl: overrides.baseUrl ?? env["DEEPSEEK_BASE_URL"],
        apiFormat: apiFormat,
        useBeta: useBeta,
        maxRepairAttempts: overrides.maxRepairAttempts
            ?? Int(env["MOON_MAX_REPAIR_ATTEMPTS"] ?? "")
            ?? 1,
        longTermMemoryPath: parseMemoryBackendUri(memoryUri),
        flashConcurrency: concurrencyForModel("deepseek-v4-flash", pricing, configured: flashRequested),
        proConcurrency: concurrencyForModel("deepseek-v4-pro", pricing, configured: proRequested),
        pricing: pricing,
        pricingPath: pricingPath,
        tokenizerPath: tokenizerPath,
        systemSuffix: overrides.systemSuffix,
        traceByDefault: overrides.traceByDefault ?? false
    )
}

public func createLlmClient(config: RuntimeConfig, metrics: MetricsCollector? = nil) -> LlmClient {
    if config.useMock {
        return MockLlmClient()
    }
    return DeepSeekClient(config: DeepSeekClientConfig(
        apiKey: config.apiKey ?? "",
        baseUrl: config.baseUrl,
        apiFormat: config.apiFormat,
        useBeta: config.useBeta,
        maxRepairAttempts: config.maxRepairAttempts,
        metrics: metrics,
        pricing: config.pricing
    ))
}
import Foundation

public struct MoonfileModels: Sendable, Equatable {
    public var defaultFlash: String?
    public var defaultPro: String?

    public init(defaultFlash: String? = nil, defaultPro: String? = nil) {
        self.defaultFlash = defaultFlash
        self.defaultPro = defaultPro
    }
}

public struct MoonfileWorkerPool: Sendable, Equatable {
    public var flashConcurrency: Int?
    public var proConcurrency: Int?
}

public struct MoonfileMemory: Sendable, Equatable {
    public var longTermBackend: String?
}

public struct MoonfileRetries: Sendable, Equatable {
    public var maxRepairAttempts: Int?
}

public struct MoonfileRuntime: Sendable, Equatable {
    public var workerPool: MoonfileWorkerPool?
    public var memory: MoonfileMemory?
    public var retries: MoonfileRetries?

    public init(
        workerPool: MoonfileWorkerPool? = nil,
        memory: MoonfileMemory? = nil,
        retries: MoonfileRetries? = nil
    ) {
        self.workerPool = workerPool
        self.memory = memory
        self.retries = retries
    }
}

public struct MoonfileDeepSeekProvider: Sendable, Equatable {
    public var apiKey: String?
    public var apiKeyEnv: String?
    public var baseUrl: String?
    public var baseUrlEnv: String?
    public var apiFormat: String?
    public var useBeta: Bool?
}

public struct MoonfileProviders: Sendable, Equatable {
    public var deepseek: MoonfileDeepSeekProvider?

    public init(deepseek: MoonfileDeepSeekProvider? = nil) {
        self.deepseek = deepseek
    }
}

public struct MoonfilePaths: Sendable, Equatable {
    public var pricing: String?
    public var tokenizer: String?

    public init(pricing: String? = nil, tokenizer: String? = nil) {
        self.pricing = pricing
        self.tokenizer = tokenizer
    }
}

public struct MoonfileStormPrompts: Sendable, Equatable {
    public var defaultRounds: Int?
    public var maxPanelSize: Int?
}

public struct MoonfilePrompts: Sendable, Equatable {
    public var defaultSystemSuffix: String?
    public var traceByDefault: Bool?
    public var storm: MoonfileStormPrompts?

    public init(
        defaultSystemSuffix: String? = nil,
        traceByDefault: Bool? = nil,
        storm: MoonfileStormPrompts? = nil
    ) {
        self.defaultSystemSuffix = defaultSystemSuffix
        self.traceByDefault = traceByDefault
        self.storm = storm
    }
}

public struct MoonfileRuntimeOverrides: Sendable, Equatable {
    public var memoryPath: String?
    public var maxRepairAttempts: Int?
    public var flashConcurrency: Int?
    public var proConcurrency: Int?
    public var apiKey: String?
    public var baseUrl: String?
    public var apiFormat: String?
    public var useBeta: Bool?
    public var pricingPath: String?
    public var tokenizerPath: String?
    public var defaultFlash: String?
    public var defaultPro: String?
    public var systemSuffix: String?
    public var traceByDefault: Bool?
}

public struct ResolvedMoonfileTarget: Sendable, Equatable {
    public var name: String
    public var path: String

    public init(name: String, path: String) {
        self.name = name
        self.path = path
    }
}

public func moonfileToRuntimeOverrides(_ moonfile: MoonfileDocument) -> MoonfileRuntimeOverrides {
    let ds = moonfile.providers.deepseek
    let env = ProcessInfo.processInfo.environment
    let apiKey = ds?.apiKeyEnv.flatMap { env[$0] } ?? ds?.apiKey
    let baseUrl = ds?.baseUrlEnv.flatMap { env[$0] } ?? ds?.baseUrl

    return MoonfileRuntimeOverrides(
        memoryPath: moonfile.runtime.memory?.longTermBackend,
        maxRepairAttempts: moonfile.runtime.retries?.maxRepairAttempts,
        flashConcurrency: moonfile.runtime.workerPool?.flashConcurrency,
        proConcurrency: moonfile.runtime.workerPool?.proConcurrency,
        apiKey: apiKey,
        baseUrl: baseUrl,
        apiFormat: ds?.apiFormat,
        useBeta: ds?.useBeta,
        pricingPath: moonfile.paths.pricing,
        tokenizerPath: moonfile.paths.tokenizer,
        defaultFlash: moonfile.models.defaultFlash,
        defaultPro: moonfile.models.defaultPro,
        systemSuffix: moonfile.prompts.defaultSystemSuffix,
        traceByDefault: moonfile.prompts.traceByDefault
    )
}

public func resolveMoonfileTarget(
    _ moonfile: MoonfileDocument,
    projectRoot: String,
    target: String? = nil
) throws -> ResolvedMoonfileTarget {
    let sortedNames = moonfile.targets.keys.sorted()
    guard let name = target ?? sortedNames.first else {
        throw MoonMoonfileParseError("Moonfile has no targets", line: 1)
    }
    guard let rel = moonfile.targets[name] else {
        throw MoonMoonfileParseError("Target not found in Moonfile: \(target ?? name)", line: 1)
    }
    let path = URL(fileURLWithPath: projectRoot).appendingPathComponent(rel).standardizedFileURL.path
    return ResolvedMoonfileTarget(name: name, path: path)
}

public func findProjectRoot(startDir: String) -> String? {
    guard let moonfile = findMoonfile(startDir: startDir) else { return nil }
    return URL(fileURLWithPath: moonfile).deletingLastPathComponent().path
}
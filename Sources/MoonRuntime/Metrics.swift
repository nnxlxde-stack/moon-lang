import Foundation

public struct ModelMetrics: Sendable, Equatable {
    public var calls: Int
    public var attempts: Int
    public var tokens: TokenUsage
    public var costUsd: Double
}

public struct MemoryMetrics: Sendable, Equatable {
    public var recallHits: Int
    public var recallMisses: Int

    public init(recallHits: Int = 0, recallMisses: Int = 0) {
        self.recallHits = recallHits
        self.recallMisses = recallMisses
    }
}

public struct WorkerTierMetrics: Sendable, Equatable {
    public var executed: Int
    public var peakConcurrent: Int

    public init(executed: Int = 0, peakConcurrent: Int = 0) {
        self.executed = executed
        self.peakConcurrent = peakConcurrent
    }
}

public struct WorkerMetrics: Sendable, Equatable {
    public var flash: WorkerTierMetrics
    public var pro: WorkerTierMetrics

    public init(
        flash: WorkerTierMetrics = .init(executed: 0, peakConcurrent: 0),
        pro: WorkerTierMetrics = .init(executed: 0, peakConcurrent: 0)
    ) {
        self.flash = flash
        self.pro = pro
    }
}

public final class MetricsCollector: @unchecked Sendable {
    private let pricing: PricingTable
    private let lock = NSLock()
    private var totals = TokenUsage()
    private var byModel: [String: ModelMetrics] = [:]
    private var llmCalls = 0
    private var costUsd = 0.0
    public private(set) var memory = MemoryMetrics()
    public private(set) var worker = WorkerMetrics()

    public init(pricing: PricingTable) {
        self.pricing = pricing
    }

    public func recordLlmUsage(model: String, usage: TokenUsage, attempts: Int = 1) {
        lock.withLock {
            llmCalls += 1
            totals.prompt += usage.prompt
            totals.completion += usage.completion
            totals.cacheHit += usage.cacheHit
            totals.cacheMiss += usage.cacheMiss

            let cost = estimateCostUsd(model, usage, pricing)
            costUsd += cost

            var existing = byModel[model] ?? ModelMetrics(
                calls: 0,
                attempts: 0,
                tokens: TokenUsage(),
                costUsd: 0
            )
            existing.calls += 1
            existing.attempts += attempts
            existing.tokens.prompt += usage.prompt
            existing.tokens.completion += usage.completion
            existing.tokens.cacheHit += usage.cacheHit
            existing.tokens.cacheMiss += usage.cacheMiss
            existing.costUsd += cost
            byModel[model] = existing
        }
    }

    public func recordRecall(hit: Bool) {
        lock.withLock {
            if hit { memory.recallHits += 1 }
            else { memory.recallMisses += 1 }
        }
    }

    public func recordWorkerStart(tier: ModelTier, concurrent: Int) {
        lock.withLock {
            switch tier {
            case .flash:
                worker.flash.executed += 1
                worker.flash.peakConcurrent = max(worker.flash.peakConcurrent, concurrent)
            case .pro:
                worker.pro.executed += 1
                worker.pro.peakConcurrent = max(worker.pro.peakConcurrent, concurrent)
            }
        }
    }

    public func snapshot() -> RunMetrics {
        lock.withLock {
            RunMetrics(
                llmCalls: llmCalls,
                tokens: totals,
                costUsd: costUsd,
                memory: memory,
                worker: worker,
                byModel: byModel
            )
        }
    }
}

public func formatMetrics(_ metrics: RunMetrics) -> String {
    var lines: [String] = []
    lines.append("LLM calls: \(metrics.llmCalls)")
    lines.append(String(format: "Cost: $%.4f", metrics.costUsd))
    lines.append("Tokens: prompt=\(metrics.tokens.prompt) completion=\(metrics.tokens.completion)")
    lines.append("Memory recall: hits=\(metrics.memory.recallHits) misses=\(metrics.memory.recallMisses)")
    lines.append("Worker flash: peak=\(metrics.worker.flash.peakConcurrent) executed=\(metrics.worker.flash.executed)")
    lines.append("Worker pro: peak=\(metrics.worker.pro.peakConcurrent) executed=\(metrics.worker.pro.executed)")
    for (model, stats) in metrics.byModel.sorted(by: { $0.key < $1.key }) {
        lines.append("  \(model): calls=\(stats.calls) cost=$\(String(format: "%.4f", stats.costUsd))")
    }
    return lines.joined(separator: "\n")
}

private extension NSLock {
    func withLock<T>(_ body: () -> T) -> T {
        lock()
        defer { unlock() }
        return body()
    }
}
import Foundation

public enum ModelTier: String, Sendable {
    case flash
    case pro
}

public struct WorkerPoolConfig: Sendable {
    public var flashConcurrency: Int
    public var proConcurrency: Int
    public var onAcquire: (@Sendable (ModelTier, Int) -> Void)?

    public init(
        flashConcurrency: Int = 20,
        proConcurrency: Int = 5,
        onAcquire: (@Sendable (ModelTier, Int) -> Void)? = nil
    ) {
        self.flashConcurrency = flashConcurrency
        self.proConcurrency = proConcurrency
        self.onAcquire = onAcquire
    }
}

public final class WorkerPool: @unchecked Sendable {
    private let limits: WorkerPoolConfig
    private var active: [ModelTier: Int] = [.flash: 0, .pro: 0]
    private var queues: [ModelTier: [CheckedContinuation<Void, Never>]] = [.flash: [], .pro: []]
    private let lock = NSLock()

    public init(config: WorkerPoolConfig = WorkerPoolConfig()) {
        self.limits = config
    }

    public func run<T: Sendable>(_ tier: ModelTier, _ fn: @Sendable () async throws -> T) async rethrows -> T {
        await acquire(tier)
        defer { release(tier) }
        return try await fn()
    }

    public func runAll<T: Sendable>(_ tier: ModelTier, _ tasks: [@Sendable () async throws -> T]) async throws -> [T] {
        try await withThrowingTaskGroup(of: (Int, T).self) { group in
            for (index, task) in tasks.enumerated() {
                group.addTask {
                    let value = try await self.run(tier, task)
                    return (index, value)
                }
            }

            var results = Array<T?>(repeating: nil, count: tasks.count)
            for try await (index, value) in group {
                results[index] = value
            }
            return results.map { $0! }
        }
    }

    private func acquire(_ tier: ModelTier) async {
        let shouldWait: Bool = lock.withLock {
            let limit = tier == .flash ? limits.flashConcurrency : limits.proConcurrency
            let current = active[tier, default: 0]
            if current < limit {
                bumpLocked(tier)
                return false
            }
            return true
        }

        if shouldWait {
            await withCheckedContinuation { continuation in
                lock.withLock {
                    queues[tier, default: []].append(continuation)
                }
            }
        }
    }

    private func bumpLocked(_ tier: ModelTier) {
        let next = active[tier, default: 0] + 1
        active[tier] = next
        limits.onAcquire?(tier, next)
    }

    private func release(_ tier: ModelTier) {
        let waiter: CheckedContinuation<Void, Never>? = lock.withLock {
            let next = max(0, active[tier, default: 0] - 1)
            active[tier] = next
            if var queue = queues[tier], !queue.isEmpty {
                let nextWaiter = queue.removeFirst()
                queues[tier] = queue
                bumpLocked(tier)
                return nextWaiter
            }
            return nil
        }
        waiter?.resume()
    }
}

public func modelToTier(_ model: String) -> ModelTier {
    model.contains("flash") ? .flash : .pro
}

private extension NSLock {
    func withLock<T>(_ body: () throws -> T) rethrows -> T {
        lock()
        defer { unlock() }
        return try body()
    }
}
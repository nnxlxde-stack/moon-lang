import Foundation

public final class MemoryManager: @unchecked Sendable {
    private var stores: [String: [String: String]] = [:]
    private var runCache: [String: String] = [:]
    private let fileBackend: FileMemoryBackend?
    private let fileScopes: Set<String> = ["LongTerm"]
    private let metrics: MetricsCollector?
    private let lock = NSLock()

    public init(longTermPath: String? = nil, metrics: MetricsCollector? = nil) {
        if let longTermPath {
            self.fileBackend = FileMemoryBackend(rootDir: longTermPath)
        } else {
            self.fileBackend = nil
        }
        self.metrics = metrics
    }

    public func register(scope: String, name: String) {
        lock.withLock {
            var store = stores[scope, default: [:]]
            let defaultValue = "knowledge for \(name)"

            if let fileBackend, fileScopes.contains(scope) {
                if let existing = fileBackend.getSync(name) {
                    store[name] = existing
                } else {
                    store[name] = defaultValue
                    Task { try? await fileBackend.set(name, defaultValue) }
                }
            } else if store[name] == nil {
                store[name] = defaultValue
            }
            stores[scope] = store
        }
    }

    public func recall(_ key: String) async -> RuntimeValue {
        let cached: String? = lock.withLock { runCache[key] }
        if let cached {
            metrics?.recordRecall(hit: true)
            return .string(cached)
        }

        if let fileBackend {
            if let fromFile = await fileBackend.get(key) {
                metrics?.recordRecall(hit: false)
                lock.withLock { runCache[key] = fromFile }
                return .string(fromFile)
            }
        }

        let fromStore: String? = lock.withLock {
            for store in stores.values {
                if let value = store[key] {
                    return value
                }
            }
            return nil
        }

        if let fromStore {
            metrics?.recordRecall(hit: false)
            lock.withLock { runCache[key] = fromStore }
            return .string(fromStore)
        }

        metrics?.recordRecall(hit: false)
        let fallback = "recalled:\(key)"
        lock.withLock { runCache[key] = fallback }
        return .string(fallback)
    }

    public func clearRunCache() {
        lock.withLock { runCache.removeAll() }
    }
}

private extension NSLock {
    func withLock<T>(_ body: () -> T) -> T {
        lock()
        defer { unlock() }
        return body()
    }
}
import Foundation

public struct LlmTraceEntry: Codable, Sendable, Equatable {
    public var id: String
    public var timestamp: String
    public var agent: String
    public var model: String
    public var stormRound: Int?
    public var delegateChain: [String]?
    public var messages: [LlmChatMessage]
    public var schemaType: String?
    public var response: String?
    public var error: String?
    public var durationMs: Int
}

public struct LlmTraceSession: Sendable, Equatable {
    public var runId: String
    public var runDir: String
    public var entries: [LlmTraceEntry]
}

public final class LlmTraceWriter: @unchecked Sendable {
    public let runId: String
    public let runDir: String
    private var entries: [LlmTraceEntry] = []
    private var seq = 0
    private let lock = NSLock()

    public init(runId: String, runDir: String) {
        self.runId = runId
        self.runDir = runDir
    }

    public static func create(baseDir: String? = nil) async throws -> LlmTraceWriter {
        let root = baseDir ?? (FileManager.default.currentDirectoryPath as NSString)
            .appendingPathComponent(".moon/trace")
        let runId = ISO8601DateFormatter().string(from: Date())
            .replacingOccurrences(of: ":", with: "-")
            .replacingOccurrences(of: ".", with: "-")
        let runDir = (root as NSString).appendingPathComponent(runId)
        try FileManager.default.createDirectory(atPath: runDir, withIntermediateDirectories: true)
        return LlmTraceWriter(runId: runId, runDir: runDir)
    }

    public func record(
        agent: String,
        model: String,
        messages: [LlmChatMessage],
        schema: JsonSchema,
        response: RuntimeValue? = nil,
        error: String? = nil,
        stormRound: Int? = nil,
        delegateChain: [String]? = nil,
        durationMs: Int
    ) async throws {
        let entry: LlmTraceEntry = lock.withLock {
            seq += 1
            let id = String(format: "%03d", seq)
            let full = LlmTraceEntry(
                id: id,
                timestamp: ISO8601DateFormatter().string(from: Date()),
                agent: agent,
                model: model,
                stormRound: stormRound,
                delegateChain: delegateChain,
                messages: messages,
                schemaType: schema.typeName,
                response: response.map(runtimeValueDescription),
                error: error,
                durationMs: durationMs
            )
            entries.append(full)
            return full
        }

        let base = "\(entry.id)-\(entry.agent)"
        let jsonData = try JSONEncoder().encode(entry)
        try jsonData.write(to: URL(fileURLWithPath: (runDir as NSString).appendingPathComponent("\(base).json")))
        let messagesText = entry.messages.map { "=== \($0.role.uppercased()) ===\n\($0.content)\n" }.joined(separator: "\n")
        try messagesText.write(
            toFile: (runDir as NSString).appendingPathComponent("\(base)-messages.txt"),
            atomically: true,
            encoding: .utf8
        )

        let manifest: [String: Any] = [
            "runId": runId,
            "entries": entries.map { ["id": $0.id, "agent": $0.agent, "model": $0.model] },
        ]
        let manifestData = try JSONSerialization.data(withJSONObject: manifest, options: [.prettyPrinted])
        try manifestData.write(to: URL(fileURLWithPath: (runDir as NSString).appendingPathComponent("manifest.json")))
    }

    public func snapshot() -> LlmTraceSession {
        lock.withLock {
            LlmTraceSession(runId: runId, runDir: runDir, entries: entries)
        }
    }
}

public func showLastTrace(baseDir: String? = nil) throws -> String? {
    let root = baseDir ?? (FileManager.default.currentDirectoryPath as NSString)
        .appendingPathComponent(".moon/trace")
    guard FileManager.default.fileExists(atPath: root) else { return nil }
    let runs = try FileManager.default.contentsOfDirectory(atPath: root).sorted()
    guard let last = runs.last else { return nil }
    return try showTraceRun(last, baseDir: root)
}

public func showTraceRun(_ runId: String, baseDir: String? = nil) throws -> String? {
    let root = baseDir ?? (FileManager.default.currentDirectoryPath as NSString)
        .appendingPathComponent(".moon/trace")
    let runDir = (root as NSString).appendingPathComponent(runId)
    let manifestPath = (runDir as NSString).appendingPathComponent("manifest.json")
    guard FileManager.default.fileExists(atPath: manifestPath) else { return nil }
    let data = try Data(contentsOf: URL(fileURLWithPath: manifestPath))
    let manifest = try JSONSerialization.jsonObject(with: data) as? [String: Any]
    let entries = manifest?["entries"] as? [[String: Any]] ?? []
    var lines = ["Trace run: \(runId)", "Entries: \(entries.count)", ""]
    for entry in entries {
        let id = entry["id"] as? String ?? "?"
        let agent = entry["agent"] as? String ?? "?"
        let model = entry["model"] as? String ?? "?"
        lines.append("  \(id)  \(agent)  (\(model))")
    }
    return lines.joined(separator: "\n")
}

public func diffTraceRuns(_ runA: String, _ runB: String, baseDir: String? = nil) throws -> String? {
    let root = baseDir ?? (FileManager.default.currentDirectoryPath as NSString)
        .appendingPathComponent(".moon/trace")
    let manifestA = try Data(contentsOf: URL(fileURLWithPath: (root as NSString).appendingPathComponent("\(runA)/manifest.json")))
    let manifestB = try Data(contentsOf: URL(fileURLWithPath: (root as NSString).appendingPathComponent("\(runB)/manifest.json")))
    let a = try JSONSerialization.jsonObject(with: manifestA) as? [String: Any]
    let b = try JSONSerialization.jsonObject(with: manifestB) as? [String: Any]
    let entriesA = a?["entries"] as? [[String: Any]] ?? []
    let entriesB = b?["entries"] as? [[String: Any]] ?? []
    let agentsA = entriesA.compactMap { $0["agent"] as? String }
    let agentsB = entriesB.compactMap { $0["agent"] as? String }
    var lines = [
        "Trace diff",
        "  A: \(runA) (\(entriesA.count) entries)",
        "  B: \(runB) (\(entriesB.count) entries)",
        "",
    ]
    let onlyA = agentsA.filter { !agentsB.contains($0) }
    let onlyB = agentsB.filter { !agentsA.contains($0) }
    if !onlyA.isEmpty { lines.append("Only in A: \(onlyA.joined(separator: ", "))") }
    if !onlyB.isEmpty { lines.append("Only in B: \(onlyB.joined(separator: ", "))") }
    return lines.joined(separator: "\n")
}

private extension NSLock {
    func withLock<T>(_ body: () -> T) -> T {
        lock()
        defer { unlock() }
        return body()
    }
}
import Foundation
import MoonAST
import MoonParser

public final class SymbolDatabase: @unchecked Sendable {
    public static let filename = "moon-symbols.json"

    private let lock = NSLock()
    private var entries: [SymbolEntry] = []
    private var byName: [String: [SymbolEntry]] = [:]
    private var projectRoot = ""

    public var symbols: [SymbolEntry] {
        lock.withLock { entries }
    }

    public var root: String {
        lock.withLock { projectRoot }
    }

    public static func dbPath(projectRoot: String) -> String {
        URL(fileURLWithPath: projectRoot).appendingPathComponent(filename).path
    }

    public init() {}

    public func load(projectRoot: String) -> Bool {
        let root = URL(fileURLWithPath: projectRoot).standardizedFileURL.path
        let path = Self.dbPath(projectRoot: root)
        guard let data = try? Data(contentsOf: URL(fileURLWithPath: path)),
              let file = try? JSONDecoder().decode(MoonSymbolsFile.self, from: data),
              file.version == 1 else {
            return false
        }
        lock.withLock {
            self.projectRoot = root
            setEntries(file.symbols)
        }
        return true
    }

    public func save(projectRoot: String? = nil) {
        lock.withLock {
            if let projectRoot {
                self.projectRoot = URL(fileURLWithPath: projectRoot).standardizedFileURL.path
            }
            guard !self.projectRoot.isEmpty else { return }
            let payload = MoonSymbolsFile(
                version: 1,
                updatedAt: ISO8601DateFormatter().string(from: Date()),
                projectRoot: self.projectRoot,
                symbols: entries
            )
            if let data = try? JSONEncoder().encode(payload),
               let json = String(data: data, encoding: .utf8) {
                let path = Self.dbPath(projectRoot: self.projectRoot)
                try? (json + "\n").write(toFile: path, atomically: true, encoding: .utf8)
            }
        }
    }

    public func rebuild(projectRoot: String, openFiles: [String] = []) {
        let root = URL(fileURLWithPath: projectRoot).standardizedFileURL.path
        let indexed = buildSymbolIndex(projectRoot: root, extraFiles: openFiles)
        lock.withLock {
            self.projectRoot = root
            setEntries(indexed)
        }
        save()
    }

    public func refreshFile(_ filePath: String) {
        let abs = URL(fileURLWithPath: filePath).standardizedFileURL.path
        lock.withLock {
            entries.removeAll { $0.file == abs }
            reindexByNameLocked()
        }
        guard FileManager.default.fileExists(atPath: abs),
              let source = try? String(contentsOfFile: abs, encoding: .utf8),
              let program = try? MoonParser().parse(source) else {
            if !FileManager.default.fileExists(atPath: abs) {
                rebuild(projectRoot: projectRoot)
            } else {
                save()
            }
            return
        }
        let moduleName = URL(fileURLWithPath: abs).deletingPathExtension().lastPathComponent
        merge(indexProgram(program, source: source, filePath: abs, moduleName: moduleName))
        save()
    }

    public func merge(_ newEntries: [SymbolEntry]) {
        lock.withLock {
            var map = Dictionary(uniqueKeysWithValues: entries.map { (entryKey($0), $0) })
            for entry in newEntries {
                map[entryKey(entry)] = entry
            }
            setEntries(Array(map.values))
        }
    }

    public func lookup(name: String, module: String? = nil, file: String? = nil) -> SymbolEntry? {
        lock.withLock {
            guard let bucket = byName[name], !bucket.isEmpty else { return nil }
            if let file {
                let abs = URL(fileURLWithPath: file).standardizedFileURL.path
                if let match = bucket.first(where: { $0.file == abs }) { return match }
            }
            if let module, let match = bucket.first(where: { $0.module == module }) { return match }
            return bucket.first
        }
    }

    public func lookupScoped(program: Program, entryPath: String, name: String) -> SymbolEntry? {
        let table = buildSymbolTable(program, entryPath: entryPath, db: self)
        guard let info = table[name] else { return lookup(name: name) }
        if let fromDb = lookup(name: name, module: info.module, file: info.filePath) {
            return fromDb
        }
        return lookup(name: name, file: info.filePath) ?? lookup(name: name)
    }

    public func toLocation(_ entry: SymbolEntry) -> DefinitionTarget? {
        guard !entry.file.isEmpty else { return nil }
        return DefinitionTarget(
            uri: URL(fileURLWithPath: entry.file).absoluteURL.absoluteString,
            line: entry.range.start.line,
            character: entry.range.start.character,
            endLine: entry.range.end.line,
            endCharacter: entry.range.end.character
        )
    }

    private func entryKey(_ entry: SymbolEntry) -> String {
        "\(entry.module)::\(entry.name)::\(entry.file)"
    }

    private func setEntries(_ newEntries: [SymbolEntry]) {
        entries = newEntries
        byName = [:]
        for entry in newEntries {
            byName[entry.name, default: []].append(entry)
        }
    }

    private func reindexByNameLocked() {
        byName = [:]
        for entry in entries {
            byName[entry.name, default: []].append(entry)
        }
    }
}

private extension NSLock {
    func withLock<T>(_ body: () -> T) -> T {
        lock()
        defer { unlock() }
        return body()
    }
}
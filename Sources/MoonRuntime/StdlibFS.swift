import Foundation

public enum StdlibFS {
    public static func readFile(_ path: String) throws -> String {
        try String(contentsOfFile: path, encoding: .utf8)
    }

    public static func writeFile(_ path: String, content: String) throws {
        let url = URL(fileURLWithPath: path)
        try FileManager.default.createDirectory(
            at: url.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        try content.write(to: url, atomically: true, encoding: .utf8)
    }

    public static func pathExists(_ path: String) -> Bool {
        FileManager.default.fileExists(atPath: path)
    }

    public static func listDir(_ path: String) throws -> [String] {
        try FileManager.default.contentsOfDirectory(atPath: path)
            .filter { !$0.hasPrefix(".") }
            .sorted()
    }

    public static func makeDir(_ path: String) throws {
        try FileManager.default.createDirectory(
            atPath: path,
            withIntermediateDirectories: true
        )
    }

    public static func removePath(_ path: String) throws {
        try FileManager.default.removeItem(atPath: path)
    }
}
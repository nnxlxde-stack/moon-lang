import Foundation

public enum MoonFormatterVersion {
    public static let current = "0.3.0"
}

public struct FormatOptions: Sendable {
    public var write: Bool
    public var check: Bool

    public init(write: Bool = false, check: Bool = false) {
        self.write = write
        self.check = check
    }
}

public struct FormatResult: Sendable {
    public var changed: Bool
    public var output: String

    public init(changed: Bool, output: String) {
        self.changed = changed
        self.output = output
    }
}

public func formatFile(at path: String, options: FormatOptions = FormatOptions()) throws -> FormatResult {
    let source = try String(contentsOfFile: path, encoding: .utf8)
    let formatted = formatSource(source)
    let changed = formatted != source
    if options.write && changed {
        try formatted.write(toFile: path, atomically: true, encoding: .utf8)
    }
    return FormatResult(changed: changed, output: formatted)
}
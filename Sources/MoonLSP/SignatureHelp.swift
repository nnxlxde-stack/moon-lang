import Foundation
import MoonAST

public struct MoonSignatureHelp: Sendable, Equatable {
    public var label: String
    public var documentation: String?

    public init(label: String, documentation: String? = nil) {
        self.label = label
        self.documentation = documentation
    }
}

public func getSignatureHelp(_ text: String, line: Int, character: Int) -> MoonSignatureHelp? {
    let lines = text.split(separator: "\n", omittingEmptySubsequences: false).map(String.init)
    let row = line >= 0 && line < lines.count ? lines[line] : ""
    let before = String(row.prefix(character))

    let hasAnalyze = before.contains(".analyze")
        || before.range(of: #"\banalyze\s"#, options: .regularExpression) != nil
        || before.hasSuffix("analyze")
    if !hasAnalyze { return nil }

    return MoonSignatureHelp(
        label: "analyze input with context: ctx maxTokens: n focus: [...]",
        documentation: "Agent LLM call. Config keys: context, focus, maxTokens, previousVersion, temperature, filter."
    )
}
import Foundation

public func wordAtPosition(_ text: String, line: Int, character: Int) -> String? {
    let lines = text.split(separator: "\n", omittingEmptySubsequences: false).map(String.init)
    guard line >= 0, line < lines.count else { return nil }
    let row = lines[line]
    let before = String(row.prefix(character))
    let after = String(row.dropFirst(character))
    let left = before.range(of: #"[A-Za-z0-9_.'-]*$"#, options: .regularExpression).map { String(before[$0]) } ?? ""
    let right = after.range(of: #"^[A-Za-z0-9_.'-]*"#, options: .regularExpression).map { String(after[$0]) } ?? ""
    let word = left + right
    if word.isEmpty { return nil }
    return word.hasSuffix(".") ? String(word.dropLast()) : word
}

public func prefixAtPosition(_ text: String, line: Int, character: Int) -> String {
    let lines = text.split(separator: "\n", omittingEmptySubsequences: false).map(String.init)
    let row = line >= 0 && line < lines.count ? lines[line] : ""
    let before = String(row.prefix(character))
    if let range = before.range(of: #"[A-Za-z0-9_.'-]*$"#, options: .regularExpression) {
        return String(before[range])
    }
    return ""
}
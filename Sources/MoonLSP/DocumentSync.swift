import Foundation

public func applyIncrementalChange(_ text: String, change: [String: Any]) -> String {
    guard let newText = change["text"] as? String else { return text }
    guard let range = change["range"] as? [String: Any],
          let start = range["start"] as? [String: Any],
          let end = range["end"] as? [String: Any],
          let startLine = start["line"] as? Int,
          let startCharacter = start["character"] as? Int,
          let endLine = end["line"] as? Int,
          let endCharacter = end["character"] as? Int else {
        return newText
    }

    let lines = text.split(separator: "\n", omittingEmptySubsequences: false).map(String.init)
    var result: [String] = []

    for i in 0..<startLine {
        result.append(i < lines.count ? lines[i] : "")
    }

    let startRow = startLine < lines.count ? lines[startLine] : ""
    let endRow = endLine < lines.count ? lines[endLine] : ""
    let prefix = String(startRow.prefix(startCharacter))
    let suffix = String(endRow.dropFirst(min(endCharacter, endRow.count)))

    let inserted = newText.split(separator: "\n", omittingEmptySubsequences: false).map(String.init)
    if inserted.count <= 1 {
        result.append(prefix + (inserted.first ?? "") + suffix)
    } else {
        result.append(prefix + inserted[0])
        for line in inserted.dropFirst().dropLast() {
            result.append(line)
        }
        result.append((inserted.last ?? "") + suffix)
    }

    for i in (endLine + 1)..<lines.count {
        result.append(lines[i])
    }

    return result.joined(separator: "\n")
}
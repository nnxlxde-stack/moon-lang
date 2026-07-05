import Foundation

public func isMoonSectionHeader(_ trimmed: String) -> Bool {
    guard trimmed.hasPrefix("--") else { return false }
    let body = String(trimmed.dropFirst(2)).trimmingCharacters(in: .whitespaces)
    if body.isEmpty { return true }
    if body.hasPrefix("===") { return true }
    return body.allSatisfy { $0 == "=" }
}

public func extractMoonDocs(_ source: String, declLine: Int) -> String? {
    let lines = source.split(separator: "\n", omittingEmptySubsequences: false).map(String.init)
    var docLines: [String] = []
    var i = declLine - 2

    while i >= 0, i < lines.count {
        let raw = lines[i]
        let trimmed = raw.trimmingCharacters(in: .whitespaces)

        if trimmed.isEmpty {
            if !docLines.isEmpty { break }
            i -= 1
            continue
        }

        if trimmed.hasPrefix("--?") {
            docLines.insert(String(trimmed.dropFirst(3)).trimmingCharacters(in: .whitespaces), at: 0)
            i -= 1
            continue
        }

        if trimmed == "-- moon-doc" || trimmed.hasPrefix("-- moon-doc ") {
            i -= 1
            while i >= 0 {
                let block = lines[i].trimmingCharacters(in: .whitespaces)
                if block.isEmpty { break }
                if block.hasPrefix("--") {
                    let text = String(block.dropFirst(2)).trimmingCharacters(in: .whitespaces)
                    if text == "moon-doc" || isMoonSectionHeader(block) { break }
                    docLines.insert(text, at: 0)
                    i -= 1
                    continue
                }
                break
            }
            break
        }

        if trimmed.hasPrefix("--"), !isMoonSectionHeader(trimmed) {
            docLines.insert(String(trimmed.dropFirst(2)).trimmingCharacters(in: .whitespaces), at: 0)
            i -= 1
            continue
        }

        break
    }

    return docLines.isEmpty ? nil : docLines.joined(separator: "\n")
}

public func formatHoverDocs(_ name: String, _ type: String, module: String? = nil, docs: String? = nil) -> String {
    var parts = ["**\(name)**", "```moon\n\(type)\n```"]
    if let module { parts.append("from `\(module)`") }
    if let docs, !docs.isEmpty { parts.append(docs) }
    return parts.joined(separator: "\n\n")
}
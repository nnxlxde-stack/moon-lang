import Foundation
import MoonFormatter
import MoonParser

public enum MoonLSPVersion {
    public static let current = "0.3.0"
}

public final class MoonLSPServer: @unchecked Sendable {
    private var documents: [String: String] = [:]
    private var running = true

    public init() {}

    public func run() {
        while running {
            guard let message = LSPTransport.readMessage() else { continue }
            handle(message)
        }
    }

    private func handle(_ message: [String: Any]) {
        guard let method = message["method"] as? String else { return }
        let id = message["id"]
        let params = message["params"] as? [String: Any] ?? [:]

        switch method {
        case "exit":
            running = false
            return
        case "initialize":
            if id != nil {
                respond(id: id, result: [
                "capabilities": [
                    "textDocumentSync": 1,
                    "completionProvider": [
                        "triggerCharacters": [".", ":"],
                        "resolveProvider": false,
                    ],
                    "definitionProvider": true,
                    "hoverProvider": true,
                    "documentFormattingProvider": true,
                ],
                ])
            }
            return
        case "shutdown":
            running = false
            if id != nil { respond(id: id, result: NSNull()) }
            return
        case "textDocument/didOpen":
            if let textDocument = params["textDocument"] as? [String: Any],
               let uri = textDocument["uri"] as? String,
               let text = textDocument["text"] as? String {
                documents[uri] = text
                publishDiagnostics(uri: uri, text: text)
            }
            return
        case "textDocument/didChange":
            if let textDocument = params["textDocument"] as? [String: Any],
               let uri = textDocument["uri"] as? String,
               let changes = params["contentChanges"] as? [[String: Any]],
               let change = changes.last,
               let text = change["text"] as? String {
                documents[uri] = text
                publishDiagnostics(uri: uri, text: text)
            }
            return
        case "textDocument/didClose":
            if let textDocument = params["textDocument"] as? [String: Any],
               let uri = textDocument["uri"] as? String {
                documents.removeValue(forKey: uri)
            }
            return
        case "textDocument/completion":
            if id != nil { respond(id: id, result: completionItems(params: params)) }
        case "textDocument/hover":
            if id != nil { respond(id: id, result: hoverResult(params: params) ?? NSNull()) }
        case "textDocument/definition":
            if id != nil { respond(id: id, result: definitionResult(params: params) ?? NSNull()) }
        case "textDocument/formatting":
            if id != nil { respond(id: id, result: formattingEdits(params: params)) }
        default:
            if id != nil { respond(id: id, result: NSNull()) }
        }
    }

    private func filePath(from uri: String) -> String {
        if uri.hasPrefix("file://") {
            let path = String(uri.dropFirst(7))
            if path.hasPrefix("/") && path.count > 2 && path[path.index(path.startIndex, offsetBy: 2)] == ":" {
                return String(path.dropFirst()).replacingOccurrences(of: "/", with: "\\")
            }
            return path
        }
        return uri
    }

    private func publishDiagnostics(uri: String, text: String) {
        let path = filePath(from: uri)
        let diags = collectDiagnostics(entryPath: path, text: text).map { diag in
            [
                "range": [
                    "start": ["line": diag.line, "character": diag.character],
                    "end": ["line": diag.line, "character": diag.endCharacter],
                ],
                "severity": 1,
                "source": diag.source,
                "message": diag.message,
            ] as [String: Any]
        }
        let notification: [String: Any] = [
            "jsonrpc": "2.0",
            "method": "textDocument/publishDiagnostics",
            "params": [
                "uri": uri,
                "diagnostics": diags,
            ],
        ]
        LSPTransport.writeMessage(notification)
    }

    private func completionItems(params: [String: Any]) -> [[String: Any]] {
        guard let textDocument = params["textDocument"] as? [String: Any],
              let uri = textDocument["uri"] as? String,
              let position = params["position"] as? [String: Any],
              let line = position["line"] as? Int,
              let character = position["character"] as? Int,
              let text = documents[uri],
              let program = try? MoonParser().parse(text) else {
            return []
        }
        let path = filePath(from: uri)
        return getCompletions(program, entryPath: path, text: text, line: line, character: character)
            .map { item in
                var dict: [String: Any] = ["label": item.label, "kind": item.kind]
                if let detail = item.detail { dict["detail"] = detail }
                return dict
            }
    }

    private func hoverResult(params: [String: Any]) -> [String: Any]? {
        guard let textDocument = params["textDocument"] as? [String: Any],
              let uri = textDocument["uri"] as? String,
              let position = params["position"] as? [String: Any],
              let line = position["line"] as? Int,
              let character = position["character"] as? Int,
              let text = documents[uri],
              let word = wordAtPosition(text, line: line, character: character),
              let program = try? MoonParser().parse(text) else {
            return nil
        }
        let path = filePath(from: uri)
        guard let info = lookupSymbol(program, entryPath: path, name: word, source: text) else { return nil }
        var md = "**\(info.name)**"
        if let module = info.module { md += "\n\nModule: `\(module)`" }
        md += "\n\n```moon\n\(info.type)\n```"
        return ["contents": ["kind": "markdown", "value": md]]
    }

    private func definitionResult(params: [String: Any]) -> [String: Any]? {
        guard let textDocument = params["textDocument"] as? [String: Any],
              let uri = textDocument["uri"] as? String,
              let position = params["position"] as? [String: Any],
              let line = position["line"] as? Int,
              let character = position["character"] as? Int,
              let text = documents[uri],
              let word = wordAtPosition(text, line: line, character: character),
              let program = try? MoonParser().parse(text) else {
            return nil
        }
        let path = filePath(from: uri)
        guard let target = definitionLocation(program, entryPath: path, name: word, source: text) else {
            return nil
        }
        return [
            "uri": target.uri,
            "range": [
                "start": ["line": target.line, "character": target.character],
                "end": ["line": target.endLine, "character": target.endCharacter],
            ],
        ]
    }

    private func formattingEdits(params: [String: Any]) -> [[String: Any]] {
        guard let textDocument = params["textDocument"] as? [String: Any],
              let uri = textDocument["uri"] as? String,
              let text = documents[uri] else {
            return []
        }
        let formatted = formatSource(text)
        let lineCount = text.split(separator: "\n", omittingEmptySubsequences: false).count
        let lastLine = text.split(separator: "\n", omittingEmptySubsequences: false).last.map(String.init) ?? ""
        return [[
            "range": [
                "start": ["line": 0, "character": 0],
                "end": ["line": max(0, lineCount - 1), "character": lastLine.count],
            ],
            "newText": formatted,
        ]]
    }

    private func respond(id: Any?, result: Any) {
        var response: [String: Any] = ["jsonrpc": "2.0", "result": result]
        if let id { response["id"] = id }
        LSPTransport.writeMessage(response)
    }
}

public func startLspServer() {
    MoonLSPServer().run()
}
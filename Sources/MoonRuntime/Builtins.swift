import Foundation
import MoonAST

public let alwaysAvailableBuiltins: Set<String> = ["not"]

public let coreModuleBuiltins: [String: [String]] = [
    "Core.GitHub": ["fetchOpenPRs", "fetchChangedFiles", "isDraft"],
    "Core.Memory": ["memory", "recall"],
    "Core.FS": ["readFile", "writeFile", "pathExists", "listDir", "makeDir", "removePath"],
    "Core.Network": ["httpGet", "httpPost", "fetchJson"],
    "Core.UI": ["showInt"],
    "Core.Tools": [
        "readFile", "saveToFile", "postToSlack", "postSummaryToSlack",
        "when", "mapM", "pure", "fetchUpdatedDocs",
        "generateCombinedReport", "generateReviewReport",
    ],
    "Core.Analyzers": [
        "hasCriticalFindings", "hasCriticalIssues", "escalateCriticalIssues",
        "notifyTeamLeads", "getPreviousVersion", "calculateScore",
        "extractRecommendations", "decideOverallVerdict", "collectFindings",
        "generateSummary", "calculateConfidence", "extractSuggestions", "detectLanguage",
    ],
]

private let typeValues: Set<String> = [
    "LongTerm", "ShortTerm", "Session", "Code", "Documentation", "Requirements", "Entity",
    "Approved", "ChangesRequested", "MajorRefactoring", "SecurityIssue",
]

public func builtinsFromImports(_ program: Program) -> Set<String> {
    var set = alwaysAvailableBuiltins
    for decl in program.declarations {
        guard case .importDecl(let path, _, _) = decl else { continue }
        let key = path.joined(separator: ".")
        if let symbols = coreModuleBuiltins[key] {
            for name in symbols { set.insert(name) }
        }
    }
    return set
}

func isBuiltin(_ name: String, _ ctx: RuntimeContext) -> Bool {
    ctx.builtins.contains(name)
}

func isTypeValue(_ name: String) -> Bool {
    typeValues.contains(name)
}

func runBuiltin(_ name: String, _ arg: RuntimeValue, _ ctx: RuntimeContext) async throws -> RuntimeValue {
    switch name {
    case "memory":
        return .callable(RuntimeCallableBox { scope, ctx in
            guard let scopeName = scopeSymbolName(scope) else {
                throw RuntimeError("memory expects scope symbol")
            }
            return .callable(RuntimeCallableBox { key, ctx in
                let keyName = scopeSymbolName(key) ?? runtimeValueDescription(key)
                ctx.memory.register(scope: scopeName, name: keyName)
                ctx.effects.append(RuntimeEffect(kind: "memory", detail: [
                    "scope": scopeName,
                    "key": keyName,
                ]))
                return .null
            })
        })
    case "recall":
        guard case .string(let key) = arg else { throw RuntimeError("recall expects string key") }
        return await ctx.memory.recall(key)
    case "showInt":
        if case .int(let n) = arg { return .string(String(n)) }
        throw RuntimeError("showInt expects Int")
    case "fetchOpenPRs":
        guard case .string(let repo) = arg else { throw RuntimeError("fetchOpenPRs expects repo string") }
        return try await fetchOpenPRsFromGitHub(repo: repo, ctx: ctx)
    case "fetchUpdatedDocs":
        return .array([
            .record(typeName: nil, fields: ["path": .string("docs/guide.md"), "content": .string("Guide")]),
            .record(typeName: nil, fields: ["path": .string("docs/api.md"), "content": .string("API")]),
        ])
    case "fetchChangedFiles":
        return .array([
            .record(typeName: nil, fields: ["path": .string("src/main.cpp"), "previousContent": .string("old")]),
            .record(typeName: nil, fields: ["path": .string("src/util.cpp"), "previousContent": .string("old2")]),
        ])
    case "isDraft":
        if case .record(_, let fields) = arg, case .bool(let draft) = fields["isDraft"] {
            return .bool(draft)
        }
        return .bool(false)
    case "readFile":
        guard case .string(let path) = arg else { throw RuntimeError("readFile expects path") }
        return .string(try StdlibFS.readFile(path))
    case "writeFile", "saveToFile":
        return try await curriedWrite(name, arg, ctx)
    case "pathExists":
        guard case .string(let path) = arg else { throw RuntimeError("pathExists expects path") }
        return .bool(StdlibFS.pathExists(path))
    case "listDir":
        guard case .string(let path) = arg else { throw RuntimeError("listDir expects path") }
        let entries = try StdlibFS.listDir(path)
        return .array(entries.map { .string($0) })
    case "makeDir":
        guard case .string(let path) = arg else { throw RuntimeError("makeDir expects path") }
        try StdlibFS.makeDir(path)
        ctx.effects.append(RuntimeEffect(kind: "makeDir", detail: ["path": path]))
        return .null
    case "removePath":
        guard case .string(let path) = arg else { throw RuntimeError("removePath expects path") }
        try StdlibFS.removePath(path)
        ctx.effects.append(RuntimeEffect(kind: "removePath", detail: ["path": path]))
        return .null
    case "httpGet":
        guard case .string(let url) = arg else { throw RuntimeError("httpGet expects url") }
        let res = try await StdlibNetwork.httpGet(url)
        ctx.effects.append(RuntimeEffect(kind: "httpGet", detail: ["url": url, "status": "\(res.status)"]))
        return .string(res.body)
    case "httpPost":
        guard case .string(let url) = arg else { throw RuntimeError("httpPost expects url") }
        return .callable(RuntimeCallableBox { body, ctx in
            let bodyText = runtimeValueDescription(body)
            let res = try await StdlibNetwork.httpPost(url, body: bodyText)
            ctx.effects.append(RuntimeEffect(kind: "httpPost", detail: ["url": url, "status": "\(res.status)"]))
            return .string(res.body)
        })
    case "fetchJson":
        guard case .string(let url) = arg else { throw RuntimeError("fetchJson expects url") }
        let res = try await StdlibNetwork.httpGet(url)
        ctx.effects.append(RuntimeEffect(kind: "fetchJson", detail: ["url": url, "status": "\(res.status)"]))
        return .string(res.body)
    case "not":
        if case .bool(let b) = arg { return .bool(!b) }
        return .bool(false)
    case "postToSlack", "postSummaryToSlack":
        ctx.effects.append(RuntimeEffect(kind: name, detail: ["payload": runtimeValueDescription(arg)]))
        return .null
    case "generateCombinedReport":
        return .callable(RuntimeCallableBox { a, ctx in
            .callable(RuntimeCallableBox { b, ctx in
                let report = "# Combined Report"
                ctx.effects.append(RuntimeEffect(kind: "generateCombinedReport", detail: ["length": "\(report.count)"]))
                return .string(report)
            })
        })
    case "generateReviewReport":
        return .string("# Review Report")
    case "mapM":
        return .callable(RuntimeCallableBox { fn, ctx in
            .callable(RuntimeCallableBox { items, ctx in
                guard case .array(let list) = items else { return .array([]) }
                var results: [RuntimeValue] = []
                for item in list {
                    results.append(try await applyValue(fn, item, ctx))
                }
                return .array(results)
            })
        })
    case "pure":
        return arg
    case "when":
        return .callable(RuntimeCallableBox { cond, ctx in
            .callable(RuntimeCallableBox { action, ctx in
                if case .bool(true) = cond {
                    if case .callable(let box) = action {
                        return try await box.fn(.null, ctx)
                    }
                    return action
                }
                return .null
            })
        })
    case "hasCriticalFindings", "hasCriticalIssues":
        return .callable(RuntimeCallableBox { _, _ in .bool(false) })
    case "escalateCriticalIssues", "notifyTeamLeads":
        return .callable(RuntimeCallableBox { items, ctx in
            ctx.effects.append(RuntimeEffect(kind: name, detail: ["items": runtimeValueDescription(items)]))
            return .null
        })
    case "getPreviousVersion":
        return .callable(RuntimeCallableBox { _, _ in .string("previous-version") })
    case "calculateScore":
        return .callable(RuntimeCallableBox { _, _ in .double(85.5) })
    case "extractRecommendations":
        return .callable(RuntimeCallableBox { _, _ in .array([]) })
    case "decideOverallVerdict":
        return .callable(RuntimeCallableBox { _, ctx in
            .callable(RuntimeCallableBox { _, _ in .string("Approved") })
        })
    case "collectFindings":
        return .callable(RuntimeCallableBox { reviews, _ in
            guard case .array(let list) = reviews else { return .array([]) }
            var out: [RuntimeValue] = []
            for item in list {
                if case .record(_, let fields) = item, case .array(let findings) = fields["findings"] {
                    out.append(contentsOf: findings)
                }
            }
            return .array(out)
        })
    case "generateSummary":
        return .callable(RuntimeCallableBox { combined, _ in
            .string("Summary: \(runtimeValueDescription(combined))")
        })
    case "calculateConfidence":
        return .callable(RuntimeCallableBox { _, _ in .double(0.92) })
    case "extractSuggestions":
        return .callable(RuntimeCallableBox { _, _ in .array([]) })
    case "detectLanguage":
        return .callable(RuntimeCallableBox { file, _ in
            if case .record(_, let fields) = file, case .string(let path) = fields["path"] {
                return .string(path.hasSuffix(".cpp") ? "cpp" : "text")
            }
            return .string("text")
        })
    default:
        throw RuntimeError("Unknown builtin: \(name)")
    }
}

private func curriedWrite(_ kind: String, _ arg: RuntimeValue, _ ctx: RuntimeContext) async throws -> RuntimeValue {
    guard case .string(let path) = arg else { throw RuntimeError("\(kind) expects path") }
    return .callable(RuntimeCallableBox { content, ctx in
        let text = runtimeValueDescription(content)
        try StdlibFS.writeFile(path, content: text)
        ctx.effects.append(RuntimeEffect(kind: kind, detail: [
            "path": path,
            "bytes": "\(text.count)",
        ]))
        return .null
    })
}

private func fetchOpenPRsFromGitHub(repo: String, ctx: RuntimeContext) async throws -> RuntimeValue {
    let env = ProcessInfo.processInfo.environment
    let token = env["GITHUB_TOKEN"] ?? env["GH_TOKEN"]
    if token == nil {
        ctx.effects.append(RuntimeEffect(kind: "fetchOpenPRs", detail: ["repo": repo, "mock": "true"]))
        return .array([
            .record(typeName: nil, fields: ["id": .string("pr-1"), "title": .string("Feature A"), "isDraft": .bool(false)]),
            .record(typeName: nil, fields: ["id": .string("pr-2"), "title": .string("Fix B"), "isDraft": .bool(true)]),
        ])
    }

    let url = "https://api.github.com/repos/\(repo)/pulls?state=open"
    let res = try await StdlibNetwork.httpGet(url, headers: [
        "Authorization": "Bearer \(token!)",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    ])
    ctx.effects.append(RuntimeEffect(kind: "fetchOpenPRs", detail: ["repo": repo, "status": "\(res.status)"]))
    guard res.status >= 200, res.status < 300 else {
        let snippet = String(res.body.prefix(200))
        throw RuntimeError("GitHub API \(res.status): \(snippet)")
    }

    guard let data = res.body.data(using: .utf8),
          let pulls = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] else {
        throw RuntimeError("GitHub API returned invalid JSON")
    }

    return .array(pulls.map { pr in
        let number = pr["number"] as? Int ?? 0
        let title = pr["title"] as? String ?? ""
        let draft = pr["draft"] as? Bool ?? false
        return .record(typeName: nil, fields: [
            "id": .string(String(number)),
            "title": .string(title),
            "isDraft": .bool(draft),
        ])
    })
}

private func effectPath(_ arg: RuntimeValue) -> [String: String] {
    ["path": runtimeValueDescription(arg)]
}

private func scopeSymbolName(_ value: RuntimeValue) -> String? {
    switch value {
    case .symbol(let name): return name
    case .string(let name): return name
    default: return nil
    }
}

public func runtimeValueDescription(_ value: RuntimeValue) -> String {
    switch value {
    case .null: return "null"
    case .bool(let b): return "\(b)"
    case .int(let n): return "\(n)"
    case .double(let d): return "\(d)"
    case .string(let s): return s
    case .symbol(let s): return s
    case .array(let items): return "[\(items.map(runtimeValueDescription).joined(separator: ", "))]"
    case .record(_, let fields):
        let parts = fields.map { "\($0.key)=\(runtimeValueDescription($0.value))" }.sorted()
        return "{\(parts.joined(separator: ", "))}"
    case .agentMethod(let agent, let method): return "\(agent).\(method)"
    case .callable: return "<fn>"
    }
}

func literalValue(_ lit: Literal) -> RuntimeValue {
    switch lit {
    case .string(let s, _): return .string(s)
    case .int(let n, _): return .int(n)
    case .float(let f, _): return .double(f)
    case .bool(let b, _): return .bool(b)
    }
}
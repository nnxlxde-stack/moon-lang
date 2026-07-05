import Foundation
import MoonAST

public let alwaysAvailableBuiltins: Set<String> = ["not"]

public let coreModuleBuiltins: [String: [String]] = [
    "Core.GitHub": ["fetchOpenPRs", "fetchChangedFiles", "isDraft"],
    "Core.Memory": ["memory", "recall"],
    "Core.FS": ["readFile", "writeFile", "pathExists", "listDir", "makeDir", "removePath"],
    "Core.Network": ["httpGet", "httpPost", "fetchJson"],
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
    case "fetchOpenPRs":
        guard case .string(let repo) = arg else { throw RuntimeError("fetchOpenPRs expects repo string") }
        ctx.effects.append(RuntimeEffect(kind: "fetchOpenPRs", detail: ["repo": repo]))
        return .array([
            .record(typeName: nil, fields: ["id": .string("pr-1"), "title": .string("Feature A"), "isDraft": .bool(false)]),
            .record(typeName: nil, fields: ["id": .string("pr-2"), "title": .string("Fix B"), "isDraft": .bool(true)]),
        ])
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
        return .string("(mock file: \(path))")
    case "writeFile", "saveToFile":
        return try await curriedWrite(name, arg, ctx)
    case "pathExists":
        return .bool(false)
    case "listDir":
        return .array([])
    case "makeDir":
        ctx.effects.append(RuntimeEffect(kind: "makeDir", detail: effectPath(arg)))
        return .null
    case "removePath":
        ctx.effects.append(RuntimeEffect(kind: "removePath", detail: effectPath(arg)))
        return .null
    case "httpGet":
        ctx.effects.append(RuntimeEffect(kind: "httpGet", detail: effectPath(arg)))
        return .string("{}")
    case "httpPost":
        return .callable(RuntimeCallableBox { body, ctx in
            ctx.effects.append(RuntimeEffect(kind: "httpPost", detail: effectPath(arg)))
            _ = body
            return .string("{}")
        })
    case "fetchJson":
        ctx.effects.append(RuntimeEffect(kind: "fetchJson", detail: effectPath(arg)))
        return .string("{}")
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
        ctx.effects.append(RuntimeEffect(kind: kind, detail: [
            "path": path,
            "bytes": "\(text.count)",
        ]))
        return .null
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

func runtimeValueDescription(_ value: RuntimeValue) -> String {
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
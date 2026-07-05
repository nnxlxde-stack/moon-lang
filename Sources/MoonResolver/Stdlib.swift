import MoonTypes

public func coreModuleSchemes(_ path: String) -> [String: Scheme]? {
    switch path {
    case "Core.GitHub": return githubSchemes()
    case "Core.Memory": return memorySchemes()
    case "Core.Tools": return toolsSchemes()
    case "Core.Analyzers": return analyzersSchemes()
    case "Core.FS": return fsSchemes()
    case "Core.Network": return networkSchemes()
    default: return nil
    }
}

public func isCoreModule(_ path: String) -> Bool {
    coreModuleSchemes(path) != nil
}

public func allCoreModulePaths() -> [String] {
    ["Core.GitHub", "Core.Memory", "Core.Tools", "Core.Analyzers", "Core.FS", "Core.Network"]
}

private func scheme(_ t: MoonType) -> Scheme { Scheme(vars: [], type: t) }

private func forall(_ t: MoonType) -> Scheme {
    var vars: [Int] = []
    func collect(_ mt: MoonType) {
        switch mt {
        case .typeVar(let id): vars.append(id)
        case .con(_, let args): args.forEach(collect)
        case .arrow(let from, let to): collect(from); collect(to)
        case .record(_, let fields): fields.forEach { collect($0.type) }
        case .tuple(let elements): elements.forEach(collect)
        }
    }
    collect(t)
    return Scheme(vars: Array(Set(vars)).sorted(), type: t)
}

private func githubSchemes() -> [String: Scheme] {
    [
        "PullRequest": scheme(prim("PullRequest")),
        "ChangedFile": scheme(moonRecord("ChangedFile", [
            MoonFieldType(name: "path", type: prim("String")),
            MoonFieldType(name: "previousContent", type: prim("String")),
        ])),
        "fetchOpenPRs": scheme(fn(prim("String"), io(listOf(prim("PullRequest"))))),
        "fetchChangedFiles": scheme(fn(prim("PullRequest"), io(listOf(prim("ChangedFile"))))),
        "isDraft": scheme(fn(prim("PullRequest"), prim("Bool"))),
    ]
}

private func memorySchemes() -> [String: Scheme] {
    [
        "LongTerm": scheme(prim("LongTerm")),
        "memory": scheme(fn(prim("LongTerm"), fn(prim("String"), io(prim("Unit"))))),
        "recall": scheme(fn(prim("String"), io(prim("String")))),
    ]
}

private func toolsSchemes() -> [String: Scheme] {
    let a: () -> MoonType = { freshVar() }
    return [
        "readFile": scheme(fn(prim("String"), io(prim("String")))),
        "saveToFile": scheme(fn(prim("String"), fn(prim("String"), io(prim("Unit"))))),
        "when": scheme(fn(prim("Bool"), fn(io(prim("Unit")), io(prim("Unit"))))),
        "mapM": forall(fn(fn(a(), io(a())), fn(listOf(a()), io(listOf(a()))))),
        "postToSlack": scheme(fn(prim("String"), io(prim("Unit")))),
        "postSummaryToSlack": forall(fn(listOf(a()), io(prim("Unit")))),
        "fetchUpdatedDocs": scheme(fn(prim("String"), io(listOf(prim("Documentation"))))),
        "generateCombinedReport": forall(fn(listOf(a()), fn(listOf(a()), io(prim("String"))))),
        "generateReviewReport": forall(fn(listOf(a()), io(prim("String")))),
        "between": scheme(fn(prim("Float"), fn(prim("Float"), prim("Float")))),
    ]
}

private func analyzeOutput(_ t: MoonType) -> MoonType {
    moonRecord("AnalyzeOutput", [
        MoonFieldType(name: "findings", type: listOf(prim("Finding", t))),
        MoonFieldType(name: "summary", type: prim("String")),
        MoonFieldType(name: "confidence", type: prim("Float")),
    ])
}

private func analyzersSchemes() -> [String: Scheme] {
    let a: () -> MoonType = { freshVar() }
    return [
        "hasCriticalFindings": forall(fn(listOf(a()), prim("Bool"))),
        "escalateCriticalIssues": forall(fn(listOf(a()), io(prim("Unit")))),
        "getPreviousVersion": forall(fn(a(), prim("String"))),
        "calculateScore": forall(fn(analyzeOutput(a()), prim("Float"))),
        "extractRecommendations": forall(fn(analyzeOutput(a()), listOf(prim("Recommendation", a())))),
        "hasCriticalIssues": forall(fn(listOf(a()), prim("Bool"))),
        "notifyTeamLeads": forall(fn(listOf(a()), io(prim("Unit")))),
        "decideOverallVerdict": forall(fn(listOf(a()), fn(prim("ReviewResult", a()), io(prim("Verdict"))))),
        "collectFindings": forall(fn(listOf(a()), listOf(prim("Finding", a())))),
        "generateSummary": forall(fn(prim("ReviewResult", a()), prim("String"))),
        "calculateConfidence": forall(fn(listOf(a()), prim("Float"))),
        "extractSuggestions": forall(fn(prim("ReviewResult", a()), listOf(prim("Suggestion")))),
        "detectLanguage": scheme(fn(prim("ChangedFile"), prim("String"))),
    ]
}

private func fsSchemes() -> [String: Scheme] {
    [
        "readFile": scheme(fn(prim("String"), io(prim("String")))),
        "writeFile": scheme(fn(prim("String"), fn(prim("String"), io(prim("Unit"))))),
        "pathExists": scheme(fn(prim("String"), io(prim("Bool")))),
        "listDir": scheme(fn(prim("String"), io(listOf(prim("String"))))),
        "makeDir": scheme(fn(prim("String"), io(prim("Unit")))),
        "removePath": scheme(fn(prim("String"), io(prim("Unit")))),
    ]
}

private func networkSchemes() -> [String: Scheme] {
    [
        "httpGet": scheme(fn(prim("String"), io(prim("String")))),
        "httpPost": scheme(fn(prim("String"), fn(prim("String"), io(prim("String"))))),
        "fetchJson": scheme(fn(prim("String"), io(prim("String")))),
    ]
}
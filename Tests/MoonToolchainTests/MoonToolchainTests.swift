import Foundation
import Testing
import MoonAST
import MoonLexer
import MoonParser
import MoonBuild
import MoonFormatter
import MoonLSP
import MoonMoonfile
import MoonPlanner
import MoonPrompt
import MoonRegistry
import MoonResolver
import MoonRuntime
import MoonSchemaCompiler
import MoonTypechecker

private let repoRoot: URL = {
    var dir = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
    while dir.path != "/" && dir.path != dir.deletingLastPathComponent().path {
        if FileManager.default.fileExists(atPath: dir.appendingPathComponent("Package.swift").path) {
            return dir
        }
        dir = dir.deletingLastPathComponent()
    }
    fatalError("Could not locate repo root (Package.swift) from \(#filePath)")
}()

@Test func lexerAndParserVersions() {
    #expect(MoonLexerVersion.current == "0.3.0")
    #expect(MoonParserVersion.current == "0.3.0")
}

@Test func fieldDotVsComposeDot() throws {
    let tokens = try rawLex("a.b (not . isDraft)")
    let kinds = Set(tokens.map(\.kind))
    #expect(kinds.contains(.fieldDot))
    #expect(kinds.contains(.composeDot))
}

@Test func rawLexCommentsAndImport() throws {
    let tokens = try rawLex("-- hello\nimport Core.GitHub\n")
    #expect(tokens.count > 3)
    #expect(tokens.contains { $0.kind == .kwImport })
}

@Test func rawLexCrlfCommentsAndImport() throws {
    let tokens = try rawLex("-- hello\r\nimport Core.GitHub\r\n")
    #expect(tokens.contains { $0.kind == .kwImport })
}

@Test func hyphenatedIdentifier() throws {
    let tokens = try rawLex("deepseek-v4-pro")
    #expect(tokens.first?.kind == .ident)
    #expect(tokens.first?.value == "deepseek-v4-pro")
}

@Test func minimalModel() throws {
    let src = """
    model AnalysisResult t where
      item :: t
    """
    let program = try MoonParser().parse(src)
    #expect(program.declarations.count == 1)
    if case .model = program.declarations[0] {
        // ok
    } else {
        Issue.record("Expected Model declaration")
    }
}

@Test func parseCodeAnalyzer() throws {
    let path = repoRoot.appendingPathComponent("examples/code-analyzer.moon")
    let src = try String(contentsOf: path, encoding: .utf8)
    let program = try MoonParser().parse(src)
    #expect(program.declarations.count > 0)
}

@Test func parseCodeReviewer() throws {
    let path = repoRoot.appendingPathComponent("examples/code-reviewer.moon")
    let src = try String(contentsOf: path, encoding: .utf8)
    let program = try MoonParser().parse(src)
    #expect(program.declarations.count > 0)
}

@Test func multilineRecordExpression() throws {
    let src = """
    main = do
      pure $ AnalysisResult
          { item = item }
    """
    _ = try MoonParser().parse(src)
}

@Test func withConfigOnBind() throws {
    let src = """
    f = do
      r <- g x
          with context: ctx
               maxTokens: 100
    """
    _ = try MoonParser().parse(src)
}

@Test func goldenCodeAnalyzer() throws {
    try assertGolden(name: "code-analyzer")
}

@Test func goldenCodeReviewer() throws {
    try assertGolden(name: "code-reviewer")
}

@Test func plannerCodeAnalyzerMainDag() throws {
    try assertGoldenDag(name: "code-analyzer-main")
}

@Test func plannerParallelBranches() throws {
    let path = repoRoot.appendingPathComponent("examples/code-analyzer.moon")
    let src = try String(contentsOf: path, encoding: .utf8)
    let program = try MoonParser().parse(src)
    guard let dag = planFunction(program, functionName: "main") else {
        Issue.record("Expected main DAG")
        return
    }

    let docsNode = nodesByLabel(dag, label: "docs").first
    let codeReviewsJoin = dag.nodes.first { $0.bindVar == "codeReviews" }
    let docsReviewsJoin = dag.nodes.first { $0.bindVar == "docsReviews" }

    #expect(docsNode != nil)
    #expect(codeReviewsJoin != nil)
    #expect(docsReviewsJoin != nil)

    let codeBranch = reachableFrom(dag, startIds: [codeReviewsJoin!.id])
    for dep in docsNode!.dependencies {
        #expect(!codeBranch.contains(dep))
    }

    let prsNode = nodesByLabel(dag, label: "prs").first
    #expect(prsNode != nil)
    #expect(!Set(docsNode!.dependencies).contains(prsNode!.id))
}

@Test func runtimeCodeAnalyzerMock() async throws {
    let path = repoRoot.appendingPathComponent("examples/code-analyzer.moon")
    let src = try String(contentsOf: path, encoding: .utf8)
    let program = try MoonParser().parse(src)
    let result = try await runProgram(program, options: ProgramRunOptions(
        overrides: RuntimeConfigOverrides(mock: true)
    ))

    #expect(result.effects.contains { $0.kind == "saveToFile" })
    #expect(result.effects.contains { $0.kind == "postToSlack" })
    #expect(result.dag.nodes.count > 0)
}

@Test func runtimeCodeReviewerMock() async throws {
    let path = repoRoot.appendingPathComponent("examples/code-reviewer.moon")
    let src = try String(contentsOf: path, encoding: .utf8)
    let program = try MoonParser().parse(src)
    let result = try await runProgram(program, options: ProgramRunOptions(
        overrides: RuntimeConfigOverrides(mock: true)
    ))

    #expect(result.effects.contains { $0.kind == "saveToFile" })
    #expect(result.dag.nodes.count > 0)
}

@Test func schemaCompilerAnalysisResult() throws {
    let path = repoRoot.appendingPathComponent("examples/code-analyzer.moon")
    let src = try String(contentsOf: path, encoding: .utf8)
    let program = try MoonParser().parse(src)
    let result = compileSchemas(program)
    #expect(result.schemas["AnalysisResult"] != nil)
    #expect(result.schemas["AnalysisResult"]?.type == "object")
}

@Test func buildAllMoonfileTargets() throws {
    let outDir = repoRoot.appendingPathComponent(".moon/build-test").path
    defer { try? FileManager.default.removeItem(atPath: outDir) }

    let moonfilePath = repoRoot.appendingPathComponent("Moonfile").path
    let results = try buildFromMoonfile(moonfilePath, options: BuildOptions(
        projectRoot: repoRoot.path,
        outDir: outDir
    ))

    #expect(results.count == 6)
    #expect(results.allSatisfy { $0.ok })

    let buildJsonPath = URL(fileURLWithPath: outDir).appendingPathComponent("analyzer/build.json")
    let buildData = try Data(contentsOf: buildJsonPath)
    let buildObj = try JSONSerialization.jsonObject(with: buildData) as? [String: Any]
    let imports = (buildObj?["imports"] as? [[String: Any]])?.compactMap { $0["path"] as? String }.sorted()
    #expect(imports == ["Core.Analyzers", "Core.GitHub", "Core.Memory", "Core.Tools"])

    for result in results {
        let dir = result.outputDir
        #expect(FileManager.default.fileExists(atPath: dir + "/build.json"))
        #expect(FileManager.default.fileExists(atPath: dir + "/schemas.json"))
        #expect(FileManager.default.fileExists(atPath: dir + "/dag.json"))
    }
}

@Test func parsePackageRefGit() throws {
    let dep = try parsePackageRef("github.com/moon-lang/review-kit@0.1.0")
    if case .git(let host, let owner, let repo, let version) = dep {
        #expect(host == "github.com")
        #expect(owner == "moon-lang")
        #expect(repo == "review-kit")
        #expect(version == "0.1.0")
    } else {
        Issue.record("Expected git dependency")
    }
}

@Test func assemblePromptIncludesDelegateBlock() {
    let assembled = assemblePrompt(AssemblyInput(
        agent: "Specialist",
        model: "deepseek-v4-pro",
        input: "payload",
        config: ["delegated_input": "draft-result"],
        delegateFrom: "Draft"
    ))
    let user = assembled.messages.first(where: { $0.role == "user" })?.content ?? ""
    #expect(user.contains("Delegated from Draft"))
}

@Test func routesToDelegatesAnalyzeChain() async throws {
    let src = """
    import Core.Tools

    agent Draft :: Analyzer Code routes_to Specialist
      model: deepseek-v4-flash

    agent Specialist :: Analyzer Code
      model: deepseek-v4-pro

    main :: IO ()
    main = do
      result <- Draft.analyze "payload"
      pure $ result
    """
    let program = try MoonParser().parse(src)
    let mock = MockLlmClient()
    _ = try await runProgram(program, options: ProgramRunOptions(
        overrides: RuntimeConfigOverrides(mock: true),
        llm: mock
    ))
    #expect(mock.callCount == 2)
}

@Test func estimateTokensFromEnglishText() {
    let pricing = loadPricingTable(path: repoRoot.appendingPathComponent("docs/model-pricing.json").path)
    let count = estimateTokensFromText("hello world", model: "deepseek-v4-flash", pricing: pricing)
    #expect(count > 0)
}

@Test func parseRootMoonfileRuntimeSections() throws {
    let path = repoRoot.appendingPathComponent("Moonfile")
    let source = try String(contentsOf: path, encoding: .utf8)
    let mf = try MoonMoonfileParser().parse(source)
    #expect(mf.package == "moon-lang-examples")
    #expect(mf.models.defaultFlash == "deepseek-v4-flash")
    #expect(mf.runtime.workerPool?.flashConcurrency == 20)
    #expect(mf.runtime.memory?.longTermBackend == "file://.moon/memory")
    #expect(mf.providers.deepseek?.apiKeyEnv == "DEEPSEEK_API_KEY")
    #expect(mf.paths.pricing == "docs/model-pricing.json")
    #expect(mf.prompts.storm?.defaultRounds == 1)
}

@Test func moonfileToRuntimeOverridesMapsSections() throws {
    let path = repoRoot.appendingPathComponent("Moonfile")
    let mf = try loadMoonfile(path: path.path)
    let overrides = moonfileToRuntimeOverrides(mf)
    #expect(overrides.memoryPath == "file://.moon/memory")
    #expect(overrides.flashConcurrency == 20)
    #expect(overrides.apiFormat == "anthropic")
    #expect(overrides.pricingPath == "docs/model-pricing.json")
}

@Test func resolveMoonfileTargetNamed() throws {
    let path = repoRoot.appendingPathComponent("Moonfile")
    let mf = try loadMoonfile(path: path.path)
    let projectRoot = path.deletingLastPathComponent().path
    let target = try resolveMoonfileTarget(mf, projectRoot: projectRoot, target: "pr-triage")
    #expect(target.name == "pr-triage")
    #expect(target.path.hasSuffix("examples/pr-triage.moon"))
}

@Test func parseMoonfileGitDependency() throws {
    let source = """
    package "demo"

    dependencies:
      Core.Tools
      github.com/moon-lang/review-kit: "0.1.0"
    """
    let doc = try MoonMoonfileParser().parse(source)
    #expect(doc.dependencies.count == 2)
    #expect(doc.containsDependency("Core.Tools"))
    #expect(doc.containsDependency("github.com/moon-lang/review-kit"))
}

@Test func vendorFixturePackage() throws {
    let fixture = repoRoot.appendingPathComponent("registry/fixtures/review-kit").path
    let outRoot = repoRoot.appendingPathComponent(".moon/vendor-test-\(UUID().uuidString)").path
    defer { try? FileManager.default.removeItem(atPath: outRoot) }

    let dep = MoonDependency.git(host: "github.com", owner: "moon-lang", repo: "review-kit", version: "0.1.0")
    let result = try vendorPackage(dep, projectRoot: outRoot, options: VendorOptions(localFixtureRoot: fixture))
    #expect(result.action == .copied)

    let manifest = try loadMoonPkgManifest(at: result.destination)
    #expect(manifest.name == "review-kit")
    #expect(manifest.exports == ["src/lib.moon"])
}

@Test func resolveVendoredGitImport() throws {
    let fixture = repoRoot.appendingPathComponent("registry/fixtures/review-kit").path
    let outRoot = repoRoot.appendingPathComponent(".moon/resolver-vendor-test").path
    defer { try? FileManager.default.removeItem(atPath: outRoot) }

    let dep = MoonDependency.git(host: "github.com", owner: "moon-lang", repo: "review-kit", version: "0.1.0")
    _ = try vendorPackage(dep, projectRoot: outRoot, options: VendorOptions(localFixtureRoot: fixture))

    let src = """
    import github.com.moon-lang.review-kit

    main :: IO ()
    main = do
      pure $ reviewSummary "ok"
    """
    let program = try MoonParser().parse(src)
    let moonfile = MoonfileDocument(
        package: "demo",
        dependencies: [dep, .core("Core.Tools")]
    )
    let resolved = resolveImports(
        program,
        options: ResolveOptions(
            entryPath: outRoot + "/main.moon",
            projectRoot: outRoot,
            moonfile: moonfile
        )
    )
    #expect(resolved.errors.isEmpty)
    #expect(resolved.imports.contains { $0.pathKey == "github.com/moon-lang/review-kit" })
    #expect(resolved.imports.first { $0.pathKey == "github.com/moon-lang/review-kit" }?.schemes["reviewSummary"] != nil)
}

@Test func semverConstraint() {
    #expect(semverSatisfies("0.3.0-swift-phase4", constraint: ">=0.3.0"))
    #expect(!semverSatisfies("0.2.0", constraint: ">=0.3.0"))
}

@Test func formatCodeAnalyzer() throws {
    let path = repoRoot.appendingPathComponent("examples/code-analyzer.moon")
    let src = try String(contentsOf: path, encoding: .utf8)
    let formatted = formatSource(src)
    #expect(formatted.count > 0)
    #expect(formatted.contains("import Core.GitHub"))
    #expect(formatted.contains("\"\"\""))
    _ = try MoonParser().parse(formatted)
}

@Test func formatIdempotent() throws {
    let src = "model Item where\n    path :: String\n"
    let once = formatSource(src)
    let twice = formatSource(once)
    #expect(twice == once)
}

@Test func lspWordAtPosition() {
    #expect(wordAtPosition("fetchOpenPRs <- x", line: 0, character: 5) == "fetchOpenPRs")
}

@Test func lspLookupCoreSymbol() throws {
    let path = repoRoot.appendingPathComponent("examples/code-analyzer.moon")
    let src = try String(contentsOf: path, encoding: .utf8)
    let program = try MoonParser().parse(src)
    let info = lookupSymbol(program, entryPath: path.path, name: "fetchOpenPRs")
    #expect(info?.module == "Core.GitHub")
    #expect(info?.type.contains("IO") == true)
}

@Test func lspDiagnosticsValidExample() throws {
    let path = repoRoot.appendingPathComponent("examples/pr-triage.moon")
    let src = try String(contentsOf: path, encoding: .utf8)
    let diags = collectDiagnostics(entryPath: path.path, text: src)
    #expect(diags.isEmpty)
}

@Test func lspImportCompletion() throws {
    let path = repoRoot.appendingPathComponent("examples/code-analyzer.moon")
    let src = try String(contentsOf: path, encoding: .utf8)
    let program = try MoonParser().parse(src)
    let items = getCompletions(program, entryPath: path.path, text: "import ", line: 0, character: 7)
    let labels = Set(items.map(\.label))
    #expect(labels.contains("Core.GitHub"))
}

@Test func buildSingleTarget() throws {
    let outDir = repoRoot.appendingPathComponent(".moon/build-test-single").path
    defer { try? FileManager.default.removeItem(atPath: outDir) }

    let moonfilePath = repoRoot.appendingPathComponent("Moonfile").path
    let results = try buildFromMoonfile(moonfilePath, options: BuildOptions(
        projectRoot: repoRoot.path,
        outDir: outDir,
        target: "pr-triage"
    ))

    #expect(results.count == 1)
    #expect(results[0].name == "pr-triage")
    #expect(results[0].ok)
}

@Test func stormRunsPanelRoundsThenSynthesizer() async throws {
    let src = """
    import Core.Tools

    agent PanelA :: Analyzer Code
      model: deepseek-v4-flash

    agent PanelB :: Analyzer Code
      model: deepseek-v4-flash

    agent Synth :: Analyzer Code
      model: deepseek-v4-pro

    main :: IO ()
    main = do
      consensus <- storm "input"
          with panel: [PanelA, PanelB]
               synthesizer: Synth
               rounds: 2
      pure $ consensus
    """
    let program = try MoonParser().parse(src)
    let mock = MockLlmClient()
    let result = try await runProgram(program, options: ProgramRunOptions(
        overrides: RuntimeConfigOverrides(mock: true),
        llm: mock
    ))
    #expect(result.dag.nodes.count > 0)
    #expect(mock.callCount == 5)
}

@Test func runtimeConfigUsesMockWithoutApiKey() {
    let config = loadRuntimeConfig(overrides: RuntimeConfigOverrides(mock: nil, apiKey: nil))
    #expect(config.useMock)
    let client = createLlmClient(config: config)
    #expect(client is MockLlmClient)
}

@Test func deepSeekApiResolvesAnthropicByDefault() {
    let api = resolveDeepSeekApi()
    #expect(api.format == .anthropic)
    #expect(api.endpoint == "/v1/messages")
}

@Test func toStrictJsonSchemaMarksRequiredFields() {
    let schema = JsonSchema.object(
        properties: ["summary": .string(), "confidence": .number(minimum: 0, maximum: 1)],
        required: ["summary", "confidence"]
    )
    let dict = toStrictJsonSchema(schema)
    #expect(dict["type"] as? String == "object")
    let required = dict["required"] as? [String] ?? []
    #expect(required.contains("summary"))
}

@Test func fileMemoryBackendPersistsAndRecalls() async throws {
    let dir = repoRoot.appendingPathComponent(".moon/mem-test-\(UUID().uuidString)").path
    defer { try? FileManager.default.removeItem(atPath: dir) }

    let backend = FileMemoryBackend(rootDir: dir)
    try await backend.set("project-knowledge", "stored knowledge")

    let pricing = loadPricingTable(path: repoRoot.appendingPathComponent("docs/model-pricing.json").path)
    let metrics = MetricsCollector(pricing: pricing)
    let memory = MemoryManager(longTermPath: dir, metrics: metrics)
    memory.register(scope: "LongTerm", name: "project-knowledge")

    if case .string(let first) = await memory.recall("project-knowledge") {
        #expect(first == "stored knowledge")
    } else {
        Issue.record("Expected string recall")
    }

    _ = await memory.recall("project-knowledge")
    let snap = metrics.snapshot()
    #expect(snap.memory.recallHits == 1)
    #expect(snap.memory.recallMisses == 1)
}

@Test func mockLlmRecordsMetrics() async throws {
    let pricing = loadPricingTable(path: repoRoot.appendingPathComponent("docs/model-pricing.json").path)
    let metrics = MetricsCollector(pricing: pricing)
    let mock = MockLlmClient(metrics: metrics, pricing: pricing)
    _ = try await mock.complete(LlmRequest(
        agent: "DocSummarizer",
        model: "deepseek-v4-flash",
        input: .string("doc"),
        schema: analyzeOutputSchema
    ))
    let snap = metrics.snapshot()
    #expect(snap.llmCalls == 1)
    #expect(snap.tokens.prompt > 0)
}

@Test func metricsCollectorTracksCost() {
    let pricing = loadPricingTable(path: repoRoot.appendingPathComponent("docs/model-pricing.json").path)
    let metrics = MetricsCollector(pricing: pricing)
    metrics.recordLlmUsage(
        model: "deepseek-v4-flash",
        usage: TokenUsage(prompt: 1000, completion: 500, cacheHit: 200, cacheMiss: 800)
    )
    metrics.recordRecall(hit: false)
    metrics.recordRecall(hit: true)
    let snap = metrics.snapshot()
    #expect(snap.llmCalls == 1)
    #expect(snap.costUsd > 0)
    #expect(snap.memory.recallHits == 1)
    #expect(snap.memory.recallMisses == 1)
}

@Test func validateSchemaRejectsInvalidConfidence() {
    let schema = JsonSchema.object(
        properties: [
            "summary": .string(),
            "confidence": .number(minimum: 0, maximum: 1),
        ],
        required: ["summary", "confidence"]
    )
    let valid = RuntimeValue.record(typeName: nil, fields: [
        "summary": .string("ok"),
        "confidence": .double(0.8),
    ])
    let invalid = RuntimeValue.record(typeName: nil, fields: [
        "summary": .string("ok"),
        "confidence": .double(1.5),
    ])
    #expect(throws: Never.self) { try validateAgainstSchema(schema, valid) }
    #expect(throws: LlmValidationError.self) { try validateAgainstSchema(schema, invalid) }
}

@Test func parseJsonContentExtractsFencedJson() throws {
    let raw = """
    Here is the result:
    ```json
    {"summary":"ok","confidence":0.5}
    ```
    """
    let value = try parseJsonContent(raw)
    if case .record(_, let fields) = value,
       case .string(let summary) = fields["summary"] {
        #expect(summary == "ok")
    } else {
        Issue.record("Expected record with summary")
    }
}

@Test func workerPoolRunAllPreservesOrder() async throws {
    let pool = WorkerPool(config: WorkerPoolConfig(flashConcurrency: 4, proConcurrency: 2))
    let results = try await pool.runAll(.flash, (0..<5).map { index in
        { index }
    })
    #expect(results == [0, 1, 2, 3, 4])
    #expect(modelToTier("deepseek-v4-flash") == .flash)
    #expect(modelToTier("deepseek-v4-pro") == .pro)
}

@Test func typecheckExamples() throws {
    for name in ["code-analyzer", "code-reviewer", "doc-summarizer", "pr-triage", "requirements-check"] {
        let examplePath = repoRoot.appendingPathComponent("examples/\(name).moon")
        let src = try String(contentsOf: examplePath, encoding: .utf8)
        let program = try MoonParser().parse(src)
        let result = MoonTypechecker().check(
            program,
            options: TypecheckOptions(entryPath: examplePath.path, projectRoot: repoRoot.path)
        )
        #expect(result.ok, "typecheck \(name) failed: \(result.errors.joined(separator: "; "))")
    }
}

private func assertGoldenDag(name: String) throws {
    let examplePath = repoRoot.appendingPathComponent("examples/code-analyzer.moon")
    let goldenPath = repoRoot.appendingPathComponent("legacy/tests/golden/dag/\(name).json")

    let src = try String(contentsOf: examplePath, encoding: .utf8)
    let program = try MoonParser().parse(src)
    guard let dag = planFunction(program, functionName: "main") else {
        Issue.record("Expected main DAG for \(name)")
        return
    }

    let actualData = try JSONEncoder().encode(dag)
    let actualObj = try JSONSerialization.jsonObject(with: actualData) as? [String: Any]
    let expectedData = try Data(contentsOf: goldenPath)
    let expectedObj = try JSONSerialization.jsonObject(with: expectedData) as? [String: Any]

    if let diff = firstJsonDiff(actualObj as Any, expectedObj) {
        Issue.record("DAG mismatch for \(name) at \(diff.path): actual=\(diff.actual) expected=\(diff.expected)")
    }
    #expect(firstJsonDiff(actualObj as Any, expectedObj) == nil)
}

private func assertGolden(name: String) throws {
    let examplePath = repoRoot.appendingPathComponent("examples/\(name).moon")
    let goldenPath = repoRoot.appendingPathComponent("legacy/tests/golden/\(name).json")

    let src = try String(contentsOf: examplePath, encoding: .utf8)
    let program = try MoonParser().parse(src)
    let actual = MoonASTLegacyExport.export(program)
    let expectedData = try Data(contentsOf: goldenPath)
    let expectedObj = try JSONSerialization.jsonObject(with: expectedData) as? [String: Any]

    if let diff = firstJsonDiff(actual, expectedObj) {
        Issue.record("AST mismatch for \(name) at \(diff.path): actual=\(diff.actual) expected=\(diff.expected)")
    }
    #expect(firstJsonDiff(actual, expectedObj) == nil)
}

private struct JsonDiff {
    var path: String
    var actual: String
    var expected: String
}

private func firstJsonDiff(_ lhs: Any, _ rhs: Any?, path: String = "$") -> JsonDiff? {
    guard let rhs else {
        return JsonDiff(path: path, actual: stringify(lhs), expected: "nil")
    }

    if let ld = lhs as? [String: Any], let rd = rhs as? [String: Any] {
        let lk = Set(ld.keys)
        let rk = Set(rd.keys)
        for key in lk.subtracting(rk) {
            return JsonDiff(path: "\(path).\(key)", actual: stringify(ld[key]!), expected: "missing")
        }
        for key in rk.subtracting(lk) {
            return JsonDiff(path: "\(path).\(key)", actual: "missing", expected: stringify(rd[key]!))
        }
        for key in lk.intersection(rk) {
            if let diff = firstJsonDiff(ld[key]!, rd[key]!, path: "\(path).\(key)") {
                return diff
            }
        }
        return nil
    }

    if let la = lhs as? [Any], let ra = rhs as? [Any] {
        if la.count != ra.count {
            return JsonDiff(path: path, actual: "count \(la.count)", expected: "count \(ra.count)")
        }
        for (index, pair) in zip(la, ra).enumerated() {
            if let diff = firstJsonDiff(pair.0, pair.1, path: "\(path)[\(index)]") {
                return diff
            }
        }
        return nil
    }

    if let ln = lhs as? NSNumber, let rn = rhs as? NSNumber {
        if ln.doubleValue != rn.doubleValue { return JsonDiff(path: path, actual: "\(ln)", expected: "\(rn)") }
        return nil
    }

    if let ld = lhs as? Double, let rd = rhs as? NSNumber {
        if ld != rd.doubleValue { return JsonDiff(path: path, actual: "\(ld)", expected: "\(rd)") }
        return nil
    }

    if let ls = lhs as? String, let rs = rhs as? String {
        if ls != rs { return JsonDiff(path: path, actual: ls, expected: rs) }
        return nil
    }

    if let lb = lhs as? Bool, let rb = rhs as? Bool {
        if lb != rb { return JsonDiff(path: path, actual: "\(lb)", expected: "\(rb)") }
        return nil
    }

    if let li = lhs as? Int, let ri = rhs as? NSNumber {
        if Int64(li) != ri.int64Value { return JsonDiff(path: path, actual: "\(li)", expected: "\(ri)") }
        return nil
    }

    return JsonDiff(path: path, actual: stringify(lhs), expected: stringify(rhs))
}

private func stringify(_ value: Any) -> String {
    if let data = try? JSONSerialization.data(withJSONObject: value, options: [.sortedKeys]),
       let str = String(data: data, encoding: .utf8) {
        return str
    }
    return String(describing: value)
}
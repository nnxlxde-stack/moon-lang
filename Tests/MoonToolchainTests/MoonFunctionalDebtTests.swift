import Foundation
import Testing
@testable import MoonRuntime
import MoonAST
import MoonParser
import MoonMoonfile
import MoonRegistry
import MoonResolver
import MoonPrompt
import MoonSchemaCompiler
import MoonLSP

private let repoRoot: URL = {
    var dir = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
    while dir.path != "/" && dir.path != dir.deletingLastPathComponent().path {
        if FileManager.default.fileExists(atPath: dir.appendingPathComponent("Package.swift").path) {
            return dir
        }
        dir = dir.deletingLastPathComponent()
    }
    fatalError("Could not locate repo root")
}()

// MARK: - Registry / builtins

@Test func coreModuleBuiltinsExposeSymbols() {
    #expect(coreModuleBuiltins["Core.GitHub"]?.contains("fetchOpenPRs") == true)
    #expect(coreModuleBuiltins["Core.Tools"]?.contains("saveToFile") == true)
}

@Test func builtinsGatedByImports() throws {
    let src = """
    main :: IO ()
    main = do
      fetchOpenPRs "org/repo"
    """
    let program = try MoonParser().parse(src)
    let builtins = builtinsFromImports(program)
    #expect(!builtins.contains("fetchOpenPRs"))
}

@Test func builtinsExposedWhenCoreGitHubImported() throws {
    let src = """
    import Core.GitHub

    main :: IO ()
    main = do
      openPRs <- fetchOpenPRs "org/repo"
      pure $ openPRs
    """
    let program = try MoonParser().parse(src)
    let builtins = builtinsFromImports(program)
    #expect(builtins.contains("fetchOpenPRs"))
    #expect(!builtins.contains("saveToFile"))
}

@Test func gitRemoteURLSupportsMultipleHosts() {
    #expect(gitRemoteURL(host: "github.com", owner: "org", repo: "lib") == "https://github.com/org/lib.git")
    #expect(gitRemoteURL(host: "gitlab.com", owner: "org", repo: "lib") == "https://gitlab.com/org/lib.git")
    #expect(gitRemoteURL(host: "git.example.com", owner: "org", repo: "lib") == "https://git.example.com/org/lib.git")
}

@Test func parsePackageRefMonorepoSubpath() throws {
    let dep = try parsePackageRef("github.com/nnxlxde-stack/moon-pkg/review-kit@0.1.0")
    if case .git(let host, let owner, let repo, let package, let version) = dep {
        #expect(host == "github.com")
        #expect(owner == "nnxlxde-stack")
        #expect(repo == "moon-pkg")
        #expect(package == "review-kit")
        #expect(version == "0.1.0")
        #expect(gitTagForDependency(dep) == "review-kit/v0.1.0")
        #expect(monorepoPackageSubpath(dep) == "packages/review-kit")
    } else {
        Issue.record("Expected monorepo git dependency")
    }
}

@Test func vendorMonorepoFixturePackage() throws {
    let fixture = repoRoot.appendingPathComponent("Tests/fixtures/review-kit").path
    let outRoot = repoRoot.appendingPathComponent(".moon/vendor-monorepo-test").path
    defer { try? FileManager.default.removeItem(atPath: outRoot) }

    let dep = MoonDependency.git(
        host: "github.com",
        owner: "nnxlxde-stack",
        repo: "moon-pkg",
        package: "review-kit",
        version: "0.1.0"
    )
    let result = try vendorPackage(dep, projectRoot: outRoot, options: VendorOptions(localFixtureRoot: fixture))
    #expect(result.action == .copied)

    let manifest = try loadMoonPkgManifest(at: result.destination)
    #expect(manifest.name == "review-kit")
}

@Test func resolveMonorepoVendoredImport() throws {
    let fixture = repoRoot.appendingPathComponent("Tests/fixtures/review-kit").path
    let outRoot = repoRoot.appendingPathComponent(".moon/resolver-monorepo-test").path
    defer { try? FileManager.default.removeItem(atPath: outRoot) }

    let dep = MoonDependency.git(
        host: "github.com",
        owner: "nnxlxde-stack",
        repo: "moon-pkg",
        package: "review-kit",
        version: "0.1.0"
    )
    _ = try vendorPackage(dep, projectRoot: outRoot, options: VendorOptions(localFixtureRoot: fixture))

    let src = """
    import github.com.nnxlxde-stack.moon-pkg.review-kit

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
        options: ResolveOptions(entryPath: outRoot + "/main.moon", projectRoot: outRoot, moonfile: moonfile)
    )
    #expect(resolved.errors.isEmpty)
    #expect(resolved.imports.contains { $0.pathKey == dep.key })
}

@Test func parsePackageRefGitLab() throws {
    let dep = try parsePackageRef("gitlab.com/acme/toolkit@2.0.0")
    if case .git(let host, let owner, let repo, let package, let version) = dep {
        #expect(host == "gitlab.com")
        #expect(owner == "acme")
        #expect(repo == "toolkit")
        #expect(package == nil)
        #expect(version == "2.0.0")
    } else {
        Issue.record("Expected git dependency")
    }
}

// MARK: - Moonfile

@Test func findMoonfileLocatesProjectManifest() {
    let examplesDir = repoRoot.appendingPathComponent("examples").path
    let found = findMoonfile(startDir: examplesDir)
    #expect(found == repoRoot.appendingPathComponent("Moonfile").path)
}

@Test func parseRootMoonfileDependencies() throws {
    let path = repoRoot.appendingPathComponent("Moonfile")
    let source = try String(contentsOf: path, encoding: .utf8)
    let mf = try MoonMoonfileParser().parse(source)
    #expect(mf.dependencies.contains(where: { $0.key == "Core.GitHub" }))
    #expect(mf.dependencies.contains(where: { $0.key == "Core.Tools" }))
    #expect(mf.targets["analyzer"] == "examples/code-analyzer.moon")
    #expect(mf.targets["pr-triage"] == "examples/pr-triage.moon")
}

// MARK: - Pure parse

@Test func parsePureExpressionVariants() throws {
    _ = try MoonParser().parse("main :: IO ()\nmain = pure $ \"ok\"")
    _ = try MoonParser().parse("main :: IO String\nmain = pure \"ok\"")
    _ = try MoonParser().parse("main :: IO ()\nmain = pure ()")
}

@Test func parseCoreToolsStdlibWithoutErrors() throws {
    let path = repoRoot.appendingPathComponent("stdlib/Core/Tools.moon")
    let source = try String(contentsOf: path, encoding: .utf8)
    _ = try MoonParser().parse(source)
    let diags = collectDiagnostics(entryPath: path.path, text: source)
    #expect(diags.isEmpty)
}

// MARK: - Prompt golden

@Test func promptMatchesGoldenStructure() {
    let goldenPath = repoRoot.appendingPathComponent("Tests/fixtures/golden/prompts/code-analyzer-agent.json")
    let goldenData = try! Data(contentsOf: goldenPath)
    let golden = try! JSONSerialization.jsonObject(with: goldenData) as! [String: Any]
    let systemContains = golden["systemContains"] as! [String]
    let userContains = golden["userContains"] as! [String]

    let assembled = assemblePrompt(AssemblyInput(
        agent: "CodeAnalyzer",
        model: "deepseek-v4-pro",
        systemPrompt: "Analyze code.",
        role: "reviewer",
        focus: ["security"],
        input: "path: src/main.cpp",
        config: ["context": "ctx"]
    ))

    let system = assembled.messages.first(where: { $0.role == "system" })?.content ?? ""
    let user = assembled.messages.first(where: { $0.role == "user" })?.content ?? ""
    for part in systemContains { #expect(system.contains(part)) }
    for part in userContains { #expect(user.contains(part)) }
    #expect(!user.contains("\"config\""))
}

// MARK: - Schema golden

@Test func goldenSchemaAnalysisResult() throws {
    try assertGoldenSchemaFile(name: "AnalysisResult", example: "code-analyzer", modelNames: ["AnalysisResult"])
}

@Test func goldenSchemaCodeReviewer() throws {
    try assertGoldenSchemaFile(name: "code-reviewer-schemas", example: "code-reviewer", modelNames: ["ReviewResult", "Finding", "Verdict"])
}

// MARK: - LLM trace

@Test func llmTraceWriterCreatesManifestAndMessages() async throws {
    let baseDir = repoRoot.appendingPathComponent(".moon/trace-test-\(UUID().uuidString)").path
    defer { try? FileManager.default.removeItem(atPath: baseDir) }

    let writer = try await LlmTraceWriter.create(baseDir: baseDir)
    try await writer.record(
        agent: "TestAgent",
        model: "deepseek-v4-flash",
        messages: [
            LlmChatMessage(role: "system", content: "system text"),
            LlmChatMessage(role: "user", content: "user text"),
        ],
        schema: .object(properties: ["summary": .string(enumValues: nil)]),
        response: .string("ok"),
        durationMs: 12
    )

    let manifest = (writer.runDir as NSString).appendingPathComponent("manifest.json")
    let messages = (writer.runDir as NSString).appendingPathComponent("001-TestAgent-messages.txt")
    #expect(FileManager.default.fileExists(atPath: manifest))
    #expect(FileManager.default.fileExists(atPath: messages))
    #expect(writer.snapshot().entries.count == 1)
    #expect(writer.snapshot().entries[0].agent == "TestAgent")
}

@Test func traceDiffReportsAgentDifferences() throws {
    let baseDir = repoRoot.appendingPathComponent(".moon/trace-diff-test-\(UUID().uuidString)").path
    defer { try? FileManager.default.removeItem(atPath: baseDir) }

    let runA = (baseDir as NSString).appendingPathComponent("run-a")
    let runB = (baseDir as NSString).appendingPathComponent("run-b")
    try FileManager.default.createDirectory(atPath: runA, withIntermediateDirectories: true)
    try FileManager.default.createDirectory(atPath: runB, withIntermediateDirectories: true)

    let manifestA: [String: Any] = ["entries": [["id": "001", "agent": "AgentA", "model": "flash"]]]
    let manifestB: [String: Any] = ["entries": [["id": "001", "agent": "AgentB", "model": "flash"]]]
    try JSONSerialization.data(withJSONObject: manifestA).write(to: URL(fileURLWithPath: (runA as NSString).appendingPathComponent("manifest.json")))
    try JSONSerialization.data(withJSONObject: manifestB).write(to: URL(fileURLWithPath: (runB as NSString).appendingPathComponent("manifest.json")))
    try "system A".write(toFile: (runA as NSString).appendingPathComponent("001-AgentA-messages.txt"), atomically: true, encoding: .utf8)
    try "system B".write(toFile: (runB as NSString).appendingPathComponent("001-AgentB-messages.txt"), atomically: true, encoding: .utf8)

    let diff = try diffTraceRuns("run-a", "run-b", baseDir: baseDir) ?? ""
    #expect(diff.contains("Only in A: AgentA"))
    #expect(diff.contains("Only in B: AgentB"))
}

// MARK: - DeepSeek API

@Test func deepSeekApiBetaModeUsesOpenAiBetaBase() {
    let api = resolveDeepSeekApi(apiFormat: .openai, useBeta: true)
    #expect(api.baseUrl == deepSeekBetaBase)
    #expect(api.endpoint == "/chat/completions")
    #expect(api.useBeta)
}

@Test func extractAnthropicContentFromTextBlocks() {
    let raw = extractAnthropicContent([
        "content": [["type": "text", "text": "{\"summary\":\"ok\",\"confidence\":0.5}"]],
    ])
    #expect(raw.contains("summary"))
}

@Test func extractOpenAiContentFromReasoningFallback() {
    let raw = extractOpenAiContent([
        "choices": [[
            "message": [
                "content": "",
                "reasoning_content": "{\"summary\":\"ok\",\"confidence\":0.9}",
            ],
        ]],
    ])
    #expect(raw.contains("summary"))
    let value = try! parseJsonContent(raw)
    if case .record(_, let fields) = value, case .string(let summary) = fields["summary"] {
        #expect(summary == "ok")
    } else {
        Issue.record("Expected parsed summary")
    }
}

// MARK: - Native tokenizer

@Test func nativeTokenizerCountsTokensWhenAvailable() {
    resetTokenizerCacheForTests()
    let tokenizerPath = repoRoot.appendingPathComponent("deepseek-tokenizer").path
    guard FileManager.default.fileExists(atPath: URL(fileURLWithPath: tokenizerPath).appendingPathComponent("tokenizer.json").path) else {
        return
    }
    configureTokenizer(path: tokenizerPath)
    let pricing = loadPricingTable(path: repoRoot.appendingPathComponent("docs/model-pricing.json").path)
    let nativeCount = countTokens("hello world from moon tokenizer", model: "deepseek-v4-flash", pricing: pricing)
    let estimateCount = estimateTokensFromText("hello world from moon tokenizer", model: "deepseek-v4-flash", pricing: pricing)
    #expect(nativeCount > 0)
    #expect(nativeCount != estimateCount || nativeCount > 3)
    resetTokenizerCacheForTests()
}

// MARK: - Helpers

private func assertGoldenSchemaFile(name: String, example: String, modelNames: [String]) throws {
    let examplePath = repoRoot.appendingPathComponent("examples/\(example).moon")
    let goldenPath = repoRoot.appendingPathComponent("Tests/fixtures/golden/schemas/\(name).json")
    let src = try String(contentsOf: examplePath, encoding: .utf8)
    let program = try MoonParser().parse(src)
    let result = compileSchemas(program)

    let encoder = JSONEncoder()
    encoder.outputFormatting = [.sortedKeys]

    let actualData: Data
    if modelNames.count == 1, let schema = result.schemas[modelNames[0]] {
        actualData = try encoder.encode(schema)
    } else {
        var dict: [String: MoonJsonSchema] = [:]
        for modelName in modelNames {
            guard let schema = result.schemas[modelName] else {
                Issue.record("Missing schema \(modelName)")
                return
            }
            dict[modelName] = schema
        }
        actualData = try encoder.encode(dict)
    }

    let expectedData = try Data(contentsOf: goldenPath)
    let actualObj = try JSONSerialization.jsonObject(with: actualData)
    let expectedObj = try JSONSerialization.jsonObject(with: expectedData)
    if let diff = schemaJsonDiff(actualObj, expectedObj) {
        Issue.record("Schema golden mismatch for \(name) at \(diff.path): actual=\(diff.actual) expected=\(diff.expected)")
    }
    #expect(schemaJsonDiff(actualObj, expectedObj) == nil)
}

private struct SchemaJsonDiff {
    var path: String
    var actual: String
    var expected: String
}

private func schemaJsonDiff(_ lhs: Any, _ rhs: Any?, path: String = "$") -> SchemaJsonDiff? {
    guard let rhs else {
        return SchemaJsonDiff(path: path, actual: schemaStringify(lhs), expected: "nil")
    }

    if let ld = lhs as? [String: Any], let rd = rhs as? [String: Any] {
        let lk = Set(ld.keys)
        let rk = Set(rd.keys)
        for key in lk.subtracting(rk) {
            return SchemaJsonDiff(path: "\(path).\(key)", actual: schemaStringify(ld[key]!), expected: "missing")
        }
        for key in rk.subtracting(lk) {
            return SchemaJsonDiff(path: "\(path).\(key)", actual: "missing", expected: schemaStringify(rd[key]!))
        }
        for key in lk.intersection(rk).sorted() {
            if let diff = schemaJsonDiff(ld[key]!, rd[key]!, path: "\(path).\(key)") {
                return diff
            }
        }
        return nil
    }

    if let la = lhs as? [Any], let ra = rhs as? [Any] {
        if la.count != ra.count {
            return SchemaJsonDiff(path: path, actual: "count \(la.count)", expected: "count \(ra.count)")
        }
        for (index, pair) in zip(la, ra).enumerated() {
            if let diff = schemaJsonDiff(pair.0, pair.1, path: "\(path)[\(index)]") {
                return diff
            }
        }
        return nil
    }

    if let ln = lhs as? NSNumber, let rn = rhs as? NSNumber {
        if ln.doubleValue != rn.doubleValue {
            return SchemaJsonDiff(path: path, actual: "\(ln)", expected: "\(rn)")
        }
        return nil
    }

    if let ls = lhs as? String, let rs = rhs as? String {
        if ls != rs { return SchemaJsonDiff(path: path, actual: ls, expected: rs) }
        return nil
    }

    if let lb = lhs as? Bool, let rb = rhs as? Bool {
        if lb != rb { return SchemaJsonDiff(path: path, actual: "\(lb)", expected: "\(rb)") }
        return nil
    }

    return SchemaJsonDiff(path: path, actual: schemaStringify(lhs), expected: schemaStringify(rhs))
}

private func schemaStringify(_ value: Any) -> String {
    if let data = try? JSONSerialization.data(withJSONObject: value, options: [.sortedKeys]),
       let str = String(data: data, encoding: .utf8) {
        return str
    }
    return String(describing: value)
}
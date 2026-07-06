import Foundation
import Testing
import MoonParser
import MoonRuntime

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

@Suite(.serialized)
struct SerializedRuntimeTests {
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
}
import Foundation
import Testing
import MoonParser
import MoonRuntime
@testable import MoonUI

@Test func collectDataConstructorsIncludesCoreUI() throws {
    let source = """
    import Core.UI
    data CounterMsg = Increment | Decrement
    main :: App Int CounterMsg
    main = App { init = (0, NoCmd), update = counterUpdate, view = counterView }
    """
    let program = try MoonParser().parse(source)
    let runtimeProgram = programWithImportedStdlib(program)
    let constructors = collectDataConstructors(runtimeProgram)
    #expect(constructors.contains("NoCmd"))
    #expect(constructors.contains("Increment"))
    #expect(constructors.contains("Decrement"))
    #expect(findUserFunction(runtimeProgram, "padding") != nil)
}

@Test func loadsUiCounterAppSession() async throws {
    let path = URL(fileURLWithPath: #filePath)
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .appendingPathComponent("examples/ui-counter.moon")
    let source = try String(contentsOf: path, encoding: .utf8)
    let program = try MoonParser().parse(source)
    let session = try await MoonAppRunner().load(program: program, options: MoonUIRunOptions())
    if case .int(let value) = session.model {
        #expect(value == 0)
    } else {
        Issue.record("Expected Int model for ui-counter")
    }
    _ = try await session.buildScene(width: 480, height: 360)
}

@Test func loadsUiInputListAppSession() async throws {
    let path = URL(fileURLWithPath: #filePath)
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .appendingPathComponent("examples/ui-input-list.moon")
    let source = try String(contentsOf: path, encoding: .utf8)
    let program = try MoonParser().parse(source)
    let session = try await MoonAppRunner().load(program: program, options: MoonUIRunOptions())
    if case .record(let typeName, _) = session.model, typeName == "DemoModel" {
        #expect(Bool(true))
    } else {
        Issue.record("Expected DemoModel for ui-input-list")
    }
}
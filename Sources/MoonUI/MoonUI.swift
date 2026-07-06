import Foundation
import MoonAST
import MoonRuntime

public enum MoonUIVersion {
    public static let current = "0.1.0"
}

public enum MoonUIError: Error, Sendable {
    case unsupportedPlatform(String)
    case invalidApp(String)
    case windowCreationFailed
    case renderFailed(String)
}

public struct MoonUIRunOptions: Sendable {
    public var mock: Bool
    public var title: String
    public var width: Int32
    public var height: Int32

    public init(
        mock: Bool = true,
        title: String = "Moon UI",
        width: Int32 = 480,
        height: Int32 = 360
    ) {
        self.mock = mock
        self.title = title
        self.width = width
        self.height = height
    }
}

public struct MoonUI {
    public init() {}

    public func isAppProgram(_ program: Program) -> Bool {
        isAppMainProgram(program)
    }

    public func run(program: Program, options: MoonUIRunOptions = MoonUIRunOptions()) async throws {
        let runner = MoonAppRunner()
        let session = try await runner.load(program: program, options: options)
        try runUI(session: session)
    }
}

public func runUI(session: MoonAppSession) throws {
    #if os(Windows)
    try WinUIHost.run(session)
    #else
    throw MoonUIError.unsupportedPlatform("MoonUI desktop runtime requires Windows in v0.1")
    #endif
}
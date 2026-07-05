import Testing
@testable import MoonAST

@Test func programRoundTripWithoutSpans() throws {
    let program = Program(
        declarations: [
            .importDecl(path: ["Core", "Tools"], alias: nil, span: .zero),
        ],
        span: .zero
    )

    let stripped = try MoonASTStrip.stripSpans(program)
    let json = String(data: stripped, encoding: .utf8)!
    #expect(json.contains("importDecl"))
    #expect(!json.contains("\"span\""))
}

@Test func astVersionIsSet() {
    #expect(!MoonASTVersion.current.isEmpty)
}
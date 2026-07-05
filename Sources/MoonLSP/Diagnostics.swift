import Foundation
import MoonLexer
import MoonMoonfile
import MoonParser
import MoonResolver
import MoonTypechecker
import MoonTypes

public struct MoonDiagnostic: Sendable, Equatable {
    public var message: String
    public var line: Int
    public var character: Int
    public var endCharacter: Int
    public var source: String

    public init(message: String, line: Int, character: Int, endCharacter: Int, source: String = "moon") {
        self.message = message
        self.line = line
        self.character = character
        self.endCharacter = endCharacter
        self.source = source
    }
}

public func collectDiagnostics(entryPath: String, text: String) -> [MoonDiagnostic] {
    do {
        let program = try MoonParser().parse(text)
        let entryURL = URL(fileURLWithPath: entryPath).standardizedFileURL
        let projectRoot = findMoonfile(startDir: entryURL.deletingLastPathComponent().path)
            .map { URL(fileURLWithPath: $0).deletingLastPathComponent().path }
            ?? entryURL.deletingLastPathComponent().path

        resetVarSupply()
        let prelude = buildPrelude()
        var env = createEnv(values: prelude.values, classes: prelude.classes)
        let resolved = resolveImports(program, options: ResolveOptions(
            entryPath: entryURL.path,
            projectRoot: projectRoot
        ))
        let importErrors = applyImportsToEnv(&env.values, resolved)
        var diags = importErrors.map { err in
            MoonDiagnostic(
                message: err.message,
                line: max(0, err.line - 1),
                character: max(0, err.column - 1),
                endCharacter: max(0, err.column + 20)
            )
        }
        let result = checkProgram(program, env: &env)
        for err in result.errors {
            diags.append(MoonDiagnostic(
                message: err.message,
                line: max(0, err.line - 1),
                character: max(0, err.column - 1),
                endCharacter: max(0, err.column + 20)
            ))
        }
        return diags
    } catch let err as ParseError {
        return [MoonDiagnostic(
            message: err.description,
            line: max(0, err.line - 1),
            character: max(0, err.column - 1),
            endCharacter: err.column + 10
        )]
    } catch let err as LexError {
        return [MoonDiagnostic(
            message: err.description,
            line: max(0, err.line - 1),
            character: max(0, err.column - 1),
            endCharacter: err.column + 10
        )]
    } catch {
        return []
    }
}
import Foundation
import MoonAST
import MoonParser
import MoonResolver
import MoonTypes

public enum MoonTypecheckerVersion {
    public static let current = "0.3.0"
}

public struct TypecheckResult: Sendable {
    public var ok: Bool
    public var errors: [String]

    public init(ok: Bool, errors: [String] = []) {
        self.ok = ok
        self.errors = errors
    }
}

public struct TypecheckOptions: Sendable {
    public var entryPath: String?
    public var projectRoot: String?

    public init(entryPath: String? = nil, projectRoot: String? = nil) {
        self.entryPath = entryPath
        self.projectRoot = projectRoot
    }
}

public struct MoonTypechecker {
    public init() {}

    public func check(_ program: Program, options: TypecheckOptions = TypecheckOptions()) -> TypecheckResult {
        resetVarSupply()
        let prelude = buildPrelude()
        var env = createEnv(values: prelude.values, classes: prelude.classes)

        if let entryPath = options.entryPath {
            let entryURL = URL(fileURLWithPath: entryPath).standardizedFileURL
            let projectRoot = options.projectRoot ?? entryURL.deletingLastPathComponent().path
            let resolved = resolveImports(program, options: ResolveOptions(entryPath: entryURL.path, projectRoot: projectRoot))
            let importErrors = applyImportsToEnv(&env.values, resolved)
            if !importErrors.isEmpty {
                return TypecheckResult(
                    ok: false,
                    errors: importErrors.map { "\($0.message) at \($0.line):\($0.column)" }
                )
            }

            var checkEnv = env
            for imp in resolved.imports where imp.pathKey == "Core.UI" {
                guard let path = imp.filePath,
                      FileManager.default.fileExists(atPath: path),
                      let source = try? String(contentsOfFile: path, encoding: .utf8),
                      let stdlibProgram = try? MoonParser().parse(source) else { continue }
                registerTopLevelDeclarations(stdlibProgram, env: &checkEnv)
            }
            env = checkEnv
        }

        var checkEnv = env
        let result = checkProgram(program, env: &checkEnv)
        return TypecheckResult(
            ok: result.ok,
            errors: result.errors.map(\.description)
        )
    }
}
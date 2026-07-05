import Foundation
import MoonAST
import MoonMoonfile
import MoonParser
import MoonPlanner
import MoonResolver
import MoonSchemaCompiler
import MoonTypechecker

public enum MoonBuildVersion {
    public static let current = "0.3.0"
}

public struct BuildTargetResult: Sendable {
    public var name: String
    public var sourcePath: String
    public var outputDir: String
    public var ok: Bool
    public var errors: [String]
    public var warnings: [String]

    public init(
        name: String,
        sourcePath: String,
        outputDir: String,
        ok: Bool,
        errors: [String],
        warnings: [String]
    ) {
        self.name = name
        self.sourcePath = sourcePath
        self.outputDir = outputDir
        self.ok = ok
        self.errors = errors
        self.warnings = warnings
    }
}

public struct BuildOptions: Sendable {
    public var projectRoot: String
    public var outDir: String?
    public var entryFn: String
    public var target: String?

    public init(
        projectRoot: String,
        outDir: String? = nil,
        entryFn: String = "main",
        target: String? = nil
    ) {
        self.projectRoot = projectRoot
        self.outDir = outDir
        self.entryFn = entryFn
        self.target = target
    }
}

private struct BuildImportInfo: Codable {
    var path: String
    var filePath: String?
    var symbols: [String]
}

private struct BuildPayload: Codable {
    var target: String
    var source: String
    var entry: String
    var builtAt: String
    var sourceHash: String
    var imports: [BuildImportInfo]
    var schemas: [String: MoonJsonSchema]
    var warnings: [SchemaWarningPayload]
    var dag: ExecutionDag?
}

private struct SchemaWarningPayload: Codable {
    var message: String
    var line: Int
    var column: Int
}

public func buildSource(
    _ sourcePath: String,
    targetName: String,
    options: BuildOptions
) throws -> BuildTargetResult {
    let projectRootURL = URL(fileURLWithPath: options.projectRoot).standardizedFileURL
    let absoluteSource = projectRootURL.appendingPathComponent(sourcePath).standardizedFileURL
    let source = try String(contentsOf: absoluteSource, encoding: .utf8)
    let program = try MoonParser().parse(source)

    let moonfile: MoonfileDocument?
    if let moonfilePath = findMoonfile(startDir: projectRootURL.path) {
        moonfile = try? loadMoonfile(path: moonfilePath)
    } else {
        moonfile = nil
    }

    let check = MoonTypechecker().check(
        program,
        options: TypecheckOptions(
            entryPath: absoluteSource.path,
            projectRoot: projectRootURL.path
        )
    )

    if !check.ok {
        return BuildTargetResult(
            name: targetName,
            sourcePath: absoluteSource.path,
            outputDir: "",
            ok: false,
            errors: check.errors,
            warnings: []
        )
    }

    let schemaResult = compileSchemas(program)
    let dag = planFunction(program, functionName: options.entryFn)
    let resolved = resolveImports(
        program,
        options: ResolveOptions(
            entryPath: absoluteSource.path,
            projectRoot: projectRootURL.path,
            moonfile: moonfile
        )
    )

    let baseOut = options.outDir ?? projectRootURL.appendingPathComponent(".moon/build").path
    let outputDir = URL(fileURLWithPath: baseOut).appendingPathComponent(targetName).path
    try FileManager.default.createDirectory(atPath: outputDir, withIntermediateDirectories: true)

    let sourceHash = sha256Hex(Data(source.utf8))

    let imports = resolved.imports
        .map { imp in
            BuildImportInfo(
                path: imp.pathKey,
                filePath: imp.filePath,
                symbols: imp.schemes.keys.sorted()
            )
        }
        .sorted { $0.path < $1.path }

    let payload = BuildPayload(
        target: targetName,
        source: sourcePath,
        entry: options.entryFn,
        builtAt: ISO8601DateFormatter().string(from: Date()),
        sourceHash: sourceHash,
        imports: imports,
        schemas: schemaResult.schemas,
        warnings: schemaResult.warnings.map {
            SchemaWarningPayload(message: $0.message, line: $0.line, column: $0.column)
        },
        dag: dag
    )

    let encoder = JSONEncoder()
    encoder.outputFormatting = [.sortedKeys, .prettyPrinted]
    let buildData = try encoder.encode(payload)
    try buildData.write(to: URL(fileURLWithPath: outputDir).appendingPathComponent("build.json"))

    let schemasData = try encoder.encode(schemaResult.schemas)
    try schemasData.write(to: URL(fileURLWithPath: outputDir).appendingPathComponent("schemas.json"))

    if let dag {
        let dagData = try encoder.encode(dag)
        try dagData.write(to: URL(fileURLWithPath: outputDir).appendingPathComponent("dag.json"))
    }

    let warnings = schemaResult.warnings.map { "\($0.message) at \($0.line):\($0.column)" }
    return BuildTargetResult(
        name: targetName,
        sourcePath: absoluteSource.path,
        outputDir: outputDir,
        ok: true,
        errors: [],
        warnings: warnings
    )
}

public func buildFromMoonfile(_ moonfilePath: String, options: BuildOptions) throws -> [BuildTargetResult] {
    let moonfile = try loadMoonfile(path: moonfilePath)
    let projectRoot = options.projectRoot.isEmpty
        ? URL(fileURLWithPath: moonfilePath).deletingLastPathComponent().path
        : options.projectRoot

    let targets: [(String, String)]
    if let target = options.target {
        guard let source = moonfile.targets[target] else {
            throw MoonBuildError.targetNotFound(target)
        }
        targets = [(target, source)]
    } else if moonfile.targets.isEmpty {
        throw MoonBuildError.noTargets
    } else {
        targets = moonfile.targets.sorted { $0.key < $1.key }
    }

    var results: [BuildTargetResult] = []
    for (name, source) in targets {
        var opts = options
        opts.projectRoot = projectRoot
        results.append(try buildSource(source, targetName: name, options: opts))
    }
    return results
}

public enum MoonBuildError: Error, CustomStringConvertible {
    case targetNotFound(String)
    case noTargets

    public var description: String {
        switch self {
        case .targetNotFound(let name): return "Target not found in Moonfile: \(name)"
        case .noTargets: return "Moonfile has no targets"
        }
    }
}
import Foundation
import MoonAST
import MoonLexer
import MoonMoonfile
import MoonParser
import MoonBuild
import MoonFormatter
import MoonLSP
import MoonPlanner
import MoonRegistry
import MoonRuntime
import MoonTypechecker

enum MoonCommand: String {
    case check
    case run
    case build
    case plan
    case add
    case vendor
    case publish
    case format
    case lsp
    case trace
    case version
    case help
}

@main
struct MoonCLI {
    static func main() async {
        var args = Array(CommandLine.arguments.dropFirst())
        if args.isEmpty {
            printBanner()
            printUsage()
            exit(0)
        }

        let cmdName = args.removeFirst()
        guard let command = MoonCommand(rawValue: cmdName) else {
            fputs("Unknown command: \(cmdName)\n", stderr)
            printUsage()
            exit(1)
        }

        do {
            let code = try await run(command: command, args: args)
            exit(code)
        } catch {
            fputs("moon: \(error)\n", stderr)
            exit(1)
        }
    }

    private static func run(command: MoonCommand, args: [String]) async throws -> Int32 {
        switch command {
        case .version:
            printVersion()
            return 0
        case .help:
            printBanner()
            printUsage()
            return 0
        case .check:
            return try runCheck(args: args)
        case .run:
            return await runRun(args: args)
        case .plan:
            return try runPlan(args: args)
        case .build:
            return try runBuild(args: args)
        case .add:
            return try runAdd(args: args)
        case .vendor:
            return try runVendor(args: args)
        case .publish:
            return try runPublish(args: args)
        case .format:
            return try runFormat(args: args)
        case .lsp:
            return runLsp()
        case .trace:
            return try runTrace(args: args)
        }
    }

    private static func runCheck(args: [String]) throws -> Int32 {
        guard let file = args.first(where: { $0.hasSuffix(".moon") }) ?? args.first else {
            fputs("Usage: moon check <file.moon>\n", stderr)
            return 1
        }

        let source = try String(contentsOfFile: file, encoding: .utf8)
        let parser = MoonParser()
        let program = try parser.parse(source)
        let fileURL = URL(fileURLWithPath: file).standardizedFileURL
        let projectRoot = findMoonfile(startDir: fileURL.deletingLastPathComponent().path)
            .map { URL(fileURLWithPath: $0).deletingLastPathComponent().path }
            ?? fileURL.deletingLastPathComponent().path
        let result = MoonTypechecker().check(
            program,
            options: TypecheckOptions(entryPath: fileURL.path, projectRoot: projectRoot)
        )

        if result.ok {
            print("OK \(file) (\(program.declarations.count) declarations)")
            return 0
        }

        for err in result.errors {
            fputs("error: \(err)\n", stderr)
        }
        return 1
    }

    private static func runPlan(args: [String]) throws -> Int32 {
        guard let file = args.first(where: { $0.hasSuffix(".moon") }) ?? args.first else {
            fputs("Usage: moon plan <file.moon> [--fn <name>]\n", stderr)
            return 1
        }

        let fn = flagValue(args, "--fn") ?? "main"
        let source = try String(contentsOfFile: file, encoding: .utf8)
        let parser = MoonParser()
        let program = try parser.parse(source)
        let fileURL = URL(fileURLWithPath: file).standardizedFileURL
        let projectRoot = findMoonfile(startDir: fileURL.deletingLastPathComponent().path)
            .map { URL(fileURLWithPath: $0).deletingLastPathComponent().path }
            ?? fileURL.deletingLastPathComponent().path
        let check = MoonTypechecker().check(
            program,
            options: TypecheckOptions(entryPath: fileURL.path, projectRoot: projectRoot)
        )
        if !check.ok {
            for err in check.errors { fputs("error: \(err)\n", stderr) }
            return 1
        }

        guard let dag = planFunction(program, functionName: fn) else {
            fputs("Function not found: \(fn)\n", stderr)
            return 1
        }

        print(try MoonPlannerExport.toJSON(dag))
        return 0
    }

    private static func runBuild(args: [String]) throws -> Int32 {
        let positionalTarget = args.first(where: { arg in
            !arg.hasPrefix("--") && !arg.hasSuffix(".moon") && arg != "Moonfile" && arg != "Moonfile.moon"
        })
        let target = flagValue(args, "--target") ?? positionalTarget
        let entryFn = flagValue(args, "--fn") ?? "main"
        let fileArg = args.first(where: { $0.hasSuffix(".moon") && $0 != "--target" && $0 != "--fn" })

        if let file = fileArg {
            let fileURL = URL(fileURLWithPath: file).standardizedFileURL
            let projectRoot = findMoonfile(startDir: fileURL.deletingLastPathComponent().path)
                .map { URL(fileURLWithPath: $0).deletingLastPathComponent().path }
                ?? fileURL.deletingLastPathComponent().path
            let targetName = target ?? fileURL.deletingPathExtension().lastPathComponent
            let relSource = relativePath(from: projectRoot, to: fileURL.path)
            let result = try buildSource(relSource, targetName: targetName, options: BuildOptions(
                projectRoot: projectRoot,
                entryFn: entryFn,
                target: target
            ))
            return printBuildResult(result)
        }

        let cwd = FileManager.default.currentDirectoryPath
        guard let moonfilePath = findMoonfile(startDir: cwd) else {
            fputs("Moonfile not found. Run from project root or pass a .moon file.\n", stderr)
            return 1
        }

        let projectRoot = URL(fileURLWithPath: moonfilePath).deletingLastPathComponent().path
        let results = try buildFromMoonfile(moonfilePath, options: BuildOptions(
            projectRoot: projectRoot,
            entryFn: entryFn,
            target: target
        ))

        var failed = 0
        for result in results {
            let code = printBuildResult(result, quiet: true)
            if code != 0 { failed += 1 }
        }

        let okCount = results.count - failed
        print("\n  \(okCount) targets  ·  \(results.flatMap(\.warnings).count) warnings")
        return failed > 0 ? 1 : 0
    }

    private static func printBuildResult(_ result: BuildTargetResult, quiet: Bool = false) -> Int32 {
        if result.ok {
            if quiet {
                print("built \(result.name) → \(result.outputDir)")
            } else {
                print("built \(result.name) → \(result.outputDir)")
            }
            for warning in result.warnings {
                fputs("warning: [\(result.name)] \(warning)\n", stderr)
            }
            return 0
        }

        fputs("error: build failed for \(result.name)\n", stderr)
        for err in result.errors {
            fputs("  \(err)\n", stderr)
        }
        return 1
    }

    private static func relativePath(from root: String, to absolute: String) -> String {
        let rootURL = URL(fileURLWithPath: root).standardizedFileURL
        let absURL = URL(fileURLWithPath: absolute).standardizedFileURL
        var rootComps = rootURL.pathComponents
        var absComps = absURL.pathComponents
        if rootComps.first == "/" && absComps.first != "/" { absComps.insert("/", at: 0) }
        while !rootComps.isEmpty && !absComps.isEmpty && rootComps.first == absComps.first {
            rootComps.removeFirst()
            absComps.removeFirst()
        }
        let ups = Array(repeating: "..", count: rootComps.count)
        let rel = (ups + absComps).joined(separator: "/")
        return rel.isEmpty ? absURL.lastPathComponent : rel
    }

    private static func runAdd(args: [String]) throws -> Int32 {
        guard let ref = args.first(where: { !$0.hasPrefix("--") }) else {
            fputs("Usage: moon add <package[@version]>\n", stderr)
            fputs("Example: moon add github.com/moon-lang/review-kit@0.1.0\n", stderr)
            return 1
        }

        let cwd = FileManager.default.currentDirectoryPath
        let fixture = ProcessInfo.processInfo.environment["MOON_VENDOR_FIXTURE"]
        let result = try addDependency(
            ref: ref,
            projectRoot: cwd,
            vendorOptions: VendorOptions(localFixtureRoot: fixture)
        )

        if result.addedToMoonfile {
            print("added \(result.dependency.key) to Moonfile")
        } else {
            print("dependency \(result.dependency.key) already in Moonfile")
        }

        if let vendor = result.vendor {
            print("vendored \(result.dependency.key) → \(vendor.destination) (\(vendor.action.rawValue))")
        }
        return 0
    }

    private static func runVendor(args: [String]) throws -> Int32 {
        let cwd = FileManager.default.currentDirectoryPath
        guard let moonfilePath = findMoonfile(startDir: cwd) else {
            fputs("Moonfile not found\n", stderr)
            return 1
        }

        let moonfile = try loadMoonfile(path: moonfilePath)
        let projectRoot = URL(fileURLWithPath: moonfilePath).deletingLastPathComponent().path
        let force = args.contains("--force")
        let fixture = ProcessInfo.processInfo.environment["MOON_VENDOR_FIXTURE"]
        let results = try vendorAll(
            moonfile: moonfile,
            projectRoot: projectRoot,
            options: VendorOptions(localFixtureRoot: fixture, force: force)
        )

        if results.isEmpty {
            print("no git dependencies to vendor")
            return 0
        }

        for result in results {
            print("vendored \(result.dependency.key) → \(result.destination) (\(result.action.rawValue))")
        }
        return 0
    }

    private static func runPublish(args: [String]) throws -> Int32 {
        let cwd = FileManager.default.currentDirectoryPath
        let createTag = !args.contains("--no-tag")
        let version = MoonToolchainVersion.current
        let result = try publishPackage(projectRoot: cwd, toolchainVersion: version, createTag: createTag)
        print("package \(result.packageName) \(result.version)")
        if result.createdTag {
            print("created tag \(result.tag)")
        } else if createTag {
            print("tag \(result.tag) not created")
        }
        return 0
    }

    private static func runFormat(args: [String]) throws -> Int32 {
        let write = args.contains("--write")
        let check = args.contains("--check")
        guard let file = args.first(where: { $0.hasSuffix(".moon") || $0 == "Moonfile" }) ?? args.first(where: { !$0.hasPrefix("--") }) else {
            fputs("Usage: moon format <file> [--write] [--check]\n", stderr)
            return 1
        }

        if check {
            let source = try String(contentsOfFile: file, encoding: .utf8)
            let formatted = formatSource(source)
            if formatted != source {
                fputs("would change \(file)\n", stderr)
                return 1
            }
            print("OK \(file)")
            return 0
        }

        let result = try formatFile(at: file, options: FormatOptions(write: write))
        if write {
            print(result.changed ? "formatted \(file)" : "unchanged \(file)")
        } else {
            print(result.output)
        }
        return 0
    }

    private static func runLsp() -> Int32 {
        startLspServer()
        return 0
    }

    private static func runRun(args: [String]) async -> Int32 {
        let mock = args.contains("--mock") || !args.contains("--no-mock")
        let metrics = args.contains("--metrics")
        let traceLlm = args.contains("--trace-llm")
        let target = flagValue(args, "--target")
        let entryFn = flagValue(args, "--fn") ?? "main"

        guard let entry = resolveRunEntry(args: args, target: target) else {
            fputs("Usage: moon run [<file.moon> | --target NAME] [--mock] [--no-mock] [--metrics] [--trace-llm]\n", stderr)
            return 1
        }

        if case .failure(let message) = entry {
            fputs("\(message)\n", stderr)
            return 1
        }
        guard case .success(let resolved) = entry else { return 1 }

        do {
            let source = try String(contentsOfFile: resolved.file, encoding: .utf8)
            let program = try MoonParser().parse(source)
            var overrides = RuntimeConfigOverrides(mock: mock)
            if let moonfilePath = findMoonfile(startDir: resolved.projectRoot),
               let moonfile = try? loadMoonfile(path: moonfilePath) {
                overrides = mergeRuntimeOverrides(
                    runtimeOverrides(from: moonfileToRuntimeOverrides(moonfile)),
                    overrides
                )
            }
            let result = try await runProgram(program, options: ProgramRunOptions(
                functionName: entryFn,
                projectRoot: resolved.projectRoot,
                overrides: overrides,
                traceLlm: traceLlm || overrides.traceByDefault == true
            ))
            print("OK (\(result.dag.nodes.count) DAG nodes)")
            if let targetName = resolved.targetName {
                print("target: \(targetName)")
            }
            if metrics {
                print(formatMetrics(result.metrics))
            }
            return 0
        } catch {
            fputs("moon: \(error)\n", stderr)
            return 1
        }
    }

    private enum RunEntryResult {
        case success(file: String, projectRoot: String, targetName: String?)
        case failure(String)
    }

    private static func resolveRunEntry(args: [String], target: String?) -> RunEntryResult? {
        let positional = args.first(where: { !$0.hasPrefix("--") && $0 != "Moonfile" && $0 != "Moonfile.moon" })

        if let file = positional, file.hasSuffix(".moon") {
            let fileURL = URL(fileURLWithPath: file).standardizedFileURL
            let projectRoot = findMoonfile(startDir: fileURL.deletingLastPathComponent().path)
                .map { URL(fileURLWithPath: $0).deletingLastPathComponent().path }
                ?? fileURL.deletingLastPathComponent().path
            return .success(file: fileURL.path, projectRoot: projectRoot, targetName: target)
        }

        let cwd = FileManager.default.currentDirectoryPath
        guard let moonfilePath = findMoonfile(startDir: cwd) else {
            if let positional {
                let path = URL(fileURLWithPath: positional).standardizedFileURL.path
                if FileManager.default.fileExists(atPath: path) {
                    return .success(file: path, projectRoot: cwd, targetName: nil)
                }
            }
            return nil
        }

        let moonfile = try? loadMoonfile(path: moonfilePath)
        let projectRoot = URL(fileURLWithPath: moonfilePath).deletingLastPathComponent().path

        if let moonfile {
            do {
                let resolved = try resolveMoonfileTarget(moonfile, projectRoot: projectRoot, target: target ?? positional)
                return .success(file: resolved.path, projectRoot: projectRoot, targetName: resolved.name)
            } catch {
                return .failure(error.localizedDescription)
            }
        }

        return .failure("No runnable target found in Moonfile")
    }

    private static func runTrace(args: [String]) throws -> Int32 {
        let sub = args.first(where: { !$0.hasPrefix("--") })
        if sub == "show" {
            let runId = flagValue(args, "--run")
            let traceDir = flagValue(args, "--trace-dir")
            let text = try runId.map { try showTraceRun($0, baseDir: traceDir) } ?? showLastTrace(baseDir: traceDir)
            guard let text else {
                fputs("No trace found. Run with: moon run <file> --trace-llm\n", stderr)
                return 1
            }
            print(text)
            return 0
        }

        if sub == "diff" {
            let runA = flagValue(args, "--a") ?? args.dropFirst().first(where: { !$0.hasPrefix("--") && $0 != "diff" })
            let runB = flagValue(args, "--b") ?? args.dropFirst().reversed().first(where: { !$0.hasPrefix("--") && $0 != "diff" })
            guard let runA, let runB else {
                fputs("Usage: moon trace diff <runA> <runB>\n", stderr)
                return 1
            }
            guard let text = try diffTraceRuns(runA, runB, baseDir: flagValue(args, "--trace-dir")) else {
                fputs("Trace runs not found.\n", stderr)
                return 1
            }
            print(text)
            return 0
        }

        fputs("Usage: moon trace show [--run <id>]  |  moon trace diff <runA> <runB>\n", stderr)
        return 1
    }

    private static func flagValue(_ args: [String], _ flag: String) -> String? {
        guard let index = args.firstIndex(of: flag), index + 1 < args.count else { return nil }
        return args[index + 1]
    }

    private static func printBanner() {
        print("moon \(MoonToolchainVersion.current) — Moon Language (Swift)")
    }

    private static func printVersion() {
        print("moon toolchain \(MoonToolchainVersion.current)")
        print("  MoonAST        \(MoonASTVersion.current)")
        print("  MoonLexer      \(MoonLexerVersion.current)")
        print("  MoonParser     \(MoonParserVersion.current)")
        print("  MoonTypechecker \(MoonTypecheckerVersion.current)")
        print("  MoonRuntime    \(MoonRuntimeVersion.current)")
        print("  MoonRegistry   \(MoonRegistryVersion.current)")
        print("  MoonFormatter  \(MoonFormatterVersion.current)")
        print("  MoonLSP        \(MoonLSPVersion.current)")
        print("  legacy TS/Bun  reference only (Swift toolchain complete)")
    }

    private static func printUsage() {
        print("""
        Usage:
          moon <command> [options]

        Commands:
          check <file.moon>   Parse and typecheck
          run                 Execute target or .moon file [--mock|--no-mock] [--metrics] [--trace-llm]
          trace show|diff     Inspect LLM trace runs
          build [target]      Build Moonfile targets [--target NAME]
          add <pkg[@ver]>     Add dependency and vendor
          vendor              Vendor git dependencies from Moonfile
          publish             Validate package and create git tag
          plan <file.moon>    Print execution DAG
          format <file>       Format source [--write] [--check]
          lsp                 Language Server (stdio)
          version             Toolchain versions
          help                Show this help

        Legacy TypeScript toolchain:
          bun run legacy:check
          bun run legacy:run
        """)
    }
}

enum MoonToolchainVersion {
    static let current = "0.3.0-swift-phase8"
}
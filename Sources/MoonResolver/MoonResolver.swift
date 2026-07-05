import Foundation
import MoonAST
import MoonMoonfile
import MoonParser
import MoonTypes

public enum MoonResolverVersion {
    public static let current = "0.3.0"
}

public struct ResolverError: Sendable, Equatable {
    public var message: String
    public var line: Int
    public var column: Int
}

public struct ResolvedImport: Sendable {
    public var path: [String]
    public var pathKey: String
    public var filePath: String?
    public var schemes: [String: Scheme]
}

public struct ResolveResult: Sendable {
    public var imports: [ResolvedImport]
    public var errors: [ResolverError]
}

public struct ResolveOptions: Sendable {
    public var entryPath: String
    public var projectRoot: String?
    public var moonfile: MoonfileDocument?

    public init(entryPath: String, projectRoot: String? = nil, moonfile: MoonfileDocument? = nil) {
        self.entryPath = entryPath
        self.projectRoot = projectRoot
        self.moonfile = moonfile
    }
}

public func defaultStdlibRoot() -> String {
    if let env = ProcessInfo.processInfo.environment["MOON_STDLIB"] {
        return URL(fileURLWithPath: env).standardizedFileURL.path
    }
    let thisFile = URL(fileURLWithPath: #filePath)
    return thisFile
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .deletingLastPathComponent()
        .appendingPathComponent("stdlib")
        .standardizedFileURL.path
}

public func resolveStdlibPath(modulePath: [String]) -> String? {
    guard modulePath.first == "Core", modulePath.count == 2 else { return nil }
    let candidate = URL(fileURLWithPath: defaultStdlibRoot())
        .appendingPathComponent("Core")
        .appendingPathComponent("\(modulePath[1]).moon")
        .path
    return FileManager.default.fileExists(atPath: candidate) ? candidate : nil
}

public func resolveLocalModule(name: String, entryPath: String, projectRoot: String) -> String? {
    let rel = "\(name).moon"
    let entryDir = URL(fileURLWithPath: entryPath).deletingLastPathComponent().path
    let candidates = [
        URL(fileURLWithPath: projectRoot).appendingPathComponent("lib").appendingPathComponent(rel).path,
        URL(fileURLWithPath: projectRoot).appendingPathComponent("src").appendingPathComponent(rel).path,
        URL(fileURLWithPath: entryDir).appendingPathComponent(rel).path,
    ]
    return candidates.first { FileManager.default.fileExists(atPath: $0) }
}

private func pathKey(_ path: [String]) -> String {
    path.joined(separator: ".")
}

public func mergeSchemes(
    _ target: inout [String: Scheme],
    _ source: [String: Scheme],
    moduleName: String,
    errors: inout [ResolverError]
) {
    for (name, scheme) in source {
        if target[name] != nil {
            errors.append(ResolverError(message: "Duplicate symbol '\(name)' from import \(moduleName)", line: 1, column: 1))
            continue
        }
        target[name] = scheme
    }
}

public func schemesFromProgram(_ program: Program) -> [String: Scheme] {
    var schemes: [String: Scheme] = [:]
    for decl in program.declarations {
        if case .function(let f, _) = decl, let sig = f.signature {
            schemes[sig.name] = typeSpecToScheme(sig.type)
        }
        if case .agent(let a, _) = decl {
            schemes[a.name] = typeSpecToScheme(a.type)
        }
        if case .data(let d, _) = decl {
            for ctor in d.constructors {
                schemes[ctor.name] = typeSpecToScheme(.con(name: ctor.name, args: [], span: ctor.span))
            }
        }
    }
    return schemes
}

public func resolveImports(_ program: Program, options: ResolveOptions) -> ResolveResult {
    var errors: [ResolverError] = []
    var imports: [ResolvedImport] = []
    let entryURL = URL(fileURLWithPath: options.entryPath).standardizedFileURL
    let projectRoot = options.projectRoot ?? entryURL.deletingLastPathComponent().path
    let moonfile: MoonfileDocument?
    if let provided = options.moonfile {
        moonfile = provided
    } else if let moonfilePath = findMoonfile(startDir: projectRoot) {
        moonfile = try? loadMoonfile(path: moonfilePath)
    } else {
        moonfile = nil
    }

    var seen = Set<String>()

    for decl in program.declarations {
        guard case .importDecl(let path, _, let span) = decl else { continue }
        let key = pathKey(path)
        if seen.contains(key) { continue }
        seen.insert(key)

        if path.first == "Core" {
            if let moonfile, !moonfile.containsDependency(key) {
                errors.append(ResolverError(
                    message: "Module \(key) is imported but not listed in Moonfile dependencies",
                    line: span.start.line,
                    column: span.start.column
                ))
            }
            guard isCoreModule(key) else {
                errors.append(ResolverError(
                    message: "Unknown Core module: \(key)",
                    line: span.start.line,
                    column: span.start.column
                ))
                continue
            }
            guard let schemes = coreModuleSchemes(key) else { continue }
            imports.append(ResolvedImport(
                path: path,
                pathKey: key,
                filePath: resolveStdlibPath(modulePath: path),
                schemes: schemes
            ))
            continue
        }

        if path.first == "github", path.count >= 4, let moonfile,
           let gitDep = dependencyForImportPath(path, dependencies: moonfile.dependencies),
           case .git(_, let owner, let repo, let version) = gitDep {
            if !moonfile.containsDependency(gitDep.key) {
                errors.append(ResolverError(
                    message: "Package \(gitDep.key) is imported but not listed in Moonfile dependencies",
                    line: span.start.line,
                    column: span.start.column
                ))
            }
            let packageRoot = vendorDirectory(projectRoot: projectRoot, owner: owner, repo: repo, version: version)
            if let vendored = resolveVendoredPackage(packageRoot: packageRoot, pathKey: gitDep.key) {
                imports.append(ResolvedImport(
                    path: path,
                    pathKey: gitDep.key,
                    filePath: packageRoot,
                    schemes: vendored
                ))
            } else {
                errors.append(ResolverError(
                    message: "Vendored package not found: \(gitDep.key) (run `moon vendor`)",
                    line: span.start.line,
                    column: span.start.column
                ))
            }
            continue
        }

        let localName = path.count == 1 ? path[0] : path.joined(separator: ".")
        guard let filePath = resolveLocalModule(name: localName, entryPath: entryURL.path, projectRoot: projectRoot) else {
            errors.append(ResolverError(
                message: "Cannot resolve local module: \(localName)",
                line: span.start.line,
                column: span.start.column
            ))
            continue
        }

        let source = (try? String(contentsOfFile: filePath, encoding: .utf8)) ?? ""
        let localProgram = (try? MoonParser().parse(source)) ?? Program(declarations: [], span: .zero)
        imports.append(ResolvedImport(
            path: path,
            pathKey: localName,
            filePath: filePath,
            schemes: schemesFromProgram(localProgram)
        ))
    }

    return ResolveResult(imports: imports, errors: errors)
}

private func resolveVendoredPackage(packageRoot: String, pathKey: String) -> [String: Scheme]? {
    guard FileManager.default.fileExists(atPath: packageRoot) else { return nil }
    guard let manifest = try? loadMoonPkgManifest(at: packageRoot) else { return nil }

    var schemes: [String: Scheme] = [:]
    for export in manifest.exports {
        let filePath = URL(fileURLWithPath: packageRoot).appendingPathComponent(export).path
        guard FileManager.default.fileExists(atPath: filePath) else { continue }
        let source = (try? String(contentsOfFile: filePath, encoding: .utf8)) ?? ""
        let program = (try? MoonParser().parse(source)) ?? Program(declarations: [], span: .zero)
        for (name, scheme) in schemesFromProgram(program) {
            schemes[name] = scheme
        }
    }
    return schemes.isEmpty ? nil : schemes
}

public func applyImportsToEnv(
    _ values: inout [String: Scheme],
    _ resolved: ResolveResult
) -> [ResolverError] {
    var errors = resolved.errors
    var merged: [String: Scheme] = [:]
    for imp in resolved.imports {
        mergeSchemes(&merged, imp.schemes, moduleName: imp.pathKey, errors: &errors)
    }
    for (name, scheme) in merged {
        if values[name] != nil {
            errors.append(ResolverError(message: "Symbol '\(name)' conflicts with an existing binding", line: 1, column: 1))
            continue
        }
        values[name] = scheme
    }
    return errors
}
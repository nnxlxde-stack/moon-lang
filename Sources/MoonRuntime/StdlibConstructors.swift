import Foundation
import MoonAST
import MoonParser

public func programWithImportedStdlib(_ program: Program) -> Program {
    var extra: [Declaration] = []
    for decl in program.declarations {
        guard case .importDecl(let path, _, _) = decl else { continue }
        guard let stdlib = loadStdlibProgram(modulePath: path) else { continue }
        for stdlibDecl in stdlib.declarations {
            switch stdlibDecl {
            case .function, .data:
                extra.append(stdlibDecl)
            default:
                break
            }
        }
    }
    guard !extra.isEmpty else { return program }
    return Program(declarations: program.declarations + extra, span: program.span)
}

public func collectDataConstructors(_ program: Program) -> Set<String> {
    var names = Set<String>()
    for decl in program.declarations {
        guard case .data(let dataDecl, _) = decl else { continue }
        for ctor in dataDecl.constructors {
            names.insert(ctor.name)
        }
    }
    return names
}

private func loadStdlibProgram(modulePath: [String]) -> Program? {
    guard modulePath.first == "Core", modulePath.count == 2 else { return nil }
    for root in stdlibRootCandidates() {
        let candidate = URL(fileURLWithPath: root)
            .appendingPathComponent("Core")
            .appendingPathComponent("\(modulePath[1]).moon")
            .path
        guard FileManager.default.fileExists(atPath: candidate),
              let source = try? String(contentsOfFile: candidate, encoding: .utf8),
              let program = try? MoonParser().parse(source) else {
            continue
        }
        return program
    }
    return nil
}

private func stdlibRootCandidates() -> [String] {
    var roots: [String] = []
    if let env = ProcessInfo.processInfo.environment["MOON_STDLIB"] {
        roots.append(URL(fileURLWithPath: env).standardizedFileURL.path)
    }
    let cwd = FileManager.default.currentDirectoryPath
    roots.append(URL(fileURLWithPath: cwd).appendingPathComponent("stdlib").path)
    let thisFile = URL(fileURLWithPath: #filePath)
    roots.append(
        thisFile
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .deletingLastPathComponent()
            .appendingPathComponent("stdlib")
            .standardizedFileURL.path
    )
    var seen = Set<String>()
    return roots.filter { seen.insert($0).inserted }
}
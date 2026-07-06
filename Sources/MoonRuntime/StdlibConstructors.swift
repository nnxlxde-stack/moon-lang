import Foundation
import MoonAST
import MoonParser

public func collectDataConstructors(_ program: Program) -> Set<String> {
    var names = constructorsFromProgram(program)
    for decl in program.declarations {
        guard case .importDecl(let path, _, _) = decl else { continue }
        guard path.first == "Core", path.count == 2 else { continue }
        let candidate = URL(fileURLWithPath: runtimeStdlibRoot())
            .appendingPathComponent("Core")
            .appendingPathComponent("\(path[1]).moon")
            .path
        guard let source = try? String(contentsOfFile: candidate, encoding: .utf8),
              let stdlibProgram = try? MoonParser().parse(source) else {
            continue
        }
        names.formUnion(constructorsFromProgram(stdlibProgram))
    }
    return names
}

private func constructorsFromProgram(_ program: Program) -> Set<String> {
    var names = Set<String>()
    for decl in program.declarations {
        guard case .data(let dataDecl, _) = decl else { continue }
        for ctor in dataDecl.constructors {
            names.insert(ctor.name)
        }
    }
    return names
}

private func runtimeStdlibRoot() -> String {
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
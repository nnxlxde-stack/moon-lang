import MoonTypes

public struct Prelude {
    public var values: [String: Scheme]
    public var classes: [String: TypeClass]
}

public func buildPrelude() -> Prelude {
    var values: [String: Scheme] = [:]
    var classes: [String: TypeClass] = [:]

    func scheme(_ t: MoonType) -> Scheme { Scheme(vars: [], type: t) }

    func forall(_ t: MoonType) -> Scheme {
        var vars: [Int] = []
        func collect(_ mt: MoonType) {
            switch mt {
            case .typeVar(let id): vars.append(id)
            case .con(_, let args): args.forEach(collect)
            case .arrow(let from, let to): collect(from); collect(to)
            case .record(_, let fields): fields.forEach { collect($0.type) }
            case .tuple(let elements): elements.forEach(collect)
            }
        }
        collect(t)
        return Scheme(vars: Array(Set(vars)).sorted(), type: t)
    }

    let a: () -> MoonType = { freshVar() }

    for p in ["String", "Int", "Float", "Bool", "Code", "Documentation", "Requirements", "Entity", "Agent", "Scope", "Unit", "Verdict"] {
        values[p] = scheme(prim(p))
    }

    for e in ["Code", "Documentation", "Requirements"] {
        values[e] = scheme(prim("Entity"))
    }

    for t in ["Finding", "Recommendation", "Suggestion", "Location", "Severity", "Category"] {
        values[t] = scheme(prim(t, a()))
    }

    let analyzeOutput: (MoonType) -> MoonType = { t in
        moonRecord("AnalyzeOutput", [
            MoonFieldType(name: "findings", type: listOf(prim("Finding", t))),
            MoonFieldType(name: "summary", type: prim("String")),
            MoonFieldType(name: "confidence", type: prim("Float")),
        ])
    }

    classes["Analyzer"] = TypeClass(
        name: "Analyzer",
        params: ["t"],
        methods: [
            ClassMethod(
                name: "analyze",
                type: forall(fn(prim("Analyzer", a()), fn(a(), io(analyzeOutput(a())))))
            ),
        ]
    )

    classes["Reviewer"] = TypeClass(
        name: "Reviewer",
        params: ["t"],
        methods: [
            ClassMethod(
                name: "analyze",
                type: forall(fn(prim("Reviewer", a()), fn(a(), io(prim("ReviewResult", a())))))
            ),
        ]
    )

    values["not"] = scheme(fn(prim("Bool"), prim("Bool")))
    values["pure"] = forall(fn(a(), io(a())))
    values["map"] = forall(fn(fn(a(), a()), fn(listOf(a()), listOf(a()))))
    values["$"] = forall(fn(fn(a(), a()), fn(a(), a())))
    values[">>="] = forall(fn(io(a()), fn(fn(a(), io(a())), io(a()))))
    values["."] = forall(fn(fn(a(), a()), fn(fn(a(), a()), fn(a(), a()))))

    return Prelude(values: values, classes: classes)
}
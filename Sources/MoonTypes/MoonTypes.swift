import MoonAST

public indirect enum MoonType: Equatable, Sendable {
    case typeVar(id: Int)
    case con(name: String, args: [MoonType])
    case arrow(from: MoonType, to: MoonType)
    case record(name: String, fields: [MoonFieldType])
    case tuple(elements: [MoonType])
}

public struct MoonFieldType: Equatable, Sendable {
    public var name: String
    public var type: MoonType

    public init(name: String, type: MoonType) {
        self.name = name
        self.type = type
    }
}

public struct Scheme: Equatable, Sendable {
    public var vars: [Int]
    public var type: MoonType

    public init(vars: [Int], type: MoonType) {
        self.vars = vars
        self.type = type
    }
}

public struct DataConstructor: Equatable, Sendable {
    public var name: String
    public var fields: [MoonFieldType]
    public var args: [MoonType]

    public init(name: String, fields: [MoonFieldType], args: [MoonType]) {
        self.name = name
        self.fields = fields
        self.args = args
    }
}

public struct TypeConstructor: Equatable, Sendable {
    public var name: String
    public var params: [String]
    public var kind: TypeConstructorKind
    public var fields: [MoonFieldType]?
    public var constructors: [DataConstructor]?
    /// When set, record syntax for this constructor produces the parent ADT (e.g. Text -> Element msg).
    public var dataParent: String?

    public init(
        name: String,
        params: [String],
        kind: TypeConstructorKind,
        fields: [MoonFieldType]? = nil,
        constructors: [DataConstructor]? = nil,
        dataParent: String? = nil
    ) {
        self.name = name
        self.params = params
        self.kind = kind
        self.fields = fields
        self.constructors = constructors
        self.dataParent = dataParent
    }
}

public enum TypeConstructorKind: String, Sendable {
    case model
    case data
    case alias
}

public struct ClassMethod: Equatable, Sendable {
    public var name: String
    public var type: Scheme

    public init(name: String, type: Scheme) {
        self.name = name
        self.type = type
    }
}

public struct TypeClass: Equatable, Sendable {
    public var name: String
    public var params: [String]
    public var methods: [ClassMethod]

    public init(name: String, params: [String], methods: [ClassMethod]) {
        self.name = name
        self.params = params
        self.methods = methods
    }
}

public struct Instance: Equatable, Sendable {
    public var className: String
    public var types: [MoonType]
    public var methods: [String: Scheme]

    public init(className: String, types: [MoonType], methods: [String: Scheme]) {
        self.className = className
        self.types = types
        self.methods = methods
    }
}

private enum VarSupply {
    nonisolated(unsafe) static var nextId = 0

    static func reset() { nextId = 0 }

    static func fresh() -> MoonType {
        defer { nextId += 1 }
        return .typeVar(id: nextId)
    }
}

public func resetVarSupply() {
    VarSupply.reset()
}

public func freshVar() -> MoonType {
    VarSupply.fresh()
}

public func prim(_ name: String, _ args: MoonType...) -> MoonType {
    .con(name: name, args: args)
}

public func prim(_ name: String, args: [MoonType]) -> MoonType {
    .con(name: name, args: args)
}

public func fn(_ from: MoonType, _ to: MoonType) -> MoonType {
    .arrow(from: from, to: to)
}

public func listOf(_ element: MoonType) -> MoonType {
    prim("List", element)
}

public func io(_ inner: MoonType) -> MoonType {
    prim("IO", inner)
}

public func moonTuple(_ elements: MoonType...) -> MoonType {
    .tuple(elements: elements)
}

public func moonRecord(_ name: String, _ fields: [MoonFieldType]) -> MoonType {
    .record(name: name, fields: fields)
}

private let knownTypes: Set<String> = [
    "String", "Int", "Float", "Bool", "IO", "List", "Unit",
    "Code", "Documentation", "Requirements", "Entity", "Agent", "Scope",
    "PullRequest", "ChangedFile", "LongTerm", "Finding", "Recommendation",
    "Suggestion", "Location", "Severity", "Category", "Verdict",
    "Analyzer", "Reviewer", "AnalysisResult", "ReviewResult",
    "Element", "Cmd", "App", "TextStyle", "Align", "Color",
]

private func isTypeVarName(_ name: String) -> Bool {
    guard let first = name.first else { return false }
    return first.isLowercase && !knownTypes.contains(name)
}

public func typeSpecToMoon(_ spec: TypeSpec, varMap: inout [String: MoonType]) -> MoonType {
    switch spec {
    case .varType(let name, _):
        if isTypeVarName(name) {
            if varMap[name] == nil {
                varMap[name] = freshVar()
            }
            return varMap[name]!
        }
        return prim(name)
    case .list(let element, _):
        return listOf(typeSpecToMoon(element, varMap: &varMap))
    case .tuple(let elements, _):
        return .tuple(elements: elements.map { typeSpecToMoon($0, varMap: &varMap) })
    case .arrow(let from, let to, _):
        return fn(typeSpecToMoon(from, varMap: &varMap), typeSpecToMoon(to, varMap: &varMap))
    case .con(let name, let args, _):
        return prim(name, args: args.map { typeSpecToMoon($0, varMap: &varMap) })
    }
}

public func typeSpecToMoon(_ spec: TypeSpec) -> MoonType {
    var varMap: [String: MoonType] = [:]
    return typeSpecToMoon(spec, varMap: &varMap)
}

public func typeSpecToScheme(_ spec: TypeSpec) -> Scheme {
    var varMap: [String: MoonType] = [:]
    let type = typeSpecToMoon(spec, varMap: &varMap)
    let vars = varMap.values.compactMap { t -> Int? in
        if case .typeVar(let id) = t { return id }
        return nil
    }
    return Scheme(vars: vars, type: type)
}

private func freeVars(_ t: MoonType, _ acc: inout Set<Int>) {
    switch t {
    case .typeVar(let id):
        acc.insert(id)
    case .con(_, let args):
        args.forEach { freeVars($0, &acc) }
    case .arrow(let from, let to):
        freeVars(from, &acc)
        freeVars(to, &acc)
    case .record(_, let fields):
        fields.forEach { freeVars($0.type, &acc) }
    case .tuple(let elements):
        elements.forEach { freeVars($0, &acc) }
    }
}

public func generalize(envVars: Set<Int>, _ t: MoonType) -> Scheme {
    var fvs = Set<Int>()
    freeVars(t, &fvs)
    let vars = fvs.filter { !envVars.contains($0) }.sorted()
    return Scheme(vars: vars, type: t)
}

public func instantiate(_ scheme: Scheme, supply: () -> MoonType) -> MoonType {
    var subst: [Int: MoonType] = [:]
    for v in scheme.vars {
        subst[v] = supply()
    }
    return applySubst(subst, scheme.type)
}

public func applySubst(_ subst: [Int: MoonType], _ t: MoonType) -> MoonType {
    switch t {
    case .typeVar(let id):
        if let s = subst[id] {
            return applySubst(subst, s)
        }
        return t
    case .con(let name, let args):
        return .con(name: name, args: args.map { applySubst(subst, $0) })
    case .arrow(let from, let to):
        return fn(applySubst(subst, from), applySubst(subst, to))
    case .record(let name, let fields):
        return moonRecord(name, fields.map { MoonFieldType(name: $0.name, type: applySubst(subst, $0.type)) })
    case .tuple(let elements):
        return .tuple(elements: elements.map { applySubst(subst, $0) })
    }
}

private func occurs(_ id: Int, _ t: MoonType) -> Bool {
    switch t {
    case .typeVar(let vid):
        return vid == id
    case .con(_, let args):
        return args.contains { occurs(id, $0) }
    case .arrow(let from, let to):
        return occurs(id, from) || occurs(id, to)
    case .record(_, let fields):
        return fields.contains { occurs(id, $0.type) }
    case .tuple(let elements):
        return elements.contains { occurs(id, $0) }
    }
}

public struct UnifyError: Error {
    public var message: String
    public var span: Span?

    public init(_ message: String, span: Span? = nil) {
        self.message = message
        self.span = span
    }
}

public func unify(_ t1: MoonType, _ t2: MoonType, span: Span? = nil) throws -> [Int: MoonType] {
    var subst: [Int: MoonType] = [:]
    try unifyMut(&subst, t1, t2, span: span)
    return subst
}

private func unifyMut(_ subst: inout [Int: MoonType], _ t1: MoonType, _ t2: MoonType, span: Span?) throws {
    let a = applySubst(subst, t1)
    let b = applySubst(subst, t2)

    if case .typeVar(let id) = a {
        try bind(&subst, id, b, span: span)
        return
    }
    if case .typeVar(let id) = b {
        try bind(&subst, id, a, span: span)
        return
    }

    switch (a, b) {
    case (.record(let an, let af), .record(let bn, let bf)) where an == bn:
        try unifyFields(&subst, af, bf, span: span)
        return
    case (.con(let an, let aa), .con(let bn, let ba)):
        guard aa.count == ba.count else {
            throw UnifyError("Type mismatch: \(formatType(a)) vs \(formatType(b))", span: span)
        }
        if an != bn && !compatibleTypes(an, bn) {
            throw UnifyError("Type mismatch: \(formatType(a)) vs \(formatType(b))", span: span)
        }
        for (left, right) in zip(aa, ba) {
            try unifyMut(&subst, left, right, span: span)
        }
        return
    case (.arrow(let af, let at), .arrow(let bf, let bt)):
        try unifyMut(&subst, af, bf, span: span)
        try unifyMut(&subst, at, bt, span: span)
        return
    case (.tuple(let ae), .tuple(let be)):
        guard ae.count == be.count else {
            throw UnifyError("Tuple arity mismatch", span: span)
        }
        for (left, right) in zip(ae, be) {
            try unifyMut(&subst, left, right, span: span)
        }
        return
    default:
        if a == b { return }
        throw UnifyError("Type mismatch: \(formatType(a)) vs \(formatType(b))", span: span)
    }
}

private func unifyFields(
    _ subst: inout [Int: MoonType],
    _ fa: [MoonFieldType],
    _ fb: [MoonFieldType],
    span: Span?
) throws {
    guard fa.count == fb.count else {
        throw UnifyError("Record field count mismatch", span: span)
    }
    for (left, right) in zip(fa, fb) {
        guard left.name == right.name else {
            throw UnifyError("Record field mismatch: \(left.name) vs \(right.name)", span: span)
        }
        try unifyMut(&subst, left.type, right.type, span: span)
    }
}

private let compatibleTypes: [String: [String]] = [
    "Code": ["PullRequest"],
    "PullRequest": ["Code"],
]

private func compatibleTypes(_ a: String, _ b: String) -> Bool {
    compatibleTypes[a]?.contains(b) ?? false
}

private func bind(_ subst: inout [Int: MoonType], _ id: Int, _ t: MoonType, span: Span?) throws {
    let applied = applySubst(subst, t)
    if occurs(id, applied) {
        throw UnifyError("Infinite type", span: span)
    }
    subst[id] = applied
}

public func formatType(_ t: MoonType) -> String {
    switch t {
    case .typeVar(let id):
        return "?\(id)"
    case .con(let name, let args):
        if args.isEmpty { return name }
        return "\(name) \(args.map(formatType).joined(separator: " "))"
    case .arrow(let from, let to):
        let left: String
        if case .arrow = from {
            left = "(\(formatType(from)))"
        } else {
            left = formatType(from)
        }
        return "\(left) -> \(formatType(to))"
    case .record(let name, let fields):
        let fs = fields.map { "\($0.name): \(formatType($0.type))" }.joined(separator: ", ")
        return "\(name) { \(fs) }"
    case .tuple(let elements):
        return "(\(elements.map(formatType).joined(separator: ", ")))"
    }
}

public func composeSubst(_ a: [Int: MoonType], _ b: [Int: MoonType]) -> [Int: MoonType] {
    var result = a
    for (key, value) in b {
        result[key] = applySubst(result, value)
    }
    return result
}
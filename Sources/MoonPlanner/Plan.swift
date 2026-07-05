import MoonAST

public enum DagNodeKind: String, Codable, Equatable, Sendable {
    case action
    case bind
    case mapM
    case mapM_join
    case storm
}

public struct DagNode: Codable, Equatable, Sendable {
    public var id: String
    public var kind: DagNodeKind
    public var label: String
    public var dependencies: [String]
    public var bindVar: String?
    public var mapMListVar: String?
    public var mapMFunc: String?
    public var stmtIndex: Int

    public init(
        id: String,
        kind: DagNodeKind,
        label: String,
        dependencies: [String],
        bindVar: String? = nil,
        mapMListVar: String? = nil,
        mapMFunc: String? = nil,
        stmtIndex: Int
    ) {
        self.id = id
        self.kind = kind
        self.label = label
        self.dependencies = dependencies
        self.bindVar = bindVar
        self.mapMListVar = mapMListVar
        self.mapMFunc = mapMFunc
        self.stmtIndex = stmtIndex
    }
}

public struct ExecutionDag: Codable, Equatable, Sendable {
    public var functionName: String
    public var nodes: [DagNode]

    public init(functionName: String, nodes: [DagNode]) {
        self.functionName = functionName
        self.nodes = nodes
    }
}

public func findFunction(_ program: Program, name: String) -> DoBlock? {
    for decl in program.declarations {
        guard case .function(let fnDecl, _) = decl else { continue }
        for eq in fnDecl.equations {
            if eq.name == name, case .doBlock(let block) = eq.body {
                return block
            }
        }
    }
    return nil
}

public func planFunction(_ program: Program, functionName: String = "main") -> ExecutionDag? {
    guard let block = findFunction(program, name: functionName) else { return nil }

    var nodes: [DagNode] = []
    var varDefs: [String: String] = [:]
    var counter = 0

    func addNode(
        kind: DagNodeKind,
        label: String,
        dependencies: [String],
        bindVar: String? = nil,
        mapMListVar: String? = nil,
        mapMFunc: String? = nil,
        stmtIndex: Int
    ) -> String {
        let id = "n\(counter)"
        counter += 1
        nodes.append(DagNode(
            id: id,
            kind: kind,
            label: label,
            dependencies: dependencies,
            bindVar: bindVar,
            mapMListVar: mapMListVar,
            mapMFunc: mapMFunc,
            stmtIndex: stmtIndex
        ))
        return id
    }

    for (i, stmt) in block.statements.enumerated() {
        let deps = collectDependencies(stmt, varDefs: varDefs)

        switch stmt {
        case .storm(let pattern, _, _, _):
            let bindName = patternBindName(pattern)
            let id = addNode(
                kind: .storm,
                label: bindName ?? "storm_\(i)",
                dependencies: deps,
                bindVar: bindName,
                stmtIndex: i
            )
            if let bindName { varDefs[bindName] = id }

        case .bind(let pattern, let expr, _, _):
            if let mapM = detectMapM(expr) {
                var mapDeps = deps
                if let listDep = varDefs[mapM.listVar], !mapDeps.contains(listDep) {
                    mapDeps.append(listDep)
                }

                let bindName = patternBindName(pattern)
                let mapId = addNode(
                    kind: .mapM,
                    label: bindName ?? "mapM_\(i)",
                    dependencies: mapDeps,
                    bindVar: bindName,
                    mapMListVar: mapM.listVar,
                    mapMFunc: exprLabel(mapM.funcExpr),
                    stmtIndex: i
                )

                let joinId = addNode(
                    kind: .mapM_join,
                    label: "\(mapId)_join",
                    dependencies: [mapId],
                    bindVar: bindName,
                    mapMListVar: mapM.listVar,
                    stmtIndex: i
                )

                if let bindName { varDefs[bindName] = joinId }
            } else {
                let bindName = patternBindName(pattern)
                let id = addNode(
                    kind: .bind,
                    label: bindName ?? "bind_\(i)",
                    dependencies: deps,
                    bindVar: bindName,
                    stmtIndex: i
                )
                if let bindName { varDefs[bindName] = id }
            }

        case .letBind(let pattern, let expr, _):
            let bindName = patternBindName(pattern)
            let id = addNode(
                kind: .action,
                label: exprLabel(expr),
                dependencies: deps,
                stmtIndex: i
            )
            if let bindName { varDefs[bindName] = id }

        case .action(let expr, _, _):
            _ = addNode(
                kind: .action,
                label: exprLabel(expr),
                dependencies: deps,
                stmtIndex: i
            )
        }
    }

    return ExecutionDag(functionName: functionName, nodes: nodes)
}

private func patternBindName(_ pattern: Pattern) -> String? {
    if case .pVar(let name, _) = pattern { return name }
    return nil
}

private func collectDependencies(_ stmt: DoStatement, varDefs: [String: String]) -> [String] {
    let expr: Expression
    var config: [ConfigItem] = []

    switch stmt {
    case .letBind(_, let e, _):
        expr = e
    case .storm(_, let input, let cfg, _):
        expr = input
        config = cfg
    case .bind(_, let e, let cfg, _):
        expr = e
        config = cfg
    case .action(let e, let cfg, _):
        expr = e
        config = cfg
    }

    var free = freeVarsExpr(expr)
    for item in config {
        free.formUnion(freeVarsExpr(item.value))
    }

    var deps: [String] = []
    for v in free.sorted() {
        if let dep = varDefs[v], !deps.contains(dep) {
            deps.append(dep)
        }
    }
    return deps
}

public func dagToGraph(_ dag: ExecutionDag) -> [String: [String]] {
    var graph: [String: [String]] = [:]
    for node in dag.nodes {
        graph[node.id] = node.dependencies
    }
    return graph
}

public func reachableFrom(_ dag: ExecutionDag, startIds: [String]) -> Set<String> {
    let graph = dagToGraph(dag)
    var visited = Set<String>()
    var stack = startIds

    while let id = stack.popLast() {
        if visited.contains(id) { continue }
        visited.insert(id)
        for dep in graph[id] ?? [] {
            stack.append(dep)
        }
    }

    return visited
}

public func nodesByLabel(_ dag: ExecutionDag, label: String) -> [DagNode] {
    dag.nodes.filter { $0.label == label || $0.bindVar == label }
}
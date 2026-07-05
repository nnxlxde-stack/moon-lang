import MoonTypes

public struct TypeEnv: Sendable {
    public var values: [String: Scheme]
    public var constructors: [String: TypeConstructor]
    public var classes: [String: TypeClass]
    public var instances: [Instance]
    public var envVars: Set<Int>

    public init(
        values: [String: Scheme] = [:],
        constructors: [String: TypeConstructor] = [:],
        classes: [String: TypeClass] = [:],
        instances: [Instance] = [],
        envVars: Set<Int> = []
    ) {
        self.values = values
        self.constructors = constructors
        self.classes = classes
        self.instances = instances
        self.envVars = envVars
    }

    public func copy(values: [String: Scheme]? = nil) -> TypeEnv {
        TypeEnv(
            values: values ?? self.values,
            constructors: constructors,
            classes: classes,
            instances: instances,
            envVars: envVars
        )
    }
}

public func createEnv(values: [String: Scheme], classes: [String: TypeClass]) -> TypeEnv {
    TypeEnv(values: values, classes: classes)
}

public func envVarIds(_ env: TypeEnv) -> Set<Int> {
    var ids = env.envVars
    for scheme in env.values.values {
        for v in scheme.vars {
            ids.insert(v)
        }
    }
    return ids
}
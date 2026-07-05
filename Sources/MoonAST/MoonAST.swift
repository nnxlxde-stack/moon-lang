import Foundation

// MARK: - Source locations

public struct Position: Codable, Equatable, Sendable {
    public var line: Int
    public var column: Int
    public var offset: Int

    public init(line: Int, column: Int, offset: Int) {
        self.line = line
        self.column = column
        self.offset = offset
    }
}

public struct Span: Codable, Equatable, Sendable {
    public var start: Position
    public var end: Position

    public init(start: Position, end: Position) {
        self.start = start
        self.end = end
    }

    public static let zero = Span(
        start: Position(line: 0, column: 0, offset: 0),
        end: Position(line: 0, column: 0, offset: 0)
    )
}

// MARK: - Types

public indirect enum TypeSpec: Codable, Equatable, Sendable {
    case varType(name: String, span: Span)
    case con(name: String, args: [TypeSpec], span: Span)
    case list(element: TypeSpec, span: Span)
    case tuple(elements: [TypeSpec], span: Span)
    case arrow(from: TypeSpec, to: TypeSpec, span: Span)
}

// MARK: - Patterns

public indirect enum Pattern: Codable, Equatable, Sendable {
    case pVar(name: String, span: Span)
    case pWildcard(span: Span)
    case pLit(value: Literal, span: Span)
    case pCon(name: String, args: [Pattern], span: Span)
    case pTuple(elements: [Pattern], span: Span)
    case pList(elements: [Pattern], span: Span)
}

// MARK: - Literals

public enum Literal: Codable, Equatable, Sendable {
    case string(String, span: Span)
    case int(Int, span: Span)
    case float(Double, span: Span)
    case bool(Bool, span: Span)
}

// MARK: - Expressions

public indirect enum Expression: Codable, Equatable, Sendable {
    case lit(value: Literal, span: Span)
    case varRef(name: String, span: Span)
    case app(func: Expression, arg: Expression, span: Span)
    case infix(op: String, left: Expression, right: Expression, span: Span)
    case prefix(op: String, operand: Expression, span: Span)
    case fieldAccess(object: Expression, field: String, span: Span)
    case lambda(params: [String], body: LambdaBody, span: Span)
    case ifExpr(condition: Expression, thenBranch: Expression, elseBranch: Expression, span: Span)
    case record(name: String, fields: [RecordField], span: Span)
    case list(elements: [Expression], span: Span)
    case tuple(elements: [Expression], span: Span)
    case paren(expr: Expression, span: Span)
    case doExpr(block: DoBlock, span: Span)
    case agent(decl: AgentDecl, span: Span)
    case model(decl: ModelDecl, span: Span)
}

public indirect enum LambdaBody: Codable, Equatable, Sendable {
    case expression(Expression)
    case doBlock(DoBlock)
}

public struct RecordField: Codable, Equatable, Sendable {
    public var name: String
    public var value: Expression
    public var span: Span

    public init(name: String, value: Expression, span: Span) {
        self.name = name
        self.value = value
        self.span = span
    }
}

// MARK: - Do blocks

public struct DoBlock: Codable, Equatable, Sendable {
    public var statements: [DoStatement]
    public var span: Span

    public init(statements: [DoStatement], span: Span) {
        self.statements = statements
        self.span = span
    }
}

public indirect enum DoStatement: Codable, Equatable, Sendable {
    case bind(pattern: Pattern, expr: Expression, config: [ConfigItem], span: Span)
    case storm(pattern: Pattern, input: Expression, config: [ConfigItem], span: Span)
    case letBind(pattern: Pattern, expr: Expression, span: Span)
    case action(expr: Expression, config: [ConfigItem], span: Span)
}

public struct ConfigItem: Codable, Equatable, Sendable {
    public var key: String
    public var value: Expression
    public var span: Span

    public init(key: String, value: Expression, span: Span) {
        self.key = key
        self.value = value
        self.span = span
    }
}

// MARK: - Declarations

public indirect enum Declaration: Codable, Equatable, Sendable {
    case importDecl(path: [String], alias: String?, span: Span)
    case model(decl: ModelDecl, span: Span)
    case agent(decl: AgentDecl, span: Span)
    case data(decl: DataDecl, span: Span)
    case instance(decl: InstanceDecl, span: Span)
    case function(decl: FunctionDecl, span: Span)
    case macro(decl: MacroDecl, span: Span)
}

public struct ModelDecl: Codable, Equatable, Sendable {
    public var name: String
    public var typeParams: [String]
    public var implements: String?
    public var fields: [FieldDef]
    public var span: Span

    public init(name: String, typeParams: [String], implements: String?, fields: [FieldDef], span: Span) {
        self.name = name
        self.typeParams = typeParams
        self.implements = implements
        self.fields = fields
        self.span = span
    }
}

public struct FieldDef: Codable, Equatable, Sendable {
    public var name: String
    public var type: TypeSpec
    public var modifiers: [FieldModifier]
    public var span: Span

    public init(name: String, type: TypeSpec, modifiers: [FieldModifier], span: Span) {
        self.name = name
        self.type = type
        self.modifiers = modifiers
        self.span = span
    }
}

public indirect enum FieldModifier: Codable, Equatable, Sendable {
    case constraint(expr: Expression, span: Span)
    case defaultValue(expr: Expression, span: Span)
    case fetchedFrom(sources: [SourceSpec], span: Span)
    case optional(span: Span)
}

public struct SourceSpec: Codable, Equatable, Sendable {
    public var source: String
    public var field: String
    public var span: Span

    public init(source: String, field: String, span: Span) {
        self.source = source
        self.field = field
        self.span = span
    }
}

public struct AgentDecl: Codable, Equatable, Sendable {
    public var name: String
    public var typeParams: [String]
    public var type: TypeSpec
    public var routesTo: String?
    public var config: [ConfigItem]
    public var span: Span

    public init(name: String, typeParams: [String], type: TypeSpec, routesTo: String?, config: [ConfigItem], span: Span) {
        self.name = name
        self.typeParams = typeParams
        self.type = type
        self.routesTo = routesTo
        self.config = config
        self.span = span
    }
}

public struct DataDecl: Codable, Equatable, Sendable {
    public var name: String
    public var typeParams: [String]
    public var constructors: [Constructor]
    public var span: Span

    public init(name: String, typeParams: [String], constructors: [Constructor], span: Span) {
        self.name = name
        self.typeParams = typeParams
        self.constructors = constructors
        self.span = span
    }
}

public struct Constructor: Codable, Equatable, Sendable {
    public var name: String
    public var args: ConstructorArgs?
    public var span: Span

    public init(name: String, args: ConstructorArgs?, span: Span) {
        self.name = name
        self.args = args
        self.span = span
    }
}

public indirect enum ConstructorArgs: Codable, Equatable, Sendable {
    case positional(types: [TypeSpec], span: Span)
    case record(fields: [RecordFieldType], span: Span)
}

public struct RecordFieldType: Codable, Equatable, Sendable {
    public var name: String
    public var type: TypeSpec
    public var span: Span

    public init(name: String, type: TypeSpec, span: Span) {
        self.name = name
        self.type = type
        self.span = span
    }
}

public struct InstanceDecl: Codable, Equatable, Sendable {
    public var className: String
    public var type: TypeSpec
    public var typeParams: [String]
    public var functions: [FunctionDecl]
    public var span: Span

    public init(className: String, type: TypeSpec, typeParams: [String], functions: [FunctionDecl], span: Span) {
        self.className = className
        self.type = type
        self.typeParams = typeParams
        self.functions = functions
        self.span = span
    }
}

public struct FunctionDecl: Codable, Equatable, Sendable {
    public var signature: FunctionSignature?
    public var equations: [FunctionEquation]
    public var span: Span

    public init(signature: FunctionSignature?, equations: [FunctionEquation], span: Span) {
        self.signature = signature
        self.equations = equations
        self.span = span
    }
}

public struct FunctionSignature: Codable, Equatable, Sendable {
    public var name: String
    public var type: TypeSpec
    public var span: Span

    public init(name: String, type: TypeSpec, span: Span) {
        self.name = name
        self.type = type
        self.span = span
    }
}

public struct FunctionEquation: Codable, Equatable, Sendable {
    public var name: String
    public var patterns: [Pattern]
    public var body: EquationBody
    public var span: Span

    public init(name: String, patterns: [Pattern], body: EquationBody, span: Span) {
        self.name = name
        self.patterns = patterns
        self.body = body
        self.span = span
    }
}

public indirect enum EquationBody: Codable, Equatable, Sendable {
    case expression(Expression)
    case doBlock(DoBlock)
}

public struct MacroDecl: Codable, Equatable, Sendable {
    public var name: String
    public var typeParams: [String]
    public var params: [ParamDef]
    public var body: DoBlock
    public var span: Span

    public init(name: String, typeParams: [String], params: [ParamDef], body: DoBlock, span: Span) {
        self.name = name
        self.typeParams = typeParams
        self.params = params
        self.body = body
        self.span = span
    }
}

public struct ParamDef: Codable, Equatable, Sendable {
    public var name: String
    public var type: TypeSpec

    public init(name: String, type: TypeSpec) {
        self.name = name
        self.type = type
    }
}

public struct Program: Codable, Equatable, Sendable {
    public var declarations: [Declaration]
    public var span: Span

    public init(declarations: [Declaration], span: Span) {
        self.declarations = declarations
        self.span = span
    }
}

// MARK: - Golden test helpers

public enum MoonASTStrip {
    public static func stripSpans<T: Encodable>(_ value: T) throws -> Data {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        let data = try encoder.encode(value)
        var json = try JSONSerialization.jsonObject(with: data)
        json = strip(json)
        return try JSONSerialization.data(withJSONObject: json, options: [.sortedKeys])
    }

    private static func strip(_ value: Any) -> Any {
        if var dict = value as? [String: Any] {
            dict.removeValue(forKey: "span")
            for (key, val) in dict {
                dict[key] = strip(val)
            }
            return dict
        }
        if let array = value as? [Any] {
            return array.map { strip($0) }
        }
        return value
    }
}

public enum MoonASTVersion {
    public static let current = "0.3.0-swift"
}
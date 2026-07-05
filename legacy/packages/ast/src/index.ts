export interface Span {
  start: { line: number; column: number; offset: number };
  end: { line: number; column: number; offset: number };
}

export interface Located<T> {
  node: T;
  span: Span;
}

// --- Types ---

export type TypeSpec =
  | { kind: "Var"; name: string; span: Span }
  | { kind: "Con"; name: string; args: TypeSpec[]; span: Span }
  | { kind: "List"; element: TypeSpec; span: Span }
  | { kind: "Tuple"; elements: TypeSpec[]; span: Span }
  | { kind: "Arrow"; from: TypeSpec; to: TypeSpec; span: Span };

// --- Patterns ---

export type Pattern =
  | { kind: "PVar"; name: string; span: Span }
  | { kind: "PWildcard"; span: Span }
  | { kind: "PLit"; value: Literal; span: Span }
  | { kind: "PCon"; name: string; args: Pattern[]; span: Span }
  | { kind: "PTuple"; elements: Pattern[]; span: Span }
  | { kind: "PList"; elements: Pattern[]; span: Span };

// --- Literals ---

export type Literal =
  | { kind: "String"; value: string; span: Span }
  | { kind: "Int"; value: number; span: Span }
  | { kind: "Float"; value: number; span: Span }
  | { kind: "Bool"; value: boolean; span: Span };

// --- Expressions ---

export type Expression =
  | { kind: "Lit"; value: Literal; span: Span }
  | { kind: "Var"; name: string; span: Span }
  | { kind: "App"; func: Expression; arg: Expression; span: Span }
  | { kind: "Infix"; op: string; left: Expression; right: Expression; span: Span }
  | { kind: "Prefix"; op: string; operand: Expression; span: Span }
  | { kind: "FieldAccess"; object: Expression; field: string; span: Span }
  | { kind: "Lambda"; params: string[]; body: Expression | DoBlock; span: Span }
  | { kind: "If"; condition: Expression; thenBranch: Expression; elseBranch: Expression; span: Span }
  | { kind: "Record"; name: string; fields: RecordField[]; span: Span }
  | { kind: "List"; elements: Expression[]; span: Span }
  | { kind: "Tuple"; elements: Expression[]; span: Span }
  | { kind: "Paren"; expr: Expression; span: Span }
  | { kind: "Do"; block: DoBlock; span: Span }
  | { kind: "Agent"; decl: AgentDecl; span: Span }
  | { kind: "Model"; decl: ModelDecl; span: Span };

export interface RecordField {
  name: string;
  value: Expression;
  span: Span;
}

// --- Do blocks ---

export interface DoBlock {
  statements: DoStatement[];
  span: Span;
}

export type DoStatement =
  | { kind: "Bind"; pattern: Pattern; expr: Expression; config: ConfigItem[]; span: Span }
  | { kind: "Storm"; pattern: Pattern; input: Expression; config: ConfigItem[]; span: Span }
  | { kind: "Let"; pattern: Pattern; expr: Expression; span: Span }
  | { kind: "Action"; expr: Expression; config: ConfigItem[]; span: Span };

export interface ConfigItem {
  key: string;
  value: Expression;
  span: Span;
}

// --- Declarations ---

export type Declaration =
  | { kind: "Import"; path: string[]; alias?: string; span: Span }
  | { kind: "Model"; decl: ModelDecl; span: Span }
  | { kind: "Agent"; decl: AgentDecl; span: Span }
  | { kind: "Data"; decl: DataDecl; span: Span }
  | { kind: "Instance"; decl: InstanceDecl; span: Span }
  | { kind: "Function"; decl: FunctionDecl; span: Span }
  | { kind: "Macro"; decl: MacroDecl; span: Span };

export interface ModelDecl {
  name: string;
  typeParams: string[];
  implements?: string;
  fields: FieldDef[];
  span: Span;
}

export interface FieldDef {
  name: string;
  type: TypeSpec;
  modifiers: FieldModifier[];
  span: Span;
}

export type FieldModifier =
  | { kind: "Constraint"; expr: Expression; span: Span }
  | { kind: "Default"; expr: Expression; span: Span }
  | { kind: "FetchedFrom"; sources: SourceSpec[]; span: Span }
  | { kind: "Optional"; span: Span };

export interface SourceSpec {
  source: string;
  field: string;
  span: Span;
}

export interface AgentDecl {
  name: string;
  typeParams: string[];
  type: TypeSpec;
  routesTo?: string;
  config: ConfigItem[];
  span: Span;
}

export interface DataDecl {
  name: string;
  typeParams: string[];
  constructors: Constructor[];
  span: Span;
}

export interface Constructor {
  name: string;
  args?: ConstructorArgs;
  span: Span;
}

export type ConstructorArgs =
  | { kind: "Positional"; types: TypeSpec[]; span: Span }
  | { kind: "Record"; fields: { name: string; type: TypeSpec; span: Span }[]; span: Span };

export interface InstanceDecl {
  className: string;
  type: TypeSpec;
  typeParams: string[];
  functions: FunctionDecl[];
  span: Span;
}

export interface FunctionDecl {
  signature?: { name: string; type: TypeSpec; span: Span };
  equations: FunctionEquation[];
  span: Span;
}

export interface FunctionEquation {
  name: string;
  patterns: Pattern[];
  body: Expression | DoBlock;
  span: Span;
}

export interface MacroDecl {
  name: string;
  typeParams: string[];
  params: { name: string; type: TypeSpec }[];
  body: DoBlock;
  span: Span;
}

export interface Program {
  declarations: Declaration[];
  span: Span;
}

// --- Serialization (for golden tests) ---

export function stripSpans<T>(node: T): T {
  if (node === null || node === undefined) return node;
  if (Array.isArray(node)) return node.map(stripSpans) as T;
  if (typeof node !== "object") return node;

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (key === "span") continue;
    result[key] = stripSpans(value);
  }
  return result as T;
}
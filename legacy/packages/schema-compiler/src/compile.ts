import type {
  Constructor,
  DataDecl,
  Expression,
  FieldDef,
  ModelDecl,
  Program,
  TypeSpec,
} from "@moon/ast";

export type JsonSchema = {
  type?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  maxLength?: number;
  maxItems?: number;
  description?: string;
};

export interface SchemaWarning {
  message: string;
  line: number;
  column: number;
}

export interface CompileResult {
  schemas: Record<string, JsonSchema>;
  warnings: SchemaWarning[];
}

export function compileSchemas(program: Program): CompileResult {
  const schemas: Record<string, JsonSchema> = {};
  const warnings: SchemaWarning[] = [];

  for (const decl of program.declarations) {
    if (decl.kind === "Model") {
      schemas[decl.decl.name] = compileModel(decl.decl, warnings);
    } else if (decl.kind === "Data") {
      compileData(decl.decl, schemas, warnings);
    }
  }

  return { schemas, warnings };
}

function compileData(decl: DataDecl, schemas: Record<string, JsonSchema>, warnings: SchemaWarning[]): void {
  const nullary = decl.constructors.filter((c) => !c.args || (c.args.kind === "Positional" && c.args.types.length === 0));
  if (nullary.length > 0 && decl.constructors.every((c) => !c.args || c.args.kind !== "Record")) {
    schemas[decl.name] = {
      enum: nullary.map((c) => c.name),
    };
  }

  for (const con of decl.constructors) {
    if (con.args?.kind === "Record") {
      schemas[con.name] = compileRecordFields(con.name, con.args.fields, warnings);
    }
  }
}

function compileModel(decl: ModelDecl, warnings: SchemaWarning[]): JsonSchema {
  return compileRecordFields(decl.name, decl.fields, warnings);
}

function compileRecordFields(
  name: string,
  fields: FieldDef[] | { name: string; type: TypeSpec; modifiers?: FieldDef["modifiers"] }[],
  warnings: SchemaWarning[],
): JsonSchema {
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const field of fields) {
    const modifiers = "modifiers" in field ? field.modifiers : [];
    const optional = modifiers.some((m) => m.kind === "Optional");
    let schema = compileType(field.type);

    for (const mod of modifiers) {
      if (mod.kind === "Constraint") {
        schema = applyConstraint(schema, mod.expr, warnings, mod.span.start.line, mod.span.start.column);
      }
    }

    properties[field.name] = schema;
    if (!optional) {
      required.push(field.name);
    }
  }

  return {
    type: "object",
    description: name,
    properties,
    required,
  };
}

function compileType(spec: TypeSpec): JsonSchema {
  switch (spec.kind) {
    case "Var":
      return typeNameToSchema(spec.name);
    case "List":
      return { type: "array", items: compileType(spec.element) };
    case "Con":
      if (spec.args.length === 0) {
        return typeNameToSchema(spec.name);
      }
      return {
        type: "object",
        description: `${spec.name} ${spec.args.map((a) => typeLabel(a)).join(" ")}`,
        properties: {},
        required: [],
      };
    case "Tuple":
      return {
        type: "array",
        items: { enum: spec.elements.map((_, i) => String(i)) },
        description: `tuple(${spec.elements.map(typeLabel).join(", ")})`,
      };
    case "Arrow":
      return { description: `${typeLabel(spec.from)} -> ${typeLabel(spec.to)}` };
  }
}

function typeLabel(spec: TypeSpec): string {
  switch (spec.kind) {
    case "Var":
      return spec.name;
    case "List":
      return `[${typeLabel(spec.element)}]`;
    case "Con":
      return spec.args.length === 0 ? spec.name : `${spec.name} ${spec.args.map(typeLabel).join(" ")}`;
    case "Tuple":
      return `(${spec.elements.map(typeLabel).join(", ")})`;
    case "Arrow":
      return `${typeLabel(spec.from)} -> ${typeLabel(spec.to)}`;
  }
}

function typeNameToSchema(name: string): JsonSchema {
  switch (name) {
    case "String":
      return { type: "string" };
    case "Int":
      return { type: "integer" };
    case "Float":
      return { type: "number" };
    case "Bool":
      return { type: "boolean" };
    default:
      return { description: name };
  }
}

function applyConstraint(
  schema: JsonSchema,
  expr: Expression,
  warnings: SchemaWarning[],
  line: number,
  column: number,
): JsonSchema {
  const between = parseBetweenConstraint(expr);
  if (between) {
    return { ...schema, minimum: between.min, maximum: between.max };
  }

  const length = parseLengthConstraint(expr);
  if (length !== null) {
    if (schema.type === "string") {
      return { ...schema, maxLength: length };
    }
    if (schema.type === "array") {
      return { ...schema, maxItems: length };
    }
    return { ...schema, maxItems: length };
  }

  warnings.push({ message: `Unrecognized constraint: ${exprToString(expr)}`, line, column });
  return schema;
}

function parseBetweenConstraint(expr: Expression): { min: number; max: number } | null {
  if (expr.kind !== "App" || expr.arg.kind !== "Lit") return null;
  const inner = expr.func;
  if (inner.kind !== "App" || inner.func.kind !== "Var" || inner.func.name !== "between") return null;
  if (inner.arg.kind !== "Lit") return null;
  const min = literalNumber(inner.arg);
  const max = literalNumber(expr.arg);
  if (min === null || max === null) return null;
  return { min, max };
}

function parseLengthConstraint(expr: Expression): number | null {
  if (expr.kind !== "Infix" || expr.op !== "<=") return null;
  if (expr.left.kind !== "Var" || expr.left.name !== "length") return null;
  if (expr.right.kind !== "Lit") return null;
  return literalNumber(expr.right);
}

function literalNumber(expr: Expression): number | null {
  if (expr.kind !== "Lit") return null;
  if (expr.value.kind === "Int" || expr.value.kind === "Float") return expr.value.value;
  return null;
}

function exprToString(expr: Expression): string {
  switch (expr.kind) {
    case "Var":
      return expr.name;
    case "Lit":
      return JSON.stringify(expr.value.kind === "String" ? expr.value.value : expr.value.value);
    case "App":
      return `${exprToString(expr.func)} ${exprToString(expr.arg)}`;
    case "Infix":
      return `${exprToString(expr.left)} ${expr.op} ${exprToString(expr.right)}`;
    default:
      return expr.kind;
  }
}


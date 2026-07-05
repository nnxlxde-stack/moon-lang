import type { Span, TypeSpec } from "@moon/ast";

export type MoonType =
  | { kind: "Var"; id: number }
  | { kind: "Con"; name: string; args: MoonType[] }
  | { kind: "Arrow"; from: MoonType; to: MoonType }
  | { kind: "Record"; name: string; fields: { name: string; type: MoonType }[] }
  | { kind: "Tuple"; elements: MoonType[] };

export interface Scheme {
  vars: number[];
  type: MoonType;
}

export interface TypeConstructor {
  name: string;
  params: string[];
  kind: "model" | "data" | "alias";
  fields?: { name: string; type: MoonType }[];
  constructors?: DataConstructor[];
}

export interface DataConstructor {
  name: string;
  fields: { name: string; type: MoonType }[];
  args: MoonType[];
}

export interface ClassMethod {
  name: string;
  type: Scheme;
}

export interface TypeClass {
  name: string;
  params: string[];
  methods: ClassMethod[];
}

export interface Instance {
  className: string;
  types: MoonType[];
  methods: Map<string, Scheme>;
}

let nextId = 0;

export function freshVar(): MoonType {
  return { kind: "Var", id: nextId++ };
}

export function resetVarSupply(): void {
  nextId = 0;
}

export function prim(name: string, ...args: MoonType[]): MoonType {
  return { kind: "Con", name, args };
}

export function fn(from: MoonType, to: MoonType): MoonType {
  return { kind: "Arrow", from, to };
}

export function listOf(t: MoonType): MoonType {
  return prim("List", t);
}

export function io(t: MoonType): MoonType {
  return prim("IO", t);
}

export function tuple(...elements: MoonType[]): MoonType {
  return { kind: "Tuple", elements };
}

export function record(name: string, fields: { name: string; type: MoonType }[]): MoonType {
  return { kind: "Record", name, fields };
}

const KNOWN_TYPES = new Set([
  "String", "Int", "Float", "Bool", "IO", "List", "Unit",
  "Code", "Documentation", "Requirements", "Entity", "Agent", "Scope",
  "PullRequest", "ChangedFile", "LongTerm", "Finding", "Recommendation",
  "Suggestion", "Location", "Severity", "Category", "Verdict",
  "Analyzer", "Reviewer", "AnalysisResult", "ReviewResult",
]);

function isTypeVarName(name: string): boolean {
  return /^[a-z]/.test(name) && !KNOWN_TYPES.has(name);
}

export function typeSpecToMoon(spec: TypeSpec, varMap?: Map<string, MoonType>): MoonType {
  switch (spec.kind) {
    case "Var": {
      if (varMap && isTypeVarName(spec.name)) {
        if (!varMap.has(spec.name)) {
          varMap.set(spec.name, freshVar());
        }
        return varMap.get(spec.name)!;
      }
      return prim(spec.name);
    }
    case "List":
      return listOf(typeSpecToMoon(spec.element, varMap));
    case "Tuple":
      return tuple(...spec.elements.map((e) => typeSpecToMoon(e, varMap)));
    case "Arrow":
      return fn(typeSpecToMoon(spec.from, varMap), typeSpecToMoon(spec.to, varMap));
    case "Con": {
      const args = spec.args.map((a) => typeSpecToMoon(a, varMap));
      return prim(spec.name, ...args);
    }
  }
}

export function typeSpecToScheme(spec: TypeSpec): Scheme {
  const varMap = new Map<string, MoonType>();
  const type = typeSpecToMoon(spec, varMap);
  const vars = [...varMap.values()]
    .filter((t): t is { kind: "Var"; id: number } => t.kind === "Var")
    .map((t) => t.id);
  return { vars, type };
}

function freeVars(t: MoonType, acc = new Set<number>()): Set<number> {
  switch (t.kind) {
    case "Var":
      acc.add(t.id);
      break;
    case "Con":
      t.args.forEach((a) => freeVars(a, acc));
      break;
    case "Arrow":
      freeVars(t.from, acc);
      freeVars(t.to, acc);
      break;
    case "Record":
      t.fields.forEach((f) => freeVars(f.type, acc));
      break;
    case "Tuple":
      t.elements.forEach((e) => freeVars(e, acc));
      break;
  }
  return acc;
}

export function generalize(envVars: Set<number>, t: MoonType): Scheme {
  const fvs = [...freeVars(t)].filter((id) => !envVars.has(id));
  return { vars: fvs, type: t };
}

export function instantiate(scheme: Scheme, supply: { fresh: () => MoonType }): MoonType {
  const subst = new Map<number, MoonType>();
  for (const v of scheme.vars) {
    subst.set(v, supply.fresh());
  }
  return applySubst(subst, scheme.type);
}

export function applySubst(subst: Map<number, MoonType>, t: MoonType): MoonType {
  switch (t.kind) {
    case "Var": {
      const s = subst.get(t.id);
      if (!s) return t;
      return applySubst(subst, s);
    }
    case "Con":
      return { kind: "Con", name: t.name, args: t.args.map((a) => applySubst(subst, a)) };
    case "Arrow":
      return fn(applySubst(subst, t.from), applySubst(subst, t.to));
    case "Record":
      return record(
        t.name,
        t.fields.map((f) => ({ name: f.name, type: applySubst(subst, f.type) })),
      );
    case "Tuple":
      return tuple(...t.elements.map((e) => applySubst(subst, e)));
  }
}

function occurs(id: number, t: MoonType): boolean {
  switch (t.kind) {
    case "Var":
      return t.id === id;
    case "Con":
      return t.args.some((a) => occurs(id, a));
    case "Arrow":
      return occurs(id, t.from) || occurs(id, t.to);
    case "Record":
      return t.fields.some((f) => occurs(id, f.type));
    case "Tuple":
      return t.elements.some((e) => occurs(id, e));
  }
}

export class UnifyError extends Error {
  constructor(
    message: string,
    public span?: Span,
  ) {
    super(message);
    this.name = "UnifyError";
  }
}

export function unify(t1: MoonType, t2: MoonType, span?: Span): Map<number, MoonType> {
  const subst = new Map<number, MoonType>();
  unifyMut(subst, t1, t2, span);
  return subst;
}

function unifyMut(subst: Map<number, MoonType>, t1: MoonType, t2: MoonType, span?: Span): void {
  const a = applySubst(subst, t1);
  const b = applySubst(subst, t2);

  if (a.kind === "Var") {
    bind(subst, a.id, b, span);
    return;
  }
  if (b.kind === "Var") {
    bind(subst, b.id, a, span);
    return;
  }

  if (a.kind !== b.kind) {
    if (a.kind === "Record" && b.kind === "Record" && a.name === b.name) {
      unifyFields(subst, a.fields, b.fields, span);
      return;
    }
    throw new UnifyError(`Type mismatch: ${formatType(a)} vs ${formatType(b)}`, span);
  }

  switch (a.kind) {
    case "Con": {
      const bc = b as typeof a;
      if (a.args.length !== bc.args.length) {
        throw new UnifyError(`Type mismatch: ${formatType(a)} vs ${formatType(b)}`, span);
      }
      if (a.name !== bc.name && !compatibleTypes(a.name, bc.name)) {
        throw new UnifyError(`Type mismatch: ${formatType(a)} vs ${formatType(b)}`, span);
      }
      for (let i = 0; i < a.args.length; i++) {
        unifyMut(subst, a.args[i]!, bc.args[i]!, span);
      }
      break;
    }
    case "Arrow":
      unifyMut(subst, a.from, (b as typeof a).from, span);
      unifyMut(subst, a.to, (b as typeof a).to, span);
      break;
    case "Record":
      unifyFields(subst, a.fields, (b as typeof a).fields, span);
      break;
    case "Tuple":
      if (a.elements.length !== (b as typeof a).elements.length) {
        throw new UnifyError(`Tuple arity mismatch`, span);
      }
      for (let i = 0; i < a.elements.length; i++) {
        unifyMut(subst, a.elements[i]!, (b as typeof a).elements[i]!, span);
      }
      break;
  }
}

function unifyFields(
  subst: Map<number, MoonType>,
  fa: { name: string; type: MoonType }[],
  fb: { name: string; type: MoonType }[],
  span?: Span,
): void {
  if (fa.length !== fb.length) {
    throw new UnifyError("Record field count mismatch", span);
  }
  for (let i = 0; i < fa.length; i++) {
    if (fa[i]!.name !== fb[i]!.name) {
      throw new UnifyError(`Record field mismatch: ${fa[i]!.name} vs ${fb[i]!.name}`, span);
    }
    unifyMut(subst, fa[i]!.type, fb[i]!.type, span);
  }
}

const COMPATIBLE_TYPES: Record<string, string[]> = {
  Code: ["PullRequest"],
  PullRequest: ["Code"],
};

function compatibleTypes(a: string, b: string): boolean {
  return COMPATIBLE_TYPES[a]?.includes(b) ?? false;
}

function bind(subst: Map<number, MoonType>, id: number, t: MoonType, span?: Span): void {
  const applied = applySubst(subst, t);
  if (occurs(id, applied)) {
    throw new UnifyError("Infinite type", span);
  }
  subst.set(id, applied);
}

export function formatType(t: MoonType): string {
  switch (t.kind) {
    case "Var":
      return `?${t.id}`;
    case "Con":
      if (t.args.length === 0) return t.name;
      return `${t.name} ${t.args.map(formatType).join(" ")}`;
    case "Arrow": {
      const left = t.from.kind === "Arrow" ? `(${formatType(t.from)})` : formatType(t.from);
      return `${left} -> ${formatType(t.to)}`;
    }
    case "Record":
      return `${t.name} { ${t.fields.map((f) => `${f.name}: ${formatType(f.type)}`).join(", ")} }`;
    case "Tuple":
      return `(${t.elements.map(formatType).join(", ")})`;
  }
}
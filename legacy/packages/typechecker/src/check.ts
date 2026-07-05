import type {
  AgentDecl,
  DataDecl,
  Declaration,
  DoBlock,
  DoStatement,
  Expression,
  FieldDef,
  FunctionDecl,
  ModelDecl,
  Pattern,
  Program,
  TypeSpec,
} from "@moon/ast";
import type { TypeEnv } from "./env";
import { envVarIds } from "./env";
import {
  applySubst,
  formatType,
  freshVar,
  fn,
  generalize,
  instantiate,
  io,
  listOf,
  prim,
  record,
  type DataConstructor,
  type MoonType,
  type Scheme,
  type TypeConstructor,
  typeSpecToMoon,
  typeSpecToScheme,
  unify,
  UnifyError,
} from "./types";

export class TypeError extends Error {
  constructor(
    message: string,
    public line: number,
    public column: number,
  ) {
    super(`${message} at ${line}:${column}`);
    this.name = "TypeError";
  }
}

interface InferResult {
  type: MoonType;
  subst: Map<number, MoonType>;
}

export interface CheckResult {
  ok: boolean;
  errors: TypeError[];
  env: TypeEnv;
}

export function checkProgram(program: Program, env: TypeEnv): CheckResult {
  const errors: TypeError[] = [];
  let subst = new Map<number, MoonType>();

  const run = <T>(span: { start: { line: number; column: number } }, f: () => T): T | undefined => {
    try {
      return f();
    } catch (e) {
      if (e instanceof UnifyError) {
        errors.push(new TypeError(e.message, span.start.line, span.start.column));
        return undefined;
      }
      if (e instanceof TypeError) {
        errors.push(e);
        return undefined;
      }
      throw e;
    }
  };

  for (const decl of program.declarations) {
    if (decl.kind === "Model") {
      registerModel(env, decl.decl);
    } else if (decl.kind === "Data") {
      registerData(env, decl.decl);
    }
  }

  for (const decl of program.declarations) {
    if (decl.kind === "Agent") {
      run(decl.span, () => registerAgent(env, decl.decl));
    } else if (decl.kind === "Function" && decl.decl.signature) {
      run(decl.span, () => registerFunctionSig(env, decl.decl));
    }
  }

  for (const decl of program.declarations) {
    if (decl.kind === "Function") {
      run(decl.span, () => {
        subst = compose(subst, checkFunction(env, decl.decl, errors));
      });
    } else if (decl.kind === "Instance") {
      run(decl.span, () => registerInstance(env, decl.decl, errors));
    }
  }

  return { ok: errors.length === 0, errors, env };
}

function compose(a: Map<number, MoonType>, b: Map<number, MoonType>): Map<number, MoonType> {
  const result = new Map(a);
  for (const [k, v] of b) {
    result.set(k, applySubst(result, v));
  }
  return result;
}

function registerModel(env: TypeEnv, decl: ModelDecl): void {
  const paramSubst = new Map<string, MoonType>();
  for (const p of decl.typeParams) {
    paramSubst.set(p, freshVar());
  }
  const fields = decl.fields.map((f) => ({
    name: f.name,
    type: applyTypeParams(typeSpecToMoon(f.type), paramSubst),
  }));
  const tc: TypeConstructor = {
    name: decl.name,
    params: decl.typeParams,
    kind: "model",
    fields,
  };
  env.constructors.set(decl.name, tc);
  env.values.set(decl.name, {
    vars: [...paramSubst.values()].filter((t): t is { kind: "Var"; id: number } => t.kind === "Var").map((t) => t.id),
    type: prim(decl.name, ...paramSubst.values()),
  });
}

function registerData(env: TypeEnv, decl: DataDecl): void {
  const paramSubst = new Map<string, MoonType>();
  for (const p of decl.typeParams) {
    paramSubst.set(p, freshVar());
  }
  const constructors: DataConstructor[] = decl.constructors.map((c) => {
    if (c.args?.kind === "Record") {
      return {
        name: c.name,
        fields: c.args.fields.map((f) => ({
          name: f.name,
          type: applyTypeParams(typeSpecToMoon(f.type), paramSubst),
        })),
        args: [],
      };
    }
    const types = c.args?.kind === "Positional" ? c.args.types.map((t) => applyTypeParams(typeSpecToMoon(t), paramSubst)) : [];
    return { name: c.name, fields: [], args: types };
  });
  env.constructors.set(decl.name, {
    name: decl.name,
    params: decl.typeParams,
    kind: "data",
    constructors,
  });
  for (const c of constructors) {
    const fieldTypes = c.fields.map((f) => f.type);
    const argTypes = c.args.length > 0 ? c.args : fieldTypes;
    const conType = argTypes.reduceRight<MoonType>((acc, t) => fn(t, acc), prim(decl.name, ...paramSubst.values()));
    env.values.set(c.name, { vars: [], type: conType });
  }
}

function applyTypeParams(t: MoonType, subst: Map<string, MoonType>): MoonType {
  if (t.kind === "Con" && t.args.length === 0 && subst.has(t.name)) {
    return subst.get(t.name)!;
  }
  if (t.kind === "Con") {
    return prim(t.name, ...t.args.map((a) => applyTypeParams(a, subst)));
  }
  if (t.kind === "Arrow") return fn(applyTypeParams(t.from, subst), applyTypeParams(t.to, subst));
  if (t.kind === "Record") {
    return record(t.name, t.fields.map((f) => ({ name: f.name, type: applyTypeParams(f.type, subst) })));
  }
  if (t.kind === "Tuple") {
    return { kind: "Tuple", elements: t.elements.map((e) => applyTypeParams(e, subst)) };
  }
  return t;
}

function registerAgent(env: TypeEnv, decl: AgentDecl): void {
  const agentType = typeSpecToMoon(decl.type);
  env.values.set(decl.name, generalize(envVarIds(env), agentType));

  if (agentType.kind === "Con") {
    const className = agentType.name;
    const tc = env.classes.get(className);
    if (tc) {
      const methods = new Map<string, Scheme>();
      for (const m of tc.methods) {
        methods.set(m.name, m.type);
      }
      env.instances.push({ className, types: agentType.args, methods });
    }
  }
}

function registerInstance(env: TypeEnv, decl: import("@moon/ast").InstanceDecl, errors: TypeError[]): void {
  const instanceType = typeSpecToMoon(decl.type);
  const methods = new Map<string, Scheme>();
  for (const f of decl.functions) {
    if (f.signature) {
      const scheme = generalize(envVarIds(env), typeSpecToMoon(f.signature.type));
      methods.set(f.signature.name, scheme);
      env.values.set(`${decl.className}.${f.signature.name}`, scheme);
    }
    checkFunction(env, f, errors);
  }
  env.instances.push({ className: decl.className, types: [instanceType], methods });
}

function checkFunction(env: TypeEnv, decl: FunctionDecl, errors: TypeError[]): Map<number, MoonType> {
  let subst = new Map<number, MoonType>();
  const supply = { fresh: freshVar };

  for (const eq of decl.equations) {
    const local = new Map(env.values);
    const expected = decl.signature
      ? instantiate(typeSpecToScheme(decl.signature.type), supply)
      : local.get(eq.name)
        ? instantiate(local.get(eq.name)!, supply)
        : undefined;

    let patSubst = new Map<number, MoonType>();
    let argTypes: MoonType[] = [];

    for (const pat of eq.patterns) {
      const pt = freshVar();
      argTypes.push(pt);
      patSubst = compose(patSubst, checkPattern(env, pat, pt, errors));
    }

    const bodyType = freshVar();
    const lambdaType = argTypes.reduceRight<MoonType>((acc, t) => fn(t, acc), bodyType);

    if (expected) {
      subst = compose(subst, unify(lambdaType, expected, eq.span));
    }

    const bodyEnv: TypeEnv = { ...env, values: new Map(local) };
    applyPatternBindings(bodyEnv, eq.patterns, argTypes, patSubst);

    const bodyResult = checkExpr(bodyEnv, eq.body, supply);
    subst = compose(subst, compose(patSubst, bodyResult.subst));
    subst = compose(subst, unify(applySubst(subst, bodyResult.type), bodyType, eq.span));

    if (!decl.signature && eq.patterns.length === 0) {
      const gen = generalize(envVarIds(env), applySubst(subst, bodyResult.type));
      local.set(eq.name, gen);
      env.values.set(eq.name, gen);
    }
  }

  return subst;
}

function applyPatternBindings(
  env: TypeEnv,
  patterns: Pattern[],
  types: MoonType[],
  subst: Map<number, MoonType>,
): void {
  for (let i = 0; i < patterns.length; i++) {
    bindPattern(env, patterns[i]!, applySubst(subst, types[i]!));
  }
}

function bindPattern(env: TypeEnv, pat: Pattern, type: MoonType): void {
  switch (pat.kind) {
    case "PVar":
      env.values.set(pat.name, { vars: [], type });
      break;
    case "PWildcard":
      break;
    case "PCon": {
      const dataTc = [...env.constructors.values()].find((tc) =>
        tc.constructors?.some((c) => c.name === pat.name),
      );
      const con = dataTc?.constructors?.find((c) => c.name === pat.name);
      if (con && pat.args.length > 0) {
        if (con.fields.length > 0) {
          for (let i = 0; i < pat.args.length; i++) {
            bindPattern(env, pat.args[i]!, con.fields[i]?.type ?? type);
          }
        } else {
          for (let i = 0; i < pat.args.length; i++) {
            bindPattern(env, pat.args[i]!, con.args[i] ?? type);
          }
        }
      }
      break;
    }
    default:
      break;
  }
}

function checkPattern(
  env: TypeEnv,
  pat: Pattern,
  expected: MoonType,
  errors: TypeError[],
): Map<number, MoonType> {
  try {
    switch (pat.kind) {
      case "PVar":
        return new Map();
      case "PWildcard":
        return new Map();
      case "PLit": {
        const litType =
          pat.value.kind === "String" ? prim("String")
          : pat.value.kind === "Int" ? prim("Int")
          : pat.value.kind === "Float" ? prim("Float")
          : prim("Bool");
        return unify(litType, expected, pat.span);
      }
      case "PCon": {
        const scheme = env.values.get(pat.name);
        if (!scheme) {
          errors.push(new TypeError(`Unknown constructor ${pat.name}`, pat.span.start.line, pat.span.start.column));
          return new Map();
        }
        const supply = { fresh: freshVar };
        const conType = instantiate(scheme, supply);
        if (pat.args.length === 0) {
          return unify(conType, expected, pat.span);
        }
        let subst = new Map<number, MoonType>();
        let cur = conType;
        for (const arg of pat.args) {
          const argType = freshVar();
          subst = compose(subst, unify(cur, fn(argType, freshVar()), pat.span));
          const arrow = applySubst(subst, cur);
          if (arrow.kind === "Arrow") {
            subst = compose(subst, unify(arrow.from, argType, pat.span));
            cur = arrow.to;
            subst = compose(subst, checkPattern(env, arg, argType, errors));
          }
        }
        subst = compose(subst, unify(applySubst(subst, cur), expected, pat.span));
        return subst;
      }
      default:
        return new Map();
    }
  } catch (e) {
    if (e instanceof UnifyError) {
      errors.push(new TypeError(e.message, pat.span.start.line, pat.span.start.column));
      return new Map();
    }
    throw e;
  }
}

function checkExpr(env: TypeEnv, expr: Expression | DoBlock, supply: { fresh: () => MoonType }): InferResult {
  if ("statements" in expr) {
    return checkDoBlock(env, expr, supply);
  }

  const span = expr.span;
  let subst = new Map<number, MoonType>();

  switch (expr.kind) {
    case "Lit": {
      const t =
        expr.value.kind === "String" ? prim("String")
        : expr.value.kind === "Int" ? prim("Int")
        : expr.value.kind === "Float" ? prim("Float")
        : prim("Bool");
      return { type: t, subst };
    }
    case "Var": {
      const scheme = env.values.get(expr.name);
      if (!scheme) {
        throw new TypeError(`Unknown variable ${expr.name}`, span.start.line, span.start.column);
      }
      return { type: instantiate(scheme, supply), subst };
    }
    case "App": {
      const f = checkExpr(env, expr.func, supply);
      const a = checkExpr(env, expr.arg, supply);
      subst = compose(subst, compose(f.subst, a.subst));
      const ret = supply.fresh();
      subst = compose(subst, unify(applySubst(subst, f.type), fn(applySubst(subst, a.type), ret), span));
      return { type: ret, subst };
    }
    case "Infix": {
      if (expr.op === ".") {
        const f = checkExpr(env, expr.left, supply);
        const g = checkExpr(env, expr.right, supply);
        subst = compose(subst, compose(f.subst, g.subst));
        const ret = supply.fresh();
        const mid = supply.fresh();
        const arg = supply.fresh();
        subst = compose(subst, unify(applySubst(subst, g.type), fn(arg, mid), span));
        subst = compose(subst, unify(applySubst(subst, f.type), fn(mid, ret), span));
        return { type: fn(arg, ret), subst };
      }
      const opScheme = env.values.get(expr.op);
      if (opScheme) {
        const opType = instantiate(opScheme, supply);
        const l = checkExpr(env, expr.left, supply);
        const r = checkExpr(env, expr.right, supply);
        subst = compose(subst, compose(l.subst, r.subst));
        subst = compose(subst, unify(opType, fn(applySubst(subst, l.type), fn(applySubst(subst, r.type), supply.fresh())), span));
        const applied = applySubst(subst, opType);
        if (applied.kind === "Arrow" && applied.to.kind === "Arrow") {
          return { type: applied.to.to, subst };
        }
      }
      const l = checkExpr(env, expr.left, supply);
      const r = checkExpr(env, expr.right, supply);
      subst = compose(subst, compose(l.subst, r.subst));
      const ret = supply.fresh();
      subst = compose(subst, unify(fn(applySubst(subst, l.type), fn(applySubst(subst, r.type), ret)), fn(prim("Bool"), fn(prim("Bool"), prim("Bool"))), span));
      return { type: ret, subst };
    }
    case "Prefix": {
      const operand = checkExpr(env, expr.operand, supply);
      subst = compose(subst, operand.subst);
      if (expr.op === "not") {
        subst = compose(subst, unify(operand.type, prim("Bool"), span));
        return { type: prim("Bool"), subst };
      }
      subst = compose(subst, unify(operand.type, prim("Float"), span));
      return { type: prim("Float"), subst };
    }
    case "FieldAccess": {
      const obj = checkExpr(env, expr.object, supply);
      subst = compose(subst, obj.subst);
      const objType = applySubst(subst, obj.type);

      if (objType.kind === "Record") {
        const field = objType.fields.find((f) => f.name === expr.field);
        if (field) return { type: field.type, subst };
      }

      const methodType = resolveMethod(env, objType, expr.field, supply);
      if (methodType) return { type: methodType, subst };

      const fieldType = supply.fresh();
      const rowType = record("_row", [{ name: expr.field, type: fieldType }]);
      subst = compose(subst, unify(objType, rowType, span));
      return { type: fieldType, subst };
    }
    case "Record": {
      const tc = env.constructors.get(expr.name);
      if (!tc?.fields) {
        throw new TypeError(`Unknown record type ${expr.name}`, span.start.line, span.start.column);
      }
      const paramSubst = new Map<string, MoonType>();
      const recType = supply.fresh();
      subst = compose(subst, unify(recType, prim(expr.name, ...tc.params.map((p) => {
        const v = supply.fresh();
        paramSubst.set(p, v);
        return v;
      })), span));

      const expectedFields = tc.fields.map((f) => ({
        name: f.name,
        type: applyTypeParams(f.type, paramSubst),
      }));

      for (const field of expr.fields) {
        const exp = checkExpr(env, field.value, supply);
        subst = compose(subst, exp.subst);
        const expected = expectedFields.find((f) => f.name === field.name);
        if (expected) {
          subst = compose(subst, unify(applySubst(subst, exp.type), expected.type, field.span));
        }
      }

      const resultType = prim(expr.name, ...tc.params.map((p) => paramSubst.get(p) ?? prim(p)));
      return { type: resultType, subst };
    }
    case "List": {
      const elemType = supply.fresh();
      for (const el of expr.elements) {
        const e = checkExpr(env, el, supply);
        subst = compose(subst, e.subst);
        subst = compose(subst, unify(applySubst(subst, e.type), elemType, el.span));
      }
      return { type: listOf(applySubst(subst, elemType)), subst };
    }
    case "Paren": {
      return checkExpr(env, expr.expr, supply);
    }
    case "Do": {
      return checkDoBlock(env, expr.block, supply);
    }
    case "Agent": {
      const agentType = typeSpecToMoon(expr.decl.type);
      return { type: agentType, subst };
    }
    case "Lambda": {
      const local: TypeEnv = { ...env, values: new Map(env.values) };
      const params = expr.params.map(() => supply.fresh());
      for (let i = 0; i < expr.params.length; i++) {
        local.values.set(expr.params[i]!, { vars: [], type: params[i]! });
      }
      const body = "statements" in expr.body
        ? checkDoBlock(local, expr.body, supply)
        : checkExpr(local, expr.body, supply);
      subst = compose(subst, body.subst);
      const lam = params.reduceRight<MoonType>((acc, p) => fn(p, acc), body.type);
      return { type: lam, subst };
    }
    case "If": {
      const cond = checkExpr(env, expr.condition, supply);
      const th = checkExpr(env, expr.thenBranch, supply);
      const el = checkExpr(env, expr.elseBranch, supply);
      subst = compose(subst, compose(cond.subst, compose(th.subst, el.subst)));
      subst = compose(subst, unify(cond.type, prim("Bool"), span));
      subst = compose(subst, unify(th.type, el.type, span));
      return { type: applySubst(subst, th.type), subst };
    }
    default:
      return { type: supply.fresh(), subst };
  }
}

function resolveMethod(
  env: TypeEnv,
  objType: MoonType,
  method: string,
  supply: { fresh: () => MoonType },
): MoonType | null {
  if (objType.kind !== "Con") return null;
  const tc = env.classes.get(objType.name);
  if (!tc) return null;
  const m = tc.methods.find((md) => md.name === method);
  if (!m) return null;
  return specializeMethod(instantiate(m.type, supply), objType);
}

function specializeMethod(methodType: MoonType, objType: MoonType): MoonType | null {
  if (methodType.kind !== "Arrow") return null;
  try {
    const subst = unify(methodType.from, objType);
    return applySubst(subst, methodType.to);
  } catch {
    return null;
  }
}

function checkDoBlock(env: TypeEnv, block: DoBlock, supply: { fresh: () => MoonType }): InferResult {
  let subst = new Map<number, MoonType>();
  const local: TypeEnv = { ...env, values: new Map(env.values) };
  let lastType: MoonType = prim("Unit");

  for (const stmt of block.statements) {
    const result = checkDoStmt(local, stmt, supply);
    subst = compose(subst, result.subst);
    lastType = applySubst(subst, result.type);
  }

  return { type: lastType, subst };
}

function checkDoStmt(env: TypeEnv, stmt: DoStatement, supply: { fresh: () => MoonType }): InferResult {
  let subst = new Map<number, MoonType>();

  switch (stmt.kind) {
    case "Let": {
      const expr = checkExpr(env, stmt.expr, supply);
      subst = compose(subst, expr.subst);
      bindPattern(env, stmt.pattern, applySubst(subst, expr.type));
      return { type: prim("Unit"), subst };
    }
    case "Bind": {
      const expr = checkExpr(env, stmt.expr, supply);
      subst = compose(subst, expr.subst);
      const inner = applySubst(subst, expr.type);
      if (inner.kind === "Con" && inner.name === "IO" && inner.args[0]) {
        bindPattern(env, stmt.pattern, inner.args[0]);
        return { type: prim("Unit"), subst };
      }
      const ret = supply.fresh();
      subst = compose(subst, unify(inner, io(ret), stmt.span));
      bindPattern(env, stmt.pattern, ret);
      return { type: prim("Unit"), subst };
    }
    case "Storm": {
      const input = checkExpr(env, stmt.input, supply);
      subst = compose(subst, input.subst);
      const ret = supply.fresh();
      bindPattern(env, stmt.pattern, ret);
      return { type: prim("Unit"), subst };
    }
    case "Action": {
      const expr = checkExpr(env, stmt.expr, supply);
      subst = compose(subst, expr.subst);
      const t = applySubst(subst, expr.type);
      if (t.kind === "Con" && t.name === "IO") {
        return { type: prim("Unit"), subst };
      }
      subst = compose(subst, unify(t, io(prim("Unit")), stmt.span));
      return { type: prim("Unit"), subst };
    }
  }
}

function registerFunctionSig(env: TypeEnv, decl: FunctionDecl): void {
  if (!decl.signature) return;
  env.values.set(decl.signature.name, typeSpecToScheme(decl.signature.type));
}
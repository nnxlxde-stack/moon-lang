import type { Expression, Pattern } from "@moon/ast";

export function freeVarsExpr(expr: Expression, bound = new Set<string>()): Set<string> {
  switch (expr.kind) {
    case "Var":
      return bound.has(expr.name) ? new Set() : new Set([expr.name]);
    case "Lit":
      return new Set();
    case "App":
      return union(freeVarsExpr(expr.func, bound), freeVarsExpr(expr.arg, bound));
    case "Infix":
      return union(
        freeVarsExpr(expr.left, bound),
        freeVarsExpr(expr.right, bound),
      );
    case "Prefix":
      return freeVarsExpr(expr.operand, bound);
    case "FieldAccess":
      return freeVarsExpr(expr.object, bound);
    case "Lambda": {
      const local = new Set(bound);
      for (const p of expr.params) local.add(p);
      if ("statements" in expr.body) {
        return freeVarsDoBlock(expr.body, local);
      }
      return freeVarsExpr(expr.body, local);
    }
    case "If":
      return union(
        freeVarsExpr(expr.condition, bound),
        freeVarsExpr(expr.thenBranch, bound),
        freeVarsExpr(expr.elseBranch, bound),
      );
    case "Record":
      return union(...expr.fields.map((f) => freeVarsExpr(f.value, bound)));
    case "List":
      return union(...expr.elements.map((e) => freeVarsExpr(e, bound)));
    case "Tuple":
      return union(...expr.elements.map((e) => freeVarsExpr(e, bound)));
    case "Paren":
      return freeVarsExpr(expr.expr, bound);
    case "Do":
      return freeVarsDoBlock(expr.block, bound);
    case "Agent":
    case "Model":
      return new Set();
  }
}

export function freeVarsDoBlock(
  block: { statements: import("@moon/ast").DoStatement[] },
  bound = new Set<string>(),
): Set<string> {
  const result = new Set<string>();
  const local = new Set(bound);

  for (const stmt of block.statements) {
    if (stmt.kind === "Let" || stmt.kind === "Bind") {
      for (const v of freeVarsExpr(stmt.expr, local)) result.add(v);
      bindPatternVars(stmt.pattern, local);
    } else if (stmt.kind === "Storm") {
      for (const v of freeVarsExpr(stmt.input, local)) result.add(v);
      for (const item of stmt.config) {
        for (const v of freeVarsExpr(item.value, local)) result.add(v);
      }
      bindPatternVars(stmt.pattern, local);
    } else {
      for (const v of freeVarsExpr(stmt.expr, local)) result.add(v);
    }
  }

  return result;
}

function bindPatternVars(pat: Pattern, bound: Set<string>): void {
  switch (pat.kind) {
    case "PVar":
      bound.add(pat.name);
      break;
    case "PCon":
      for (const arg of pat.args) bindPatternVars(arg, bound);
      break;
    case "PTuple":
      for (const el of pat.elements) bindPatternVars(el, bound);
      break;
    case "PList":
      for (const el of pat.elements) bindPatternVars(el, bound);
      break;
    default:
      break;
  }
}

function union(...sets: Set<string>[]): Set<string> {
  const result = new Set<string>();
  for (const s of sets) {
    for (const v of s) result.add(v);
  }
  return result;
}
import type { Expression } from "@moon/ast";

export interface MapMCall {
  func: Expression;
  listVar: string;
}

export function detectMapM(expr: Expression): MapMCall | null {
  if (expr.kind !== "App") return null;
  const outer = expr;
  if (outer.func.kind !== "App") return null;
  const inner = outer.func;
  if (inner.func.kind !== "Var" || inner.func.name !== "mapM") return null;
  if (outer.arg.kind !== "Var") return null;
  return { func: inner.arg, listVar: outer.arg.name };
}

export function exprLabel(expr: Expression): string {
  switch (expr.kind) {
    case "Var":
      return expr.name;
    case "Lit":
      return JSON.stringify(
        expr.value.kind === "String" ? expr.value.value : expr.value.value,
      );
    case "App":
      return `${exprLabel(expr.func)} ${exprLabel(expr.arg)}`;
    case "FieldAccess":
      return `${exprLabel(expr.object)}.${expr.field}`;
    case "Paren":
      return `(${exprLabel(expr.expr)})`;
    default:
      return expr.kind;
  }
}
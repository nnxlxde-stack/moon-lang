import { fn, freshVar, io, listOf, prim, type MoonType, type Scheme } from "../types";

const v = () => freshVar();
const a = () => v();
const scheme = (t: MoonType): Scheme => ({ vars: [], type: t });

const forall = (t: MoonType): Scheme => {
  const vars: number[] = [];
  const collect = (mt: MoonType) => {
    if (mt.kind === "Var") vars.push(mt.id);
    else if (mt.kind === "Con") mt.args.forEach(collect);
    else if (mt.kind === "Arrow") { collect(mt.from); collect(mt.to); }
    else if (mt.kind === "Record") mt.fields.forEach((f) => collect(f.type));
    else if (mt.kind === "Tuple") mt.elements.forEach(collect);
  };
  collect(t);
  return { vars: [...new Set(vars)], type: t };
};

export function toolsSchemes(): Map<string, Scheme> {
  const values = new Map<string, Scheme>();
  values.set("readFile", scheme(fn(prim("String"), io(prim("String")))));
  values.set("saveToFile", scheme(fn(prim("String"), fn(prim("String"), io(prim("Unit"))))));
  values.set("when", scheme(fn(prim("Bool"), fn(io(prim("Unit")), io(prim("Unit"))))));
  values.set("mapM", forall(fn(fn(a(), io(a())), fn(listOf(a()), io(listOf(a()))))));
  values.set("postToSlack", scheme(fn(prim("String"), io(prim("Unit")))));
  values.set("postSummaryToSlack", forall(fn(listOf(a()), io(prim("Unit")))));
  values.set("fetchUpdatedDocs", scheme(fn(prim("String"), io(listOf(prim("Documentation"))))));
  values.set("generateCombinedReport", forall(fn(listOf(a()), fn(listOf(a()), io(prim("String"))))));
  values.set("generateReviewReport", forall(fn(listOf(a()), io(prim("String")))));
  values.set("between", scheme(fn(prim("Float"), fn(prim("Float"), prim("Float")))));
  return values;
}
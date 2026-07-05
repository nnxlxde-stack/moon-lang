import {
  fn, freshVar, io, listOf, prim, record, type ClassMethod, type MoonType, type Scheme, type TypeClass,
} from "./types";

const v = () => freshVar();
const a = () => v();
const b = () => v();

export function buildPrelude(): {
  values: Map<string, Scheme>;
  classes: Map<string, TypeClass>;
} {
  const values = new Map<string, Scheme>();
  const classes = new Map<string, TypeClass>();

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

  for (const p of ["String", "Int", "Float", "Bool", "Code", "Documentation", "Requirements", "Entity", "Agent", "Scope", "Unit", "Verdict"]) {
    values.set(p, scheme(prim(p)));
  }

  for (const e of ["Code", "Documentation", "Requirements"]) {
    values.set(e, scheme(prim("Entity")));
  }

  for (const t of ["Finding", "Recommendation", "Suggestion", "Location", "Severity", "Category"]) {
    values.set(t, scheme(prim(t, a())));
  }

  const analyzeOutput = (t: MoonType) => record("AnalyzeOutput", [
    { name: "findings", type: listOf(prim("Finding", t)) },
    { name: "summary", type: prim("String") },
    { name: "confidence", type: prim("Float") },
  ]);

  const analyzerMethod: ClassMethod = {
    name: "analyze",
    type: forall(fn(prim("Analyzer", a()), fn(a(), io(analyzeOutput(a()))))),
  };
  classes.set("Analyzer", {
    name: "Analyzer",
    params: ["t"],
    methods: [analyzerMethod],
  });

  const reviewerMethod: ClassMethod = {
    name: "analyze",
    type: forall(fn(prim("Reviewer", a()), fn(a(), io(prim("ReviewResult", a()))))),
  };
  classes.set("Reviewer", {
    name: "Reviewer",
    params: ["t"],
    methods: [reviewerMethod],
  });

  values.set("not", scheme(fn(prim("Bool"), prim("Bool"))));
  values.set("pure", forall(fn(a(), io(a()))));
  values.set("map", forall(fn(fn(a(), b()), fn(listOf(a()), listOf(b())))));
  values.set("$", forall(fn(fn(a(), b()), fn(a(), b()))));
  values.set(">>=", forall(fn(io(a()), fn(fn(a(), io(b())), io(b())))));
  values.set(".", forall(fn(fn(b(), a()), fn(fn(a(), b()), fn(a(), a()))))); // compose: (.) f g

  return { values, classes };
}
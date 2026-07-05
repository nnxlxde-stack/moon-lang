import { fn, freshVar, io, listOf, prim, record, type MoonType, type Scheme } from "../types";

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

const analyzeOutput = (t: MoonType) => record("AnalyzeOutput", [
  { name: "findings", type: listOf(prim("Finding", t)) },
  { name: "summary", type: prim("String") },
  { name: "confidence", type: prim("Float") },
]);

export function analyzersSchemes(): Map<string, Scheme> {
  const values = new Map<string, Scheme>();
  values.set("hasCriticalFindings", forall(fn(listOf(a()), prim("Bool"))));
  values.set("escalateCriticalIssues", forall(fn(listOf(a()), io(prim("Unit")))));
  values.set("getPreviousVersion", forall(fn(a(), prim("String"))));
  values.set("calculateScore", forall(fn(analyzeOutput(a()), prim("Float"))));
  values.set("extractRecommendations", forall(fn(analyzeOutput(a()), listOf(prim("Recommendation", a())))));
  values.set("hasCriticalIssues", forall(fn(listOf(a()), prim("Bool"))));
  values.set("notifyTeamLeads", forall(fn(listOf(a()), io(prim("Unit")))));
  values.set("decideOverallVerdict", forall(fn(listOf(a()), fn(prim("ReviewResult", a()), io(prim("Verdict"))))));
  values.set("collectFindings", forall(fn(listOf(a()), listOf(prim("Finding", a())))));
  values.set("generateSummary", forall(fn(prim("ReviewResult", a()), prim("String"))));
  values.set("calculateConfidence", forall(fn(listOf(a()), prim("Float"))));
  values.set("extractSuggestions", forall(fn(prim("ReviewResult", a()), listOf(prim("Suggestion")))));
  values.set("detectLanguage", scheme(fn(prim("ChangedFile"), prim("String"))));
  return values;
}
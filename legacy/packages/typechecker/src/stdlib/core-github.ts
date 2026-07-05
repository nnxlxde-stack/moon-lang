import { fn, io, listOf, prim, record, type MoonType, type Scheme } from "../types";

const scheme = (t: MoonType): Scheme => ({ vars: [], type: t });

export function githubSchemes(): Map<string, Scheme> {
  const values = new Map<string, Scheme>();
  values.set("PullRequest", scheme(prim("PullRequest")));
  values.set("ChangedFile", scheme(record("ChangedFile", [
    { name: "path", type: prim("String") },
    { name: "previousContent", type: prim("String") },
  ])));
  values.set("fetchOpenPRs", scheme(fn(prim("String"), io(listOf(prim("PullRequest"))))));
  values.set("fetchChangedFiles", scheme(fn(prim("PullRequest"), io(listOf(prim("ChangedFile"))))));
  values.set("isDraft", scheme(fn(prim("PullRequest"), prim("Bool"))));
  return values;
}
import { fn, io, prim, type MoonType, type Scheme } from "../types";

const scheme = (t: MoonType): Scheme => ({ vars: [], type: t });

export function memorySchemes(): Map<string, Scheme> {
  const values = new Map<string, Scheme>();
  values.set("LongTerm", scheme(prim("LongTerm")));
  values.set("memory", scheme(fn(prim("LongTerm"), fn(prim("String"), io(prim("Unit"))))));
  values.set("recall", scheme(fn(prim("String"), io(prim("String")))));
  return values;
}
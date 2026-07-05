import { fn, io, prim, type MoonType, type Scheme } from "../types";

const scheme = (t: MoonType): Scheme => ({ vars: [], type: t });

export function networkSchemes(): Map<string, Scheme> {
  const values = new Map<string, Scheme>();
  values.set("httpGet", scheme(fn(prim("String"), io(prim("String")))));
  values.set("httpPost", scheme(fn(prim("String"), fn(prim("String"), io(prim("String"))))));
  values.set("fetchJson", scheme(fn(prim("String"), io(prim("String")))));
  return values;
}
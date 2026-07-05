import { fn, io, listOf, prim, type MoonType, type Scheme } from "../types";

const scheme = (t: MoonType): Scheme => ({ vars: [], type: t });

export function fsSchemes(): Map<string, Scheme> {
  const values = new Map<string, Scheme>();
  values.set("readFile", scheme(fn(prim("String"), io(prim("String")))));
  values.set("writeFile", scheme(fn(prim("String"), fn(prim("String"), io(prim("Unit"))))));
  values.set("pathExists", scheme(fn(prim("String"), io(prim("Bool")))));
  values.set("listDir", scheme(fn(prim("String"), io(listOf(prim("String"))))));
  values.set("makeDir", scheme(fn(prim("String"), io(prim("Unit")))));
  values.set("removePath", scheme(fn(prim("String"), io(prim("Unit")))));
  return values;
}
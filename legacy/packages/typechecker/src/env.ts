import type { Instance, Scheme, TypeClass, TypeConstructor } from "./types";

export interface TypeEnv {
  values: Map<string, Scheme>;
  constructors: Map<string, TypeConstructor>;
  classes: Map<string, TypeClass>;
  instances: Instance[];
  envVars: Set<number>;
}

export function createEnv(
  values: Map<string, Scheme>,
  classes: Map<string, TypeClass>,
): TypeEnv {
  return {
    values,
    constructors: new Map(),
    classes,
    instances: [],
    envVars: new Set(),
  };
}

export function envVarIds(env: TypeEnv): Set<number> {
  const ids = new Set<number>(env.envVars);
  for (const scheme of env.values.values()) {
    for (const v of scheme.vars) ids.add(v);
  }
  return ids;
}
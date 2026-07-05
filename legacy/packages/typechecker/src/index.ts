import type { Program } from "@moon/ast";
import { dirname, resolve } from "path";
import { applyImportsToEnv, resolveImports } from "@moon/resolver";
import { checkProgram, type CheckResult, TypeError } from "./check";
import { createEnv } from "./env";
import { buildPrelude } from "./prelude";
import { resetVarSupply } from "./types";

export { checkProgram, TypeError, type CheckResult } from "./check";
export { formatType, type MoonType, type Scheme } from "./types";
export { createEnv, type TypeEnv } from "./env";
export { buildPrelude } from "./prelude";

export interface TypecheckOptions {
  entryPath?: string;
  projectRoot?: string;
}

export function typecheck(program: Program, options: TypecheckOptions = {}): CheckResult {
  return typecheckProgram(program, options);
}

export function typecheckProgram(program: Program, options: TypecheckOptions = {}): CheckResult {
  resetVarSupply();
  const prelude = buildPrelude();
  const env = createEnv(prelude.values, prelude.classes);

  if (options.entryPath) {
    const entryPath = resolve(options.entryPath);
    const projectRoot = options.projectRoot ?? dirname(entryPath);
    const resolved = resolveImports(program, { entryPath, projectRoot });
    const importErrors = applyImportsToEnv(env.values, resolved);
    if (importErrors.length > 0) {
      return {
        ok: false,
        errors: importErrors.map((e) => new TypeError(e.message, e.line, e.column)),
        env,
      };
    }
  }

  return checkProgram(program, env);
}
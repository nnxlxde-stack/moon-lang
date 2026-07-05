import type { Program } from "@moon/ast";
import { compileSchemas, type CompileResult, type JsonSchema, type SchemaWarning } from "./compile";

export { compileSchemas, type CompileResult, type JsonSchema, type SchemaWarning } from "./compile";

export function compileProgramSchemas(program: Program, names?: string[]): CompileResult {
  const result = compileSchemas(program);
  if (!names || names.length === 0) {
    return result;
  }

  const schemas: Record<string, JsonSchema> = {};
  for (const name of names) {
    if (result.schemas[name]) {
      schemas[name] = result.schemas[name];
    }
  }
  return { schemas, warnings: result.warnings };
}
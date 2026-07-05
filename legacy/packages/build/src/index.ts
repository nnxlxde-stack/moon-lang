import { mkdir, writeFile } from "fs/promises";
import { createHash } from "crypto";
import { join, resolve } from "path";
import { stripSpans } from "@moon/ast";
import type { Moonfile } from "@moon/moonfile";
import { loadMoonfile } from "@moon/moonfile";
import { parse } from "@moon/parser";
import { planFunction } from "@moon/planner";
import { compileProgramSchemas } from "@moon/schema-compiler";
import { resolveImports } from "@moon/resolver";
import { typecheck } from "@moon/typechecker";

export interface BuildTargetResult {
  name: string;
  sourcePath: string;
  outputDir: string;
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export interface BuildOptions {
  projectRoot: string;
  outDir?: string;
  entryFn?: string;
  target?: string;
}

export async function buildSource(
  sourcePath: string,
  targetName: string,
  options: BuildOptions,
): Promise<BuildTargetResult> {
  const absoluteSource = resolve(options.projectRoot, sourcePath);
  const source = await Bun.file(absoluteSource).text();
  const program = parse(source);
  const check = typecheck(program, { entryPath: absoluteSource, projectRoot: options.projectRoot });

  if (!check.ok) {
    return {
      name: targetName,
      sourcePath: absoluteSource,
      outputDir: "",
      ok: false,
      errors: check.errors.map((e) => e.message),
      warnings: [],
    };
  }

  const schemaResult = compileProgramSchemas(program);
  const dag = planFunction(program, options.entryFn ?? "main");
  const resolved = resolveImports(program, { entryPath: absoluteSource, projectRoot: options.projectRoot });
  const outputDir = join(options.outDir ?? join(options.projectRoot, ".moon", "build"), targetName);

  await mkdir(outputDir, { recursive: true });

  const payload = {
    target: targetName,
    source: sourcePath,
    entry: options.entryFn ?? "main",
    builtAt: new Date().toISOString(),
    sourceHash: createHash("sha256").update(source).digest("hex"),
    imports: resolved.imports.map((i) => ({
      path: i.pathKey,
      filePath: i.filePath,
      symbols: [...i.schemes.keys()].sort(),
    })),
    schemas: schemaResult.schemas,
    warnings: schemaResult.warnings,
    dag: dag ? stripSpans(dag) : null,
  };

  await writeFile(join(outputDir, "build.json"), JSON.stringify(payload, null, 2));
  await writeFile(join(outputDir, "schemas.json"), JSON.stringify(schemaResult.schemas, null, 2));
  if (dag) {
    await writeFile(join(outputDir, "dag.json"), JSON.stringify(stripSpans(dag), null, 2));
  }

  return {
    name: targetName,
    sourcePath: absoluteSource,
    outputDir,
    ok: true,
    errors: [],
    warnings: schemaResult.warnings.map((w) => `${w.message} at ${w.line}:${w.column}`),
  };
}

export async function buildFromMoonfile(
  moonfilePath: string,
  options: Partial<BuildOptions> = {},
): Promise<BuildTargetResult[]> {
  const moonfile = loadMoonfile(moonfilePath);
  const projectRoot = options.projectRoot ?? resolve(moonfilePath, "..");
  const targets = options.target
    ? Object.entries(moonfile.targets).filter(([name]) => name === options.target)
    : Object.entries(moonfile.targets);

  if (targets.length === 0) {
    throw new Error(options.target
      ? `Target not found in Moonfile: ${options.target}`
      : "Moonfile has no targets");
  }

  const results: BuildTargetResult[] = [];
  for (const [name, source] of targets) {
    results.push(await buildSource(source, name, {
      projectRoot,
      outDir: options.outDir,
      entryFn: options.entryFn,
    }));
  }
  return results;
}

export async function buildMoonfile(moonfile: Moonfile, projectRoot: string, options: Partial<BuildOptions> = {}) {
  const results: BuildTargetResult[] = [];
  const entries = options.target
    ? Object.entries(moonfile.targets).filter(([name]) => name === options.target)
    : Object.entries(moonfile.targets);

  for (const [name, source] of entries) {
    results.push(await buildSource(source, name, { projectRoot, ...options }));
  }
  return results;
}
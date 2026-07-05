import type { Program } from "@moon/ast";
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { parse } from "@moon/parser";
import type { Moonfile } from "@moon/moonfile";
import { findMoonfile, loadMoonfile } from "@moon/moonfile";
import { coreModuleSchemes, isCoreModule } from "@moon/typechecker/stdlib";
import type { Scheme } from "@moon/typechecker/types";
import { typeSpecToScheme } from "@moon/typechecker/types";

export interface ResolverError {
  message: string;
  line: number;
  column: number;
}

export interface ResolvedImport {
  path: string[];
  pathKey: string;
  filePath?: string;
  schemes: Map<string, Scheme>;
}

export interface ResolveResult {
  imports: ResolvedImport[];
  errors: ResolverError[];
}

export interface ResolveOptions {
  entryPath: string;
  projectRoot?: string;
  moonfile?: Moonfile;
}

function defaultStdlibRoot(): string {
  if (process.env.MOON_STDLIB) {
    return resolve(process.env.MOON_STDLIB);
  }
  return resolve(import.meta.dir, "../../../../stdlib");
}

export function resolveStdlibPath(modulePath: string[]): string | null {
  if (modulePath[0] !== "Core" || modulePath.length !== 2) return null;
  const candidate = join(defaultStdlibRoot(), "Core", `${modulePath[1]}.moon`);
  return existsSync(candidate) ? candidate : null;
}

export function resolveLocalModule(name: string, entryPath: string, projectRoot: string): string | null {
  const rel = `${name}.moon`;
  const candidates = [
    join(projectRoot, "lib", rel),
    join(projectRoot, "src", rel),
    join(dirname(resolve(entryPath)), rel),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

function pathKey(path: string[]): string {
  return path.join(".");
}

export function mergeSchemes(
  target: Map<string, Scheme>,
  source: Map<string, Scheme>,
  moduleName: string,
  errors: ResolverError[],
): void {
  for (const [name, scheme] of source) {
    if (target.has(name)) {
      errors.push({
        message: `Duplicate symbol '${name}' from import ${moduleName}`,
        line: 1,
        column: 1,
      });
      continue;
    }
    target.set(name, scheme);
  }
}

function schemesFromLocalProgram(program: Program): Map<string, Scheme> {
  const schemes = new Map<string, Scheme>();
  for (const decl of program.declarations) {
    if (decl.kind === "Function" && decl.decl.signature) {
      schemes.set(decl.decl.signature.name, typeSpecToScheme(decl.decl.signature.type));
    }
    if (decl.kind === "Agent") {
      schemes.set(decl.decl.name, typeSpecToScheme(decl.decl.type));
    }
    if (decl.kind === "Data") {
      for (const ctor of decl.decl.constructors) {
        schemes.set(ctor.name, typeSpecToScheme({ kind: "Con", name: ctor.name, args: [], span: ctor.span }));
      }
    }
  }
  return schemes;
}

export function resolveImports(program: Program, options: ResolveOptions): ResolveResult {
  const errors: ResolverError[] = [];
  const imports: ResolvedImport[] = [];
  const projectRoot = options.projectRoot ?? dirname(resolve(options.entryPath));
  const moonfilePath = findMoonfile(projectRoot);
  const moonfile = options.moonfile ?? (moonfilePath ? loadMoonfile(moonfilePath) : undefined);
  const seen = new Set<string>();

  for (const decl of program.declarations) {
    if (decl.kind !== "Import") continue;
    const key = pathKey(decl.path);

    if (seen.has(key)) continue;
    seen.add(key);

    if (decl.path[0] === "Core") {
      if (moonfile && !moonfile.dependencies.includes(key)) {
        errors.push({
          message: `Module ${key} is imported but not listed in Moonfile dependencies`,
          line: decl.span.start.line,
          column: decl.span.start.column,
        });
      }

      if (!isCoreModule(key)) {
        errors.push({
          message: `Unknown Core module: ${key}`,
          line: decl.span.start.line,
          column: decl.span.start.column,
        });
        continue;
      }

      const schemes = coreModuleSchemes(key);
      if (!schemes) continue;
      imports.push({
        path: decl.path,
        pathKey: key,
        filePath: resolveStdlibPath(decl.path) ?? undefined,
        schemes,
      });
      continue;
    }

    const localName = decl.path.length === 1 ? decl.path[0]! : decl.path.join(".");
    const filePath = resolveLocalModule(localName, options.entryPath, projectRoot);
    if (!filePath) {
      errors.push({
        message: `Cannot resolve local module: ${localName}`,
        line: decl.span.start.line,
        column: decl.span.start.column,
      });
      continue;
    }

    const localProgram = parse(readFileSync(filePath, "utf-8"));
    imports.push({
      path: decl.path,
      pathKey: localName,
      filePath,
      schemes: schemesFromLocalProgram(localProgram),
    });
  }

  return { imports, errors };
}

export function applyImportsToEnv(
  values: Map<string, Scheme>,
  resolved: ResolveResult,
): ResolverError[] {
  const errors: ResolverError[] = [...resolved.errors];
  const merged = new Map<string, Scheme>();
  for (const imp of resolved.imports) {
    mergeSchemes(merged, imp.schemes, imp.pathKey, errors);
  }
  for (const [name, scheme] of merged) {
    if (values.has(name)) {
      errors.push({ message: `Symbol '${name}' conflicts with an existing binding`, line: 1, column: 1 });
      continue;
    }
    values.set(name, scheme);
  }
  return errors;
}
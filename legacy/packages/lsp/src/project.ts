import type { Program } from "@moon/ast";
import { parse, ParseError } from "@moon/parser";
import { LexError } from "@moon/lexer";
import { resolveImports, resolveStdlibPath } from "@moon/resolver";
import { buildPrelude, formatType, typecheckProgram } from "@moon/typechecker";
import { allCoreModulePaths, coreModuleSchemes } from "@moon/typechecker/stdlib";
import { freshVar, instantiate, type Scheme, typeSpecToScheme } from "@moon/typechecker/types";
import { existsSync, readFileSync } from "fs";
import { basename as pathBasename, dirname, resolve } from "path";
import { pathToFileURL } from "url";
import type { SymbolDatabase } from "./symbol-db";
import { indexProgram, spanToRange, type SymbolEntry } from "./symbol-index";

export interface SymbolInfo {
  name: string;
  type: string;
  module?: string;
  filePath?: string;
  range?: SymbolEntry["range"];
  docs?: string;
}

export interface DefinitionTarget {
  uri: string;
  range: SymbolEntry["range"];
}

export function wordAtPosition(text: string, line: number, character: number): string | null {
  const lines = text.split(/\r?\n/);
  const row = lines[line];
  if (!row) return null;
  const before = row.slice(0, character);
  const after = row.slice(character);
  const left = before.match(/[A-Za-z0-9_.'-]*$/)?.[0] ?? "";
  const right = after.match(/^[A-Za-z0-9_.'-]*/)?.[0] ?? "";
  const word = left + right;
  return word.length > 0 ? word.replace(/\.$/, "") : null;
}

function formatScheme(scheme: Scheme): string {
  const inst = instantiate(scheme, { fresh: freshVar });
  return formatType(inst);
}

function localDefinition(
  program: Program,
  source: string,
  entryPath: string,
  name: string,
): DefinitionTarget | null {
  const abs = resolve(entryPath);
  for (const entry of indexProgram(program, source, abs, pathBasename(entryPath, ".moon"))) {
    if (entry.name !== name) continue;
    return { uri: pathToFileURL(abs).href, range: entry.range };
  }
  return null;
}

export function buildSymbolTable(
  program: Program,
  entryPath: string,
  db?: SymbolDatabase,
  source?: string,
): Map<string, SymbolInfo> {
  const table = new Map<string, SymbolInfo>();
  const prelude = buildPrelude();
  for (const [name, scheme] of prelude.values) {
    const entry = db?.lookup(name, { module: "Moon.Prelude" });
    table.set(name, {
      name,
      type: formatScheme(scheme),
      module: "Moon.Prelude",
      docs: entry?.docs,
      range: entry?.range,
    });
  }

  const projectRoot = dirname(resolve(entryPath));
  const resolved = resolveImports(program, { entryPath: resolve(entryPath), projectRoot });
  for (const imp of resolved.imports) {
    for (const [name, scheme] of imp.schemes) {
      const entry = db?.lookup(name, { module: imp.pathKey, file: imp.filePath });
      table.set(name, {
        name,
        type: formatScheme(scheme),
        module: imp.pathKey,
        filePath: imp.filePath,
        range: entry?.range,
        docs: entry?.docs,
      });
    }
  }

  const abs = resolve(entryPath);
  const src = source ?? (existsSync(abs) ? readFileSync(abs, "utf-8") : "");
  for (const entry of indexProgram(program, src, abs, pathBasename(entryPath, ".moon"))) {
    if (table.has(entry.name)) continue;
    table.set(entry.name, {
      name: entry.name,
      type: entry.type,
      filePath: abs,
      range: entry.range,
      docs: entry.docs,
    });
  }

  for (const decl of program.declarations) {
    if (decl.kind === "Function" && decl.decl.signature) {
      const existing = table.get(decl.decl.signature.name);
      if (!existing) {
        table.set(decl.decl.signature.name, {
          name: decl.decl.signature.name,
          type: formatScheme(typeSpecToScheme(decl.decl.signature.type)),
          filePath: abs,
          range: spanToRange(decl.decl.signature.span, decl.decl.signature.name),
        });
      }
    }
    if (decl.kind === "Agent") {
      const existing = table.get(decl.decl.name);
      if (!existing) {
        table.set(decl.decl.name, {
          name: decl.decl.name,
          type: `agent ${decl.decl.name}`,
          filePath: abs,
          range: spanToRange(decl.span, decl.decl.name),
        });
      }
    }
    if (decl.kind === "Data") {
      for (const ctor of decl.decl.constructors) {
        if (!table.has(ctor.name)) {
          table.set(ctor.name, {
            name: ctor.name,
            type: ctor.name,
            filePath: abs,
            range: spanToRange(ctor.span, ctor.name),
          });
        }
      }
    }
  }

  return table;
}

export function lookupSymbol(
  program: Program,
  entryPath: string,
  name: string,
  db?: SymbolDatabase,
  source?: string,
): SymbolInfo | undefined {
  return buildSymbolTable(program, entryPath, db, source).get(name);
}

export function definitionLocation(
  program: Program,
  entryPath: string,
  name: string,
  db?: SymbolDatabase,
  source = "",
): DefinitionTarget | null {
  if (db) {
    const entry = db.lookupScoped(program, entryPath, name);
    if (entry) {
      const loc = db.toLocation(entry);
      if (loc) return loc;
    }
  }

  const info = lookupSymbol(program, entryPath, name, db, source);
  if (info?.filePath && info.range) {
    return { uri: pathToFileURL(resolve(info.filePath)).href, range: info.range };
  }
  if (info?.filePath) {
    return {
      uri: pathToFileURL(resolve(info.filePath)).href,
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: name.length } },
    };
  }

  if (source) {
    const local = localDefinition(program, source, entryPath, name);
    if (local) return local;
  }

  for (const modulePath of allCoreModulePaths()) {
    const schemes = coreModuleSchemes(modulePath);
    if (!schemes?.has(name)) continue;
    const stdlibPath = resolveStdlibPath(modulePath.split("."));
    if (!stdlibPath) continue;
    const entry = db?.lookup(name, { module: modulePath, file: stdlibPath });
    return {
      uri: pathToFileURL(resolve(stdlibPath)).href,
      range: entry?.range ?? { start: { line: 0, character: 0 }, end: { line: 0, character: name.length } },
    };
  }

  return null;
}

export function collectDiagnostics(entryPath: string, text: string) {
  try {
    const program = parse(text);
    const result = typecheckProgram(program, { entryPath, projectRoot: dirname(resolve(entryPath)) });
    return result.errors.map((e) => ({
      severity: 1 as const,
      range: {
        start: { line: Math.max(0, e.line - 1), character: Math.max(0, e.column - 1) },
        end: { line: Math.max(0, e.line - 1), character: Math.max(0, e.column + 20) },
      },
      message: e.message,
      source: "moon",
    }));
  } catch (err) {
    if (err instanceof ParseError || err instanceof LexError) {
      return [{
        severity: 1 as const,
        range: {
          start: { line: Math.max(0, err.line - 1), character: Math.max(0, err.column - 1) },
          end: { line: Math.max(0, err.line - 1), character: err.column + 10 },
        },
        message: err.message,
        source: "moon",
      }];
    }
    return [];
  }
}
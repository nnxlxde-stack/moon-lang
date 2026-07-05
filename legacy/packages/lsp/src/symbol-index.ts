import type { Program, Span, TypeSpec } from "@moon/ast";
import { existsSync, readdirSync, readFileSync } from "fs";
import { basename, join, resolve } from "path";
import { parse } from "@moon/parser";
import { resolveStdlibPath } from "@moon/resolver";
import { buildPrelude, formatType } from "@moon/typechecker";
import { allCoreModulePaths, coreModuleSchemes } from "@moon/typechecker/stdlib";
import { freshVar, instantiate, type Scheme, typeSpecToScheme } from "@moon/typechecker/types";
import { extractMoonDocs } from "./moon-docs";

export type SymbolKind =
  | "function"
  | "agent"
  | "model"
  | "data"
  | "constructor"
  | "type"
  | "value";

export interface SymbolRange {
  start: { line: number; character: number };
  end: { line: number; character: number };
}

export interface SymbolEntry {
  name: string;
  kind: SymbolKind;
  module: string;
  type: string;
  file: string;
  range: SymbolRange;
  docs?: string;
}

export interface MoonSymbolsFile {
  version: 1;
  updatedAt: string;
  projectRoot: string;
  symbols: SymbolEntry[];
}

function formatScheme(scheme: Scheme): string {
  return formatType(instantiate(scheme, { fresh: freshVar }));
}

function formatTypeSpec(spec: TypeSpec): string {
  return formatScheme(typeSpecToScheme(spec));
}

export function spanToRange(span: Span, name: string): SymbolRange {
  const line = Math.max(0, span.start.line - 1);
  const character = Math.max(0, span.start.column - 1);
  return {
    start: { line, character },
    end: { line, character: character + name.length },
  };
}

function schemeType(schemes: Map<string, Scheme> | null | undefined, name: string): string {
  const scheme = schemes?.get(name);
  return scheme ? formatScheme(scheme) : "?";
}

export function indexProgram(
  program: Program,
  source: string,
  filePath: string,
  moduleName: string,
  schemes?: Map<string, Scheme>,
): SymbolEntry[] {
  const abs = resolve(filePath);
  const entries: SymbolEntry[] = [];

  const push = (
    name: string,
    kind: SymbolKind,
    span: Span,
    type: string,
    docs?: string,
  ) => {
    entries.push({
      name,
      kind,
      module: moduleName,
      type,
      file: abs,
      range: spanToRange(span, name),
      docs: docs ?? extractMoonDocs(source, span.start.line),
    });
  };

  for (const decl of program.declarations) {
    switch (decl.kind) {
      case "Model":
        push(
          decl.decl.name,
          "model",
          decl.span,
          `model ${decl.decl.name}`,
        );
        for (const field of decl.decl.fields) {
          push(field.name, "type", field.span, formatTypeSpec(field.type));
        }
        break;
      case "Agent":
        push(
          decl.decl.name,
          "agent",
          decl.span,
          schemeType(schemes, decl.decl.name) || `agent ${decl.decl.name}`,
        );
        break;
      case "Data":
        push(decl.decl.name, "data", decl.span, `data ${decl.decl.name}`);
        for (const ctor of decl.decl.constructors) {
          push(ctor.name, "constructor", ctor.span, ctor.name);
        }
        break;
      case "Function":
        if (decl.decl.signature) {
          push(
            decl.decl.signature.name,
            "function",
            decl.decl.signature.span,
            formatTypeSpec(decl.decl.signature.type),
          );
        }
        for (const eq of decl.decl.equations) {
          if (decl.decl.signature?.name === eq.name) continue;
          push(
            eq.name,
            "function",
            eq.span,
            schemeType(schemes, eq.name),
          );
        }
        break;
      default:
        break;
    }
  }

  return entries;
}

function findNameLine(lines: string[], name: string): number {
  const patterns = [
    new RegExp(`^${name}\\s*::`),
    new RegExp(`^${name}\\s*=`),
    new RegExp(`^data\\s+${name}\\b`),
    new RegExp(`^agent\\s+${name}\\b`),
    new RegExp(`^model\\s+${name}\\b`),
    new RegExp(`=\\s*${name}\\b`),
  ];
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i]!.trim();
    if (patterns.some((re) => re.test(trimmed))) return i;
  }
  return -1;
}

function indexFromSourceText(
  source: string,
  filePath: string,
  moduleName: string,
): SymbolEntry[] {
  const schemes = coreModuleSchemes(moduleName);
  if (!schemes) return [];

  const abs = resolve(filePath);
  const lines = source.split(/\r?\n/);
  const entries: SymbolEntry[] = [];

  for (const [name, scheme] of schemes) {
    const lineIdx = findNameLine(lines, name);
    const line = Math.max(0, lineIdx);
    const raw = lineIdx >= 0 ? lines[lineIdx]! : "";
    const col = Math.max(0, raw.indexOf(name));
    entries.push({
      name,
      kind: "function",
      module: moduleName,
      type: formatScheme(scheme),
      file: abs,
      range: {
        start: { line, character: col },
        end: { line, character: col + name.length },
      },
      docs: lineIdx >= 0 ? extractMoonDocs(source, lineIdx + 1) : undefined,
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const dataMatch = lines[i]!.trim().match(/^data\s+(\w+)\s*=/);
    if (!dataMatch) continue;
    const typeName = dataMatch[1]!;
    if (entries.some((e) => e.name === typeName)) continue;
    entries.push({
      name: typeName,
      kind: "data",
      module: moduleName,
      type: `data ${typeName}`,
      file: abs,
      range: spanToRange(
        { start: { line: i + 1, column: lines[i]!.indexOf(typeName) + 1, offset: 0 }, end: { line: i + 1, column: lines[i]!.indexOf(typeName) + 1 + typeName.length, offset: 0 } },
        typeName,
      ),
    });
    const ctorMatch = lines[i]!.match(/=\s*(\w+)/);
    if (ctorMatch && !entries.some((e) => e.name === ctorMatch[1])) {
      const ctor = ctorMatch[1]!;
      entries.push({
        name: ctor,
        kind: "constructor",
        module: moduleName,
        type: ctor,
        file: abs,
        range: spanToRange(
          { start: { line: i + 1, column: lines[i]!.indexOf(ctor) + 1, offset: 0 }, end: { line: i + 1, column: lines[i]!.indexOf(ctor) + 1 + ctor.length, offset: 0 } },
          ctor,
        ),
      });
    }
  }

  return entries;
}

function indexMoonFile(filePath: string, moduleName: string): SymbolEntry[] {
  const source = readFileSync(filePath, "utf-8");
  const schemes = coreModuleSchemes(moduleName) ?? undefined;
  try {
    const program = parse(source);
    return indexProgram(program, source, filePath, moduleName, schemes);
  } catch {
    return indexFromSourceText(source, filePath, moduleName);
  }
}

export function indexStdlib(): SymbolEntry[] {
  const entries: SymbolEntry[] = [];
  for (const modulePath of allCoreModulePaths()) {
    const stdlibPath = resolveStdlibPath(modulePath.split("."));
    if (!stdlibPath || !existsSync(stdlibPath)) continue;
    entries.push(...indexMoonFile(stdlibPath, modulePath));
  }
  return entries;
}

export function indexPrelude(): SymbolEntry[] {
  const prelude = buildPrelude();
  const entries: SymbolEntry[] = [];
  for (const [name, scheme] of prelude.values) {
    entries.push({
      name,
      kind: "type",
      module: "Moon.Prelude",
      type: formatScheme(scheme),
      file: "",
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: name.length } },
      docs: "Moon prelude builtin",
    });
  }
  return entries;
}

export function indexWorkspace(projectRoot: string): SymbolEntry[] {
  const entries: SymbolEntry[] = [];
  const libDir = join(projectRoot, "lib");
  if (!existsSync(libDir)) return entries;

  for (const file of readdirSync(libDir).filter((f) => f.endsWith(".moon"))) {
    const filePath = join(libDir, file);
    const moduleName = basename(file, ".moon");
    entries.push(...indexMoonFile(filePath, moduleName));
  }
  return entries;
}

export function buildSymbolIndex(projectRoot: string, extraFiles: string[] = []): SymbolEntry[] {
  const seen = new Set<string>();
  const out: SymbolEntry[] = [];

  const add = (entry: SymbolEntry) => {
    const key = `${entry.module}::${entry.name}::${entry.file}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(entry);
  };

  for (const entry of indexPrelude()) add(entry);
  for (const entry of indexStdlib()) add(entry);
  for (const entry of indexWorkspace(projectRoot)) add(entry);

  for (const filePath of extraFiles) {
    if (!existsSync(filePath)) continue;
    const source = readFileSync(filePath, "utf-8");
    const program = parse(source);
    const moduleName = basename(filePath, ".moon");
    for (const entry of indexProgram(program, source, filePath, moduleName)) add(entry);
  }

  return out.sort((a, b) => a.name.localeCompare(b.name) || a.module.localeCompare(b.module));
}
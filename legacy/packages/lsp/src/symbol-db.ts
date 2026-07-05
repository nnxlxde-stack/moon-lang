import { existsSync, readFileSync, writeFileSync } from "fs";
import { basename, dirname, join, resolve } from "path";
import type { Program } from "@moon/ast";
import { parse } from "@moon/parser";
import { pathToFileURL } from "url";
import {
  buildSymbolIndex,
  indexProgram,
  type MoonSymbolsFile,
  type SymbolEntry,
} from "./symbol-index";
import { buildSymbolTable } from "./project";

const DB_FILENAME = "moon-symbols.json";

export class SymbolDatabase {
  private entries: SymbolEntry[] = [];
  private byName = new Map<string, SymbolEntry[]>();
  private projectRoot = "";

  get symbols(): readonly SymbolEntry[] {
    return this.entries;
  }

  get root(): string {
    return this.projectRoot;
  }

  static dbPath(projectRoot: string): string {
    return join(resolve(projectRoot), DB_FILENAME);
  }

  load(projectRoot: string): boolean {
    this.projectRoot = resolve(projectRoot);
    const path = SymbolDatabase.dbPath(this.projectRoot);
    if (!existsSync(path)) return false;
    try {
      const data = JSON.parse(readFileSync(path, "utf-8")) as MoonSymbolsFile;
      if (data.version !== 1 || !Array.isArray(data.symbols)) return false;
      this.setEntries(data.symbols);
      return true;
    } catch {
      return false;
    }
  }

  save(projectRoot?: string): void {
    if (projectRoot) this.projectRoot = resolve(projectRoot);
    const payload: MoonSymbolsFile = {
      version: 1,
      updatedAt: new Date().toISOString(),
      projectRoot: this.projectRoot,
      symbols: this.entries,
    };
    writeFileSync(SymbolDatabase.dbPath(this.projectRoot), `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
  }

  rebuild(projectRoot: string, openFiles: string[] = []): void {
    this.projectRoot = resolve(projectRoot);
    this.setEntries(buildSymbolIndex(this.projectRoot, openFiles));
    this.save();
  }

  refreshFile(filePath: string): void {
    const abs = resolve(filePath);
    this.entries = this.entries.filter((e) => e.file !== abs);
    if (!existsSync(abs)) {
      this.reindex();
      return;
    }
    const source = readFileSync(abs, "utf-8");
    const program = parse(source);
    const moduleName = basename(abs, ".moon");
    this.merge(indexProgram(program, source, abs, moduleName));
  }

  reindex(openFiles: string[] = []): void {
    if (!this.projectRoot) return;
    this.setEntries(buildSymbolIndex(this.projectRoot, openFiles));
  }

  merge(entries: SymbolEntry[]): void {
    const key = (e: SymbolEntry) => `${e.module}::${e.name}::${e.file}`;
    const map = new Map(this.entries.map((e) => [key(e), e]));
    for (const entry of entries) map.set(key(entry), entry);
    this.setEntries([...map.values()]);
  }

  private setEntries(entries: SymbolEntry[]): void {
    this.entries = entries;
    this.byName.clear();
    for (const entry of entries) {
      const bucket = this.byName.get(entry.name) ?? [];
      bucket.push(entry);
      this.byName.set(entry.name, bucket);
    }
  }

  lookup(name: string, hint?: { module?: string; file?: string }): SymbolEntry | undefined {
    const bucket = this.byName.get(name);
    if (!bucket?.length) return undefined;

    if (hint?.file) {
      const abs = resolve(hint.file);
      const inFile = bucket.find((e) => e.file === abs);
      if (inFile) return inFile;
    }

    if (hint?.module) {
      const inModule = bucket.find((e) => e.module === hint.module);
      if (inModule) return inModule;
    }

    return bucket[0];
  }

  lookupScoped(program: Program, entryPath: string, name: string): SymbolEntry | undefined {
    const table = buildSymbolTable(program, entryPath);
    const info = table.get(name);
    if (!info) return this.lookup(name);

    const fromDb = this.lookup(name, { module: info.module, file: info.filePath ?? entryPath });
    if (fromDb) return fromDb;

    return this.lookup(name, { file: info.filePath ?? entryPath }) ?? this.lookup(name);
  }

  toLocation(entry: SymbolEntry): { uri: string; range: SymbolEntry["range"] } | null {
    if (!entry.file) return null;
    return {
      uri: pathToFileURL(resolve(entry.file)).href,
      range: entry.range,
    };
  }
}

export function findProjectRootFromPath(entryPath: string): string {
  let dir = resolve(entryPath);
  if (basename(entryPath).endsWith(".moon")) dir = dirname(dir);
  while (true) {
    if (existsSync(join(dir, "Moonfile")) || existsSync(join(dir, "Moonfile.moon"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return dirname(resolve(entryPath));
}
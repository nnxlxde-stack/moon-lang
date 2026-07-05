import { parseMoonfile, MoonfileParseError } from "@moon/moonfile";
import { allCoreModulePaths } from "@moon/typechecker/stdlib";
import { existsSync, readdirSync, statSync } from "fs";
import { basename, join, resolve } from "path";
import { CompletionItemKind, type MoonCompletionItem } from "./completion";
import {
  extractMoonfileLineDocs,
  formatMoonfileHover,
  lookupMoonfileDoc,
  MOONFILE_SECTION_DOCS,
} from "./moonfile-docs";
import { filterPathCompletions, scanWorkspacePaths } from "./workspace-paths";

export function isMoonfileDocument(filePath: string): boolean {
  const name = basename(filePath);
  return name === "Moonfile" || name === "Moonfile.moon";
}

export type MoonfileCompletionContext =
  | { kind: "section"; prefix: string }
  | { kind: "dependency"; prefix: string }
  | { kind: "target-name"; prefix: string }
  | { kind: "path"; prefix: string; extensions?: string[]; quoted?: boolean; replaceStart: number }
  | { kind: "provider-key"; prefix: string }
  | { kind: "nested-key"; section: string; nested: string; prefix: string }
  | { kind: "flat-key"; section: string; prefix: string }
  | { kind: "env-var"; prefix: string }
  | { kind: "api-format"; prefix: string }
  | { kind: "model"; prefix: string }
  | { kind: "boolean"; prefix: string }
  | { kind: "package"; prefix: string }
  | { kind: "nested-section"; section: string; prefix: string };

const TOP_SECTIONS = [
  "dependencies",
  "targets",
  "providers",
  "paths",
  "models",
  "prompts",
  "runtime",
] as const;

const PROVIDER_KEYS = ["api_key", "base_url", "api_format", "use_beta"] as const;
const PATH_KEYS = ["pricing", "tokenizer"] as const;
const MODEL_KEYS = ["default_flash", "default_pro"] as const;
const PROMPT_KEYS = ["default_system_suffix", "trace_by_default"] as const;
const STORM_KEYS = ["default_rounds", "max_panel_size"] as const;
const WORKER_KEYS = ["flash_concurrency", "pro_concurrency"] as const;
const MEMORY_KEYS = ["long_term_backend"] as const;
const RETRY_KEYS = ["max_repair_attempts"] as const;

const MODEL_VALUES = ["deepseek-v4-flash", "deepseek-v4-pro"] as const;
const API_FORMAT_VALUES = ["openai", "anthropic"] as const;
const BOOLEAN_VALUES = ["true", "false"] as const;

function rowAt(text: string, line: number): string {
  return text.split(/\r?\n/)[line] ?? "";
}

function pathValueContext(
  row: string,
  before: string,
  character: number,
): { prefix: string; quoted: boolean; replaceStart: number } | null {
  const colonIdx = row.indexOf(":");
  if (colonIdx < 0 || character <= colonIdx) return null;

  const quotedMatch = before.match(/:\s*"([^"]*)$/);
  if (quotedMatch) {
    const quoteStart = before.lastIndexOf('"');
    return {
      prefix: quotedMatch[1] ?? "",
      quoted: true,
      replaceStart: quoteStart + 1,
    };
  }

  const unquotedMatch = before.match(/:\s*([A-Za-z0-9_./\\-]*)$/);
  if (unquotedMatch) {
    const valueStart = before.length - (unquotedMatch[1]?.length ?? 0);
    return {
      prefix: unquotedMatch[1] ?? "",
      quoted: false,
      replaceStart: valueStart,
    };
  }

  const afterColon = row.slice(colonIdx + 1);
  if (/^\s*$/.test(afterColon.slice(0, Math.max(0, character - colonIdx - 1)))) {
    const valueStart = colonIdx + 1 + (afterColon.match(/^\s*/)?.[0].length ?? 0);
    if (character >= valueStart) {
      return { prefix: "", quoted: false, replaceStart: valueStart };
    }
  }

  return null;
}

function prefixAt(text: string, line: number, character: number): string {
  const row = rowAt(text, line);
  const before = row.slice(0, character);
  const pathCtx = pathValueContext(row, before, character);
  if (pathCtx) return pathCtx.prefix;
  const wordMatch = before.match(/[A-Za-z0-9_.-]*$/);
  return wordMatch?.[0] ?? "";
}

function isSectionHeader(text: string): boolean {
  return text.endsWith(":") && !text.includes(" ") && !text.includes('"');
}

function findSectionContext(text: string, lineNo: number): { section: string; nested: string; indent: number } {
  const lines = text.split(/\r?\n/);
  let section = "";
  let nested = "";
  let sectionIndent = 0;

  for (let i = 0; i <= lineNo; i++) {
    const raw = lines[i] ?? "";
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("--")) continue;
    if (/^package\s+"/.test(trimmed)) continue;

    const indent = raw.match(/^(\s*)/)?.[1].length ?? 0;
    if (!isSectionHeader(trimmed)) continue;

    const name = trimmed.slice(0, -1);
    if (indent === 0) {
      section = name;
      nested = "";
      sectionIndent = 0;
      continue;
    }
    if (section && indent > sectionIndent) {
      nested = name;
    }
  }

  return { section, nested, indent: sectionIndent };
}

export function detectMoonfileContext(
  text: string,
  line: number,
  character: number,
): MoonfileCompletionContext {
  const row = rowAt(text, line);
  const before = row.slice(0, character);
  const prefix = prefixAt(text, line, character);
  const { section, nested } = findSectionContext(text, line);

  if (/^package\s+/.test(row) && !/"[^"]*"$/.test(before)) {
    return { kind: "package", prefix };
  }

  const envMatch = before.match(/env\(\s*"([^"]*)$/);
  if (envMatch) {
    return { kind: "env-var", prefix: envMatch[1] ?? "" };
  }

  const valueMatch = row.match(/^\s*([a-zA-Z0-9_.-]+):/);
  const pathCtx = pathValueContext(row, before, character);

  if (valueMatch && pathCtx) {
    const key = valueMatch[1]!;
    if (section === "targets" || (section === "paths" && PATH_KEYS.includes(key as typeof PATH_KEYS[number]))) {
      const extensions = section === "targets" ? [".moon"] : undefined;
      return {
        kind: "path",
        prefix: pathCtx.prefix,
        extensions,
        quoted: pathCtx.quoted,
        replaceStart: pathCtx.replaceStart,
      };
    }
    if (section === "providers" && nested === "deepseek" && key === "api_format") {
      return { kind: "api-format", prefix };
    }
    if (section === "providers" && nested === "deepseek" && key === "use_beta") {
      return { kind: "boolean", prefix };
    }
    if (section === "models" && MODEL_KEYS.includes(key as typeof MODEL_KEYS[number])) {
      return { kind: "model", prefix };
    }
    if (section === "prompts" && key === "trace_by_default") {
      return { kind: "boolean", prefix };
    }
    if (section === "providers" && nested === "deepseek" && key === "api_key" && !before.includes("env(")) {
      return { kind: "env-var", prefix: "" };
    }
  }

  if (section === "dependencies" && (/^\s*$/.test(before) || /^\s+[A-Za-z0-9_.]*$/.test(before))) {
    return { kind: "dependency", prefix: prefix.replace(/^Core\./, "") };
  }

  if (section === "targets" && !row.includes(":")) {
    return { kind: "target-name", prefix };
  }

  if (
    (section === "providers" || section === "prompts" || section === "runtime")
    && !nested
    && /^\s+$/.test(before)
  ) {
    return { kind: "nested-section", section, prefix };
  }

  if (section === "providers" && nested === "deepseek" && !row.includes(":")) {
    return { kind: "provider-key", prefix };
  }

  if (section === "paths" && !row.includes(":")) {
    return { kind: "flat-key", section, prefix };
  }
  if (section === "models" && !row.includes(":")) {
    return { kind: "flat-key", section, prefix };
  }
  if (section === "prompts" && nested === "storm" && !row.includes(":")) {
    return { kind: "nested-key", section, nested, prefix };
  }
  if (section === "prompts" && !nested && !row.includes(":")) {
    return { kind: "flat-key", section, prefix };
  }
  if (section === "runtime" && nested && !row.includes(":")) {
    return { kind: "nested-key", section, nested, prefix };
  }

  if (/^\s*$/.test(row) || (!section && !/^package\s/.test(row))) {
    return { kind: "section", prefix };
  }

  return { kind: "section", prefix };
}

function matchesPrefix(label: string, prefix: string): boolean {
  return label.toLowerCase().startsWith(prefix.toLowerCase());
}

function item(
  label: string,
  kind: number,
  opts: Partial<MoonCompletionItem> = {},
): MoonCompletionItem {
  return { label, kind, ...opts };
}

let workspacePathCache: { root: string; paths: string[] } | null = null;

function cachedWorkspacePaths(projectRoot: string, extensions?: string[]): string[] {
  if (workspacePathCache?.root === projectRoot) return workspacePathCache.paths;
  const paths = scanWorkspacePaths([projectRoot], { extensions });
  workspacePathCache = { root: projectRoot, paths };
  return paths;
}

function formatPathCompletion(
  rel: string,
  opts: { quoted: boolean; line: number; replaceStart: number; character: number },
): Partial<MoonCompletionItem> {
  const insertText = opts.quoted ? `${rel}"` : `"${rel}"`;
  return {
    insertText,
    textEdit: {
      range: {
        start: { line: opts.line, character: opts.replaceStart },
        end: { line: opts.line, character: opts.character },
      },
      newText: insertText,
    },
  };
}

function listPathCompletions(
  projectRoot: string,
  partial: string,
  extensions: string[] | undefined,
  edit: { line: number; character: number; quoted: boolean; replaceStart: number },
): MoonCompletionItem[] {
  workspacePathCache = null;
  const local = listRelativePaths(projectRoot, partial, extensions, edit);
  const workspace = filterPathCompletions(cachedWorkspacePaths(projectRoot, extensions), partial);
  const seen = new Set(local.map((entry) => entry.label));
  const merged = [...local];
  for (const rel of workspace) {
    if (seen.has(rel)) continue;
    seen.add(rel);
    const kind = rel.endsWith("/") ? CompletionItemKind.Folder : CompletionItemKind.File;
    merged.push(item(rel, kind, {
      detail: "workspace",
      sortText: `2${rel}`,
      ...formatPathCompletion(rel, edit),
    }));
  }
  return merged;
}

function listRelativePaths(
  projectRoot: string,
  partial: string,
  extensions: string[] | undefined,
  edit: { line: number; character: number; quoted: boolean; replaceStart: number },
): MoonCompletionItem[] {
  const normalized = partial.replace(/\\/g, "/");
  const parts = normalized.split("/");
  const filePrefix = parts.pop() ?? "";
  let current = resolve(projectRoot);

  for (const part of parts) {
    if (!part || part === ".") continue;
    current = join(current, part);
    if (!existsSync(current)) return [];
  }

  let entries: string[] = [];
  try {
    entries = readdirSync(current);
  } catch {
    return [];
  }

  const items: MoonCompletionItem[] = [];
  const dirPrefix = parts.length > 0 ? `${parts.join("/")}/` : "";

  for (const entry of entries.sort()) {
    if (entry.startsWith(".")) continue;
    const full = join(current, entry);
    let isDir = false;
    try {
      isDir = statSync(full).isDirectory();
    } catch {
      continue;
    }

    if (isDir) {
      if (!matchesPrefix(entry, filePrefix)) continue;
      const rel = `${dirPrefix}${entry}/`;
      items.push(item(rel, CompletionItemKind.Folder, {
        detail: "directory",
        sortText: `0${rel}`,
        ...formatPathCompletion(rel, edit),
      }));
      continue;
    }

    if (extensions && !extensions.some((ext) => entry.endsWith(ext))) continue;
    if (!matchesPrefix(entry, filePrefix)) continue;
    const rel = `${dirPrefix}${entry}`;
    items.push(item(rel, CompletionItemKind.File, {
      detail: extensions?.length ? "Moon target" : "file",
      sortText: `1${rel}`,
      ...formatPathCompletion(rel, edit),
    }));
  }

  return items;
}

function suggestEnvVars(prefix: string): MoonCompletionItem[] {
  const common = [
    "DEEPSEEK_API_KEY",
    "DEEPSEEK_BASE_URL",
    "DEEPSEEK_USE_BETA",
    "MOON_MEMORY_PATH",
  ];
  const fromEnv = Object.keys(process.env);
  const all = [...new Set([...common, ...fromEnv])];
  return all
    .filter((name) => matchesPrefix(name, prefix))
    .map((name) => item(`env("${name}")`, CompletionItemKind.Constant, {
      detail: "environment variable",
      insertText: `env("${name}")`,
      sortText: `a${name}`,
    }));
}

function suggestValues(values: readonly string[], prefix: string, kind = CompletionItemKind.Value): MoonCompletionItem[] {
  return values
    .filter((value) => matchesPrefix(value, prefix))
    .map((value) => item(value, kind, { sortText: `a${value}` }));
}

export function getMoonfileCompletions(
  text: string,
  line: number,
  character: number,
  projectRoot: string,
): MoonCompletionItem[] {
  const ctx = detectMoonfileContext(text, line, character);
  const prefix = "prefix" in ctx ? ctx.prefix : "";

  switch (ctx.kind) {
    case "package":
      return [item('package "${1:name}"', CompletionItemKind.Snippet, {
        insertText: 'package "${1:name}"',
        insertTextFormat: 2,
        detail: "project package name",
      })];

    case "section": {
      const items: MoonCompletionItem[] = [];
      if (!text.includes('package "')) {
        items.push(item('package "${1:name}"', CompletionItemKind.Snippet, {
          insertText: 'package "${1:name}"\n\n',
          insertTextFormat: 2,
          detail: "declare package name",
        }));
      }
      for (const section of TOP_SECTIONS) {
        if (!matchesPrefix(section, prefix)) continue;
        items.push(item(`${section}:`, CompletionItemKind.Keyword, {
          detail: MOONFILE_SECTION_DOCS[section],
          insertText: `${section}:\n  `,
          sortText: `a${section}`,
        }));
      }
      return items;
    }

    case "dependency":
      return allCoreModulePaths()
        .filter((path) => matchesPrefix(path, prefix) || matchesPrefix(path.replace(/^Core\./, ""), prefix))
        .map((path) => item(path, CompletionItemKind.Module, {
          detail: "Core stdlib module",
          sortText: `a${path}`,
        }));

    case "target-name": {
      const pathEdit = {
        line,
        character,
        quoted: false,
        replaceStart: Math.max(0, character - prefix.length),
      };
      if (prefix.includes("/") || prefix.includes(".") || prefix.includes("\\")) {
        return listPathCompletions(projectRoot, prefix, [".moon"], pathEdit);
      }
      const moonFiles = listPathCompletions(projectRoot, "", [".moon"], {
        ...pathEdit,
        replaceStart: character,
      }).slice(0, 12);
      return [
        item("${1:target}: ${2:examples/file.moon}", CompletionItemKind.Snippet, {
          insertText: "${1:target}: ${2:examples/file.moon}",
          insertTextFormat: 2,
          detail: "new target entry",
        }),
        ...moonFiles,
      ];
    }

    case "nested-section": {
      const nestedBySection: Record<string, readonly string[]> = {
        providers: ["deepseek"],
        prompts: ["storm"],
        runtime: ["worker_pool", "memory", "retries"],
      };
      const options = nestedBySection[ctx.section] ?? [];
      return options
        .filter((name) => matchesPrefix(name, prefix))
        .map((name) => item(`${name}:`, CompletionItemKind.Keyword, {
          detail: `${ctx.section} subsection`,
          insertText: `${name}:\n    `,
          sortText: `a${name}`,
        }));
    }

    case "path":
      return listPathCompletions(projectRoot, prefix, ctx.extensions, {
        line,
        character,
        quoted: ctx.quoted ?? false,
        replaceStart: ctx.replaceStart,
      });

    case "provider-key":
      return PROVIDER_KEYS
        .filter((key) => matchesPrefix(key, prefix))
        .map((key) => item(`${key}: `, CompletionItemKind.Property, {
          detail: lookupMoonfileDoc("providers", "deepseek", key),
          insertText: key === "api_key" ? 'api_key: env("${1:DEEPSEEK_API_KEY}")' : `${key}: `,
          insertTextFormat: key === "api_key" ? 2 : 1,
        }));

    case "flat-key": {
      const keys = ctx.section === "paths"
        ? PATH_KEYS
        : ctx.section === "models"
          ? MODEL_KEYS
          : PROMPT_KEYS;
      return keys
        .filter((key) => matchesPrefix(key, prefix))
        .map((key) => item(`${key}: `, CompletionItemKind.Property, {
          detail: lookupMoonfileDoc(ctx.section, undefined, key),
        }));
    }

    case "nested-key": {
      const keys = ctx.nested === "storm"
        ? STORM_KEYS
        : ctx.nested === "worker_pool"
          ? WORKER_KEYS
          : ctx.nested === "memory"
            ? MEMORY_KEYS
            : ctx.nested === "retries"
              ? RETRY_KEYS
              : PROVIDER_KEYS;
      return keys
        .filter((key) => matchesPrefix(key, prefix))
        .map((key) => item(`${key}: `, CompletionItemKind.Property, {
          detail: lookupMoonfileDoc(ctx.section, ctx.nested, key),
        }));
    }

    case "env-var":
      return suggestEnvVars(prefix);

    case "api-format":
      return suggestValues(API_FORMAT_VALUES, prefix);

    case "model":
      return suggestValues(MODEL_VALUES, prefix, CompletionItemKind.Constant);

    case "boolean":
      return suggestValues(BOOLEAN_VALUES, prefix, CompletionItemKind.Constant);

    default:
      return [];
  }
}

export function getMoonfileHover(text: string, line: number, character: number): string | null {
  const row = rowAt(text, line);
  const word = prefixAt(text, line, character);
  const { section, nested } = findSectionContext(text, line);
  const inlineDocs = extractMoonfileLineDocs(text, line);

  const keyMatch = row.match(/^\s*([a-zA-Z0-9_.-]+):/);
  const key = keyMatch?.[1];
  if (key && (word === key || row.includes(`: ${word}`))) {
    const doc = inlineDocs ?? lookupMoonfileDoc(section, nested, key);
    if (doc) {
      const type = nested ? `${section}.${nested}.${key}` : section ? `${section}.${key}` : key;
      return formatMoonfileHover(key, type, doc);
    }
  }

  if (word && MOONFILE_SECTION_DOCS[word]) {
    return formatMoonfileHover(word, "section", inlineDocs ?? MOONFILE_SECTION_DOCS[word]);
  }

  if (word?.startsWith("Core.")) {
    return formatMoonfileHover(word, "Core module", inlineDocs ?? "Core stdlib module dependency.");
  }

  if (inlineDocs) {
    return formatMoonfileHover(word ?? "Moonfile", "declaration", inlineDocs);
  }

  return null;
}

export function collectMoonfileDiagnostics(text: string): Array<{
  message: string;
  line: number;
  character: number;
  endLine: number;
  endCharacter: number;
  severity: 1 | 2;
}> {
  try {
    parseMoonfile(text);
    return [];
  } catch (err) {
    if (!(err instanceof MoonfileParseError)) {
      return [{
        message: err instanceof Error ? err.message : String(err),
        line: 0,
        character: 0,
        endLine: 0,
        endCharacter: 1,
        severity: 1,
      }];
    }

    const line = Math.max(0, err.line - 1);
    const row = text.split(/\r?\n/)[line] ?? "";
    return [{
      message: err.message,
      line,
      character: 0,
      endLine: line,
      endCharacter: Math.max(1, row.length),
      severity: 1,
    }];
  }
}
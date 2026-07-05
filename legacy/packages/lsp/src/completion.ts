import type { DoBlock, DoStatement, Pattern, Program } from "@moon/ast";
import { existsSync, readdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { allCoreModulePaths } from "@moon/typechecker/stdlib";
import { buildSymbolTable, type SymbolInfo } from "./project";

export const CompletionItemKind = {
  Text: 1,
  Method: 2,
  Function: 3,
  Variable: 6,
  Class: 7,
  Module: 9,
  Property: 10,
  Value: 12,
  Keyword: 14,
  Snippet: 15,
  EnumMember: 13,
  File: 17,
  Folder: 18,
  Constant: 21,
  TypeParameter: 25,
} as const;

export interface MoonCompletionItem {
  label: string;
  kind: number;
  detail?: string;
  documentation?: string;
  insertText?: string;
  insertTextFormat?: 1 | 2;
  sortText?: string;
  filterText?: string;
  textEdit?: {
    range: {
      start: { line: number; character: number };
      end: { line: number; character: number };
    };
    newText: string;
  };
}

export type CompletionKind =
  | "import"
  | "import-core"
  | "member"
  | "config"
  | "agent-config"
  | "type"
  | "name"
  | "expression"
  | "declaration"
  | "keyword";

export interface CompletionContext {
  kind: CompletionKind;
  prefix: string;
  objectName?: string;
}

const DECLARATION_KEYWORDS = [
  "import", "model", "agent", "data", "instance", "macro", "main",
];

const DO_KEYWORDS = ["do", "let", "with", "storm", "pure", "when", "if", "then", "else", "not"];

const AGENT_CONFIG_KEYS = [
  "model", "temperature", "systemPrompt", "role", "focus", "style",
];

const BIND_CONFIG_KEYS = [
  "context", "focus", "maxTokens", "previousVersion", "filter", "temperature",
];

const STORM_CONFIG_KEYS = [
  "panel", "synthesizer", "rounds", "context",
];

const TYPE_NAMES = [
  "String", "Int", "Float", "Bool", "IO", "List", "Unit", "Code",
  "Documentation", "Requirements", "Entity", "Agent", "Scope", "Verdict",
  "Analyzer", "Reviewer", "LongTerm", "PullRequest", "ChangedFile",
];

const MODEL_NAMES = [
  "deepseek-v4-flash", "deepseek-v4-pro",
];

export function prefixAtPosition(text: string, line: number, character: number): string {
  const row = text.split(/\r?\n/)[line] ?? "";
  const before = row.slice(0, character);
  const match = before.match(/[A-Za-z0-9_.'-]*$/);
  return match?.[0] ?? "";
}

export function detectCompletionContext(text: string, line: number, character: number): CompletionContext {
  const row = text.split(/\r?\n/)[line] ?? "";
  const before = row.slice(0, character);
  const prefix = prefixAtPosition(text, line, character);

  if (/\bimport\s+Core\.[\w.]*$/.test(before) || /\bimport\s+Core\.$/.test(before)) {
    return { kind: "import-core", prefix: prefix.replace(/^.*\./, "") };
  }
  if (/\bimport\s+[\w.]*$/.test(before)) {
    return { kind: "import", prefix };
  }

  const memberMatch = before.match(/([A-Za-z][A-Za-z0-9_]*)\.([A-Za-z0-9_]*)$/);
  if (memberMatch) {
    return { kind: "member", prefix: memberMatch[2] ?? "", objectName: memberMatch[1] };
  }

  if (/\bwith\s*$/.test(before) || (/^\s{4,}\w*:?\s*$/.test(before) && text.slice(0, offsetAt(text, line, character)).includes("with"))) {
    const stormNearby = row.includes("storm") || linesBefore(text, line, 3).some((l) => l.includes("<- storm"));
    if (stormNearby) return { kind: "config", prefix };
    return { kind: "config", prefix };
  }

  if (isAgentConfigLine(text, line, before)) {
    return { kind: "agent-config", prefix };
  }

  if (/::\s*[\w.[\]]*$/.test(before)) {
    const typePrefix = before.match(/::\s*([\w.[\]]*)$/)?.[1] ?? "";
    return { kind: "type", prefix: typePrefix };
  }

  if (/^\s*$/.test(before) || /^\s*(main|agent|model|data)\b/.test(before)) {
    return { kind: "declaration", prefix };
  }

  if (/[A-Za-z0-9_.'-]*$/.test(before) && prefix.length > 0) {
    return { kind: "name", prefix };
  }

  return { kind: "expression", prefix };
}

function linesBefore(text: string, line: number, count: number): string[] {
  const lines = text.split(/\r?\n/);
  const out: string[] = [];
  for (let i = Math.max(0, line - count); i < line; i++) {
    out.push(lines[i] ?? "");
  }
  return out;
}

function isAgentConfigLine(text: string, line: number, before: string): boolean {
  if (!/^\s+\w*:?\s*$/.test(before) && !/^\s+\w+[\w-]*$/.test(before)) return false;
  const lines = text.split(/\r?\n/);
  for (let i = line; i >= Math.max(0, line - 20); i--) {
    if (/^\s*agent\s/.test(lines[i] ?? "")) return true;
    if (/^\s*(main|model|data|import)\b/.test(lines[i] ?? "")) return false;
  }
  return false;
}

function offsetAt(text: string, line: number, character: number): number {
  const lines = text.split(/\r?\n/);
  let offset = 0;
  for (let i = 0; i < line; i++) offset += (lines[i]?.length ?? 0) + 1;
  return offset + character;
}

function matchesPrefix(label: string, prefix: string): boolean {
  if (!prefix) return true;
  return label.toLowerCase().startsWith(prefix.toLowerCase());
}

function item(
  label: string,
  kind: number,
  opts: Partial<MoonCompletionItem> = {},
): MoonCompletionItem {
  return { label, kind, ...opts };
}

export function findProjectRoot(entryPath: string): string {
  let dir = dirname(resolve(entryPath));
  while (true) {
    if (existsSync(join(dir, "Moonfile")) || existsSync(join(dir, "Moonfile.moon"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return dirname(resolve(entryPath));
}

export function listLocalModules(projectRoot: string): string[] {
  const libDir = join(projectRoot, "lib");
  if (!existsSync(libDir)) return [];
  return readdirSync(libDir)
    .filter((f) => f.endsWith(".moon"))
    .map((f) => f.replace(/\.moon$/, ""));
}

export function collectProgramNames(
  program: Program,
  table: Map<string, SymbolInfo>,
  beforeLine?: number,
): MoonCompletionItem[] {
  const seen = new Set<string>();
  const items: MoonCompletionItem[] = [];

  const add = (name: string, kind: number, detail: string, sort = "b") => {
    if (seen.has(name)) return;
    seen.add(name);
    items.push(item(name, kind, { detail, sortText: `${sort}${name}` }));
  };

  for (const decl of program.declarations) {
    if (decl.kind === "Model") {
      add(decl.decl.name, CompletionItemKind.Class, "model");
    }
    if (decl.kind === "Agent") {
      add(decl.decl.name, CompletionItemKind.Class, "agent");
    }
    if (decl.kind === "Function" && decl.decl.signature) {
      add(decl.decl.signature.name, CompletionItemKind.Function, "function");
    }
    if (decl.kind === "Data") {
      add(decl.decl.name, CompletionItemKind.Class, "data type");
      for (const ctor of decl.decl.constructors) {
        add(ctor.name, CompletionItemKind.EnumMember, `constructor of ${decl.decl.name}`);
      }
    }
  }

  for (const [name, info] of table) {
    add(name, CompletionItemKind.Function, info.type, "c");
  }

  if (beforeLine !== undefined) {
    for (const local of collectLocalBindings(program, beforeLine)) {
      add(local, CompletionItemKind.Variable, "local binding", "a");
    }
  }

  return items;
}

export function collectLocalBindings(program: Program, beforeLine: number): string[] {
  const locals = new Set<string>();

  const bindPattern = (pat: Pattern) => {
    if (pat.kind === "PVar") locals.add(pat.name);
  };

  const walkDo = (block: DoBlock) => {
    for (const stmt of block.statements) {
      if (stmt.span.start.line >= beforeLine) break;
      if (stmt.kind === "Let" || stmt.kind === "Bind" || stmt.kind === "Storm") {
        bindPattern(stmt.pattern);
      }
      if (stmt.kind === "Let" || stmt.kind === "Bind" || stmt.kind === "Action" || stmt.kind === "Storm") {
        collectExprBindings(stmt, locals, beforeLine);
      }
    }
  };

  for (const decl of program.declarations) {
    if (decl.kind !== "Function") continue;
    for (const eq of decl.decl.equations) {
      for (const pat of eq.patterns) {
        if (pat.kind === "PVar") locals.add(pat.name);
      }
      if ("statements" in eq.body) {
        walkDo(eq.body);
      }
    }
  }

  return [...locals];
}

function collectExprBindings(stmt: DoStatement, locals: Set<string>, beforeLine: number): void {
  if (stmt.span.start.line >= beforeLine) return;
}

export function getCompletions(
  program: Program,
  entryPath: string,
  text: string,
  line: number,
  character: number,
): MoonCompletionItem[] {
  const ctx = detectCompletionContext(text, line, character);
  const projectRoot = findProjectRoot(entryPath);
  const table = buildSymbolTable(program, entryPath);
  const agents = program.declarations
    .filter((d): d is Extract<typeof d, { kind: "Agent" }> => d.kind === "Agent")
    .map((d) => d.decl.name);

  switch (ctx.kind) {
    case "import":
      return importCompletions(ctx.prefix, projectRoot);
    case "import-core":
      return coreSubmoduleCompletions(ctx.prefix);
    case "member":
      return memberCompletions(ctx.objectName ?? "", ctx.prefix, agents, table);
    case "config":
      return configCompletions(text, line, ctx.prefix);
    case "agent-config":
      return agentConfigCompletions(ctx.prefix);
    case "type":
      return typeCompletions(ctx.prefix);
    case "name":
      return nameCompletions(program, table, line, ctx.prefix, agents);
    case "declaration":
      return declarationCompletions();
    case "expression":
    default:
      return expressionCompletions(program, table, entryPath, line, ctx.prefix, agents);
  }
}

function nameCompletions(
  program: Program,
  table: Map<string, SymbolInfo>,
  line: number,
  prefix: string,
  agents: string[] = [],
): MoonCompletionItem[] {
  const items = collectProgramNames(program, table, line + 1)
    .filter((i) => matchesPrefix(i.label, prefix));

  for (const kw of DO_KEYWORDS) {
    if (!matchesPrefix(kw, prefix)) continue;
    if (kw === "storm") {
      items.push(item("storm", CompletionItemKind.Snippet, {
        insertText: "storm ${1:input}\n    with panel: [${2:AgentA}, ${3:AgentB}]\n         synthesizer: ${4:Synth}\n         rounds: ${5:2}",
        insertTextFormat: 2,
        detail: "brainstorm/debate panel",
        sortText: "0storm",
      }));
      continue;
    }
    items.push(item(kw, CompletionItemKind.Keyword, { sortText: `z${kw}` }));
  }

  for (const agent of agents) {
    if (!matchesPrefix(agent, prefix)) continue;
    items.push(item(agent, CompletionItemKind.Class, {
      detail: "agent",
      insertText: `${agent}.analyze `,
      sortText: `aa${agent}`,
    }));
  }

  return items;
}

function importCompletions(prefix: string, projectRoot: string): MoonCompletionItem[] {
  const items: MoonCompletionItem[] = [];
  for (const path of allCoreModulePaths()) {
    if (!matchesPrefix(path, prefix)) continue;
    items.push(item(path, CompletionItemKind.Module, {
      detail: "Core stdlib module",
      sortText: `a${path}`,
    }));
  }
  items.push(item("Core", CompletionItemKind.Module, {
    detail: "Core stdlib namespace",
    insertText: "Core.",
    sortText: "aCore",
  }));
  for (const local of listLocalModules(projectRoot)) {
    if (!matchesPrefix(local, prefix)) continue;
    items.push(item(local, CompletionItemKind.Module, {
      detail: "lib/ module",
      sortText: `al${local}`,
    }));
  }
  return items;
}

function coreSubmoduleCompletions(prefix: string): MoonCompletionItem[] {
  return allCoreModulePaths()
    .map((p) => p.replace(/^Core\./, ""))
    .filter((name) => matchesPrefix(name, prefix))
    .map((name) => item(name, CompletionItemKind.Module, {
      detail: `Core.${name}`,
      insertText: name,
      sortText: `a${name}`,
    }));
}

function memberCompletions(
  objectName: string,
  prefix: string,
  agents: string[],
  table: Map<string, SymbolInfo>,
): MoonCompletionItem[] {
  if (agents.includes(objectName)) {
    if (matchesPrefix("analyze", prefix)) {
      return [item("analyze", CompletionItemKind.Method, {
        detail: "Agent.analyze input",
        documentation: "Run LLM analysis. Chain with `with` for context, focus, maxTokens.",
        insertText: "analyze ${1:input}\n    with context: ${2:ctx}\n         maxTokens: ${3:2000}",
        insertTextFormat: 2,
        sortText: "aanalyze",
      })];
    }
    return [];
  }

  const sym = table.get(objectName);
  if (sym?.type.includes("->")) {
    return [];
  }

  return [];
}

function configCompletions(text: string, line: number, prefix: string): MoonCompletionItem[] {
  const isStorm = linesBefore(text, line, 6).some((l) => /<- storm\b/.test(l))
    || (text.split(/\r?\n/)[line] ?? "").includes("storm");
  const keys = isStorm ? STORM_CONFIG_KEYS : BIND_CONFIG_KEYS;
  return keys
    .filter((k) => matchesPrefix(k, prefix))
    .map((k) => item(k, CompletionItemKind.Property, {
      detail: isStorm ? "storm config" : "bind/action config",
      insertText: `${k}: `,
      sortText: `a${k}`,
    }));
}

function agentConfigCompletions(prefix: string): MoonCompletionItem[] {
  const items = AGENT_CONFIG_KEYS
    .filter((k) => matchesPrefix(k, prefix))
    .map((k) => item(k, CompletionItemKind.Property, {
      detail: "agent config",
      insertText: k === "systemPrompt"
        ? 'systemPrompt: """\n$0\n"""'
        : k === "focus"
          ? 'focus: ["$0"]'
          : k === "model"
            ? "model: deepseek-v4-pro"
            : `${k}: `,
      insertTextFormat: k === "systemPrompt" || k === "focus" ? 2 : 1,
      sortText: `a${k}`,
    }));

  for (const model of MODEL_NAMES) {
    if (matchesPrefix(model, prefix)) {
      items.push(item(model, CompletionItemKind.Constant, {
        detail: "LLM model",
        sortText: `b${model}`,
      }));
    }
  }
  return items;
}

function typeCompletions(prefix: string): MoonCompletionItem[] {
  return TYPE_NAMES
    .filter((t) => matchesPrefix(t, prefix))
    .map((t) => item(t, CompletionItemKind.Class, {
      sortText: `a${t}`,
    }));
}

function declarationCompletions(): MoonCompletionItem[] {
  return [
    item("import", CompletionItemKind.Keyword, {
      insertText: "import Core.${1:GitHub}",
      insertTextFormat: 2,
      sortText: "aimport",
    }),
    item("model", CompletionItemKind.Snippet, {
      insertText: "model ${1:Name} where\n    ${2:field} :: ${3:String}",
      insertTextFormat: 2,
      detail: "model declaration",
      sortText: "amodel",
    }),
    item("agent", CompletionItemKind.Snippet, {
      insertText: "agent ${1:Name} :: ${2:Analyzer} ${3:Code}\n  model: deepseek-v4-pro\n  systemPrompt: \"\"\"\n  $0\n  \"\"\"",
      insertTextFormat: 2,
      detail: "agent declaration",
      sortText: "aagent",
    }),
    item("main", CompletionItemKind.Snippet, {
      insertText: "main :: IO ()\nmain = do\n    $0",
      insertTextFormat: 2,
      sortText: "amain",
    }),
    item("data", CompletionItemKind.Keyword, { sortText: "adata" }),
  ];
}

function expressionCompletions(
  program: Program,
  table: Map<string, SymbolInfo>,
  _entryPath: string,
  line: number,
  prefix: string,
  agents: string[],
): MoonCompletionItem[] {
  return nameCompletions(program, table, line, prefix, agents);
}

export function getPartialCompletions(
  text: string,
  entryPath: string,
  line: number,
  character: number,
): MoonCompletionItem[] {
  const ctx = detectCompletionContext(text, line, character);
  const projectRoot = findProjectRoot(entryPath);

  switch (ctx.kind) {
    case "import":
      return importCompletions(ctx.prefix, projectRoot);
    case "import-core":
      return coreSubmoduleCompletions(ctx.prefix);
    case "member":
      return memberCompletions(ctx.objectName ?? "", ctx.prefix, [], new Map());
    case "config":
      return configCompletions(text, line, ctx.prefix);
    case "agent-config":
      return agentConfigCompletions(ctx.prefix);
    case "type":
      return typeCompletions(ctx.prefix);
    case "declaration":
      return declarationCompletions();
    case "name":
    case "expression":
    default: {
      const items = declarationCompletions();
      for (const kw of DO_KEYWORDS) {
        if (!matchesPrefix(kw, ctx.prefix)) continue;
        items.push(item(kw, CompletionItemKind.Keyword, { sortText: `z${kw}` }));
      }
      for (const path of allCoreModulePaths()) {
        if (!matchesPrefix(path, ctx.prefix)) continue;
        items.push(item(path, CompletionItemKind.Module, {
          detail: "Core stdlib (import required)",
          sortText: `y${path}`,
        }));
      }
      return items;
    }
  }
}

export function getSignatureHelp(
  program: Program,
  text: string,
  line: number,
  character: number,
): { signatures: Array<{ label: string; documentation?: string }>; activeSignature: number } | null {
  const row = text.split(/\r?\n/)[line] ?? "";
  const before = row.slice(0, character);

  if (!/\.analyze\b/.test(before) && !/\banalyze\s/.test(before) && !/\banalyze$/.test(before)) {
    return null;
  }

  return {
    activeSignature: 0,
    signatures: [{
      label: "analyze input with context: ctx maxTokens: n focus: [...]",
      documentation: "Agent LLM call. Config keys: context, focus, maxTokens, previousVersion, temperature, filter.",
    }],
  };
}
import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";

export interface MoonfileModels {
  default_flash?: string;
  default_pro?: string;
}

export interface MoonfileRuntime {
  worker_pool?: {
    flash_concurrency?: number;
    pro_concurrency?: number;
  };
  memory?: {
    long_term_backend?: string;
  };
  retries?: {
    max_repair_attempts?: number;
  };
}

export interface MoonfileProviders {
  deepseek?: {
    api_key?: string;
    api_key_env?: string;
    base_url?: string;
    base_url_env?: string;
    api_format?: "openai" | "anthropic";
    use_beta?: boolean;
  };
}

export interface MoonfilePaths {
  pricing?: string;
  tokenizer?: string;
}

export interface MoonfilePrompts {
  default_system_suffix?: string;
  trace_by_default?: boolean;
  storm?: {
    default_rounds?: number;
    max_panel_size?: number;
  };
}

export interface Moonfile {
  package: string;
  dependencies: string[];
  targets: Record<string, string>;
  models: MoonfileModels;
  providers: MoonfileProviders;
  paths: MoonfilePaths;
  prompts: MoonfilePrompts;
  runtime: MoonfileRuntime;
}

export class MoonfileParseError extends Error {
  constructor(
    message: string,
    public line: number,
  ) {
    super(`${message} at line ${line}`);
    this.name = "MoonfileParseError";
  }
}

interface ParsedLine {
  indent: number;
  text: string;
  lineNo: number;
}

export function parseMoonfile(source: string): Moonfile {
  const result: Moonfile = {
    package: "",
    dependencies: [],
    targets: {},
    models: {},
    providers: {},
    paths: {},
    prompts: {},
    runtime: {},
  };

  const lines = source
    .split(/\r?\n/)
    .map((raw, index): ParsedLine => ({
      indent: raw.match(/^(\s*)/)?.[1].length ?? 0,
      text: raw.trim(),
      lineNo: index + 1,
    }))
    .filter((line) => line.text && !line.text.startsWith("#") && !line.text.startsWith("--"));

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    const packageMatch = line.text.match(/^package\s+"([^"]+)"/);
    if (packageMatch) {
      result.package = packageMatch[1]!;
      continue;
    }

    if (isNestedSectionHeader(line.text)) {
      const section = line.text.slice(0, -1);
      i = parseSection(section, lines, i + 1, line.indent, result);
      continue;
    }

    throw new MoonfileParseError(`Unexpected top-level line: ${line.text}`, line.lineNo);
  }

  if (!result.package) {
    throw new MoonfileParseError('Missing package "name" declaration', 1);
  }

  return result;
}

function parseSection(
  section: string,
  lines: ParsedLine[],
  start: number,
  parentIndent: number,
  result: Moonfile,
): number {
  let i = start;
  while (i < lines.length && lines[i]!.indent > parentIndent) {
    const line = lines[i]!;

    if (isNestedSectionHeader(line.text)) {
      const nested = line.text.slice(0, -1);
      i = parseNestedSection(section, nested, lines, i + 1, line.indent, result);
      continue;
    }

    const kv = line.text.match(/^([a-zA-Z0-9_.-]+):\s+(.+)$/);
    if (kv) {
      const key = kv[1]!;
      const value = stripQuotes(kv[2]!.trim());
      applySectionValue(section, key, value, result);
      i++;
      continue;
    }

    if (section === "dependencies") {
      result.dependencies.push(line.text.replace(/^-\s*/, ""));
      i++;
      continue;
    }

    throw new MoonfileParseError(`Unexpected line in ${section}`, line.lineNo);
  }

  return i - 1;
}

function isNestedSectionHeader(text: string): boolean {
  return text.endsWith(":") && !text.includes(" ") && !text.includes('"');
}

function parseNestedSection(
  section: string,
  nested: string,
  lines: ParsedLine[],
  start: number,
  parentIndent: number,
  result: Moonfile,
): number {
  let i = start;
  while (i < lines.length && lines[i]!.indent > parentIndent) {
    const line = lines[i]!;
    const kv = line.text.match(/^([a-zA-Z0-9_.-]+):\s+(.+)$/);
    if (!kv) {
      throw new MoonfileParseError(`Expected key: value in ${section}.${nested}`, line.lineNo);
    }

    const key = kv[1]!;
    const value = stripQuotes(kv[2]!.trim());
    applyNestedValue(section, nested, key, value, result);
    i++;
  }
  return i - 1;
}

function applySectionValue(
  section: string,
  key: string,
  value: string,
  result: Moonfile,
): void {
  switch (section) {
    case "targets":
      result.targets[key] = value;
      break;
    case "models":
      if (key === "default_flash") result.models.default_flash = value;
      if (key === "default_pro") result.models.default_pro = value;
      break;
    case "paths":
      if (key === "pricing") result.paths.pricing = value;
      if (key === "tokenizer") result.paths.tokenizer = value;
      break;
    case "prompts":
      if (key === "default_system_suffix") result.prompts.default_system_suffix = stripQuotes(value);
      if (key === "trace_by_default") result.prompts.trace_by_default = value === "true";
      break;
    default:
      break;
  }
}

function parseEnvRef(value: string): { env?: string; literal?: string; error?: string } {
  const m = value.match(/^env\("([^"]+)"\)$/);
  if (m) return { env: m[1] };
  if (/^sk-[a-zA-Z0-9]+$/.test(value) || value.startsWith("sk-")) {
    return { error: "Literal API keys are not allowed; use env(\"VAR\")" };
  }
  return { literal: stripQuotes(value) };
}

function applyNestedValue(
  section: string,
  nested: string,
  key: string,
  value: string,
  result: Moonfile,
): void {
  if (section === "providers" && nested === "deepseek") {
    result.providers.deepseek ??= {};
    if (key === "api_key") {
      const parsed = parseEnvRef(value);
      if (parsed.error) throw new MoonfileParseError(parsed.error, 1);
      if (parsed.env) result.providers.deepseek.api_key_env = parsed.env;
      else if (parsed.literal) result.providers.deepseek.api_key = parsed.literal;
    }
    if (key === "base_url") {
      const parsed = parseEnvRef(value);
      if (parsed.env) result.providers.deepseek.base_url_env = parsed.env;
      else result.providers.deepseek.base_url = stripQuotes(value);
    }
    if (key === "api_format") {
      const fmt = stripQuotes(value);
      if (fmt === "openai" || fmt === "anthropic") {
        result.providers.deepseek.api_format = fmt;
      }
    }
    if (key === "use_beta") result.providers.deepseek.use_beta = value === "true";
    return;
  }

  if (section === "prompts" && nested === "storm") {
    result.prompts.storm ??= {};
    if (key === "default_rounds") result.prompts.storm.default_rounds = Number(value);
    if (key === "max_panel_size") result.prompts.storm.max_panel_size = Number(value);
    return;
  }

  if (section !== "runtime") return;

  if (nested === "worker_pool") {
    result.runtime.worker_pool ??= {};
    if (key === "flash_concurrency") result.runtime.worker_pool.flash_concurrency = Number(value);
    if (key === "pro_concurrency") result.runtime.worker_pool.pro_concurrency = Number(value);
  } else if (nested === "memory") {
    result.runtime.memory ??= {};
    if (key === "long_term_backend") result.runtime.memory.long_term_backend = value;
  } else if (nested === "retries") {
    result.runtime.retries ??= {};
    if (key === "max_repair_attempts") result.runtime.retries.max_repair_attempts = Number(value);
  }
}

function stripQuotes(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

export function loadMoonfile(path: string): Moonfile {
  return parseMoonfile(readFileSync(path, "utf-8"));
}

export const MOONFILE_NAMES = ["Moonfile", "Moonfile.moon"] as const;

export function findMoonfile(startDir: string): string | null {
  let dir = resolve(startDir);
  while (true) {
    for (const name of MOONFILE_NAMES) {
      const candidate = join(dir, name);
      if (existsSync(candidate)) return candidate;
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function findProjectRoot(startDir: string): string | null {
  const moonfile = findMoonfile(startDir);
  return moonfile ? dirname(moonfile) : null;
}

export function resolveMoonfileTarget(
  moonfile: Moonfile,
  projectRoot: string,
  target?: string,
): { name: string; path: string } {
  const name = target ?? Object.keys(moonfile.targets)[0];
  if (!name) {
    throw new MoonfileParseError("Moonfile has no targets", 1);
  }
  const rel = moonfile.targets[name];
  if (!rel) {
    throw new MoonfileParseError(`Target not found in Moonfile: ${target}`, 1);
  }
  return { name, path: resolve(projectRoot, rel) };
}
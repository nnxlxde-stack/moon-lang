import { extractMoonDocs } from "./moon-docs";

export const MOONFILE_SECTION_DOCS: Record<string, string> = {
  package: "Unique package name for the Moon project manifest.",
  dependencies: "Core stdlib modules imported by project targets (`Core.GitHub`, `Core.FS`, …).",
  targets: "Named runnable/buildable entrypoints mapped to `.moon` source files.",
  providers: "LLM provider credentials and wire format (`deepseek` block).",
  paths: "Project-relative asset paths (pricing table, tokenizer bundle).",
  models: "Default flash/pro model ids used when agents do not override `model:`.",
  prompts: "Global prompt suffixes, trace defaults, and storm panel settings.",
  runtime: "Worker pool sizing, long-term memory backend URI, retry policy.",
};

export const MOONFILE_KEY_DOCS: Record<string, string> = {
  "providers.deepseek.api_key": "API key via `env(\"VAR\")`. Literal `sk-…` keys are rejected.",
  "providers.deepseek.base_url": "Provider base URL or `env(\"VAR\")` (anthropic/openai endpoints).",
  "providers.deepseek.api_format": "Transport format: `openai` or `anthropic` (default anthropic).",
  "providers.deepseek.use_beta": "When `true`, use DeepSeek beta OpenAI-compatible surface.",
  "paths.pricing": "Path to `model-pricing.json` for token cost estimation.",
  "paths.tokenizer": "Directory with DeepSeek tokenizer assets.",
  "models.default_flash": "Default flash-tier model id (high concurrency workers).",
  "models.default_pro": "Default pro-tier model id (lower concurrency, higher quality).",
  "prompts.default_system_suffix": "Appended to every agent system prompt unless overridden.",
  "prompts.trace_by_default": "When `true`, LLM traces are written for each run by default.",
  "prompts.storm.default_rounds": "Default debate rounds for `storm` binds.",
  "prompts.storm.max_panel_size": "Maximum agents in a storm panel.",
  "runtime.worker_pool.flash_concurrency": "Concurrent flash-tier LLM calls.",
  "runtime.worker_pool.pro_concurrency": "Concurrent pro-tier LLM calls.",
  "runtime.memory.long_term_backend": "Long-term memory URI, e.g. `file://.moon/memory`.",
  "runtime.retries.max_repair_attempts": "JSON repair retries after schema validation failures.",
};

export function moonfileDocId(section: string, nested: string | undefined, key: string): string {
  if (section === "providers" && nested) return `${section}.${nested}.${key}`;
  if (section === "prompts" && nested) return `${section}.${nested}.${key}`;
  if (section === "runtime" && nested) return `${section}.${nested}.${key}`;
  if (section) return `${section}.${key}`;
  return key;
}

export function lookupMoonfileDoc(section: string, nested: string | undefined, key: string): string | undefined {
  return MOONFILE_KEY_DOCS[moonfileDocId(section, nested, key)]
    ?? MOONFILE_SECTION_DOCS[key]
    ?? MOONFILE_SECTION_DOCS[section];
}

export function extractMoonfileLineDocs(source: string, line: number): string | undefined {
  return extractMoonDocs(source, line + 1);
}

export function formatMoonfileHover(
  label: string,
  type: string,
  docs?: string,
): string {
  const parts = [`**${label}**`, `\`\`\`moonfile\n${type}\n\`\`\``];
  if (docs) parts.push(docs);
  return parts.join("\n\n");
}
import Foundation

public let moonfileSectionDocs: [String: String] = [
    "package": "Unique package name for the Moon project manifest.",
    "dependencies": "Core stdlib modules imported by project targets (`Core.GitHub`, `Core.FS`, …).",
    "targets": "Named runnable/buildable entrypoints mapped to `.moon` source files.",
    "providers": "LLM provider credentials and wire format (`deepseek` block).",
    "paths": "Project-relative asset paths (pricing table, tokenizer bundle).",
    "models": "Default flash/pro model ids used when agents do not override `model:`.",
    "prompts": "Global prompt suffixes, trace defaults, and storm panel settings.",
    "runtime": "Worker pool sizing, long-term memory backend URI, retry policy.",
]

public let moonfileKeyDocs: [String: String] = [
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
]

public func moonfileDocId(section: String, nested: String?, key: String) -> String {
    if section == "providers", let nested { return "\(section).\(nested).\(key)" }
    if section == "prompts", let nested { return "\(section).\(nested).\(key)" }
    if section == "runtime", let nested { return "\(section).\(nested).\(key)" }
    if !section.isEmpty { return "\(section).\(key)" }
    return key
}

public func lookupMoonfileDoc(section: String, nested: String?, key: String) -> String? {
    moonfileKeyDocs[moonfileDocId(section: section, nested: nested, key: key)]
        ?? moonfileSectionDocs[key]
        ?? moonfileSectionDocs[section]
}

public func formatMoonfileHover(label: String, type: String, docs: String?) -> String {
    var parts = ["**\(label)**", "```moonfile\n\(type)\n```"]
    if let docs, !docs.isEmpty { parts.append(docs) }
    return parts.joined(separator: "\n\n")
}
import type { ResolvedImport } from "@moon/resolver";

export const CORE_MODULE_BUILTINS: Record<string, readonly string[]> = {
  "Core.GitHub": ["fetchOpenPRs", "fetchChangedFiles", "isDraft"],
  "Core.Memory": ["memory", "recall"],
  "Core.FS": ["readFile", "writeFile", "pathExists", "listDir", "makeDir", "removePath"],
  "Core.Network": ["httpGet", "httpPost", "fetchJson"],
  "Core.Tools": [
    "readFile", "saveToFile", "postToSlack", "postSummaryToSlack",
    "when", "mapM", "pure", "fetchUpdatedDocs",
    "generateCombinedReport", "generateReviewReport",
  ],
  "Core.Analyzers": [
    "hasCriticalFindings", "hasCriticalIssues", "escalateCriticalIssues",
    "notifyTeamLeads", "getPreviousVersion", "calculateScore",
    "extractRecommendations", "decideOverallVerdict", "collectFindings",
    "generateSummary", "calculateConfidence", "extractSuggestions", "detectLanguage",
  ],
};

const SYMBOL_TO_MODULE = new Map<string, string>();
for (const [modulePath, symbols] of Object.entries(CORE_MODULE_BUILTINS)) {
  for (const symbol of symbols) {
    SYMBOL_TO_MODULE.set(symbol, modulePath);
  }
}

export const ALWAYS_AVAILABLE_BUILTINS = new Set(["not"]);

export function builtinsFromImports(imports: ResolvedImport[]): Set<string> {
  const set = new Set(ALWAYS_AVAILABLE_BUILTINS);
  for (const imp of imports) {
    const core = CORE_MODULE_BUILTINS[imp.pathKey];
    if (core) {
      for (const name of core) set.add(name);
      continue;
    }
    for (const name of imp.schemes.keys()) set.add(name);
  }
  return set;
}

export function coreModuleForSymbol(symbol: string): string | undefined {
  return SYMBOL_TO_MODULE.get(symbol);
}

export function importKeysFromProgram(program: import("@moon/ast").Program): string[] {
  return program.declarations
    .filter((d): d is Extract<typeof d, { kind: "Import" }> => d.kind === "Import")
    .map((d) => d.path.join("."));
}
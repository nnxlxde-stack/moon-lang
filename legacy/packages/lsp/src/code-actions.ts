import type { Program } from "@moon/ast";
import { allCoreModulePaths, coreModuleSchemes } from "@moon/typechecker/stdlib";
import { buildSymbolTable } from "./project";
import { findProjectRoot, listLocalModules } from "./completion";

export interface MoonDiagnostic {
  message: string;
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
  source?: string;
}

export interface MoonCodeActionResult {
  title: string;
  kind: string;
  edit?: {
    range: { start: { line: number; character: number }; end: { line: number; character: number } };
    newText: string;
  };
  isPreferred?: boolean;
}

function moduleForSymbol(name: string): string | null {
  for (const modulePath of allCoreModulePaths()) {
    const schemes = coreModuleSchemes(modulePath);
    if (schemes?.has(name)) return modulePath;
  }
  return null;
}

function existingImports(program: Program): Set<string> {
  const out = new Set<string>();
  for (const decl of program.declarations) {
    if (decl.kind === "Import") out.add(decl.path.join("."));
  }
  return out;
}

function firstImportLine(program: Program): number {
  for (const decl of program.declarations) {
    if (decl.kind === "Import") return decl.span.start.line - 1;
  }
  return 0;
}

function similarNames(name: string, candidates: string[]): string | null {
  const lower = name.toLowerCase();
  let best: string | null = null;
  let bestDist = Infinity;
  for (const c of candidates) {
    const dist = levenshtein(lower, c.toLowerCase());
    if (dist < bestDist && dist <= 2 && dist > 0) {
      bestDist = dist;
      best = c;
    }
  }
  return best;
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i]![0] = i;
  for (let j = 0; j <= b.length; j++) dp[0]![j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost);
    }
  }
  return dp[a.length]![b.length]!;
}

export function getCodeActions(
  program: Program,
  entryPath: string,
  text: string,
  diagnostic: MoonDiagnostic,
): MoonCodeActionResult[] {
  const actions: MoonCodeActionResult[] = [];
  const imports = existingImports(program);
  const table = buildSymbolTable(program, entryPath);
  const allNames = [...table.keys()];

  const unknownVar = diagnostic.message.match(/^Unknown variable (.+)$/);
  if (unknownVar) {
    const name = unknownVar[1]!;
    const modulePath = moduleForSymbol(name);
    if (modulePath && !imports.has(modulePath)) {
      const line = firstImportLine(program);
      const lastImport = [...program.declarations].reverse().find((d) => d.kind === "Import");
      const insertLine = lastImport ? lastImport.span.end.line : line;
      actions.push({
        title: `Import ${modulePath}`,
        kind: "quickfix",
        isPreferred: true,
        edit: {
          range: {
            start: { line: insertLine, character: 0 },
            end: { line: insertLine, character: 0 },
          },
          newText: `import ${modulePath}\n`,
        },
      });
    }

    const suggestion = similarNames(name, allNames);
    if (suggestion) {
      actions.push({
        title: `Use '${suggestion}' instead`,
        kind: "quickfix",
        edit: {
          range: diagnostic.range,
          newText: suggestion,
        },
      });
    }
  }

  const unknownCtor = diagnostic.message.match(/^Unknown constructor (.+)$/);
  if (unknownCtor) {
    const name = unknownCtor[1]!;
    const suggestion = similarNames(name, allNames);
    if (suggestion) {
      actions.push({
        title: `Use constructor '${suggestion}'`,
        kind: "quickfix",
        edit: {
          range: diagnostic.range,
          newText: suggestion,
        },
      });
    }
  }

  const missingDep = diagnostic.message.match(
    /^Module (.+) is imported but not listed in Moonfile dependencies$/,
  );
  if (missingDep) {
    actions.push({
      title: `Add '${missingDep[1]}' to Moonfile dependencies`,
      kind: "quickfix",
      edit: {
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } },
        newText: "",
      },
    });
  }

  const unknownCore = diagnostic.message.match(/^Unknown Core module: (.+)$/);
  if (unknownCore) {
    const bad = unknownCore[1]!;
    const suggestion = similarNames(bad.replace(/^Core\./, ""), allCoreModulePaths());
    if (suggestion) {
      actions.push({
        title: `Change import to '${suggestion}'`,
        kind: "quickfix",
        isPreferred: true,
        edit: {
          range: diagnostic.range,
          newText: `import ${suggestion}`,
        },
      });
    }
  }

  const unresolvedLocal = diagnostic.message.match(/^Cannot resolve local module: (.+)$/);
  if (unresolvedLocal) {
    const projectRoot = findProjectRoot(entryPath);
    const locals = listLocalModules(projectRoot);
    const suggestion = similarNames(unresolvedLocal[1]!, locals);
    if (suggestion) {
      actions.push({
        title: `Import local module '${suggestion}'`,
        kind: "quickfix",
        edit: {
          range: diagnostic.range,
          newText: `import ${suggestion}`,
        },
      });
    }
  }

  if (/^Unexpected character/.test(diagnostic.message) && text.includes('"""')) {
    actions.push({
      title: "Use triple-quoted string (\"\"\")",
      kind: "quickfix",
      edit: {
        range: diagnostic.range,
        newText: '"""',
      },
    });
  }

  return actions;
}
import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "../packages/parser/src/index.ts";
import {
  collectDiagnostics,
  definitionLocation,
  lookupSymbol,
  wordAtPosition,
} from "../packages/lsp/src/project.ts";
import {
  CompletionItemKind,
  collectLocalBindings,
  collectProgramNames,
  detectCompletionContext,
  getCompletions,
  getSignatureHelp,
  listLocalModules,
  prefixAtPosition,
} from "../packages/lsp/src/completion.ts";
import { getCodeActions } from "../packages/lsp/src/code-actions.ts";
import { buildSymbolTable } from "../packages/lsp/src/project.ts";
import { extractMoonDocs } from "../packages/lsp/src/moon-docs.ts";
import { buildSymbolIndex, indexStdlib } from "../packages/lsp/src/symbol-index.ts";
import { SymbolDatabase } from "../packages/lsp/src/symbol-db.ts";
import { allCoreModulePaths, coreModuleSchemes } from "../packages/typechecker/src/stdlib/index.ts";
import {
  buildPromptPreview,
  findPromptSites,
} from "../packages/lsp/src/prompt-preview.ts";
import {
  collectMoonfileDiagnostics,
  detectMoonfileContext,
  getMoonfileCompletions,
  getMoonfileHover,
  isMoonfileDocument,
} from "../packages/lsp/src/moonfile-lsp.ts";
import { getPartialCompletions } from "../packages/lsp/src/completion.ts";

const root = join(import.meta.dir, "..", "..");

describe("lsp", () => {
  test("wordAtPosition extracts identifier", () => {
    const text = "fetchOpenPRs <- x";
    expect(wordAtPosition(text, 0, 5)).toBe("fetchOpenPRs");
  });

  test("lookupSymbol finds Core import", () => {
    const file = join(root, "examples", "code-analyzer.moon");
    const program = parse(readFileSync(file, "utf-8"));
    const info = lookupSymbol(program, file, "fetchOpenPRs");
    expect(info?.module).toBe("Core.GitHub");
    expect(info?.type).toContain("IO");
  });

  test("definitionLocation points to stdlib with precise range", () => {
    const file = join(root, "examples", "code-analyzer.moon");
    const program = parse(readFileSync(file, "utf-8"));
    const db = new SymbolDatabase();
    db.rebuild(root, [file]);

    const save = definitionLocation(program, file, "saveToFile", db);
    expect(save?.uri).toContain("Tools.moon");
    expect(save?.range.start.line).toBeGreaterThan(0);

    const fetch = definitionLocation(program, file, "fetchOpenPRs", db);
    expect(fetch?.uri).toContain("GitHub.moon");
    expect(fetch?.range.start.character).toBe(0);
  });

  test("indexes full stdlib symbol coverage", () => {
    const indexed = new Set(indexStdlib().map((e) => e.name));
    for (const modulePath of allCoreModulePaths()) {
      const schemes = coreModuleSchemes(modulePath);
      if (!schemes) continue;
      for (const name of schemes.keys()) {
        expect(indexed.has(name)).toBe(true);
      }
    }
  });

  test("moon-symbols.json is written to workspace root", () => {
    const db = new SymbolDatabase();
    db.rebuild(root);
    expect(db.symbols.length).toBeGreaterThan(20);
    const fromDisk = new SymbolDatabase();
    expect(fromDisk.load(root)).toBe(true);
    expect(fromDisk.symbols.length).toBeGreaterThan(20);
  });

  test("collectDiagnostics passes valid example", () => {
    const file = join(root, "examples", "pr-triage.moon");
    const text = readFileSync(file, "utf-8");
    const diags = collectDiagnostics(file, text);
    expect(diags.length).toBe(0);
  });
});

describe("lsp intellisense", () => {
  test("detects import context", () => {
    const ctx = detectCompletionContext("import Core.", 0, 12);
    expect(ctx.kind).toBe("import-core");
  });

  test("detects member access context", () => {
    const ctx = detectCompletionContext("CodeAnalyzer.anal", 0, 17);
    expect(ctx.kind).toBe("member");
    expect(ctx.objectName).toBe("CodeAnalyzer");
  });

  test("completes Core modules on import", () => {
    const file = join(root, "examples", "code-analyzer.moon");
    const program = parse(readFileSync(file, "utf-8"));
    const items = getCompletions(program, file, "import ", 0, 7);
    const labels = items.map((i) => i.label);
    expect(labels).toContain("Core.GitHub");
    expect(labels).toContain("ReportHelpers");
  });

  test("completes analyze on agent member access", () => {
    const file = join(root, "examples", "code-analyzer.moon");
    const program = parse(readFileSync(file, "utf-8"));
    const items = getCompletions(program, file, "CodeAnalyzer.", 0, 13);
    expect(items.some((i) => i.label === "analyze")).toBe(true);
    const analyze = items.find((i) => i.label === "analyze");
    expect(analyze?.kind).toBe(CompletionItemKind.Method);
    expect(analyze?.insertText).toContain("with context");
  });

  test("completes bind config keys after with", () => {
    const file = join(root, "examples", "code-analyzer.moon");
    const program = parse(readFileSync(file, "utf-8"));
    const line = "        with ";
    const items = getCompletions(program, file, line, 0, line.length);
    const labels = items.map((i) => i.label);
    expect(labels).toContain("context");
    expect(labels).toContain("maxTokens");
    expect(labels).toContain("focus");
  });

  test("completes storm config keys", () => {
    const file = join(root, "examples", "code-review-storm.moon");
    const program = parse(readFileSync(file, "utf-8"));
    const src = "    consensus <- storm item\n        with ";
    const items = getCompletions(program, file, src, 1, "        with ".length);
    const labels = items.map((i) => i.label);
    expect(labels).toContain("panel");
    expect(labels).toContain("synthesizer");
    expect(labels).toContain("rounds");
  });

  test("completes agent config keys", () => {
    const src = "agent X :: Analyzer Code\n  tem";
    const program = parse("agent X :: Analyzer Code\n  model: flash\n");
    const file = join(root, "examples", "code-analyzer.moon");
    const items = getCompletions(program, file, src, 1, 5);
    expect(items.some((i) => i.label === "temperature")).toBe(true);
  });

  test("completes types after ::", () => {
    const file = join(root, "examples", "pr-triage.moon");
    const program = parse(readFileSync(file, "utf-8"));
    const strItems = getCompletions(program, file, "dummy :: Str", 0, 12);
    expect(strItems.some((i) => i.label === "String")).toBe(true);

    const ioItems = getCompletions(program, file, "dummy :: IO", 0, 11);
    expect(ioItems.some((i) => i.label === "IO")).toBe(true);
  });

  test("includes local bindings in expression context", () => {
    const program = parse(readFileSync(join(root, "examples", "pr-triage.moon"), "utf-8"));
    const file = join(root, "examples", "pr-triage.moon");
    const locals = collectLocalBindings(program, 42);
    expect(locals).toContain("openPRs");
    expect(locals).toContain("triaged");
  });

  test("filters completions by prefix", () => {
    const file = join(root, "examples", "code-analyzer.moon");
    const program = parse(readFileSync(file, "utf-8"));
    const items = getCompletions(program, file, "fetch", 0, 5);
    expect(items.every((i) => i.label.toLowerCase().startsWith("fetch") || i.kind === CompletionItemKind.Keyword)).toBe(true);
  });

  test("lists local lib modules", () => {
    expect(listLocalModules(root)).toContain("ReportHelpers");
  });

  test("prefixAtPosition returns partial word", () => {
    expect(prefixAtPosition("saveToFil", 0, 9)).toBe("saveToFil");
  });

  test("signature help for analyze", () => {
    const src = "agent A :: Analyzer Code\nmain = do\n  A.analyze x\n";
    const program = parse(src);
    const help = getSignatureHelp(program, src, 2, 11);
    expect(help?.signatures[0]?.label).toContain("analyze");
    expect(help?.signatures[0]?.documentation).toContain("context");
  });

  test("declaration snippets include agent and main", () => {
    const program = parse("-- new file\n");
    const file = join(root, "examples", "code-analyzer.moon");
    const items = getCompletions(program, file, "", 0, 0);
    expect(items.some((i) => i.label === "agent" && i.insertText?.includes("systemPrompt"))).toBe(true);
    expect(items.some((i) => i.label === "main")).toBe(true);
  });

  test("completes program names including agents and data constructors", () => {
    const file = join(root, "examples", "code-reviewer.moon");
    const program = parse(readFileSync(file, "utf-8"));
    const table = buildSymbolTable(program, file);
    const names = collectProgramNames(program, table, 80).map((i) => i.label);
    expect(names).toContain("CodeReviewer");
    expect(names).toContain("Verdict");
    expect(names).toContain("Approved");
    expect(names).toContain("fetchOpenPRs");
  });

  test("detects name completion context", () => {
    const ctx = detectCompletionContext("    saveTo", 0, 10);
    expect(ctx.kind).toBe("name");
    expect(ctx.prefix).toBe("saveTo");
  });
});

describe("lsp moon-docs", () => {
  test("extracts --? documentation lines", () => {
    const src = "--? Fetches PRs\n--? @param repo slug\nfetchOpenPRs :: IO ()\n";
    const docs = extractMoonDocs(src, 3);
    expect(docs).toContain("Fetches PRs");
    expect(docs).toContain("@param repo slug");
  });

  test("hover includes moon-docs from symbol db", () => {
    const db = new SymbolDatabase();
    db.rebuild(root);
    const entry = db.lookup("fetchOpenPRs", { module: "Core.GitHub" });
    expect(entry?.docs).toContain("Fetches open");
  });

  test("buildSymbolIndex includes workspace lib", () => {
    const symbols = buildSymbolIndex(root);
    expect(symbols.some((s) => s.name === "reportHeading" && s.module === "ReportHelpers")).toBe(true);
  });
});

describe("lsp code actions", () => {
  test("suggests import for unknown variable from Core module", () => {
    const src = `main :: IO ()\nmain = do\n    saveToFile "a" "b"\n`;
    const program = parse(src);
    const file = join(root, "examples", "code-analyzer.moon");
    const actions = getCodeActions(program, file, src, {
      message: "Unknown variable saveToFile",
      range: { start: { line: 1, character: 4 }, end: { line: 1, character: 14 } },
    });
    expect(actions.some((a) => a.title.includes("Import Core.Tools"))).toBe(true);
  });

  test("suggests similar symbol for typo", () => {
    const file = join(root, "examples", "code-analyzer.moon");
    const program = parse(readFileSync(file, "utf-8"));
    const actions = getCodeActions(program, file, readFileSync(file, "utf-8"), {
      message: "Unknown variable fetchOpenPR",
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 12 } },
    });
    expect(actions.some((a) => a.title.includes("fetchOpenPRs"))).toBe(true);
  });
});

describe("lsp prompt preview", () => {
  test("finds agent.analyze bind sites", () => {
    const file = join(root, "examples", "code-reviewer.moon");
    const program = parse(readFileSync(file, "utf-8"));
    const sites = findPromptSites(program);
    expect(sites.some((s) => s.kind === "analyze")).toBe(true);
    expect(sites.some((s) => s.agent.includes("Reviewer") || s.kind === "analyze")).toBe(true);
  });

  test("finds storm bind sites", () => {
    const file = join(root, "examples", "code-review-storm.moon");
    const program = parse(readFileSync(file, "utf-8"));
    const sites = findPromptSites(program);
    expect(sites.some((s) => s.kind === "storm")).toBe(true);
    expect(sites.find((s) => s.kind === "storm")?.agent).toBe("LeadSynthesizer");
  });

  test("builds analyze prompt with system and user sections", () => {
    const file = join(root, "examples", "code-reviewer.moon");
    const program = parse(readFileSync(file, "utf-8"));
    const sites = findPromptSites(program).filter((s) => s.kind === "analyze");
    expect(sites.length).toBeGreaterThan(0);

    const preview = buildPromptPreview(program, sites[0]!.line);
    expect(preview).not.toBeNull();
    expect(preview!.assembled.messages).toHaveLength(2);
    expect(preview!.assembled.messages[0]?.role).toBe("system");
    expect(preview!.assembled.messages[1]?.content).toContain("## Input");
    expect(preview!.markdown).toContain("SYSTEM");
  });

  test("storm preview includes panel note and peer section", () => {
    const file = join(root, "examples", "code-review-storm.moon");
    const program = parse(readFileSync(file, "utf-8"));
    const storm = findPromptSites(program).find((s) => s.kind === "storm");
    expect(storm).toBeDefined();

    const preview = buildPromptPreview(program, storm!.line);
    expect(preview!.markdown).toContain("Storm panel");
    expect(preview!.assembled.messages[1]?.content).toContain("Peer perspectives");
  });
});

describe("lsp moonfile", () => {
  const moonfile = join(root, "Moonfile");
  const source = readFileSync(moonfile, "utf-8");

  test("isMoonfileDocument recognizes manifest names", () => {
    expect(isMoonfileDocument(moonfile)).toBe(true);
    expect(isMoonfileDocument(join(root, "Moonfile.moon"))).toBe(true);
    expect(isMoonfileDocument(join(root, "examples", "code-analyzer.moon"))).toBe(false);
  });

  test("collectMoonfileDiagnostics accepts valid manifest", () => {
    expect(collectMoonfileDiagnostics(source)).toHaveLength(0);
  });

  test("detectMoonfileContext finds dependency and path contexts", () => {
    const depLine = source.split(/\r?\n/).findIndex((line) => line.includes("Core.GitHub"));
    expect(detectMoonfileContext(source, depLine, 8).kind).toBe("dependency");

    const targetLine = source.split(/\r?\n/).findIndex((line) => line.startsWith("  analyzer:"));
    const pathCtx = detectMoonfileContext(source, targetLine, 20);
    expect(pathCtx.kind).toBe("path");
  });

  test("getMoonfileHover returns moon-docs for Moonfile keys", () => {
    const apiKeyLine = source.split(/\r?\n/).findIndex((line) => line.trim().startsWith("api_key:"));
    const hover = getMoonfileHover(source, apiKeyLine, 4);
    expect(hover).toContain("api_key");
    expect(hover).toContain("env");
  });

  test("getMoonfileCompletions works after erasing path and uses quotes", () => {
    const erased = "targets:\n  demo: ";
    const ctx = detectMoonfileContext(erased, 1, erased.split("\n")[1]!.length);
    expect(ctx.kind).toBe("path");

    const items = getMoonfileCompletions(erased, 1, erased.split("\n")[1]!.length, root);
    expect(items.length).toBeGreaterThan(0);
    const first = items[0];
    expect(first?.insertText?.startsWith('"')).toBe(true);
    expect(first?.textEdit?.newText.startsWith('"')).toBe(true);
  });

  test("getPartialCompletions works when moon source does not parse", () => {
    const broken = "import Core.GitHub\nmain :: IO ()\nmain = do\n  x <- ";
    const items = getPartialCompletions(broken, join(root, "examples", "x.moon"), 3, 6);
    expect(items.length).toBeGreaterThan(0);
  });

  test("getMoonfileCompletions suggests sections, modules, and file paths", () => {
    const sections = getMoonfileCompletions("package \"x\"\n\n", 2, 0, root);
    expect(sections.some((item) => item.label === "targets:")).toBe(true);

    const depLine = source.split(/\r?\n/).findIndex((line) => line.includes("Core.GitHub"));
    const deps = getMoonfileCompletions(source, depLine, 8, root);
    expect(deps.some((item) => item.label === "Core.GitHub")).toBe(true);

    const partial = "targets:\n  demo: examples/";
    const paths = getMoonfileCompletions(partial, 1, partial.split("\n")[1]!.length, root);
    expect(paths.some((item) => item.kind === CompletionItemKind.File || item.kind === CompletionItemKind.Folder)).toBe(true);
  });
});
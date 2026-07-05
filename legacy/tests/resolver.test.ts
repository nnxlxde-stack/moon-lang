import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "../packages/parser/src/index.ts";
import { resolveImports } from "../packages/resolver/src/index.ts";

const root = join(import.meta.dir, "..", "..");

describe("resolver", () => {
  test("resolves Core imports from code-analyzer", () => {
    const file = join(root, "examples", "code-analyzer.moon");
    const program = parse(readFileSync(file, "utf-8"));
    const result = resolveImports(program, { entryPath: file, projectRoot: root });
    expect(result.errors).toEqual([]);
    expect(result.imports.map((i) => i.pathKey).sort()).toEqual([
      "Core.Analyzers",
      "Core.GitHub",
      "Core.Memory",
      "Core.Tools",
    ]);
    expect(result.imports[0]?.schemes.has("fetchOpenPRs")).toBe(true);
  });

  test("resolves local lib module", () => {
    const src = `import ReportHelpers\nimport Core.Tools\nmain :: IO ()\nmain = do\n  saveToFile "out.md" reportHeading "Title"`;
    const file = join(root, "examples", "doc-summarizer.moon");
    const program = parse(src);
    const result = resolveImports(program, { entryPath: file, projectRoot: root });
    expect(result.errors).toEqual([]);
    expect(result.imports.some((i) => i.pathKey === "ReportHelpers")).toBe(true);
    expect(result.imports.find((i) => i.pathKey === "ReportHelpers")?.schemes.has("reportHeading")).toBe(true);
  });

  test("errors when Core module missing from Moonfile dependencies", () => {
    const src = `import Core.GitHub`;
    const file = join(root, "examples", "pr-triage.moon");
    const program = parse(src);
    const moonfile = { package: "t", dependencies: [], targets: {}, models: {}, providers: {}, paths: {}, prompts: {}, runtime: {} };
    const result = resolveImports(program, { entryPath: file, projectRoot: root, moonfile });
    expect(result.errors.some((e) => e.message.includes("Moonfile dependencies"))).toBe(true);
  });
});
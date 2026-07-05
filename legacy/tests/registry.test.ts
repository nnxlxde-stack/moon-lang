import { describe, expect, test } from "bun:test";
import { parse } from "../packages/parser/src/index.ts";
import { runProgram } from "../packages/runtime/src/executor.ts";
import { createMockLlm } from "../packages/runtime/src/mock-llm.ts";
import { CORE_MODULE_BUILTINS, builtinsFromImports } from "../packages/runtime/src/stdlib/registry.ts";
import { resolveImports } from "../packages/resolver/src/index.ts";
import { join } from "path";

const root = join(import.meta.dir, "..", "..");

describe("stdlib registry", () => {
  test("maps Core modules to builtin symbols", () => {
    expect(CORE_MODULE_BUILTINS["Core.GitHub"]).toContain("fetchOpenPRs");
    expect(CORE_MODULE_BUILTINS["Core.Tools"]).toContain("saveToFile");
  });

  test("gates builtins by imports", async () => {
    const src = `main :: IO ()\nmain = do\n  fetchOpenPRs "org/repo"`;
    const program = parse(src);
    const file = join(root, "examples", "no-import.moon");

    await expect(
      runProgram(program, { llm: createMockLlm(), entryPath: file, projectRoot: root }),
    ).rejects.toThrow(/Unbound variable: fetchOpenPRs/);
  });

  test("exposes builtins when Core.GitHub is imported", async () => {
    const src = `import Core.GitHub\nimport Core.FS\nmain :: IO ()\nmain = do\n  openPRs <- fetchOpenPRs "org/repo"\n  pure $ openPRs`;
    const program = parse(src);
    const file = join(root, "examples", "pr-triage.moon");
    const resolved = resolveImports(program, { entryPath: file, projectRoot: root });
    const builtins = builtinsFromImports(resolved.imports);

    expect(builtins.has("fetchOpenPRs")).toBe(true);
    expect(builtins.has("saveToFile")).toBe(false);
  });
});
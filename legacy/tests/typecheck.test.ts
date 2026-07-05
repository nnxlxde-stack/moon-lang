import { describe, expect, test } from "bun:test";
import { parse } from "../packages/parser/src/index.ts";
import { typecheck } from "../packages/typechecker/src/index.ts";
import { readFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dir, "..", "..");

describe("typecheck", () => {
  for (const name of [
    "code-analyzer",
    "code-reviewer",
    "doc-summarizer",
    "pr-triage",
    "requirements-check",
  ]) {
    test(name, () => {
      const src = readFileSync(join(root, "examples", `${name}.moon`), "utf-8");
      const file = join(root, "examples", `${name}.moon`);
      const result = typecheck(parse(src), { entryPath: file, projectRoot: root });
      if (!result.ok) {
        console.error(result.errors.map((e) => e.message).join("\n"));
      }
      expect(result.ok).toBe(true);
    });
  }
});
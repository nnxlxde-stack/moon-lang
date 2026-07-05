import { describe, expect, test } from "bun:test";
import { parse } from "../packages/parser/src/index.ts";
import { stripSpans } from "../packages/ast/src/index.ts";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const root = join(import.meta.dir, "..", "..");
const goldenDir = join(import.meta.dir, "golden");

function goldenPath(name: string) {
  return join(goldenDir, `${name}.json`);
}

function parseExample(name: string) {
  const src = readFileSync(join(root, "examples", `${name}.moon`), "utf-8");
  return stripSpans(parse(src));
}

describe("golden AST", () => {
  for (const name of ["code-analyzer", "code-reviewer"]) {
    test(name, () => {
      const ast = parseExample(name);
      const path = goldenPath(name);
      const json = JSON.stringify(ast, null, 2);

      if (!existsSync(path) || process.env.UPDATE_GOLDEN === "1") {
        writeFileSync(path, json);
      }

      const expected = readFileSync(path, "utf-8");
      expect(json).toBe(expected);
    });
  }
});
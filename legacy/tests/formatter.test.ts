import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { parse } from "../packages/parser/src/index.ts";
import { formatSource } from "../packages/formatter/src/index.ts";

const root = join(import.meta.dir, "..", "..");

describe("formatter", () => {
  test("formats code-analyzer without crashing", () => {
    const src = readFileSync(join(root, "examples", "code-analyzer.moon"), "utf-8");
    const formatted = formatSource(src);
    expect(formatted.length).toBeGreaterThan(0);
    expect(formatted).toContain("import Core.GitHub");
  });

  test("is idempotent on minimal model", () => {
    const src = `model Item where\n    path :: String\n`;
    const once = formatSource(src);
    const twice = formatSource(once);
    expect(twice).toBe(once);
  });

  test("round-trips all parseable examples", () => {
    for (const file of readdirSync(join(root, "examples")).filter((f) => f.endsWith(".moon"))) {
      const src = readFileSync(join(root, "examples", file), "utf-8");
      try {
        parse(src);
      } catch {
        continue;
      }
      const formatted = formatSource(src);
      expect(() => parse(formatted)).not.toThrow();
      expect(formatted).toContain("import");
    }
  });

  test("preserves multiline strings and with blocks", () => {
    const src = readFileSync(join(root, "examples", "code-analyzer.moon"), "utf-8");
    const formatted = formatSource(src);
    expect(formatted).toContain('"""');
    expect(formatted).toContain("with context: context");
    expect(formatted).toContain("maxTokens: 10000");
  });
});
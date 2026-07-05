import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "../packages/parser/src/index.ts";
import { collectDiagnostics } from "../packages/lsp/src/project.ts";

const root = join(import.meta.dir, "..", "..");

describe("pure parsing", () => {
  test("parses pure $ expression", () => {
    const program = parse('main :: IO ()\nmain = pure $ "ok"');
    expect(program.declarations).toHaveLength(1);
  });

  test("parses pure with string argument without dollar", () => {
    const program = parse('main :: IO String\nmain = pure "ok"');
    expect(program.declarations).toHaveLength(1);
  });

  test("parses pure unit without dollar", () => {
    const program = parse("main :: IO ()\nmain = pure ()");
    expect(program.declarations).toHaveLength(1);
  });

  test("parses Core.Tools stdlib without errors", () => {
    const source = readFileSync(join(root, "stdlib/Core/Tools.moon"), "utf-8");
    expect(() => parse(source)).not.toThrow();
    const diags = collectDiagnostics(join(root, "stdlib/Core/Tools.moon"), source);
    expect(diags.filter((d) => d.severity === 1)).toHaveLength(0);
  });
});
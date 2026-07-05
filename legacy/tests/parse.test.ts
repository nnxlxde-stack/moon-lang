import { describe, expect, test } from "bun:test";
import { parse } from "../packages/parser/src/index.ts";
import { stripSpans } from "../packages/ast/src/index.ts";
import { lex, rawLex } from "../packages/lexer/src/index.ts";
import { readFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dir, "..", "..");

describe("lexer", () => {
  test("FIELD_DOT vs COMPOSE_DOT", () => {
    const tokens = rawLex("a.b (not . isDraft)");
    const kinds = tokens.map((t) => t.kind);
    expect(kinds).toContain("FIELD_DOT");
    expect(kinds).toContain("COMPOSE_DOT");
  });

  test("hyphenated identifier", () => {
    const tokens = rawLex("deepseek-v4-pro");
    expect(tokens[0]).toMatchObject({ kind: "IDENT", value: "deepseek-v4-pro" });
  });
});

describe("parser", () => {
  test("minimal model", () => {
    const src = `model AnalysisResult t where
  item :: t
`;
    const program = parse(src);
    expect(program.declarations).toHaveLength(1);
    expect(program.declarations[0]?.kind).toBe("Model");
  });

  test("code-analyzer.moon", () => {
    const src = readFileSync(join(root, "examples/code-analyzer.moon"), "utf-8");
    const program = parse(src);
    expect(program.declarations.length).toBeGreaterThan(0);
  });

  test("code-reviewer.moon", () => {
    const src = readFileSync(join(root, "examples/code-reviewer.moon"), "utf-8");
    const program = parse(src);
    expect(program.declarations.length).toBeGreaterThan(0);
  });

  test("multiline record expression", () => {
    parse(`main = do
  pure $ AnalysisResult
      { item = item }
`);
  });

  test("with config on bind", () => {
    parse(`f = do
  r <- g x
      with context: ctx
           maxTokens: 100
`);
  });
});
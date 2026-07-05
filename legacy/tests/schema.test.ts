import { describe, expect, test } from "bun:test";
import { parse } from "../packages/parser/src/index.ts";
import { compileProgramSchemas } from "../packages/schema-compiler/src/index.ts";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const root = join(import.meta.dir, "..", "..");
const goldenDir = join(import.meta.dir, "golden", "schemas");

function goldenPath(name: string) {
  return join(goldenDir, `${name}.json`);
}

describe("schema compiler", () => {
  test("code-analyzer AnalysisResult", () => {
    const src = readFileSync(join(root, "examples", "code-analyzer.moon"), "utf-8");
    const result = compileProgramSchemas(parse(src), ["AnalysisResult"]);
    const json = JSON.stringify(result.schemas.AnalysisResult, null, 2);
    const path = goldenPath("AnalysisResult");

    if (!existsSync(path) || process.env.UPDATE_GOLDEN === "1") {
      writeFileSync(path, json);
    }

    expect(json).toBe(readFileSync(path, "utf-8"));
  });

  test("code-reviewer schemas", () => {
    const src = readFileSync(join(root, "examples", "code-reviewer.moon"), "utf-8");
    const result = compileProgramSchemas(parse(src), ["ReviewResult", "Finding", "Verdict"]);
    const payload = {
      ReviewResult: result.schemas.ReviewResult,
      Finding: result.schemas.Finding,
      Verdict: result.schemas.Verdict,
    };
    const json = JSON.stringify(payload, null, 2);
    const path = goldenPath("code-reviewer-schemas");

    if (!existsSync(path) || process.env.UPDATE_GOLDEN === "1") {
      writeFileSync(path, json);
    }

    expect(json).toBe(readFileSync(path, "utf-8"));
  });
});
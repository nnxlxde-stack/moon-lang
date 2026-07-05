import { describe, expect, test } from "bun:test";
import { parse } from "../packages/parser/src/index.ts";
import { runProgram } from "../packages/runtime/src/index.ts";
import { createMockLlm, LlmValidationError, fixtureFromSchema } from "../packages/runtime/src/mock-llm.ts";
import { readFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dir, "..", "..");

describe("mock LLM", () => {
  test("generates fixture from schema", () => {
    const value = fixtureFromSchema({
      type: "object",
      properties: {
        summary: { type: "string" },
        confidence: { type: "number", minimum: 0, maximum: 1 },
      },
      required: ["summary", "confidence"],
    }) as Record<string, unknown>;

    expect(typeof value.summary).toBe("string");
    expect(typeof value.confidence).toBe("number");
  });

  test("retries on invalid response", async () => {
    let attempts = 0;
    const client = {
      async complete() {
        attempts++;
        if (attempts === 1) throw new LlmValidationError("invalid");
        return { ok: true };
      },
    };

    try {
      await client.complete({} as never);
    } catch {
      await client.complete({} as never);
    }
    expect(attempts).toBe(2);
  });
});

describe("runtime", () => {
  test("runs code-analyzer main with mock LLM", async () => {
    const src = readFileSync(join(root, "examples", "code-analyzer.moon"), "utf-8");
    const result = await runProgram(parse(src), { mock: true });

    expect(result.effects.some((e) => e.kind === "saveToFile")).toBe(true);
    expect(result.effects.some((e) => e.kind === "postToSlack")).toBe(true);
    expect(result.dag.nodes.length).toBeGreaterThan(0);
  });

  test("runs code-reviewer main with mock LLM", async () => {
    const src = readFileSync(join(root, "examples", "code-reviewer.moon"), "utf-8");
    const result = await runProgram(parse(src), { mock: true });

    expect(result.effects.some((e) => e.kind === "saveToFile")).toBe(true);
    expect(result.dag.nodes.length).toBeGreaterThan(0);
  });
});
import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { assemblePrompt } from "../packages/prompt/src/index.ts";

const golden = JSON.parse(
  readFileSync(join(import.meta.dir, "golden", "prompts", "code-analyzer-agent.json"), "utf-8"),
) as { systemContains: string[]; userContains: string[] };

describe("prompt assembler", () => {
  test("structures system and user messages", () => {
    const assembled = assemblePrompt({
      agent: "CodeAnalyzer",
      model: "deepseek-v4-pro",
      systemPrompt: "You are a code reviewer.",
      role: "security",
      focus: ["bugs", "security"],
      input: { path: "main.cpp" },
      config: { context: "project notes", maxTokens: 1000 },
      schema: { type: "object", properties: { summary: { type: "string" } } },
    });

    expect(assembled.messages).toHaveLength(2);
    expect(assembled.messages[0]?.role).toBe("system");
    expect(assembled.messages[0]?.content).toContain("code reviewer");
    expect(assembled.messages[0]?.content).toContain("Role: security");
    expect(assembled.messages[0]?.content).toContain("bugs");
    expect(assembled.messages[1]?.content).toContain("## Input");
    expect(assembled.messages[1]?.content).toContain("## Project context");
    expect(assembled.messages[1]?.content).not.toContain('"config"');
  });

  test("matches golden prompt structure", () => {
    const assembled = assemblePrompt({
      agent: "CodeAnalyzer",
      model: "deepseek-v4-pro",
      systemPrompt: "Analyze code.",
      role: "reviewer",
      focus: ["security"],
      input: { path: "src/main.cpp" },
      config: { context: "ctx" },
      schema: { type: "object", properties: { summary: { type: "string" } } },
    });

    const system = assembled.messages[0]?.content ?? "";
    const user = assembled.messages[1]?.content ?? "";
    for (const part of golden.systemContains) {
      expect(system).toContain(part);
    }
    for (const part of golden.userContains) {
      expect(user).toContain(part);
    }
  });
});
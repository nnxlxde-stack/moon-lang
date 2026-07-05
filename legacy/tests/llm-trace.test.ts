import { describe, expect, test } from "bun:test";
import { existsSync } from "fs";
import { join } from "path";
import { LlmTraceWriter } from "../packages/runtime/src/llm-trace.ts";

describe("llm trace", () => {
  test("writes manifest and message files", async () => {
    const baseDir = join(import.meta.dir, ".trace-test");
    const writer = await LlmTraceWriter.create(baseDir);

    await writer.record({
      agent: "TestAgent",
      model: "deepseek-v4-flash",
      messages: [
        { role: "system", content: "system text" },
        { role: "user", content: "user text" },
      ],
      schema: { type: "object" },
      response: { ok: true },
      durationMs: 12,
    });

    const manifest = join(writer.runDir, "manifest.json");
    const messages = join(writer.runDir, "001-TestAgent-messages.txt");

    expect(existsSync(manifest)).toBe(true);
    expect(existsSync(messages)).toBe(true);

    const snap = writer.snapshot();
    expect(snap.entries).toHaveLength(1);
    expect(snap.entries[0]?.agent).toBe("TestAgent");
  });
});
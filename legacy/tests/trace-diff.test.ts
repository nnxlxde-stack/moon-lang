import { describe, expect, test } from "bun:test";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { diffTraceRuns } from "../packages/runtime/src/llm-trace.ts";

const root = join(import.meta.dir, ".trace-diff");

describe("trace diff", () => {
  test("reports agent and message differences", async () => {
    const runA = join(root, "run-a");
    const runB = join(root, "run-b");
    await mkdir(runA, { recursive: true });
    await mkdir(runB, { recursive: true });

    await writeFile(join(runA, "manifest.json"), JSON.stringify({
      entries: [{ id: "001", agent: "AgentA", model: "flash" }],
    }));
    await writeFile(join(runB, "manifest.json"), JSON.stringify({
      entries: [{ id: "001", agent: "AgentB", model: "flash" }],
    }));
    await writeFile(join(runA, "001-AgentA-messages.txt"), "system A");
    await writeFile(join(runB, "001-AgentB-messages.txt"), "system B");

    const diff = await diffTraceRuns("run-a", "run-b", root);
    expect(diff).toContain("Only in A: AgentA");
    expect(diff).toContain("Only in B: AgentB");
  });
});
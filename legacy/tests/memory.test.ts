import { describe, expect, test } from "bun:test";
import {
  FileMemoryBackend,
  loadPricingTable,
  MemoryManager,
  MetricsCollector,
} from "../packages/runtime/src/index.ts";
import { mkdtemp, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const root = join(import.meta.dir, "..", "..");

describe("file memory backend", () => {
  test("persists and recalls LongTerm knowledge", async () => {
    const dir = await mkdtemp(join(tmpdir(), "moon-mem-"));
    try {
      const backend = new FileMemoryBackend(dir);
      await backend.set("project-knowledge", "stored knowledge");

      const memory = new MemoryManager({ longTermPath: dir });
      memory.register("LongTerm", "project-knowledge");

      const first = await memory.recall("project-knowledge");
      expect(first).toBe("stored knowledge");

      const second = await memory.recall("project-knowledge");
      expect(second).toBe("stored knowledge");

      const metrics = new MetricsCollector(loadPricingTable(join(root, "docs", "model-pricing.json")));
      const tracked = new MemoryManager({ longTermPath: dir, metrics });
      tracked.register("LongTerm", "project-knowledge");
      await tracked.recall("project-knowledge");
      await tracked.recall("project-knowledge");
      expect(metrics.snapshot().memory.recallHits).toBe(1);
      expect(metrics.snapshot().memory.recallMisses).toBe(1);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
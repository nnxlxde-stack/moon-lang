import { describe, expect, test } from "bun:test";
import { parse } from "../packages/parser/src/index.ts";
import { runProgram } from "../packages/runtime/src/index.ts";
import {
  estimateCostUsd,
  loadPricingTable,
  MetricsCollector,
  countTokens,
  WorkerPool,
} from "../packages/runtime/src/index.ts";
import { readFileSync } from "fs";
import { join } from "path";

const root = join(import.meta.dir, "..", "..");

describe("pricing", () => {
  test("loads model-pricing.json", () => {
    const pricing = loadPricingTable(join(root, "docs", "model-pricing.json"));
    expect(pricing["deepseek-v4-pro"]?.["price-by-million-tokens-in-dollars"]?.output).toBe(0.87);
    expect(pricing["deepseek-v4-flash"]?.["concurency-limit"]).toBe(2500);
  });

  test("estimates cost from token usage", () => {
    const pricing = loadPricingTable(join(root, "docs", "model-pricing.json"));
    const cost = estimateCostUsd("deepseek-v4-flash", {
      prompt: 1_000_000,
      completion: 0,
      cacheHit: 0,
      cacheMiss: 1_000_000,
    }, pricing);
    expect(cost).toBeCloseTo(0.14, 5);
  });
});

describe("tokenizer", () => {
  test("counts tokens with deepseek-tokenizer", () => {
    const pricing = loadPricingTable(join(root, "docs", "model-pricing.json"));
    const count = countTokens("Hello, Moon language!", "deepseek-v4-pro", pricing);
    expect(count).toBeGreaterThan(0);
  });
});

describe("run metrics", () => {
  test("code-analyzer reports llm and recall metrics", async () => {
    const src = readFileSync(join(root, "examples", "code-analyzer.moon"), "utf-8");
    const result = await runProgram(parse(src), { mock: true });

    expect(result.metrics.llmCalls).toBeGreaterThan(0);
    expect(result.metrics.tokens.prompt).toBeGreaterThan(0);
    expect(result.metrics.tokens.completion).toBeGreaterThan(0);
    expect(result.metrics.costUsd).toBeGreaterThan(0);
    expect(result.metrics.memory.recallMisses).toBeGreaterThan(0);
    expect(result.metrics.worker.pro.executed).toBeGreaterThan(0);
  });

  test("worker pool respects tier concurrency", async () => {
    const metrics = new MetricsCollector(loadPricingTable(join(root, "docs", "model-pricing.json")));
    const pool = new WorkerPool({
      flashConcurrency: 2,
      proConcurrency: 1,
      onAcquire: (tier, active) => metrics.recordWorkerStart(tier, active),
    });

    let running = 0;
    let peak = 0;
    const tasks = Array.from({ length: 4 }, () => () => pool.run("flash", async () => {
      running++;
      peak = Math.max(peak, running);
      await Bun.sleep(5);
      running--;
      return 1;
    }));

    await Promise.all(tasks.map((t) => t()));
    expect(peak).toBeLessThanOrEqual(2);
    expect(metrics.snapshot().worker.flash.executed).toBe(4);
  });
});
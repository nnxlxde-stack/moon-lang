import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import {
  findMoonfile,
  loadMoonfile,
  moonfileToRuntimeOverrides,
  parseMoonfile,
  resolveMoonfileTarget,
} from "../packages/moonfile/src/index.ts";

const root = join(import.meta.dir, "..", "..");

describe("moonfile", () => {
  test("parses root Moonfile", () => {
    const source = readFileSync(join(root, "Moonfile"), "utf-8");
    const mf = parseMoonfile(source);

    expect(mf.package).toBe("moon-lang-examples");
    expect(mf.dependencies).toEqual([
      "Core.GitHub",
      "Core.Memory",
      "Core.Tools",
      "Core.FS",
      "Core.Network",
      "Core.Analyzers",
    ]);
    expect(mf.targets.analyzer).toBe("examples/code-analyzer.moon");
    expect(mf.targets.reviewer).toBe("examples/code-reviewer.moon");
    expect(mf.targets["doc-summarizer"]).toBe("examples/doc-summarizer.moon");
    expect(mf.targets["pr-triage"]).toBe("examples/pr-triage.moon");
    expect(mf.targets["requirements-check"]).toBe("examples/requirements-check.moon");
    expect(mf.models.default_flash).toBe("deepseek-v4-flash");
    expect(mf.models.default_pro).toBe("deepseek-v4-pro");
    expect(mf.runtime.worker_pool?.flash_concurrency).toBe(20);
    expect(mf.runtime.worker_pool?.pro_concurrency).toBe(5);
    expect(mf.runtime.memory?.long_term_backend).toBe("file://.moon/memory");
    expect(mf.runtime.retries?.max_repair_attempts).toBe(1);
    expect(mf.providers.deepseek?.api_key_env).toBe("DEEPSEEK_API_KEY");
    expect(mf.providers.deepseek?.base_url_env).toBe("DEEPSEEK_BASE_URL");
    expect(mf.providers.deepseek?.api_format).toBe("anthropic");
    expect(mf.paths.pricing).toBe("docs/model-pricing.json");
    expect(mf.prompts.storm?.default_rounds).toBe(1);
  });

  test("findMoonfile locates project manifest", () => {
    const path = findMoonfile(join(root, "examples"));
    expect(path).toBe(join(root, "Moonfile"));
  });

  test("resolveMoonfileTarget picks default and named targets", () => {
    const mf = loadMoonfile(join(root, "Moonfile"));
    const defaultTarget = resolveMoonfileTarget(mf, root);
    expect(defaultTarget.name).toBe("analyzer");
    expect(defaultTarget.path).toBe(join(root, "examples/code-analyzer.moon"));

    const named = resolveMoonfileTarget(mf, root, "pr-triage");
    expect(named.name).toBe("pr-triage");
    expect(named.path).toBe(join(root, "examples/pr-triage.moon"));
  });

  test("moonfileToRuntimeOverrides maps runtime section", () => {
    const mf = loadMoonfile(join(root, "Moonfile"));
    const overrides = moonfileToRuntimeOverrides(mf);
    expect(overrides.memoryPath).toBe("file://.moon/memory");
    expect(overrides.maxRepairAttempts).toBe(1);
    expect(overrides.flashConcurrency).toBe(20);
    expect(overrides.proConcurrency).toBe(5);
    // base_url comes from env("DEEPSEEK_BASE_URL") in root Moonfile
    expect(overrides.baseUrl).toBe(process.env.DEEPSEEK_BASE_URL);
    expect(overrides.apiFormat).toBe("anthropic");
    expect(overrides.pricingPath).toBe("docs/model-pricing.json");
  });
});
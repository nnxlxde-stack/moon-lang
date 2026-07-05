import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, rmSync } from "fs";
import { join } from "path";
import { buildFromMoonfile } from "../packages/build/src/index.ts";

const root = join(import.meta.dir, "..", "..");
const outDir = join(root, ".moon", "build-test");

afterAll(() => {
  if (existsSync(outDir)) {
    rmSync(outDir, { recursive: true, force: true });
  }
});

describe("build", () => {
  test("builds all Moonfile targets", async () => {
    const results = await buildFromMoonfile(join(root, "Moonfile"), {
      projectRoot: root,
      outDir,
    });

    expect(results.length).toBe(6);
    expect(results.every((r) => r.ok)).toBe(true);

    const buildJson = JSON.parse(
      await Bun.file(join(outDir, "analyzer", "build.json")).text(),
    ) as { imports?: Array<{ path: string }> };
    expect(buildJson.imports?.map((i) => i.path).sort()).toEqual([
      "Core.Analyzers",
      "Core.GitHub",
      "Core.Memory",
      "Core.Tools",
    ]);

    for (const result of results) {
      expect(existsSync(join(result.outputDir, "build.json"))).toBe(true);
      expect(existsSync(join(result.outputDir, "schemas.json"))).toBe(true);
      expect(existsSync(join(result.outputDir, "dag.json"))).toBe(true);
    }
  });

  test("builds single target", async () => {
    const results = await buildFromMoonfile(join(root, "Moonfile"), {
      projectRoot: root,
      outDir,
      target: "pr-triage",
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("pr-triage");
    expect(results[0]?.ok).toBe(true);
  });
});
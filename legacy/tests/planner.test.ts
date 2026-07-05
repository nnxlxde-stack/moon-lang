import { describe, expect, test } from "bun:test";
import { parse } from "../packages/parser/src/index.ts";
import { nodesByLabel, planFunction, reachableFrom } from "../packages/planner/src/index.ts";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { stripSpans } from "../packages/ast/src/index.ts";

const root = join(import.meta.dir, "..", "..");
const goldenDir = join(import.meta.dir, "golden", "dag");

describe("execution planner", () => {
  test("code-analyzer main DAG", () => {
    const src = readFileSync(join(root, "examples", "code-analyzer.moon"), "utf-8");
    const dag = planFunction(parse(src), "main");
    expect(dag).not.toBeNull();

    const json = JSON.stringify(stripSpans(dag), null, 2);
    const path = join(goldenDir, "code-analyzer-main.json");

    if (!existsSync(goldenDir)) {
      mkdirSync(goldenDir, { recursive: true });
    }
    if (!existsSync(path) || process.env.UPDATE_GOLDEN === "1") {
      writeFileSync(path, json);
    }

    expect(json).toBe(readFileSync(path, "utf-8"));
  });

  test("codeReviews and docsReviews branches are parallel", () => {
    const src = readFileSync(join(root, "examples", "code-analyzer.moon"), "utf-8");
    const dag = planFunction(parse(src), "main")!;

    const docsNode = nodesByLabel(dag, "docs")[0];
    const codeReviewsJoin = dag.nodes.find((n) => n.bindVar === "codeReviews");
    const docsReviewsJoin = dag.nodes.find((n) => n.bindVar === "docsReviews");

    expect(docsNode).toBeDefined();
    expect(codeReviewsJoin).toBeDefined();
    expect(docsReviewsJoin).toBeDefined();

    const codeBranch = reachableFrom(dag, [codeReviewsJoin!.id]);
    const docsDeps = new Set(docsNode!.dependencies);

    for (const dep of docsDeps) {
      expect(codeBranch.has(dep)).toBe(false);
    }

    const prsNode = nodesByLabel(dag, "prs")[0];
    expect(prsNode).toBeDefined();
    expect(docsDeps.has(prsNode!.id)).toBe(false);
  });
});
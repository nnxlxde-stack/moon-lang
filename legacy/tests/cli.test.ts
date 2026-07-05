import { describe, expect, test } from "bun:test";
import { join } from "path";

const root = join(import.meta.dir, "..", "..");
const cli = join(root, "legacy", "packages", "cli", "src", "index.ts");

describe("cli", () => {
  test("moon help prints commands", async () => {
    const proc = Bun.spawn(["bun", "run", cli, "help"], { cwd: root, stdout: "pipe" });
    const out = await new Response(proc.stdout).text();
    const code = await proc.exited;
    expect(code).toBe(0);
    expect(out).toContain("moon");
    expect(out).toContain("check");
    expect(out).toContain("run");
    expect(out).toContain("trace");
  });

  test("moon help check shows flags", async () => {
    const proc = Bun.spawn(["bun", "run", cli, "help", "check"], { cwd: root, stdout: "pipe" });
    const out = await new Response(proc.stdout).text();
    expect(await proc.exited).toBe(0);
    expect(out).toContain("--ast");
  });

  test("moon run without args uses Moonfile target", async () => {
    const proc = Bun.spawn(["bun", "run", cli, "run", "--mock"], {
      cwd: root,
      stdout: "pipe",
      stderr: "pipe",
    });
    const out = await new Response(proc.stdout).text();
    const code = await proc.exited;
    expect(code).toBe(0);
    expect(out).toContain("ran main");
    expect(out).toContain("analyzer");
  });

  test("moon run rejects Moonfile as .moon source", async () => {
    const proc = Bun.spawn(["bun", "run", cli, "run", "Moonfile"], {
      cwd: root,
      stdout: "pipe",
      stderr: "pipe",
    });
    const err = await new Response(proc.stderr).text();
    expect(await proc.exited).toBe(1);
    expect(err).toContain("project manifest");
  });
});
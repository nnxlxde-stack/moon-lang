import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { parse } from "../packages/parser/src/index.ts";
import { runProgram } from "../packages/runtime/src/index.ts";
import { fsReadFile, fsWriteFile } from "../packages/runtime/src/stdlib/fs.ts";

const tempRoot = mkdtempSync(join(tmpdir(), "moon-fs-"));

afterAll(() => {
  if (existsSync(tempRoot)) rmSync(tempRoot, { recursive: true, force: true });
});

describe("stdlib Core.FS", () => {
  test("fs helpers read and write on disk", () => {
    const target = join(tempRoot, "nested", "note.txt");
    fsWriteFile(target, "hello moon");
    expect(fsReadFile(target)).toBe("hello moon");
  });

});
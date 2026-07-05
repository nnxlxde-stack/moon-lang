import { cpSync, existsSync, rmSync } from "fs";
import { join, dirname } from "path";

const pkgRoot = join(import.meta.dir, "..");
const repoRoot = join(pkgRoot, "..", "..");
const src = join(repoRoot, "stdlib");
const dest = join(pkgRoot, "stdlib");

if (!existsSync(src)) {
  console.error(`stdlib not found at ${src}`);
  process.exit(1);
}

if (existsSync(dest)) {
  rmSync(dest, { recursive: true, force: true });
}

cpSync(src, dest, { recursive: true });
console.log(`Copied stdlib → ${dest}`);
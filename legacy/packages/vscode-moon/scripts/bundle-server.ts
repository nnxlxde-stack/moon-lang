import { mkdirSync } from "fs";
import { join } from "path";
import { $ } from "bun";

const pkgRoot = join(import.meta.dir, "..");
const outDir = join(pkgRoot, "server");
const outfile = join(outDir, "index.js");
const entry = join(pkgRoot, "..", "lsp", "src", "index.ts");

mkdirSync(outDir, { recursive: true });

await $`bun build ${entry} --outfile=${outfile} --target=node --format=cjs`;
console.log(`Bundled LSP server → ${outfile}`);
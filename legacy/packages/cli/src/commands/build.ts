import { buildFromMoonfile, buildSource } from "@moon/build";
import { findMoonfile } from "@moon/moonfile";
import { basename, resolve } from "path";
import { flagValue, type CliArgs } from "../args";
import { printFail, printOk, printWarning } from "../ui";
import { ui } from "../ui";

export async function runBuild(cli: CliArgs): Promise<number> {
  const start = Date.now();
  const target = flagValue(cli.argv, "--target");
  const entryFn = flagValue(cli.argv, "--fn");
  const fileArg = cli.positional.find((a) => a.endsWith(".moon"));

  if (fileArg) {
    const projectRoot = process.cwd();
    const targetName = target ?? basename(fileArg, ".moon");
    const result = await buildSource(fileArg, targetName, { projectRoot, entryFn });
    if (!result.ok) {
      for (const err of result.errors) printFail(err);
      return 1;
    }
    printOk(`built ${targetName} → ${result.outputDir}`);
    for (const w of result.warnings) printWarning(w);
    return 0;
  }

  const moonfilePath = findMoonfile(process.cwd());
  if (!moonfilePath) {
    printFail("Moonfile not found. Run from project root or pass a .moon file.");
    return 1;
  }

  const results = await buildFromMoonfile(moonfilePath, {
    projectRoot: resolve(moonfilePath, ".."),
    target,
    entryFn,
  });

  let failed = 0;
  let warnings = 0;
  for (const result of results) {
    if (!result.ok) {
      failed++;
      printFail(`built ${result.name}`);
      for (const err of result.errors) console.error(`    ${err}`);
      continue;
    }
    printOk(`built ${ui.dim(result.name)} → ${result.outputDir}`);
    warnings += result.warnings.length;
    for (const w of result.warnings) printWarning(`[${result.name}] ${w}`);
  }

  const elapsed = Date.now() - start;
  console.log();
  console.log(`  ${results.length - failed} targets  ·  ${warnings} warnings  ·  ${elapsed}ms`);
  return failed > 0 ? 1 : 0;
}
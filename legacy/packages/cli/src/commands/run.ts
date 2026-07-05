import { parse } from "@moon/parser";
import { typecheckProgram } from "@moon/typechecker";
import {
  findMoonfile,
  loadMoonfile,
  moonfileToRuntimeOverrides,
  resolveMoonfileTarget,
} from "@moon/moonfile";
import { formatMetrics, loadRuntimeConfig, runProgram } from "@moon/runtime";
import { stripSpans } from "@moon/ast";
import { existsSync } from "fs";
import { resolve } from "path";
import { flagValue, hasFlag, type CliArgs } from "../args";
import { printError, printFail, printInfo, printOk, printWarning } from "../ui";

interface RunEntry {
  file: string;
  projectRoot: string;
  targetName?: string;
}

function loadMoonfileOverrides(projectRoot: string) {
  const moonfilePath = findMoonfile(projectRoot);
  if (!moonfilePath) return {};
  return moonfileToRuntimeOverrides(loadMoonfile(moonfilePath));
}

function resolveRunEntry(cli: CliArgs): RunEntry | string {
  const targetFlag = flagValue(cli.argv, "--target");
  const positional = cli.positional[0];

  if (positional === "Moonfile" || positional === "Moonfile.moon") {
    return "Moonfile is a project manifest, not a .moon program. Use: moon run [--target <name>]";
  }

  if (positional?.endsWith(".moon")) {
    return { file: resolve(positional), projectRoot: process.cwd() };
  }

  const moonfilePath = findMoonfile(process.cwd());
  if (moonfilePath) {
    const moonfile = loadMoonfile(moonfilePath);
    const projectRoot = resolve(moonfilePath, "..");

    if (positional) {
      if (moonfile.targets[positional]) {
        return {
          file: resolve(projectRoot, moonfile.targets[positional]!),
          projectRoot,
          targetName: positional,
        };
      }
      if (!existsSync(resolve(positional))) {
        return `Unknown target '${positional}'. Available: ${Object.keys(moonfile.targets).join(", ")}`;
      }
    } else {
      try {
        const target = resolveMoonfileTarget(moonfile, projectRoot, targetFlag);
        return { file: target.path, projectRoot, targetName: target.name };
      } catch (err) {
        return err instanceof Error ? err.message : String(err);
      }
    }
  }

  if (!positional) {
    return "Moonfile not found. Run from project root, pass a .moon file, or a target name.";
  }

  return { file: resolve(positional), projectRoot: process.cwd() };
}

export async function runRun(cli: CliArgs): Promise<number> {
  const entry = resolveRunEntry(cli);
  if (typeof entry === "string") {
    printFail(entry);
    return 1;
  }

  const { file, projectRoot, targetName } = entry;
  const source = await Bun.file(file).text();
  const program = parse(source);
  const check = typecheckProgram(program, { entryPath: file });

  if (!check.ok) {
    for (const err of check.errors) printError(err.message);
    return 1;
  }

  const fn = flagValue(cli.argv, "--fn") ?? "main";
  const moonfileOverrides = loadMoonfileOverrides(projectRoot);
  const memoryDir = flagValue(cli.argv, "--memory-dir");

  const runtimeConfig = loadRuntimeConfig({
    mock: hasFlag(cli.argv, "--mock") ? true : undefined,
    memoryPath: memoryDir ? `file://${memoryDir}` : moonfileOverrides.memoryPath,
    apiKey: moonfileOverrides.apiKey,
    baseUrl: moonfileOverrides.baseUrl,
    apiFormat: moonfileOverrides.apiFormat,
    useBeta: moonfileOverrides.useBeta,
    pricingPath: moonfileOverrides.pricingPath,
    maxRepairAttempts: moonfileOverrides.maxRepairAttempts,
    flashConcurrency: moonfileOverrides.flashConcurrency,
    proConcurrency: moonfileOverrides.proConcurrency,
  });

  if (runtimeConfig.useMock && !hasFlag(cli.argv, "--mock") && !runtimeConfig.apiKey) {
    printWarning("DEEPSEEK_API_KEY not set, using mock LLM");
  } else if (!runtimeConfig.useMock) {
    const fmt = runtimeConfig.apiFormat ?? "anthropic";
    const base = runtimeConfig.baseUrl ?? "https://api.deepseek.com/anthropic";
    const beta = runtimeConfig.useBeta ? " +beta" : "";
    printInfo(`using DeepSeek ${fmt} API (${base}${beta})`);
  }

  const result = await runProgram(program, {
    functionName: fn,
    entryPath: file,
    projectRoot,
    mock: hasFlag(cli.argv, "--mock") ? true : undefined,
    memoryPath: memoryDir ? `file://${memoryDir}` : moonfileOverrides.memoryPath,
    apiKey: moonfileOverrides.apiKey,
    baseUrl: moonfileOverrides.baseUrl,
    apiFormat: moonfileOverrides.apiFormat,
    useBeta: moonfileOverrides.useBeta,
    pricingPath: moonfileOverrides.pricingPath,
    maxRepairAttempts: moonfileOverrides.maxRepairAttempts,
    flashConcurrency: moonfileOverrides.flashConcurrency,
    proConcurrency: moonfileOverrides.proConcurrency,
    traceLlm: hasFlag(cli.argv, "--trace-llm"),
    traceDir: flagValue(cli.argv, "--trace-dir"),
  });

  const label = targetName ? `${targetName} (${file})` : file;

  if (hasFlag(cli.argv, "--json")) {
    console.log(JSON.stringify({
      mode: runtimeConfig.useMock ? "mock" : "live",
      target: targetName,
      effects: result.effects,
      dag: stripSpans(result.dag),
      metrics: result.metrics,
      llmTrace: result.llmTrace,
    }, null, 2));
  } else {
    printOk(`ran ${fn} in ${label} (${runtimeConfig.useMock ? "mock" : "live"})`);
    console.log(`  effects: ${result.effects.length}`);
    if (result.llmTrace?.runDir) {
      printInfo(`trace: ${result.llmTrace.runDir}`);
    }
    if (hasFlag(cli.argv, "--metrics") || !runtimeConfig.useMock) {
      console.log(formatMetrics(result.metrics));
    }
  }
  return 0;
}
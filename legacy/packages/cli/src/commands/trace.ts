import { diffTraceRuns, showLastTrace, showTraceRun } from "@moon/runtime";
import { flagValue, type CliArgs } from "../args";
import { printFail, printInfo } from "../ui";

export async function runTrace(cli: CliArgs): Promise<number> {
  const sub = cli.argv[1];
  if (sub === "show") {
    const runId = flagValue(cli.argv, "--run");
    const text = runId
      ? await showTraceRun(runId, flagValue(cli.argv, "--trace-dir"))
      : await showLastTrace(flagValue(cli.argv, "--trace-dir"));

    if (!text) {
      printFail("No trace found. Run with: moon run <file> --trace-llm");
      return 1;
    }

    printInfo(text);
    return 0;
  }

  if (sub === "diff") {
    const runA = flagValue(cli.argv, "--a") ?? cli.positional[0];
    const runB = flagValue(cli.argv, "--b") ?? cli.positional[1];
    if (!runA || !runB) {
      console.error("Usage: moon trace diff <runA> <runB>  |  moon trace diff --a <id> --b <id>");
      return 1;
    }

    const text = await diffTraceRuns(runA, runB, flagValue(cli.argv, "--trace-dir"));
    if (!text) {
      printFail("Trace runs not found.");
      return 1;
    }

    printInfo(text);
    return 0;
  }

  console.error("Usage: moon trace show [--run <id>]  |  moon trace diff <runA> <runB>");
  return 1;
}
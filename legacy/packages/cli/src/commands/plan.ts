import { stripSpans } from "@moon/ast";
import { parse } from "@moon/parser";
import { typecheckProgram } from "@moon/typechecker";
import { planFunction } from "@moon/planner";
import { flagValue, type CliArgs } from "../args";

export async function runPlan(cli: CliArgs): Promise<number> {
  const file = cli.positional[0];
  if (!file) {
    console.error("Usage: moon plan <file.moon>");
    return 1;
  }

  const program = parse(await Bun.file(file).text());
  const check = typecheckProgram(program, { entryPath: file });
  if (!check.ok) {
    for (const err of check.errors) console.error(err.message);
    return 1;
  }

  const fn = flagValue(cli.argv, "--fn") ?? "main";
  const dag = planFunction(program, fn);
  if (!dag) {
    console.error(`Function not found: ${fn}`);
    return 1;
  }
  console.log(JSON.stringify(stripSpans(dag), null, 2));
  return 0;
}
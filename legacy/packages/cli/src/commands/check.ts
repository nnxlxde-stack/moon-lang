import { stripSpans } from "@moon/ast";
import { parse } from "@moon/parser";
import { typecheckProgram } from "@moon/typechecker";
import { compileProgramSchemas } from "@moon/schema-compiler";
import { flagValue, hasFlag, type CliArgs } from "../args";
import { printOk, printWarning } from "../ui";

export async function runCheck(cli: CliArgs): Promise<number> {
  const file = cli.positional[0];
  if (!file) {
    console.error("Usage: moon check <file.moon>");
    return 1;
  }

  const source = await Bun.file(file).text();
  const program = parse(source);
  const check = typecheckProgram(program, { entryPath: file });

  if (!check.ok) {
    for (const err of check.errors) console.error(err.message);
    return 1;
  }

  if (hasFlag(cli.argv, "--ast")) {
    console.log(JSON.stringify(stripSpans(program), null, 2));
    return 0;
  }

  if (hasFlag(cli.argv, "--schemas")) {
    console.log(JSON.stringify(compileProgramSchemas(program), null, 2));
    return 0;
  }

  printOk(file);
  const schemaResult = compileProgramSchemas(program);
  for (const w of schemaResult.warnings) {
    printWarning(`${w.message} at ${w.line}:${w.column}`);
  }
  return 0;
}
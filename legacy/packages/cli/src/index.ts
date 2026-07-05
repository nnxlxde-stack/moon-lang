#!/usr/bin/env bun
import { ParseError } from "@moon/parser";
import { LexError } from "@moon/lexer";
import { parseCliArgs } from "./args";
import { configureUi } from "./ui";
import { printCommandHelp, printMainHelp, resolveHelpCommand } from "./help";
import { runCheck } from "./commands/check";
import { runRun } from "./commands/run";
import { runPlan } from "./commands/plan";
import { runBuild } from "./commands/build";
import { runFormat } from "./commands/format";
import { runLsp } from "./commands/lsp";
import { runTrace } from "./commands/trace";

const argv = process.argv.slice(2);
configureUi(argv);

const helpCmd = resolveHelpCommand(argv);
if (!argv.length || argv[0] === "help" || helpCmd) {
  if (helpCmd) printCommandHelp(helpCmd);
  else printMainHelp();
  process.exit(0);
}

const cli = parseCliArgs(argv);

try {
  let code = 1;
  switch (cli.command) {
    case "check":
      code = await runCheck(cli);
      break;
    case "run":
      code = await runRun(cli);
      break;
    case "plan":
      code = await runPlan(cli);
      break;
    case "build":
      code = await runBuild(cli);
      break;
    case "format":
      code = await runFormat(cli);
      break;
    case "lsp":
      code = await runLsp();
      break;
    case "trace":
      code = await runTrace(cli);
      break;
    default:
      console.error(`Unknown command: ${cli.command}`);
      printMainHelp();
      code = 1;
  }
  process.exit(code);
} catch (err) {
  if (err instanceof ParseError || err instanceof LexError) {
    console.error(err.message);
    process.exit(1);
  }
  throw err;
}
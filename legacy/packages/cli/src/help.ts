import { ui } from "./ui";

interface CommandHelp {
  name: string;
  summary: string;
  usage: string;
  flags?: string[];
  examples?: string[];
}

const COMMANDS: CommandHelp[] = [
  {
    name: "check",
    summary: "Parse and typecheck a .moon file",
    usage: "moon check <file.moon> [--ast] [--schemas]",
    flags: ["--ast", "--schemas", "--no-color"],
    examples: ["moon check examples/code-analyzer.moon"],
  },
  {
    name: "run",
    summary: "Run a Moonfile target or a .moon program",
    usage: "moon run [--target <name>] [<target|file.moon>] [--mock] [--json] [--metrics] [--trace-llm] [--fn <name>] [--memory-dir <path>]",
    flags: ["--target <name>", "--mock", "--json", "--metrics", "--trace-llm", "--trace-dir <path>", "--fn <name>", "--memory-dir <path>"],
    examples: [
      "moon run --mock",
      "moon run --target analyzer --mock",
      "moon run examples/code-analyzer.moon --mock --metrics",
    ],
  },
  {
    name: "plan",
    summary: "Print execution DAG for a function",
    usage: "moon plan <file.moon> [--fn <name>]",
    flags: ["--fn <name>"],
    examples: ["moon plan examples/code-analyzer.moon"],
  },
  {
    name: "build",
    summary: "Build targets from Moonfile or a single file",
    usage: "moon build [--target <name>] [--fn <name>] [<file.moon>]",
    flags: ["--target <name>", "--fn <name>"],
    examples: ["moon build", "moon build --target analyzer"],
  },
  {
    name: "format",
    summary: "Format .moon source",
    usage: "moon format <file.moon> [--check] [--write]",
    flags: ["--check", "--write"],
    examples: ["moon format examples/pr-triage.moon --write"],
  },
  {
    name: "lsp",
    summary: "Start Language Server (stdio)",
    usage: "moon lsp",
  },
  {
    name: "trace",
    summary: "Inspect LLM prompt traces",
    usage: "moon trace show [--run <id>]  |  moon trace diff <runA> <runB>",
    flags: ["--run <id>", "--trace-dir <path>", "--a <id>", "--b <id>"],
    examples: ["moon trace show", "moon trace diff run-1 run-2"],
  },
];

export function printBanner(): void {
  console.log(ui.bold("moon") + " — Moon Language toolchain");
  console.log();
}

export function printMainHelp(): void {
  printBanner();
  console.log("Usage:");
  console.log(`  ${ui.bold("moon")} <command> [options]`);
  console.log(`  ${ui.bold("moon help")} [command]`);
  console.log();
  console.log(ui.bold("Commands:"));
  for (const cmd of COMMANDS) {
    console.log(`  ${ui.bold(cmd.name.padEnd(8))} ${cmd.summary}`);
  }
  console.log();
  console.log(`Run ${ui.bold("moon help <command>")} for details.`);
}

export function printCommandHelp(name: string): void {
  const cmd = COMMANDS.find((c) => c.name === name);
  if (!cmd) {
    console.error(`Unknown command: ${name}`);
    console.error(`Available: ${COMMANDS.map((c) => c.name).join(", ")}`);
    process.exit(1);
  }
  console.log(ui.bold(`moon ${cmd.name}`) + ` — ${cmd.summary}`);
  console.log();
  console.log(ui.bold("Usage:"));
  console.log(`  ${cmd.usage}`);
  if (cmd.flags?.length) {
    console.log();
    console.log(ui.bold("Flags:"));
    for (const flag of cmd.flags) {
      console.log(`  ${flag}`);
    }
  }
  if (cmd.examples?.length) {
    console.log();
    console.log(ui.bold("Examples:"));
    for (const ex of cmd.examples) {
      console.log(`  ${ex}`);
    }
  }
}

export function resolveHelpCommand(argv: string[]): string | null {
  if (argv[0] === "help") return argv[1] ?? null;
  if (argv.includes("--help") || argv.includes("-h")) {
    const cmd = argv[0];
    if (cmd && cmd !== "help") return cmd;
  }
  return null;
}
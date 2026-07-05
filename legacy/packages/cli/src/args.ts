export interface CliArgs {
  argv: string[];
  command: string;
  subcommand?: string;
  positional: string[];
}

export function parseCliArgs(argv: string[]): CliArgs {
  const command = argv[0] ?? "";
  const subcommand = command === "help" || command === "trace" ? argv[1] : undefined;
  const positional = argv.filter((arg, index) => {
    if (index === 0) return false;
    if (arg.startsWith("--")) return false;
    const prev = argv[index - 1];
    if (prev?.startsWith("--") && !["--mock", "--json", "--metrics", "--ast", "--schemas", "--write", "--check", "--no-color"].includes(prev)) {
      return false;
    }
    return true;
  });
  return { argv, command, subcommand, positional };
}

export function flagValue(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : undefined;
}

export function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}
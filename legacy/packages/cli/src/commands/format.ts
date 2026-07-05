import { formatSource } from "@moon/formatter";
import { type CliArgs } from "../args";
import { printOk } from "../ui";

export async function runFormat(cli: CliArgs): Promise<number> {
  const file = cli.positional[0];
  if (!file) {
    console.error("Usage: moon format <file.moon> [--check] [--write]");
    return 1;
  }

  const source = await Bun.file(file).text();
  const formatted = formatSource(source);

  if (cli.argv.includes("--check")) {
    if (formatted !== source) {
      console.error(`Would reformat: ${file}`);
      return 1;
    }
    printOk(`${file} is formatted`);
    return 0;
  }

  if (cli.argv.includes("--write")) {
    await Bun.write(file, formatted);
    printOk(`formatted ${file}`);
    return 0;
  }

  process.stdout.write(formatted);
  return 0;
}
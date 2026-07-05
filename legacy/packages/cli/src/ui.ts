export interface UiOptions {
  noColor?: boolean;
}

let colorEnabled = !process.env.NO_COLOR && process.env.CI !== "true";

export function configureUi(args: string[]): UiOptions {
  if (args.includes("--no-color")) {
    colorEnabled = false;
  }
  return { noColor: !colorEnabled };
}

function wrap(code: string, text: string): string {
  if (!colorEnabled) return text;
  return `\x1b[${code}m${text}\x1b[0m`;
}

export const ui = {
  success: (text: string) => wrap("32", text),
  error: (text: string) => wrap("31", text),
  warning: (text: string) => wrap("33", text),
  info: (text: string) => wrap("36", text),
  bold: (text: string) => wrap("1", text),
  dim: (text: string) => wrap("2", text),
  path: (text: string) => (colorEnabled ? `\x1b[2m\x1b[36m${text}\x1b[0m` : text),
  check: () => (colorEnabled ? "\x1b[32m✓\x1b[0m" : "OK"),
  cross: () => (colorEnabled ? "\x1b[31m✗\x1b[0m" : "FAIL"),
};

export function printOk(message: string): void {
  console.log(`  ${ui.check()} ${message}`);
}

export function printFail(message: string): void {
  console.error(`  ${ui.cross()} ${message}`);
}

export function printWarning(message: string): void {
  console.warn(`  ${ui.warning("warning:")} ${message}`);
}

export function printInfo(message: string): void {
  console.warn(`  ${ui.info("info:")} ${message}`);
}

export function printError(message: string): void {
  console.error(`  ${ui.error(message)}`);
}
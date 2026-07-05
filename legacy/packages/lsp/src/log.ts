import type { Connection } from "vscode-languageserver";

export interface MoonLogConfig {
  enabled: boolean;
  verbose: boolean;
}

let connection: Connection | undefined;
let config: MoonLogConfig = { enabled: true, verbose: false };

export function attachMoonLogger(conn: Connection): void {
  connection = conn;
}

export function setMoonLogConfig(next: Partial<MoonLogConfig>): void {
  config = { ...config, ...next };
}

export function moonLog(message: string, level: "info" | "warn" | "debug" = "info"): void {
  if (!connection || !config.enabled) return;
  if (level === "debug" && !config.verbose) return;
  const tag = level === "warn" ? "[warn]" : level === "debug" ? "[debug]" : "[info]";
  void connection.console.log(`${tag} ${message}`);
}
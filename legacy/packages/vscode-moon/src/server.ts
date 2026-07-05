import { execSync } from "child_process";
import { existsSync } from "fs";
import * as path from "path";
import { workspace, type ExtensionContext } from "vscode";
import { type ServerOptions, TransportKind } from "vscode-languageclient/node";

function nodeCommand(): string {
  const fromEditor = process.env.VSCODE_NODEJS_PATH?.trim();
  if (fromEditor && existsSync(fromEditor)) return fromEditor;

  try {
    const lookup = process.platform === "win32" ? "where.exe node" : "which node";
    const hit = execSync(lookup, { encoding: "utf8" })
      .trim()
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean);
    if (hit && existsSync(hit)) return hit;
  } catch {
    // Fall back to PATH lookup by spawn.
  }

  return process.platform === "win32" ? "node.exe" : "node";
}

function envWithStdlib(stdlibPath: string | undefined): NodeJS.ProcessEnv {
  const env = { ...process.env };
  if (stdlibPath && existsSync(stdlibPath)) {
    env.MOON_STDLIB = stdlibPath;
  }
  return env;
}

export function createServerOptions(context: ExtensionContext): ServerOptions {
  const config = workspace.getConfiguration("moon");
  const override = config.get<string>("languageServerPath")?.trim();

  const bundledStdlib = path.join(context.extensionPath, "stdlib");
  const bundledServer = path.join(context.extensionPath, "server", "index.js");

  if (override) {
    const env = envWithStdlib(
      existsSync(bundledStdlib)
        ? bundledStdlib
        : path.join(context.extensionPath, "..", "..", "stdlib"),
    );

    if (override.endsWith(".ts")) {
      const run = {
        command: "bun",
        args: ["run", override, ...(override.includes("lsp") ? [] : ["lsp"]), "--", "--stdio"],
        transport: TransportKind.stdio,
        options: { env },
      };
      return { run, debug: run };
    }

    const run = {
      command: nodeCommand(),
      args: [override, "--stdio"],
      transport: TransportKind.stdio,
      options: { env },
    };
    return { run, debug: run };
  }

  if (existsSync(bundledServer)) {
    const run = {
      command: nodeCommand(),
      args: [bundledServer, "--stdio"],
      transport: TransportKind.stdio,
      options: { env: envWithStdlib(bundledStdlib) },
    };
    return { run, debug: run };
  }

  const devLsp = path.join(context.extensionPath, "..", "lsp", "src", "index.ts");
  const devStdlib = path.join(context.extensionPath, "..", "..", "stdlib");
  const run = {
    command: "bun",
    args: ["run", devLsp, "--", "--stdio"],
    transport: TransportKind.stdio,
    options: { env: envWithStdlib(devStdlib) },
  };
  return { run, debug: run };
}
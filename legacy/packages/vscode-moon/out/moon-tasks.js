"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMoonCli = runMoonCli;
exports.moonBuild = moonBuild;
exports.moonRun = moonRun;
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const fs_1 = require("fs");
const vscode_1 = require("vscode");
const config_1 = require("./config");
function workspaceRoot() {
    return vscode_1.workspace.workspaceFolders?.[0]?.uri.fsPath;
}
function resolveCli(root) {
    const cfg = (0, config_1.readMoonConfig)();
    if (cfg.build.cliPath.trim()) {
        const custom = cfg.build.cliPath.trim();
        if (custom.endsWith(".ts")) {
            return { command: "bun", argsPrefix: ["run", custom] };
        }
        return { command: custom, argsPrefix: [] };
    }
    const bundled = path.join(root, "packages", "cli", "src", "index.ts");
    if ((0, fs_1.existsSync)(bundled)) {
        return { command: "bun", argsPrefix: ["run", bundled] };
    }
    return { command: "moon", argsPrefix: [] };
}
function runMoonCli(subcommand, extraArgs, output) {
    const root = workspaceRoot();
    if (!root) {
        output.appendLine("[error] No workspace folder open.");
        return Promise.resolve(1);
    }
    const { command, argsPrefix } = resolveCli(root);
    const args = [...argsPrefix, subcommand, ...extraArgs];
    output.appendLine(`[task] ${command} ${args.join(" ")}`);
    return new Promise((resolve) => {
        const child = (0, child_process_1.spawn)(command, args, {
            cwd: root,
            shell: process.platform === "win32",
            env: { ...process.env },
        });
        child.stdout.on("data", (chunk) => {
            output.append(chunk.toString());
        });
        child.stderr.on("data", (chunk) => {
            output.append(chunk.toString());
        });
        child.on("close", (code) => {
            output.appendLine(`[task] exit ${code ?? 1}`);
            resolve(code ?? 1);
        });
        child.on("error", (err) => {
            output.appendLine(`[error] ${String(err)}`);
            resolve(1);
        });
    });
}
async function moonBuild(output, target) {
    const cfg = (0, config_1.readMoonConfig)();
    const name = target ?? cfg.build.defaultTarget;
    const args = name ? ["--target", name] : [];
    return runMoonCli("build", args, output);
}
async function moonRun(output, target) {
    const cfg = (0, config_1.readMoonConfig)();
    if (cfg.build.runBeforeStart) {
        const buildCode = await moonBuild(output, target);
        if (buildCode !== 0)
            return buildCode;
    }
    const name = target ?? cfg.build.defaultTarget;
    const args = ["--mock", ...(name ? ["--target", name] : [])];
    return runMoonCli("run", args, output);
}
//# sourceMappingURL=moon-tasks.js.map
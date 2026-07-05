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
exports.createServerOptions = createServerOptions;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
function nodeCommand() {
    return process.platform === "win32" ? "node.exe" : "node";
}
function envWithStdlib(stdlibPath) {
    const env = { ...process.env };
    if (stdlibPath && (0, fs_1.existsSync)(stdlibPath)) {
        env.MOON_STDLIB = stdlibPath;
    }
    return env;
}
function createServerOptions(context) {
    const config = vscode_1.workspace.getConfiguration("moon");
    const override = config.get("languageServerPath")?.trim();
    const bundledStdlib = path.join(context.extensionPath, "stdlib");
    const bundledServer = path.join(context.extensionPath, "server", "index.js");
    if (override) {
        const env = envWithStdlib((0, fs_1.existsSync)(bundledStdlib)
            ? bundledStdlib
            : path.join(context.extensionPath, "..", "..", "stdlib"));
        if (override.endsWith(".ts")) {
            const run = {
                command: "bun",
                args: ["run", override, ...(override.includes("lsp") ? [] : ["lsp"]), "--", "--stdio"],
                transport: node_1.TransportKind.stdio,
                options: { env },
            };
            return { run, debug: run };
        }
        const run = {
            command: nodeCommand(),
            args: [override, "--stdio"],
            transport: node_1.TransportKind.stdio,
            options: { env },
        };
        return { run, debug: run };
    }
    if ((0, fs_1.existsSync)(bundledServer)) {
        const run = {
            command: nodeCommand(),
            args: [bundledServer, "--stdio"],
            transport: node_1.TransportKind.stdio,
            options: { env: envWithStdlib(bundledStdlib) },
        };
        return { run, debug: run };
    }
    const devLsp = path.join(context.extensionPath, "..", "lsp", "src", "index.ts");
    const devStdlib = path.join(context.extensionPath, "..", "..", "stdlib");
    const run = {
        command: "bun",
        args: ["run", devLsp, "--", "--stdio"],
        transport: node_1.TransportKind.stdio,
        options: { env: envWithStdlib(devStdlib) },
    };
    return { run, debug: run };
}
//# sourceMappingURL=server.js.map
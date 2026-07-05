"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readMoonConfig = readMoonConfig;
exports.moonConfigSection = moonConfigSection;
const vscode_1 = require("vscode");
function readMoonConfig() {
    const cfg = vscode_1.workspace.getConfiguration("moon");
    return {
        languageServerPath: cfg.get("languageServerPath", ""),
        logging: {
            enabled: cfg.get("logging.enabled", true),
            verbose: cfg.get("logging.verbose", false),
        },
        deepseek: {
            apiKey: cfg.get("deepseek.apiKey", "") || process.env.DEEPSEEK_API_KEY || "",
            baseUrl: cfg.get("deepseek.baseUrl", "") || process.env.DEEPSEEK_BASE_URL || "",
            apiFormat: cfg.get("deepseek.apiFormat", "anthropic"),
            useBeta: cfg.get("deepseek.useBeta", false),
        },
        ai: {
            inlineCompletions: {
                enabled: cfg.get("ai.inlineCompletions.enabled", false),
                model: cfg.get("ai.inlineCompletions.model", "deepseek-v4-flash"),
            },
        },
        build: {
            defaultTarget: cfg.get("build.defaultTarget", ""),
            runBeforeStart: cfg.get("build.runBeforeStart", true),
            cliPath: cfg.get("build.cliPath", ""),
        },
        models: {
            defaultFlash: cfg.get("models.defaultFlash", "deepseek-v4-flash"),
            defaultPro: cfg.get("models.defaultPro", "deepseek-v4-pro"),
        },
        formatOnSave: cfg.get("formatOnSave", true),
    };
}
function moonConfigSection() {
    return vscode_1.workspace.getConfiguration("moon");
}
//# sourceMappingURL=config.js.map
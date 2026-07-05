"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAiInlineCompletionProvider = createAiInlineCompletionProvider;
exports.registerAiCompletions = registerAiCompletions;
const vscode_1 = require("vscode");
const config_1 = require("./config");
const MOON_LANGUAGES = new Set(["moon", "moonfile"]);
function linePrefix(doc, position) {
    return doc.lineAt(position.line).text.slice(0, position.character);
}
async function fetchAiCompletion(doc, position, output) {
    const cfg = (0, config_1.readMoonConfig)();
    const apiKey = cfg.deepseek.apiKey.trim();
    if (!apiKey)
        return null;
    const base = cfg.deepseek.baseUrl.trim()
        || (cfg.deepseek.apiFormat === "openai"
            ? "https://api.deepseek.com/v1"
            : "https://api.deepseek.com/anthropic");
    const prefix = doc.getText(new vscode_1.Range(Math.max(0, position.line - 20), 0, position.line, position.character));
    const prompt = doc.languageId === "moonfile"
        ? `Complete the Moonfile manifest line at the cursor. Return only the completion suffix, no markdown.\n\n${prefix}`
        : `Complete the Moon language code at the cursor. Return only the completion suffix, no markdown.\n\n${prefix}`;
    output.appendLine(`[ai] inline completion request (${cfg.ai.inlineCompletions.model})`);
    try {
        if (cfg.deepseek.apiFormat === "openai") {
            const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: cfg.ai.inlineCompletions.model,
                    messages: [
                        { role: "system", content: "You are a Moon language coding assistant." },
                        { role: "user", content: prompt },
                    ],
                    max_tokens: 120,
                    temperature: 0.2,
                }),
            });
            const json = await res.json();
            return json.choices?.[0]?.message?.content?.trim() ?? null;
        }
        const res = await fetch(`${base.replace(/\/$/, "")}/v1/messages`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: cfg.ai.inlineCompletions.model,
                max_tokens: 120,
                messages: [{ role: "user", content: prompt }],
            }),
        });
        const json = await res.json();
        const block = json.content?.find((c) => c.type === "text");
        return block?.text?.trim() ?? null;
    }
    catch (err) {
        output.appendLine(`[ai] error: ${String(err)}`);
        return null;
    }
}
function createAiInlineCompletionProvider(output) {
    return {
        async provideInlineCompletionItems(document, position, _context, token) {
            if (!MOON_LANGUAGES.has(document.languageId))
                return undefined;
            const cfg = (0, config_1.readMoonConfig)();
            if (!cfg.ai.inlineCompletions.enabled)
                return undefined;
            if (!cfg.deepseek.apiKey.trim())
                return undefined;
            const before = linePrefix(document, position);
            if (before.trim().length < 2)
                return undefined;
            const text = await fetchAiCompletion(document, position, output);
            if (!text || token.isCancellationRequested)
                return undefined;
            return new vscode_1.InlineCompletionList([
                new vscode_1.InlineCompletionItem(text, new vscode_1.Range(position, position)),
            ]);
        },
    };
}
function registerAiCompletions(output) {
    const cfg = (0, config_1.readMoonConfig)();
    const provider = createAiInlineCompletionProvider(output);
    const sub = vscode_1.workspace.registerInlineCompletionItemProvider([{ language: "moon" }, { language: "moonfile" }], provider);
    output.appendLine(`[ai] inline completions ${cfg.ai.inlineCompletions.enabled ? "enabled" : "disabled"}`);
    return { dispose: () => sub.dispose() };
}
//# sourceMappingURL=ai-completions.js.map
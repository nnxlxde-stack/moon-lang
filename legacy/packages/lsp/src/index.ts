import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  type InitializeParams,
  type TextDocumentPositionParams,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { dirname } from "path";
import { parse } from "@moon/parser";
import { formatSource } from "@moon/formatter";

import {
  collectDiagnostics,
  definitionLocation,
  lookupSymbol,
  wordAtPosition,
} from "./project";
import { getCompletions, getPartialCompletions, getSignatureHelp } from "./completion";
import { getCodeActions } from "./code-actions";
import { formatHoverDocs } from "./moon-docs";
import { buildPromptPreview, findPromptSites } from "./prompt-preview";
import { findProjectRootFromPath, SymbolDatabase } from "./symbol-db";
import {
  collectMoonfileDiagnostics,
  detectMoonfileContext,
  getMoonfileCompletions,
  getMoonfileHover,
  isMoonfileDocument,
} from "./moonfile-lsp";
import { attachMoonLogger, moonLog } from "./log";
import { getMoonSettings, updateMoonSettings, type MoonLspSettings } from "./lsp-config";

const connection = createConnection(ProposedFeatures.all);
attachMoonLogger(connection);
const documents = new TextDocuments(TextDocument);
const symbolDb = new SymbolDatabase();

function applyInitializationSettings(params: InitializeParams): void {
  const init = params.initializationOptions as { moon?: MoonLspSettings } | undefined;
  if (init?.moon) {
    updateMoonSettings(init.moon);
    moonLog("settings loaded from initializationOptions", "debug");
  }
}

async function refreshMoonSettings(): Promise<void> {
  try {
    const getCfg = connection.workspace?.getConfiguration;
    if (typeof getCfg !== "function") {
      moonLog("workspace configuration not supported by client", "debug");
      return;
    }
    const cfg = await getCfg.call(connection.workspace, { section: "moon" });
    updateMoonSettings(cfg as Record<string, unknown>);
    moonLog("settings refreshed", "debug");
  } catch (err) {
    moonLog(`settings refresh failed: ${String(err)}`, "warn");
  }
}

function ensureSymbolDb(filePath: string): void {
  const root = findProjectRootFromPath(filePath);
  if (symbolDb.root === root && symbolDb.symbols.length > 0) return;
  if (!symbolDb.load(root)) symbolDb.rebuild(root);
}

connection.onInitialize((params) => {
  applyInitializationSettings(params);
  return {
  capabilities: {
    textDocumentSync: TextDocumentSyncKind.Incremental,
    completionProvider: {
      triggerCharacters: [".", ":", "/", "\\", "<", "-", '"'],
      resolveProvider: false,
    },
    signatureHelpProvider: {
      triggerCharacters: [" ", ".", ":"],
    },
    definitionProvider: true,
    hoverProvider: true,
    documentFormattingProvider: true,
    codeActionProvider: { resolveProvider: false },
    codeLensProvider: { resolveProvider: false },
  },
};
});

connection.onInitialized(() => {
  void refreshMoonSettings();
});

connection.onDidChangeConfiguration(() => {
  void refreshMoonSettings();
});

function filePathFromUri(uri: string): string {
  let path = uri.replace(/^file:\/\//, "");
  if (process.platform === "win32" && path.startsWith("/")) {
    path = path.slice(1);
  }
  return path.replace(/\//g, process.platform === "win32" ? "\\" : "/");
}

function safeParse(text: string) {
  try {
    return parse(text);
  } catch {
    return null;
  }
}

documents.onDidChangeContent((change) => {
  const uri = change.document.uri;
  const filePath = filePathFromUri(uri);
  const text = change.document.getText();

  if (filePath.endsWith(".moon")) {
    ensureSymbolDb(filePath);
    symbolDb.refreshFile(filePath);
    if (symbolDb.root) symbolDb.save();
  }

  const diagnostics = isMoonfileDocument(filePath)
    ? collectMoonfileDiagnostics(text).map((d) => ({
      message: d.message,
      severity: d.severity,
      range: {
        start: { line: d.line, character: d.character },
        end: { line: d.endLine, character: d.endCharacter },
      },
      source: "moonfile",
    }))
    : collectDiagnostics(filePath, text);
  connection.sendDiagnostics({ uri, diagnostics });
});

connection.onCodeLens((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  const program = safeParse(doc.getText());
  if (!program) return [];

  return findPromptSites(program).map((site) => ({
    range: {
      start: { line: site.line, character: 0 },
      end: { line: site.endLine, character: 1 },
    },
    command: {
      title: `$(sparkle) ${site.title}`,
      command: "moon.previewPrompt",
      arguments: [params.textDocument.uri, site.line],
    },
  }));
});

connection.onRequest("moon/getPromptPreview", (params: { uri: string; line: number }) => {
  const doc = documents.get(params.uri);
  if (!doc) return null;
  const program = safeParse(doc.getText());
  if (!program) return null;
  const preview = buildPromptPreview(program, params.line);
  if (!preview) return null;
  return {
    title: preview.site.title,
    markdown: preview.markdown,
    messages: preview.assembled.messages,
    temperature: preview.assembled.temperature,
    maxTokens: preview.assembled.maxTokens,
  };
});

connection.onCompletion((params: TextDocumentPositionParams) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  const filePath = filePathFromUri(params.textDocument.uri);
  const { line, character } = params.position;

  if (isMoonfileDocument(filePath)) {
    const root = findProjectRootFromPath(filePath) ?? dirname(filePath);
    const items = getMoonfileCompletions(doc.getText(), line, character, root);
    const ctx = detectMoonfileContext(doc.getText(), line, character);
    moonLog(`moonfile completion ${ctx.kind} → ${items.length} items`, "debug");
    return items;
  }

  const program = safeParse(doc.getText());
  const items = program
    ? getCompletions(program, filePath, doc.getText(), line, character)
    : getPartialCompletions(doc.getText(), filePath, line, character);

  moonLog(
    `moon completion ${program ? "full" : "partial"} → ${items.length} items`,
    "debug",
  );
  return items;
});

connection.onSignatureHelp((params: TextDocumentPositionParams) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;
  const program = safeParse(doc.getText());
  if (!program) return null;

  const help = getSignatureHelp(
    program,
    doc.getText(),
    params.position.line,
    params.position.character,
  );
  if (!help) return null;

  return {
    signatures: help.signatures.map((s) => ({
      label: s.label,
      documentation: s.documentation,
    })),
    activeSignature: help.activeSignature,
    activeParameter: 0,
  };
});

connection.onHover((params: TextDocumentPositionParams) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;
  const filePath = filePathFromUri(params.textDocument.uri);

  if (isMoonfileDocument(filePath)) {
    const markdown = getMoonfileHover(doc.getText(), params.position.line, params.position.character);
    if (!markdown) return null;
    return { contents: { kind: "markdown", value: markdown } };
  }

  const word = wordAtPosition(doc.getText(), params.position.line, params.position.character);
  if (!word) return null;

  const program = safeParse(doc.getText());
  if (!program) return null;

  ensureSymbolDb(filePath);
  const info = lookupSymbol(program, filePath, word, symbolDb, doc.getText());
  if (!info) return null;

  return {
    contents: {
      kind: "markdown",
      value: formatHoverDocs(info.name, info.type, info.module, info.docs),
    },
  };
});

connection.onDefinition((params: TextDocumentPositionParams) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return null;
  const filePath = filePathFromUri(params.textDocument.uri);
  const word = wordAtPosition(doc.getText(), params.position.line, params.position.character);
  if (!word) return null;

  const program = safeParse(doc.getText());
  if (!program) return null;

  ensureSymbolDb(filePath);
  const target = definitionLocation(program, filePath, word, symbolDb, doc.getText());
  if (!target) return null;
  return { uri: target.uri, range: target.range };
});

connection.onCodeAction((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  const filePath = filePathFromUri(params.textDocument.uri);
  const program = safeParse(doc.getText());
  if (!program) return [];

  const actions: Array<{
    title: string;
    kind?: string;
    isPreferred?: boolean;
    edit?: {
      changes: Record<string, Array<{ range: typeof params.range; newText: string }>>;
    };
  }> = [];

  for (const diag of params.context.diagnostics) {
    if (diag.source && diag.source !== "moon") continue;
    for (const fix of getCodeActions(program, filePath, doc.getText(), {
      message: diag.message,
      range: diag.range,
      source: diag.source,
    })) {
      if (!fix.edit) continue;
      actions.push({
        title: fix.title,
        kind: fix.kind ? `quickfix.${fix.kind}` : "quickfix",
        isPreferred: fix.isPreferred,
        edit: {
          changes: {
            [params.textDocument.uri]: [{
              range: fix.edit.range,
              newText: fix.edit.newText,
            }],
          },
        },
      });
    }
  }

  return actions;
});

connection.onDocumentFormatting((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) return [];
  const formatted = formatSource(doc.getText());
  return [{
    range: {
      start: doc.positionAt(0),
      end: doc.positionAt(doc.getText().length),
    },
    newText: formatted,
  }];
});

connection.onRequest("moon/getSettings", () => getMoonSettings());

export async function startLspServer(): Promise<void> {
  moonLog("Moon LSP listening", "info");
  documents.listen(connection);
  await connection.listen();
}

export {
  collectDiagnostics,
  lookupSymbol,
  wordAtPosition,
  definitionLocation,
} from "./project";
export {
  getCompletions,
  getPartialCompletions,
  getSignatureHelp,
  detectCompletionContext,
  prefixAtPosition,
  listLocalModules,
  collectLocalBindings,
} from "./completion";
export {
  findPromptSites,
  buildPromptPreview,
  formatPreviewMarkdown,
} from "./prompt-preview";
export {
  collectMoonfileDiagnostics,
  detectMoonfileContext,
  getMoonfileCompletions,
  getMoonfileHover,
  isMoonfileDocument,
} from "./moonfile-lsp";

const lspTransportArg = process.argv.some(
  (arg) => arg === "--stdio" || arg === "--node-ipc" || arg.startsWith("--socket="),
);

if (import.meta.main || lspTransportArg) {
  void startLspServer();
}
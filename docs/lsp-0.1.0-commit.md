# LSP 0.1.0

```
feat(vscode-moon): ship Moon Language extension 0.1.0 with bundled LSP

Package the VS Code extension as a self-contained VSIX. On activate, the
extension auto-starts a bundled Node LSP server (node server/index.js --stdio)
and sets MOON_STDLIB to the extension's copied stdlib tree.

- Add vscode-moon skeleton: grammar, language config, format-on-save
- Bundle LSP server and extension host code for distribution
- Implement context-aware IntelliSense (imports, members, config keys, types)
- Add signature help for agent.analyze and declaration snippets
- Add CodeLens "Preview prompt" for analyze/storm binds
- Add moon.previewPrompt command and dedicated output channels
- Add status bar indicator and moon.restartLanguageServer command
- Support optional moon.languageServerPath override for development

Extension version: 0.1.0
```
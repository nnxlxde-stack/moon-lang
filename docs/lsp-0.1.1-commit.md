# LSP 0.1.1

```
fix(lsp): safe formatting, quick-fixes, and name completions

Fix document formatting that previously emitted invalid Moon syntax after
format-on-save. Add LSP code actions and richer identifier completion.

Formatter:
- Rebuild formatter as span-preserving: keep original source slices, normalize
  do-block indentation only, verify parse round-trip before applying

LSP:
- Register codeActionProvider with quick-fixes:
  - import missing Core module for unknown variables
  - suggest similar symbol names for typos
  - fix unknown Core/local module names
- Add name completion context (agents, models, data constructors, locals, symbols)
- Merge keywords and agent snippets into name completions

Extension version: 0.1.1
```
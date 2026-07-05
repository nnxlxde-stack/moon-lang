# LSP 0.1.2

```
feat(lsp): symbol database, precise go-to-definition, moon-docs

Improve navigation and documentation for Moon projects. Persist a workspace
symbol index and resolve stdlib/local symbols to exact source ranges.

Symbol database:
- Add moon-symbols.json in workspace root (version 1 JSON schema)
- Index Moon.Prelude, all Core stdlib modules, lib/*.moon, and open files
- Refresh index on document changes and persist to disk

Navigation:
- Return precise DefinitionLocation ranges (line/character) instead of 0:0
- Resolve symbols via scoped lookup (imports, module hints, file paths)
- Index local agents, models, data constructors, and functions

Documentation:
- Add moon-docs comment format: `--? line` and `-- moon-doc` blocks
- Attach docs to indexed symbols; show in hover markdown
- Document key stdlib APIs (fetchOpenPRs, saveToFile, recall)

Resolver:
- Export agents and data constructors from local lib modules

Extension version: 0.1.2
```
# LSP / Stdlib 0.2.0

```
feat(stdlib,lsp): real FS/Network builtins, Moonfile workspace paths, pure parse fix

Ship Moon 0.2.0 with a real stdlib surface and stronger Moonfile IDE support.

Stdlib 0.2.0:
- Add Core.FS (readFile, writeFile, pathExists, listDir, makeDir, removePath)
- Add Core.Network (httpGet, httpPost, fetchJson)
- Runtime uses Bun fs + fetch (Tools.readFile/saveToFile now hit disk)
- Core.GitHub fetchOpenPRs calls GitHub REST API when GITHUB_TOKEN/GH_TOKEN is set

Moonfile IDE:
- Workspace-wide path IntelliSense (recursive scan with ignore dirs)
- moon-docs hover for sections/keys via --? comments + MOONFILE_KEY_DOCS
- Dedicated moonfile language grammar and icons (0.1.3 extension base)

Parser / LSP fix:
- Parse `()` as unit tuple and `pure arg` / `pure ()` without `$`
- Fix type parser eating equation names after `IO String` in signatures
- Add `pure` to Moon.Prelude (keyword used in stdlib stubs, not re-declared in .moon)
- Core.Tools.moon parses cleanly in diagnostics and symbol index

Extension version: 0.2.0
```
# Legacy TypeScript / Bun Toolchain

Рабочий прототип интерпретатора Moon (Phase 0 эталон для Swift-порта).

```bash
cd legacy
bun install
bun test
bun run check examples/code-analyzer.moon   # from repo root paths
```

Или из корня репозитория:

```bash
bun run test:legacy
bun run legacy:check examples/code-analyzer.moon
```

Новая разработка ведётся в `Sources/` (Swift 6.3). Этот каталог замораживается после достижения паритета Swift runtime.
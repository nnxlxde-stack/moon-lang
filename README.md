# The Moon Language

**Moon** — AI-native язык программирования для описания LLM-агентов, типизированных моделей данных и монадических пайплайнов. Синтаксис вдохновлён Haskell; конфигурация проекта — манифестом **Moonfile** в духе SwiftPM.

**Toolchain:** `0.3.0-swift-phase5` · Swift 6.3+ · 33 теста

<p align="center">
  <a href="docs/index.html"><strong>📖 Полная документация</strong></a>
</p>

---

## Возможности

- **Агенты** — декларативные LLM-конфигурации с `model`, `temperature`, `systemPrompt` и произвольными полями
- **Модели** — типизированные схемы ответов с ограничениями (`constraint: between 0.0 1.0`)
- **Do-блоки** — монадический `IO` с `bind`, `with`-контекстом и вызовами `agent.analyze`
- **Storm** — мульти-агентные дебаты с панелью и синтезатором
- **Moonfile** — targets, провайдеры, runtime, модели по умолчанию
- **Toolchain** — Swift CLI (check, run, build, plan, format, lsp, registry), LSP, расширение VS Code / Cursor

## Быстрый старт

### Требования

- **Swift 6.3+** (основной toolchain, Windows/macOS/Linux)
- [Bun](https://bun.sh) 1.1+ (legacy TypeScript прототип и VS Code extension)
- `DEEPSEEK_API_KEY` — для реальных LLM-вызовов (пока только в legacy runtime)

### Swift toolchain (новый)

```bash
git clone https://github.com/moon-lang/moon-lang.git
cd moon-lang
swift build
swift test
.build/debug/moon.exe version    # Windows
.build/debug/moon version        # macOS/Linux

moon check examples/code-analyzer.moon
moon plan examples/code-analyzer.moon
moon run --mock --target analyzer
moon build
moon format examples/pr-triage.moon --write
```

### Legacy TypeScript (рабочий прототип)

```bash
bun install
bun run test:legacy

# Парсинг и типы
bun run legacy:check examples/code-analyzer.moon

# Запуск первого target из Moonfile (без API)
bun run legacy:run -- --mock
```

### Минимальный пример

```moon
import Core.Tools

main :: IO ()
main = do
    prs <- fetchOpenPRs "org/repo"
    saveToFile "out/prs.txt" "done"
```

## Moonfile

Манифест проекта лежит в корне как `Moonfile` (без расширения):

```moonfile
package "my-project"

dependencies:
  Core.GitHub
  Core.Tools

targets:
  app: src/main.moon

providers:
  deepseek:
    api_key: env("DEEPSEEK_API_KEY")
    api_format: anthropic

models:
  default_flash: "deepseek-v4-flash"
  default_pro: "deepseek-v4-pro"
```

Подробнее — в [документации Moonfile](docs/index.html#moonfile).

## CLI

| Команда | Описание |
|---------|----------|
| `moon check <file>` | Парсинг и проверка типов |
| `moon run [--target NAME] [--mock]` | Запуск target или `.moon` файла (mock LLM) |
| `moon build [--target NAME]` | Сборка из Moonfile → `.moon/build/` |
| `moon plan <file>` | DAG выполнения |
| `moon add <pkg[@ver]>` | Добавить git-зависимость и vendor |
| `moon vendor` | Vendor git-зависимостей из Moonfile |
| `moon publish` | Валидация пакета и git-тег |
| `moon format <file> [--write\|--check]` | Форматирование |
| `moon lsp` | Language Server (stdio, Swift) |
| `moon version` | Версии модулей toolchain |

Команды `moon trace *` — только в legacy TypeScript CLI.

```bash
moon help
```

## Примеры

| Файл | Описание |
|------|----------|
| `examples/code-analyzer.moon` | Универсальный анализатор |
| `examples/code-reviewer.moon` | Код-ревью pull request'ов |
| `examples/pr-triage.moon` | Быстрый triage PR |
| `examples/code-review-storm.moon` | Storm-дебаты панели агентов |
| `examples/doc-summarizer.moon` | Суммаризация документации |
| `examples/requirements-check.moon` | Проверка требований |

## VS Code / Cursor

```bash
bun run vscode:package
code --install-extension legacy/packages/vscode-moon/vscode-moon-0.2.2.vsix
```

Расширение даёт подсветку `*.moon` и `Moonfile`, LSP (completion, hover, go-to-definition, diagnostics), форматирование, preview промптов и команды **Moon: Build** / **Moon: Run**. Для Swift LSP укажите путь к `.build/debug/moon` в настройке `moon.languageServerPath` и используйте подкоманду `lsp`.

## Структура репозитория

```
moon-lang/
├── Package.swift              # SwiftPM monorepo
├── Sources/
│   ├── MoonAST/               # AST
│   ├── MoonLexer/             # Лексер
│   ├── MoonParser/            # Парсер + layout
│   ├── MoonTypes/             # Система типов
│   ├── MoonMoonfile/          # Парсер Moonfile
│   ├── MoonResolver/          # Импорты и vendored git-пакеты
│   ├── MoonTypechecker/
│   ├── MoonSchemaCompiler/    # JSON Schema из model
│   ├── MoonPlanner/           # DAG выполнения
│   ├── MoonBuild/             # moon build
│   ├── MoonRegistry/          # add / vendor / publish
│   ├── MoonPrompt/            # Промпты агентов
│   ├── MoonRuntime/           # Интерпретатор (--mock)
│   ├── MoonFormatter/         # Форматирование
│   ├── MoonLSP/               # Language Server
│   └── MoonCLI/               # moon executable
├── Tests/
├── Moonfile                   # Манифест примеров
├── examples/
├── stdlib/Core/
├── registry/                  # Git-based package registry
├── legacy/                    # TypeScript/Bun прототип (эталон)
│   ├── packages/
│   └── tests/golden/
└── docs/
```

### Ограничения Swift toolchain (Phase 5)

- Runtime: только `--mock`, без storm и реальных LLM-вызовов; `mapM` последовательный
- LSP: нет Moonfile LSP, code actions, signature help, code lens
- Registry: только `github.com`, vendor через `git clone`

## Документация

| Ресурс | Описание |
|--------|----------|
| [**docs/index.html**](docs/index.html) | Полная интерактивная документация (откройте в браузере) |
| [docs/grammar.ebnf](docs/grammar.ebnf) | EBNF-грамматика v0.3 |
| [docs/model-pricing.json](docs/model-pricing.json) | Таблица цен моделей |

Локальный просмотр:

```bash
# Windows
start docs/index.html

# macOS
open docs/index.html

# Linux
xdg-open docs/index.html
```

## Разработка

```bash
swift build && swift test         # Swift toolchain
bun run test:legacy               # 108+ legacy тестов
bun run vscode:package            # VSIX (legacy/packages/vscode-moon)
```

## Лицензия

MIT
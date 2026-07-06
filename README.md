# Moon Language

[![Release](https://img.shields.io/github/v/release/nnxlxde-stack/moon-lang?style=flat-square&logo=github)](https://github.com/nnxlxde-stack/moon-lang/releases/latest)
[![License: MIT](https://img.shields.io/github/license/nnxlxde-stack/moon-lang?style=flat-square)](LICENSE)
[![Release build](https://img.shields.io/github/actions/workflow/status/nnxlxde-stack/moon-lang/release.yml?label=release&style=flat-square)](https://github.com/nnxlxde-stack/moon-lang/actions/workflows/release.yml)
[![Docs](https://img.shields.io/badge/docs-GitHub%20Pages-7c5cff?style=flat-square)](https://nnxlxde-stack.github.io/moon-lang/)
[![Stars](https://img.shields.io/github/stars/nnxlxde-stack/moon-lang?style=flat-square&logo=github)](https://github.com/nnxlxde-stack/moon-lang/stargazers)

**Moon** — AI-native язык программирования для описания LLM-агентов, типизированных моделей данных и монадических пайплайнов. Синтаксис вдохновлён Haskell; конфигурация проекта — манифестом **Moonfile** в духе SwiftPM.

**Toolchain:** `0.3.0-swift-phase11` · Swift 6.3+ · 77 тестов

<p align="center">
  <a href="docs/index.html"><strong>📖 Полная документация</strong></a>
</p>

## Экосистема

| Репозиторий | Описание |
|-------------|----------|
| **moon-lang** (этот репозиторий) | Интерпретатор, CLI, LSP |
| [moon-vscode](https://github.com/nnxlxde-stack/moon-vscode) | Расширение VS Code / Cursor |
| [moon-pkg](https://github.com/nnxlxde-stack/moon-pkg) | Monorepo пакетов и каталог |
| [moon-setup](https://github.com/nnxlxde-stack/moon-setup) | Скрипты установки toolchain + VS Code |

Исторический TypeScript/Bun toolchain — ветка [`legacy`](https://github.com/nnxlxde-stack/moon-lang/tree/legacy).

### Установка

```powershell
irm https://raw.githubusercontent.com/nnxlxde-stack/moon-setup/main/install-all.ps1 | iex
```

---

## Возможности

- **Агенты** — декларативные LLM-конфигурации с `model`, `temperature`, `systemPrompt` и произвольными полями
- **Модели** — типизированные схемы ответов с ограничениями (`constraint: between 0.0 1.0`)
- **Do-блоки** — монадический `IO` с `bind`, `with`-контекстом и вызовами `agent.analyze`
- **Storm** — мульти-агентные дебаты с панелью и синтезатором
- **Moonfile** — targets, провайдеры, runtime, модели по умолчанию
- **Toolchain** — Swift CLI (check, run, build, plan, format, lsp, registry), LSP

## Быстрый старт

### Установка (Windows, без сборки)

```powershell
irm https://raw.githubusercontent.com/nnxlxde-stack/moon-setup/main/install-all.ps1 | iex
```

Устанавливает **moon** + Swift runtime в `%APPDATA%\Moon` и добавляет в PATH пользователя.

Подробнее — [moon-setup](https://github.com/nnxlxde-stack/moon-setup).

### Требования

- Windows 10+ (автоустановка) или **Swift 6.3+** для сборки из исходников
- `DEEPSEEK_API_KEY` — для реальных LLM-вызовов (`moon run --no-mock`)
- `GITHUB_TOKEN` — для реальных GitHub API вызовов (`Core.GitHub`)

**Ручная установка:** [GitHub Releases](https://github.com/nnxlxde-stack/moon-lang/releases/latest) — `moon-*.exe` + `moon-runtime-*.zip`

```bash
git clone https://github.com/nnxlxde-stack/moon-lang.git
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
| `moon run [--target NAME] [--mock\|--no-mock]` | Запуск target или `.moon` файла |
| `moon run --metrics` | Запуск с отчётом токенов и стоимости |
| `moon run --trace-llm` | Запуск с записью LLM-трейса |
| `moon trace show` | Просмотр последнего LLM-трейса |
| `moon trace diff <A> <B>` | Сравнение двух прогонов |
| `moon build [--target NAME]` | Сборка из Moonfile → `.moon/build/` |
| `moon plan <file>` | DAG выполнения |
| `moon add <pkg[@ver]>` | Добавить git-зависимость и vendor |
| `moon vendor` | Vendor git-зависимостей из Moonfile |
| `moon publish` | Валидация пакета и git-тег |
| `moon format <file> [--write\|--check]` | Форматирование |
| `moon lsp` | Language Server (stdio) |
| `moon version` | Версии модулей toolchain |

`moon run --no-mock` требует `DEEPSEEK_API_KEY` для реальных LLM-вызовов.

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

Расширение: [moon-vscode Releases](https://github.com/nnxlxde-stack/moon-vscode/releases/latest) или `moon-setup`.

```bash
# Скачать .vsix из Releases, затем:
code --install-extension vscode-moon-0.3.0.vsix
```

После `swift build` в проекте Moon расширение автоматически подхватит `.build/debug/moon` как LSP.

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
│   └── fixtures/              # golden-файлы и review-kit
├── Moonfile                   # Манифест примеров
├── examples/
├── stdlib/Core/
└── docs/
```

### Ограничения (Phase 10)

- Tokenizer: нативный Swift BPE из `deepseek-tokenizer/tokenizer.json` (fallback — character estimate)
- Registry: `github.com`, `gitlab.com`, self-hosted HTTPS git; vendor через `git clone`

## Документация

| Ресурс | Описание |
|--------|----------|
| [**Документация (GitHub Pages)**](https://nnxlxde-stack.github.io/moon-lang/) | Полная интерактивная документация |
| [**docs/index.html**](docs/index.html) | Локальная копия документации |
| [docs/grammar.ebnf](docs/grammar.ebnf) | EBNF-грамматика v0.3 |
| [docs/model-pricing.json](docs/model-pricing.json) | Таблица цен моделей |

## Разработка

```bash
swift build && swift test
```

## Лицензия

MIT
# The Moon Language — план реализации интерпретатора

> Этот документ — техническое задание для AI coding agent (Grok Build Beta, Copilot Chat и т.п.).
> Он описывает, ЧТО нужно построить и в каком порядке, с достаточной конкретикой, чтобы агент
> мог декомпозировать задачи и писать код без дополнительных уточнений по архитектуре.
> Вопросы, которые агент должен задать перед стартом, вынесены в раздел "Открытые решения" в конце.

## 0. Что мы строим

Интерпретатор DSL "Moon" — языка для оркестрации AI-агентов с Haskell-подобным синтаксисом,
Hindley-Milner типизацией и рантаймом, который умеет:
- парсить и типизировать программы на Moon;
- превращать `do`-блоки в граф исполнения с автоматическим распараллеливанием;
- исполнять этот граф, отправляя вызовы `agent`-узлов в DeepSeek V4 Flash / Pro как
  structured-output запросы, схема которых выведена напрямую из типов Moon.

Референс языка: грамматика `grammar.ebnf` (приложена отдельно) + два примера
(`code-analyzer.moon`, `code-reviewer.moon`).

## 1. Технологический стек (допущение)

Предлагается **TypeScript / Bun** для всего интерпретатора (парсер, тайпчекер, рантайм):
- Async/await нативно ложится на конкурентные LLM-вызовы (worker pool).
- Богатая экосистема npm для CLI, тестов, JSON Schema (ajv).
- Единый язык для всех слоёв упрощает поддержку.

Если у вас есть причина предпочесть Rust (производительность парсера/тайпчекера) или
OCaml/Haskell (более естественный HM-инференс) — это тоже разумный выбор, но потребует
отдельного согласования конкурентной модели рантайма. Ниже всё описано в терминах,
не зависящих от языка реализации.

## 2. Структура репозитория

```
moon/
  packages/
    lexer/          — токенизация + layout-препроцессор (offside rule)
    parser/         — рекурентный спуск / Pratt-парсер -> AST
    typechecker/     — HM-инференс, type classes, unification
    schema-compiler/ — Moon type -> JSON Schema (для structured output)
    macro-expander/  — раскрытие template/macro до тайпчека
    planner/         — do-блок -> DAG (dependency graph)
    runtime/
      worker-pool/   — конкурентный планировщик задач
      memory/        — LongTerm / ShortTerm / Session scopes
      llm-client/     — абстракция над провайдерами + адаптер DeepSeek V4
    cli/             — moon run / check / build
  examples/
    code-analyzer.moon
    code-reviewer.moon
  grammar/
    grammar.ebnf
  Moonfile.moon        (пример манифеста)
```

## 3. Компонент: Lexer + Layout

**Вход:** исходный текст `.moon`. **Выход:** поток токенов с расставленными
виртуальными `{`, `;`, `}` (offside rule, как в Haskell).

Обязанности:
- Строчные комментарии `-- ...` — вырезаются на этапе лексера.
- Строковые литералы: обычные `"..."` и многострочные `""" ... """` (используются в `systemPrompt`).
- Идентификаторы: буквы/цифры/`_`/`-`, где `-` разрешён только без окружающих пробелов
  (maximal munch) — это даёт `deepseek-v4-pro` как один токен, а `a - b` остаётся вычитанием.
- Символ `.` лексикализируется в зависимости от пробелов вокруг него:
  без пробелов — `FIELD_DOT` (доступ к полю / квалифицированное имя),
  с пробелами с обеих сторон — `COMPOSE_DOT` (композиция функций).
- Layout-алгоритм: ключевые слова `where`, `do` (и `with` — см. ниже) открывают блок;
  колонка первого токена после ключевого слова = опорный отступ блока.
  Строка с тем же отступом = виртуальная `;`, с меньшим — виртуальная `}`.

**Тесты:** проверить оба примера (`code-analyzer.moon`, `code-reviewer.moon`) —
результат токенизации не должен требовать ни одной явной `{`/`;`/`}` в тексте.

## 4. Компонент: Parser

Рекурентный спуск для деклараций, Pratt-парсер (precedence climbing) для `expression`
по таблице приоритетов (сверху вниз — от низкого к высокому):

```
$          (право-ассоциативно, самый низкий)
>>= >>     (лево-ассоциативно)
||
&&
not
== /= <= >= < >
+ -
* /
.          (композиция функций, COMPOSE_DOT)
унарный -
применение функции (juxtaposition: f a b)
.          (доступ к полю, FIELD_DOT)
```

Строит AST по грамматике из `grammar_v3.ebnf`. Ключевые узлы:
`Declaration` (import / model / agent / data / instance / macro / function),
`FunctionEquation` (имя + список `Pattern` + тело), `Expression`
(включая `RecordExpr`, `IfExpr`, `LambdaExpr`, `AgentDecl`/`ModelDecl` как выражение).

**Важно:** `agent`/`model` декларации должны парситься и как top-level declaration,
и как `primary_expr` внутри тела функции (см. `deriveReviewer` в примере — там
`agent ... where ...` возвращается из ветки pattern match).

## 5. Компонент: Type Checker

- Алгоритм W (Hindley-Milner) для инференса типов, с unification.
- Type classes: словарный (dictionary-passing) подход для `instance ... for ...`.
- `constraint:`/`default:` в `field_def` не участвуют в типах — это runtime-валидация
  (см. Schema Compiler), тайпчекер их не проверяет статически.
- Ошибки типов должны быть человекочитаемыми — this нужно для `moon check`, чтобы
  ловить ошибки до трат на LLM-вызовы.

## 6. Компонент: Schema Compiler

Отдельный проход после тайпчека: берёт любой `model`/`data` тип, который используется
как возвращаемый тип `agent` (например `AnalysisResult t`), и компилирует его в JSON Schema
для DeepSeek `response_format`.

Маппинг:
| Moon | JSON Schema |
|---|---|
| `String` | `{"type": "string"}` |
| `Int` | `{"type": "integer"}` |
| `Float` | `{"type": "number"}` |
| `Bool` | `{"type": "boolean"}` |
| `[T]` | `{"type": "array", "items": <T>}` |
| `field :: T constraint: between 0.0 100.0` | `{"type": "number", "minimum": 0.0, "maximum": 100.0}` |
| `field :: T optional` | поле не входит в `required` |
| `data Verdict = A \| B \| C` | `{"enum": ["A", "B", "C"]}` |
| record-конструктор `{ f1 :: T1, f2 :: T2 }` | `{"type": "object", "properties": {...}, "required": [...]}` |

Схема компилируется один раз при `moon build`, кэшируется — не пересобирается на
каждый вызов агента.

Распознаваемые формы `constraint:` (расширяемый список, начать с этих):
`between a b` -> min/max, `length <= n` -> `maxLength`/`maxItems` (в зависимости от типа поля).
Всё, что не распознано, — предупреждение при `moon build`, а не runtime-ошибка.

## 7. Компонент: Macro/Template Expander

Раскрывает `template_decl`/`macro_decl` до или во время тайпчека (аналог Template Haskell,
запускается перед основным проходом инференса на уже раскрытом коде).
**Статус:** ни разу не встретился в реальных примерах — можно отложить в Фазу 2
и первую версию рантайма собрать вообще без этого прохода.

## 8. Компонент: Execution Planner

Вход: типизированный AST одной функции (обычно `main`, но применимо к любой).
Выход: DAG, где узлы — `action_call`/`bind_stmt`, рёбра — зависимости по переменным.

Алгоритм:
1. Пройти по `do_statement` списку по порядку.
2. Каждый `bind_stmt` (`x <- expr`) — узел, который зависит от узлов, чьи переменные
   встречаются в `expr` (свободные переменные).
3. `mapM f xs` разворачивается в N независимых узлов (по одному на элемент `xs`),
   все зависящие от одного и того же `xs`-узла, плюс один "join"-узел, собирающий
   результаты в список — join зависит от всех N.
4. Узлы без зависимостей друг от друга — кандидаты на параллельное исполнение.

Пример (`code-analyzer.moon`, `main`):
```
prs <- fetchOpenPRs "org/repo"
codeReviews <- mapM (analyze CodeAnalyzer) prs   -- N параллельных узлов + join
docs <- fetchUpdatedDocs "docs/"                  -- независим от prs/codeReviews
docsReviews <- mapM (analyze DocsAnalyzer) docs   -- N параллельных узлов + join
combinedReport <- generateCombinedReport codeReviews docsReviews  -- ждёт оба join
```
`prs`-ветка и `docs`-ветка независимы — планировщик может их слить.

## 9. Компонент: Runtime — Worker Pool

- Пул асинхронных задач с ограничением параллелизма **по тиру модели**, не глобально:
  отдельный семафор для `deepseek-v4-flash` (высокий параллелизм — дешёвая модель) и
  отдельный для `deepseek-v4-pro` (более консервативный лимит — дороже примерно в 12 раз
  по цене за токен).
- Лимиты задаются в `Moonfile.moon` (см. раздел 12), с разумными дефолтами
  (например flash: 20 одновременных запросов, pro: 5).
- При ошибке валидации ответа (см. п. 11) — retry с repair-промптом, не более
  configurable `maxRetries` (дефолт 1).

## 10. Компонент: Runtime — Memory Manager

Три скоупа: `LongTerm`, `ShortTerm`, `Session`.
- `memory LongTerm "project-knowledge"` — регистрирует скоуп с бэкендом
  (по умолчанию — простое персистентное KV/файловое хранилище на диске; интерфейс
  должен быть заменяемым на векторное хранилище позже).
- `recall "key"` — читает; результат **кэшируется в памяти на время исполнения одного
  DAG** (один прогон `moon run`), чтобы параллельные ветки не долбили бэкенд повторно
  одним и тем же ключом.
- `ShortTerm`/`Session` — чисто in-memory, без персистентности между запусками.

## 11. Компонент: Runtime — LLM Client (DeepSeek V4 адаптер)

Факты по API (проверено на актуальной документации DeepSeek, апрель 2026):
- Один и тот же `base_url`, OpenAI-совместимый Chat Completions формат (плюс
  Anthropic-совместимый); смена модели — это просто смена поля `model` на
  `deepseek-v4-pro` или `deepseek-v4-flash`.
- Structured output — через `response_format` с JSON Schema (OpenAI-конверт
  `{name, schema, strict}` либо голая схема, автоматически оборачиваемая).
- Обе модели поддерживают режимы thinking/non-thinking. **По умолчанию агенты Moon
  должны звать модель в non-thinking режиме** — известна проблема, когда structured
  JSON output вместе с thinking-режимом приводит к тому, что содержимое утекает в поле
  `reasoning` вместо `content`. Парсер ответа обязан как fallback пытаться извлечь JSON
  из `reasoning`/`reasoning_content`, если `content` пуст.
- Легаси-алиасы `deepseek-chat`/`deepseek-reasoner` полностью выводятся из обращения
  **24 июля 2026** — использовать только явные `deepseek-v4-pro`/`deepseek-v4-flash`.

Обязанности клиента:
1. Собрать `messages`: `system` = `systemPrompt` из `agent_config`, `user` = сериализованный
   вход + значения из `with`-конфига (`context:`, `maxTokens:`, `previousVersion:`, ...).
2. Подставить `response_format` из Schema Compiler.
3. Выбрать тир модели по полю `model:` в `agent_config` агента.
4. Отправить запрос, распарсить ответ, провалидировать против JSON Schema (включая
   `constraint:`-поля — их нет в самой JSON Schema минимума/максимума достаточно, но
   стоит перепроверить явно, т.к. модель может нарушить и валидный по типам, но
   логически некорректный ответ).
5. При невалидном ответе — вернуть управление в Worker Pool для retry с repair-промптом.

## 12. Манифест: Moonfile.moon

```
package "code-review-suite"

dependencies:
  Core.GitHub
  Core.Memory
  Core.Tools

models:
  default_flash: "deepseek-v4-flash"
  default_pro:   "deepseek-v4-pro"

runtime:
  worker_pool:
    flash_concurrency: 20
    pro_concurrency: 5
  memory:
    long_term_backend: "file://.moon/memory"
  retries:
    max_repair_attempts: 1
```
(Синтаксис самого Moonfile — SwiftPM-style, точный грамматику манифеста нужно
зафиксировать отдельно, в этом плане не описана.)

## 13. CLI

- `moon check` — Lexer → Parser → Type Checker → Schema Compiler (только валидация схем,
  без сети). Ошибка на любой стадии — ненулевой exit code, без единого HTTP-запроса.
- `moon build` — то же + Macro Expander + Execution Planner, кэширует скомпилированные
  JSON Schema на диск.
- `moon run` — полный пайплайн + Runtime (реальные вызовы к DeepSeek).

## 14. Фазы реализации (порядок для агента)

1. **Фаза 0 — skeleton.** Lexer без layout (только токенизация), Parser для подмножества
   без записей/pattern matching, `moon check` печатает AST. Цель — обработать
   упрощённую версию `code-analyzer.moon` без `where`/records/multi-equation функций.
2. **Фаза 1 — полный синтаксис.** Layout rule, records, pattern matching по нескольким
   уравнениям, `agent`/`model` как expression. Оба примера должны парситься целиком.
3. **Фаза 2 — типы.** HM-инференс, type classes, Schema Compiler. `moon check` полностью
   валидирует оба примера, включая вывод корректной JSON Schema для `AnalysisResult`/`ReviewResult`.
4. **Фаза 3 — планирование и рантайм без сети.** Execution Planner строит DAG,
   Worker Pool исполняет граф с mock LLM-клиентом (возвращает фиктурные данные по схеме).
5. **Фаза 4 — реальный DeepSeek.** LLM Client с реальными вызовами, retry-логика,
   Memory Manager с файловым бэкендом. `moon run` полностью исполняет
   `code-analyzer.moon`/`code-reviewer.moon` целиком.
6. **Фаза 5 — конкурентность и лимиты.** Раздельные семафоры по тирам, кэширование
   `recall` внутри одного прогона, метрики (сколько потрачено токенов/долларов за запуск).

## 15. Тестовая стратегия

- Golden-тесты на AST для обоих примеров (сериализованный AST фиксируется как fixture).
- Snapshot-тесты на сгенерированную JSON Schema для `AnalysisResult`/`ReviewResult`/`Finding`.
- DAG-тесты: для `main` из `code-analyzer.moon` проверить, что `codeReviews`- и
  `docsReviews`-ветки не имеют перекрёстных зависимостей (параллелизуемы).
- Mock LLM-клиент с фикстурными ответами (валидными и специально невалидными — проверить
  retry-цикл).

## 16. Открытые решения (уточнить перед стартом)

- Язык реализации — TypeScript предложен по умолчанию (см. раздел 1), нужно подтвердить.
- Формат хранения LongTerm memory в проде — файловое хранилище достаточно для MVP,
  но для реального использования почти наверняка понадобится векторная БД; выбор
  конкретной (pgvector/Qdrant/etc.) не сделан.
- `macro_decl` не подтверждён примерами — можно исключить из MVP полностью (см. раздел 7).
- Точная грамматика `Moonfile.moon` не зафиксирована — нужен отдельный проход по
  аналогии с работой над `grammar.ebnf`.

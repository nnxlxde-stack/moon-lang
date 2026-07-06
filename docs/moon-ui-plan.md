# План: Core.UI — GUI-библиотека для Moon Language

**Цель:** дать Moon декларативную UI-библиотеку в архитектуре TEA (View → Msg → Update → Cmd), где вызовы LLM-агентов и Storm-дебаты — это такие же команды (`Cmd`), как HTTP или таймер. Рендер — **нативный**: Win32 + Direct2D (на D3D12) + DirectWrite, без WebView и без браузерного движка. Результат: killer-example — живое desktop-приложение (панель ревью PR со Storm-дебатами агентов), которое демонстрирует весь стек языка в одном экране.

**Затронутые репозитории:** `moon-lang` (ядро + рантайм), `moon-vscode` (превью), `moon-pkg` (ui-kit пакет), `moon-setup` (без изменений — уже готов).

**Технические решения (v2, нативный рендер):**
- Окно и ввод: `WinSDK` Swift-модуль (Win32 message pump) — уже используется в реальных Swift-GUI-проектах, не экспериментальная территория.
- Рендер: **Direct2D поверх D3D12** через `D3D11On12CreateDevice` — GPU-ускорение, без ручных root signatures/PSO на каждый примитив. Текст — **DirectWrite** (шейпинг, лигатуры, IME бесплатно).
- Layout: биндинг **Yoga** (C++ flexbox-движок, MIT, ядро React Native) через C++-interop — не пишем constraint-солвер с нуля.
- OpenGL 4.5 — исключён из плана: тупиковая ветка на Windows, не переносится на будущий macOS (там нужен Metal, не GL).
- Диффинг сцены — полностью in-process в Swift, без сериализации в JSON (в отличие от webview-варианта): `Element` дерево сравнивается с retained-сценой напрямую как Swift-значения.

**Не трогать без необходимости:** `MoonLexer`, `MoonParser`, `MoonTypechecker` — грамматика `data`/`model` с ADT и параметрами типа уже поддерживает всё нужное (`Element msg`). Новый синтаксис не нужен.

---

## Phase 0 — Спека протокола (день 1, без кода)

- [x] Зафиксировать в `moon-lang/docs/ui-spec.md` (см. [ui-spec.md](ui-spec.md)): набор `Element msg` вариантов v0.1, **сознательно урезанный до того, что не требует скролла и текстового ввода** — `Text`, `Button`, `Column`, `Row`, `Rect/Card`. `Input` и `List` (со скроллом) — это исторически самые больные места любого нативного UI-тулкита (курсор, выделение, IME, virtualized scroll) — выносятся в отдельную Phase 4.5, не блокируют MVP.
- [ ] Зафиксировать внутренний контракт retained-сцены: `SceneNode` (Swift-класс/структура с bounding box из Yoga, типом примитива, ссылкой на предыдущее состояние для диффа) — никакого JSON, всё в памяти одного процесса.
- [ ] Критерий готовности: документ ревьюится и мержится до того, как написана хоть одна строка Swift-кода — protocol-first, чтобы не переписывать пайплайн на середине.

## Phase 1 — Core.UI на уровне языка (`moon-lang/stdlib/Core/UI.moon`)

- [ ] `data Element msg = Text {..} | Button {..} | Input {..} | Column {..} | Row {..} | List {..} | ProgressBar {..} | Markdown {..}`
- [ ] `data Cmd msg = NoCmd | RunAgent (Analyzer t) t (AnalysisResult t -> msg) | RunStorm StormConfig (String -> msg) | SaveFile String String msg | Delay Int msg`
- [ ] Тип `App model msg = { init :: (model, Cmd msg), update :: msg -> model -> (model, Cmd msg), view :: model -> Element msg }`
- [ ] Юнит-тесты в `Tests/` по образцу существующих golden-фикстур: `App` с тривиальным counter (`+`/`-` кнопки) — минимальный сквозной пример без агентов.
- [ ] Критерий готовности: `moon check examples/ui-counter.moon` проходит тайпчекер без ошибок (рантайм ещё не нужен на этом шаге).

## Phase 2 — Биндинг Yoga (layout)

- [x] Добавить Yoga (submodule/vendored C++, MIT) как C-таргет в `Package.swift`, обёртку `MoonYoga` — тонкий Swift-слой над C API Yoga (`YGNodeNew`, `YGNodeStyleSetFlexDirection`, `YGNodeCalculateLayout`).
- [x] Смэппить `Column`/`Row`/`Rect` из `Element msg` (Phase 1) на Yoga-ноды с их flex-свойствами (padding, gap, alignment) — минимальный набор пропов, не весь API Yoga сразу.
- [x] Критерий готовности: unit-тест — дерево `Column [Row [...], Text ...]` даёт ожидаемые прямоугольники (x,y,w,h) после `YGNodeCalculateLayout`, сверено вручную на 3–4 фикстурах.

## Phase 3 — Новый Swift-таргет `Sources/MoonUI` (окно + рендер + рантайм-цикл)

- [x] Добавить target в `Package.swift`: `MoonUI` зависит от `MoonRuntime`, `MoonYoga`, `WinSDK` (встроенный модуль Swift на Windows).
- [x] Окно и message pump: `WinSDK` (`CreateWindowExW`, `WM_PAINT`, `WM_SIZE`, `WM_LBUTTONUP`).
- [x] Рендер-девайс: Direct2D/DirectWrite через `MoonD2D` C++ bridge (`ID2D1HwndRenderTarget` + `IDWriteTextLayout`; D3D12/`D3D11On12` — следующий шаг).
- [x] Реализовать `UIRuntimeLoop`: держит `model`, вызывает `update`/`view` через `MoonRuntime`, диспетчит `NoCmd`/`Batch`/`Delay`/`SaveFile` (заглушки для `RunAgent`/`RunStorm`).
- [x] `SceneDiff`: сравнение retained-сцены, dirty rects (MVP: full-frame fallback через invalidate).
- [x] Хит-тестинг: linear scan по bounding box'ам Yoga-layout.
- [x] `moon run` ветвится на `App` → `MoonUI` вместо `runProgram`.
- [x] Критерий готовности (полный): `examples/ui-counter.moon` — нативное окно, клики, Direct2D без миганий.

## Phase 4 — Текст и дефолтная тема

- [x] `Text`/`Button` label рендерятся через DirectWrite (`IDWriteTextLayout`) — шейпинг и перенос строк бесплатно, не пишем свой text engine.
- [x] Одна встроенная палитра/шрифт/отступы (константы в `MoonUI`, не конфигурируемые в v0.1) — hover/pressed состояние кнопки как два предустановленных Direct2D brush.
- [x] Критерий готовности: скриншот `ui-counter.moon` выглядит как законченный мини-продукт (не системные серые Win32-кнопки по умолчанию).

## Phase 4.5 — Input и List/скролл (осознанно после MVP)

- [ ] `Input`: курсор, выделение текста, вставка из буфера — самая трудоёмкая часть тулкита, не входит в MVP счётчика/killer-example первой версии.
- [ ] `List` с virtualized-скроллом (рендерить только видимые элементы) — нужен для killer-example (список PR), но можно начать с простого не-виртуализированного скролла на небольших списках (десятки PR, не тысячи) и отложить виртуализацию.
- [ ] Критерий готовности: список из ~30 карточек PR скроллится без просадки FPS на интеграционном тесте.

## Phase 5 — CLI-интеграция (`Sources/MoonCLI`)

- [ ] `moon run app.moon`: если `main :: App model msg` (а не `IO ()`) — типчекер это уже видит, CLI ветвится на запуск через `MoonUI` вместо однократного do-блока.
- [ ] `moon run --watch`: файловый watcher (можно переиспользовать любой уже подключённый Swift-пакет для FS events) → на сохранение пересчитывает `view`, шлёт патч в уже открытое окно тем же каналом, без перезапуска процесса.
- [ ] Критерий готовности: правка `view`-функции и `Ctrl+S` в редакторе обновляет открытое окно за <1 сек.

## Phase 6 — moon-vscode: живой превью (опционально для MVP)

- [ ] Команда `Moon: Preview UI` — открывает панель webview прямо в редакторе, подключённую к тому же hot-reload каналу, что и `moon run --watch`.
- [ ] Критерий готовности: не блокирует релиз killer-example — можно вынести в отдельный PR после Phase 7.

## Phase 7 — moon-pkg: `ui-kit` пакет

- [ ] Добавить пакет `packages/ui-kit/` в `moon-pkg`: набор готовых композитных `view`-функций поверх `Core.UI` (карточка PR, чат-баббл вердикта агента, панель статусов Storm-раунда).
- [ ] Публикация через существующий `moon publish` / `catalog/index.json`.
- [ ] Критерий готовности: killer-example (Phase 8) подключает `ui-kit` как обычную git-зависимость через `moon vendor`, а не копипастит код.

## Phase 8 — Killer example: `code-review-storm-ui.moon`

- [ ] Взять существующий `examples/code-review-storm.moon`, обернуть в `App`:
  - `Model`: список PR, выбранный PR, статус (`Idle | Loading | Ready String`).
  - `Msg`: `PrClicked PR`, `StormFinished String`, `ApproveClicked`.
  - `view`: список PR слева (`ui-kit` карточки) + панель справа с live-статусом Storm-раунда + кнопка Approve.
  - `update`: `PrClicked` → `RunStorm`, `StormFinished` → рендер вердикта, `ApproveClicked` → `RunAgent GitHubActor` (реальный вызов `Core.GitHub`).
- [ ] Записать 30–60 сек. демо-gif для README и презентации языка.
- [ ] Критерий готовности: `moon run code-review-storm-ui.moon --no-mock` с реальным `DEEPSEEK_API_KEY` и `GITHUB_TOKEN` — полный цикл от клика до реального апрува PR на GitHub.

## Phase 9 — Документация и запуск

- [ ] Раздел "Building UIs" на `nnxlxde-stack.github.io/moon-lang`.
- [ ] Обновить README всех 4 репозиториев (таблица "Экосистема" уже есть — добавить туда `Core.UI`/killer-example).
- [ ] Пост-анонс с демо-gif — как единая точка форсинга языка.

---

## Открытые архитектурные развилки (нужно решить до Phase 3)

| Развилка | Вариант A | Вариант B | Рекомендация |
|---|---|---|---|
| Рисование 2D | Direct2D поверх D3D12 (`D3D11On12`) | Сырой D3D12 (свои PSO/шейдеры под каждый примитив) | **A** — на порядок меньше кода, текст и клиппинг бесплатно |
| Кроссплатформенность рендера | Раздельный бэкенд на ОС (Direct2D на Win, Metal на mac позже) | Единый OpenGL 4.5 везде | **A** — OpenGL депрекейтен на macOS, не даёт реальной переносимости |
| Layout | Биндинг Yoga (C++) | Свой flexbox-солвер на Swift | **A** — проверенный годами код вместо новых багов на edge-кейсах |
| Текст | DirectWrite | Свой text shaping | **A** — шейпинг/IME/лигатуры не то, что стоит писать самому |

## Что НЕ входит в этот план (сознательно вне скоупа v0.1)

- `Input` (текстовый ввод с курсором/выделением) и virtualized-скролл — вынесены в Phase 4.5, самые трудоёмкие части любого нативного тулкита
- Анимации/переходы между состояниями
- `Sub msg` (подписки на сокеты/таймеры вне `Cmd`) — если понадобится для killer-example, добавить в Phase 1 отдельным пунктом
- macOS/Linux рендер-бэкенды (Metal/Vulkan) — архитектура закладывается расширяемой (Phase 3 — отдельный протокол `RenderBackend`), но не реализуется в v0.1
- Пользовательский `Style`/theming API — тема статична до v0.2
- Accessibility (UI Automation) — важно для реального продукта, но не для killer-example; отметить как технический долг явно, не забыть

## Честная оценка объёма

Это заметно больше по объёму, чем webview-вариант — здесь нет бесплатного CSS/flex/типографики от браузерного движка. Даже с Yoga и Direct2D вместо самописных layout/рендера, реалистичный солобилд MVP (Phase 0–4, без Input/List) — это недели, а не дни. Phase 4.5 (текстовый ввод + скролл) сама по себе сопоставима по сложности со всем остальным вместе взятым — именно поэтому она явно вынесена отдельно и не блокирует первый показательный релиз.

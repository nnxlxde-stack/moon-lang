# Core.UI — спецификация протокола v0.1

**Статус:** Phase 0 (protocol-first)  
**Версия:** 0.1.0-draft  
**Связанные документы:** [moon-ui-plan.md](moon-ui-plan.md), [grammar.ebnf](grammar.ebnf)

---

## 1. Цель

`Core.UI` — декларативная GUI-библиотека для Moon в архитектуре **TEA** (The Elm Architecture):

```
Model  --view-->  Element msg
  ^                    |
  |                    v (events)
  +---update---  Msg <--+
        |
        v
      Cmd msg  --->  side effects (agents, storm, files, timers)
```

**Отличие от webview-подхода:** рендер нативный (Win32 + Direct2D/DirectWrite в v0.1), layout через Yoga, диффинг сцены in-process в Swift без JSON.

**Отличие от императивных UI-китов:** API в стиле **SwiftUI** — композиция view-функций и modifier-обёрток, состояние только в `model`, события только через типизированный `msg`.

Новый синтаксис языка **не требуется** — достаточно `data`, `model`, `function`, ADT с параметрами типа (`Element msg`).

---

## 2. SwiftUI-подобный DX (маппинг)

| SwiftUI | Moon Core.UI |
|---------|--------------|
| `protocol View` | `View msg` — соглашение: любой `Element msg` |
| `VStack` / `HStack` | `Column` / `Row` |
| `Text("hello")` | `text "hello"` или `Text { content = "hello", style = Body }` |
| `Button("OK") { ... }` | `Button { label = text "OK", onPress = OkClicked }` |
| `.padding(16)` | `padding 16 child` |
| `.font(.title)` | `font Title child` |
| `@State var n` | поле в `model` + `update` |
| `@main struct App: App` | `main :: App Model Msg` |
| `body` | `view model` |

**Почему это «лучше SwiftUI» для Moon:**

- `Cmd` объединяет UI-побочные эффекты с **LLM-агентами** и **Storm** — те же абстракции, что `IO` в остальном языке.
- `msg` типизирован на уровне ADT пользователя — нет строковых action identifier.
- View-дерево — чистое значение; hot-reload пересчитывает только `view`.

---

## 3. Модуль `Core.UI`

Расположение: `stdlib/Core/UI.moon`

Импорт в приложениях:

```moon
import Core.UI
```

---

## 4. Типы стиля и layout

```moon
data TextStyle = Title | Headline | Body | Caption | Monospace

data Color = Color
  { r :: Int
  , g :: Int
  , b :: Int
  }

data Align = AlignStart | AlignCenter | AlignEnd | AlignStretch

data MainAlign = MainStart | MainCenter | MainEnd | MainSpaceBetween
```

Константы темы v0.1 (не конфигурируются пользователем):

| Имя | Назначение |
|-----|------------|
| `colorBackground` | фон окна (`#313338`) |
| `colorSurface` | карточки (`#2b2d31`) |
| `colorAccent` | blurple (`#5865f2`) |
| `colorText` | основной текст (`#f2f3f5`) |
| `colorTextMuted` | вторичный текст (`#b5bac1`) |

---

## 5. ADT `Element msg`

Параметр `msg` — тип сообщений приложения. Каждый интерактивный виджет хранит `onPress :: msg` (или `onChange :: String -> msg` для Input).

### 5.1 MVP-рендер (v0.1 runtime)

Рантайм v0.1 **обязан** рендерить и обрабатывать ввод для:

| Конструктор | Поля | Поведение |
|-------------|------|-----------|
| `Text` | `content :: String`, `style :: TextStyle` | DirectWrite text layout |
| `Button` | `label :: Element msg`, `onPress :: msg`, `enabled :: Bool` | hit-test, hover/pressed, click → `msg` |
| `Column` | `spacing :: Int`, `padding :: Int`, `align :: Align`, `children :: [Element msg]` | Yoga flex column |
| `Row` | `spacing :: Int`, `padding :: Int`, `align :: Align`, `children :: [Element msg]` | Yoga flex row |
| `Card` | `padding :: Int`, `child :: Element msg` | фон + border-radius + тень (статичная тема) |
| `Spacer` | — | занимает свободное место по главной оси |
| `WithPadding` | `top/right/bottom/left :: Int`, `child :: Element msg` | modifier-обёртка |
| `WithFrame` | `width :: Int`, `height :: Int`, `child :: Element msg` | фиксированный размер (`0` = auto) |
| `WithForeground` | `color :: Color`, `child :: Element msg` | цвет текста/иконки |

### 5.2 Forward-declare (тайпчек v0.1, рендер Phase 4.5)

Объявлены в `Core.UI`, но рантайм v0.1 возвращает диагностику «not implemented» при попадании в draw path:

| Конструктор | Назначение |
|-------------|------------|
| `Input` | однострочный ввод: курсор, выделение, clipboard, IME |
| `List` | вертикальный список со скроллом |
| `ProgressBar` | индикатор загрузки (Storm/Agent) |
| `Markdown` | рендер вердикта агента (subset: bold, code, list) |

### 5.3 Полное определение (нормативное)

```moon
data Element msg =
    Text
      { content :: String
      , style   :: TextStyle
      }
  | Button
      { label    :: Element msg
      , onPress  :: msg
      , enabled  :: Bool
      }
  | Column
      { spacing  :: Int
      , padding  :: Int
      , align    :: Align
      , children :: [Element msg]
      }
  | Row
      { spacing  :: Int
      , padding  :: Int
      , align    :: Align
      , children :: [Element msg]
      }
  | Card
      { padding :: Int
      , child   :: Element msg
      }
  | Spacer
  | WithPadding
      { top    :: Int
      , right  :: Int
      , bottom :: Int
      , left   :: Int
      , child  :: Element msg
      }
  | WithFrame
      { width  :: Int
      , height :: Int
      , child  :: Element msg
      }
  | WithForeground
      { color :: Color
      , child :: Element msg
      }
  | Input
      { value    :: String
      , placeholder :: String
      , onChange :: String -> msg
      }
  | List
      { items    :: [Element msg]
      , scrollOffset :: Int
      , onScroll :: Int -> msg
      }
  | ProgressBar
      { progress :: Float
      }
  | Markdown
      { content :: String
      }
```

**Инварианты:**

- `Button.label` в MVP — только `Text` или композиция `WithForeground (Text ...)`.
- `children` / `items` — плоские списки; вложенность через `Column`/`Row`.
- Пустой `Column { children = [] }` допустим (zero-size).

---

## 6. Modifier-функции (SwiftUI-style)

Modifiers — обычные функции Moon, не синтаксис языка:

```moon
padding :: Int -> Element msg -> Element msg
padding n child =
    WithPadding { top = n, right = n, bottom = n, left = n, child = child }

paddingXY :: Int -> Int -> Element msg -> Element msg
paddingXY px py child =
    WithPadding { top = py, right = px, bottom = py, left = px, child = child }

frame :: Int -> Int -> Element msg -> Element msg
frame w h child =
    WithFrame { width = w, height = h, child = child }

foreground :: Color -> Element msg -> Element msg
foreground c child =
    WithForeground { color = c, child = child }

font :: TextStyle -> Element msg -> Element msg
-- применяется только к Text внутри; иначе no-op или type error на этапе check

text :: String -> Element msg
text s = Text { content = s, style = Body }
```

Композиция читается как SwiftUI:

```moon
padding 16 $
    Column { spacing = 8, padding = 0, align = AlignStart, children = [
        font Title $ text "Counter",
        text (show n)
    ]}
```

---

## 7. ADT `Cmd msg`

Команды — побочные эффекты TEA-цикла. Выполняются **после** `update`, результаты возвращаются как `msg`.

```moon
data Cmd msg =
    NoCmd
  | Batch [Cmd msg]
  | RunAgent
      { agentRef :: String
      , input    :: String
      , onResult :: String -> msg
      }
  | RunStorm
      { target       :: String
      , panel        :: [String]
      , synthesizer  :: String
      , rounds       :: Int
      , onResult     :: String -> msg
      }
  | SaveFile
      { path     :: String
      , content  :: String
      , onDone   :: msg
      }
  | Delay
      { milliseconds :: Int
      , onDone       :: msg
      }
```

| Конструктор | Семантика |
|-------------|-----------|
| `NoCmd` | ничего |
| `Batch` | последовательное выполнение (порядок сохраняется) |
| `RunAgent` | `agentRef` — имя `agent` в программе; вызов через `MoonRuntime` (`--no-mock`) |
| `RunStorm` | `panel` / `synthesizer` — имена агентов; обёртка над `storm` |
| `SaveFile` | запись через `Core.FS` / runtime FS |
| `Delay` | `SetTimer` / sleep; по истечении шлёт `onDone` |

**Инвариант:** пока выполняется `Cmd`, UI остаётся отзывчивым (message pump не блокируется); долгие операции — async на фоне, completion → очередь `msg`.

---

## 8. Тип входа `App model msg`

```moon
data App model msg = App
  { init   :: (model, Cmd msg)
  , update :: msg -> model -> (model, Cmd msg)
  , view   :: model -> Element msg
  }
```

**Точка входа:**

```moon
main :: App CounterModel CounterMsg
main = App
  { init   = (0, NoCmd)
  , update = counterUpdate
  , view   = counterView
  }
```

CLI (`moon run`) ветвится:

- `main :: IO ()` — существующий путь (`runProgram`)
- `main :: App model msg` — запуск `UIRuntimeLoop` (Windows v0.1)

---

## 9. Системные события → `msg`

Рантайм генерирует **внутренние** события; `update` получает только пользовательский `msg`.

Внутренний тип (Swift, не экспортируется в Moon):

```
SystemEvent =
  | WindowResized (width, height)
  | PointerDown (x, y, button)
  | PointerUp (x, y, button)
  | PointerMove (x, y)
  | KeyDown (keyCode, modifiers)
  | KeyChar (char)
  | CmdCompleted (cmdId, result)
  | Tick
```

Маппинг в пользовательский `msg`:

| Источник | Действие |
|----------|----------|
| Hit-test на `Button` + `PointerUp` | `onPress` |
| `Input` + `KeyChar` | `onChange` с новым value |
| `List` + scroll wheel | `onScroll` |
| `RunAgent` завершён | `onResult` |
| `RunStorm` завершён | `onResult` |
| `SaveFile` / `Delay` | `onDone` |

---

## 10. Внутренний контракт `SceneNode` (Swift)

Retained-дерево для layout + hit-test + diff. **Не сериализуется.**

```
SceneNode {
  id:           UInt64           -- стабильный id пока нода «та же» по структуре
  elementKind:  ElementKind      -- Text | Button | Column | ...
  bounds:       Rect             -- x, y, width, height (после Yoga)
  yogaNode:     YGNodeRef        -- handle в MoonYoga
  children:     [SceneNode]
  payload:      ElementPayload   -- текст, onPress msg closure, стили
  prevSnapshot: ElementHash?     -- для diff
  dirty:        Bool
}
```

### 10.1 Diff-алгоритм (v0.1)

1. `view model` → новое `Element` дерево.
2. Рекурсивное сопоставление по конструктору + позиции в `children`.
3. Изменённые ноды → `dirty = true`, bbox добавляется в `dirtyRects`.
4. Удалённые ноды → erase в dirty rect.
5. `RenderBackend` перерисовывает только `dirtyRects` (MVP: допустим full-frame fallback).

### 10.2 Hit-test (v0.1)

Linear scan по retained-дереву в порядке paint (reverse children — top-most first).  
Оптимизация R-tree — вне v0.1.

---

## 11. `RenderBackend` (мультиплатформенный контракт)

Обязательный протокол Swift — проектируется до реализации Windows.

```swift
protocol RenderBackend {
    func createSurface(windowHandle: WindowHandle, size: Size) throws
    func resize(size: Size) throws
    func beginFrame() throws
    func drawRect(_ rect: Rect, fill: Color, radius: Float, border: Border?)
    func drawText(_ text: String, rect: Rect, style: TextStyle, color: Color)
    func drawImage(_ image: ImageHandle, rect: Rect)  // stub v0.1
    func endFrame() throws
    func present() throws
}
```

| Платформа | v0.1 | Планируется |
|-----------|------|-------------|
| Windows | `WinRenderBackend` — D3D12 swapchain, D3D11On12, Direct2D, DirectWrite | — |
| macOS | stub (понятная ошибка) | `MetalRenderBackend` |
| Linux | stub (понятная ошибка) | `VulkanRenderBackend` или Skia/Vulkan |

OpenGL **не используется**.

`SceneNode` → `drawRect` / `drawText` — общий код; OS-specific только внутри бэкенда.

---

## 12. Layout (Yoga)

| `Element` | Yoga |
|-----------|------|
| `Column` | `flexDirection = column`, `gap = spacing` |
| `Row` | `flexDirection = row`, `gap = spacing` |
| `Card` / `WithPadding` | padding на ноде |
| `Text` | intrinsic size (DirectWrite measure) |
| `Button` | min height 36px, padding horizontal 12px |
| `Spacer` | `flexGrow = 1` |
| `WithFrame` | `width/height` fixed |

Корневая нода: `width/height = 100%` от клиентской области окна.

---

## 13. Hot-reload (`moon run --watch`)

1. FS watcher на `.moon` файлы проекта.
2. При сохранении: `moon check` → пересчёт `view model` (model не сбрасывается).
3. Патч через тот же канал, что `Moon: Preview UI` в vscode (localhost IPC / named pipe).
4. Latency target: **< 1 сек**.

---

## 14. Эталонный пример: `ui-counter.moon`

```moon
import Core.UI

data CounterMsg = Increment | Decrement

counterUpdate :: CounterMsg -> Int -> (Int, Cmd CounterMsg)
counterUpdate Increment n = (n + 1, NoCmd)
counterUpdate Decrement n = (n - 1, NoCmd)

counterView :: Int -> Element CounterMsg
counterView n =
    padding 24 $
    Column { spacing = 16, padding = 0, align = AlignCenter, children = [
        font Title $ text (show n),
        Row { spacing = 12, padding = 0, align = AlignCenter, children = [
            Button { label = text "-", onPress = Decrement, enabled = True },
            Button { label = text "+", onPress = Increment, enabled = True }
        ]}
    ]}

main :: App Int CounterMsg
main = App
  { init   = (0, NoCmd)
  , update = counterUpdate
  , view   = counterView
  }
```

**Критерий Phase 1:** `moon check examples/ui-counter.moon` без ошибок.  
**Критерий Phase 3:** `moon run examples/ui-counter.moon` — живое окно, клики работают.

---

## 15. Вне скоупа v0.1 (технический долг)

| Тема | Статус |
|------|--------|
| `Input` (курсор, IME, clipboard) | Phase 4.5 |
| Virtualized `List` | Phase 4.5 (MVP: простой scroll до ~30 items) |
| Анимации / transitions | v0.2+ |
| `Sub msg` (сокеты, таймеры вне Cmd) | по необходимости |
| Пользовательский `Theme` API | v0.2+ |
| Accessibility (UI Automation) | tech debt, не блокирует killer-example |
| macOS / Linux render backends | stub + протокол в v0.1 |

---

## 16. Критерии готовности Phase 0

- [x] `docs/ui-spec.md` написан и согласован с [moon-ui-plan.md](moon-ui-plan.md)
- [ ] Ревью пройдено
- [ ] Документ смержен до первой строки Swift-кода Phase 1

**Следующий шаг (PR-2):** `stdlib/Core/UI.moon` + `examples/ui-counter.moon` по этой спецификации.
-- Core.UI — declarative UI library (TEA: View / Msg / Update / Cmd)
-- Spec: docs/ui-spec.md

data TextStyle = Title | Headline | Body | Caption | Monospace

data Align = AlignStart | AlignCenter | AlignEnd | AlignStretch

data Color = Color
  { r :: Int
  , g :: Int
  , b :: Int
  }

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
      { value       :: String
      , placeholder :: String
      , onChange    :: String -> msg
      }
  | List
      { items        :: [Element msg]
      , scrollOffset :: Int
      , onScroll     :: Int -> msg
      }
  | ProgressBar
      { progress :: Float
      }
  | Markdown
      { content :: String
      }

data Cmd msg =
    NoCmd
  | Batch ([Cmd msg])
  | RunAgent
      { agentRef :: String
      , input    :: String
      , onResult :: String -> msg
      }
  | RunStorm
      { target      :: String
      , panel       :: [String]
      , synthesizer :: String
      , rounds      :: Int
      , onResult    :: String -> msg
      }
  | SaveFile
      { path    :: String
      , content :: String
      , onDone  :: msg
      }
  | Delay
      { milliseconds :: Int
      , onDone       :: msg
      }

data App model msg = App
  { init   :: (model, Cmd msg)
  , update :: msg -> model -> (model, Cmd msg)
  , view   :: model -> Element msg
  }

-- Modifier helpers (SwiftUI-style)

text :: String -> Element msg
text s = Text { content = s, style = Body }

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
font style child = child

showInt :: Int -> String
showInt _ = ""
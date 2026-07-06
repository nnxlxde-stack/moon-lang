-- Minimal Core.UI app: counter with +/- buttons (TEA)
-- Spec: docs/ui-spec.md

import Core.UI

data CounterMsg = Increment | Decrement

counterUpdate :: CounterMsg -> Int -> (Int, Cmd CounterMsg)
counterUpdate Increment n = (n + 1, NoCmd)
counterUpdate Decrement n = (n - 1, NoCmd)

counterView :: Int -> Element CounterMsg
counterView n =
    padding 24 $
    Column
      { spacing = 16
      , padding = 0
      , align = AlignCenter
      , children = [
          font Title $ text (showInt n),
          Row
            { spacing = 12
            , padding = 0
            , align = AlignCenter
            , children = [
                Button
                  { label = text "-"
                  , onPress = Decrement
                  , enabled = true
                  },
                Button
                  { label = text "+"
                  , onPress = Increment
                  , enabled = true
                  }
              ]
            }
        ]
      }

main :: App Int CounterMsg
main = App
  { init = (0, NoCmd)
  , update = counterUpdate
  , view = counterView
  }
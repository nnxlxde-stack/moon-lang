-- Input + scrollable List demo (Phase 4.5)
import Core.UI

data DemoMsg = QueryChanged (String) | Scrolled (Int)

data DemoModel = DemoModel
  { query  :: String
  , scroll :: Int
  }

demoInit :: (DemoModel, Cmd DemoMsg)
demoInit = (DemoModel { query = "", scroll = 0 }, NoCmd)

demoUpdate :: DemoMsg -> DemoModel -> (DemoModel, Cmd DemoMsg)
demoUpdate (QueryChanged q) m = (DemoModel { query = q, scroll = m.scroll }, NoCmd)
demoUpdate (Scrolled offset) m = (DemoModel { query = m.query, scroll = offset }, NoCmd)

prCard :: Int -> Element DemoMsg
prCard n =
    Card
      { padding = 12
      , child = text (showInt n)
      }

prItems :: [Element DemoMsg]
prItems =
    [ prCard 1, prCard 2, prCard 3, prCard 4, prCard 5
    , prCard 6, prCard 7, prCard 8, prCard 9, prCard 10
    , prCard 11, prCard 12, prCard 13, prCard 14, prCard 15
    , prCard 16, prCard 17, prCard 18, prCard 19, prCard 20
    , prCard 21, prCard 22, prCard 23, prCard 24, prCard 25
    , prCard 26, prCard 27, prCard 28, prCard 29, prCard 30
    ]

demoView :: DemoModel -> Element DemoMsg
demoView state =
    padding 16 $
    Column
      { spacing = 12
      , padding = 0
      , align = AlignStretch
      , children = [
          font Headline $ text "PR inbox",
          Input
            { value = state.query
            , placeholder = "Search PRs..."
            , onChange = QueryChanged
            },
          frame 0 320 $
            List
              { items = prItems
              , scrollOffset = state.scroll
              , onScroll = Scrolled
              }
        ]
      }

main :: App DemoModel DemoMsg
main = App
  { init = demoInit
  , update = demoUpdate
  , view = demoView
  }
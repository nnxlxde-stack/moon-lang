-- =============================================
-- Moon Language — суммаризация документации
-- =============================================

import Core.Memory
import Core.Tools

model SummaryResult where
  title      :: String
  summary    :: String
  keyPoints  :: [String]
  confidence :: Float           constraint: between 0.0 1.0

agent DocSummarizer :: Analyzer Documentation
  model: deepseek-v4-flash
  temperature: 0.2
  systemPrompt: """
    Ты технический редактор. Сжимай документацию до ясного резюме
    с ключевыми пунктами для команды разработки.
  """

summarizeDoc :: Analyzer Documentation -> Documentation -> IO (SummaryResult)
summarizeDoc analyzer doc = do
    context <- recall "project-knowledge"
    
    result <- analyzer.analyze doc
        with context: context
             maxTokens: 4000

    pure $ SummaryResult
        { title = "Documentation summary"
        , summary = result.summary
        , keyPoints = []
        , confidence = result.confidence
        }

main :: IO ()
main = do
    memory LongTerm "project-knowledge"

    docs <- fetchUpdatedDocs "docs/"

    summaries <- mapM (summarizeDoc DocSummarizer) docs

    combinedReport <- generateCombinedReport summaries summaries

    saveToFile "reports/doc-summary.md" combinedReport
    postToSlack combinedReport
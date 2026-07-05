-- =============================================
-- Moon Language — проверка требований (Requirements)
-- =============================================

import Core.Memory
import Core.Tools

model RequirementsReport where
  documentId   :: String
  ambiguity    :: Float           constraint: between 0.0 1.0
  testability  :: Float           constraint: between 0.0 1.0
  consistency  :: Float           constraint: between 0.0 1.0
  summary      :: String
  blockers     :: [String]

agent RequirementsChecker :: Analyzer Requirements
  model: deepseek-v4-pro
  temperature: 0.2
  systemPrompt: """
    Ты аналитик требований. Оцени неоднозначность, тестируемость
    и согласованность. Выделяй блокеры для релиза.
  """

checkRequirements :: Analyzer Requirements -> Requirements -> IO (RequirementsReport)
checkRequirements checker req = do
    context <- recall "project-knowledge"

    result <- checker.analyze req
        with context: context
             maxTokens: 8000
             focus: ["ambiguity", "testability", "consistency"]

    pure $ RequirementsReport
        { documentId = "requirements-doc"
        , ambiguity = result.confidence
        , testability = result.confidence
        , consistency = result.confidence
        , summary = result.summary
        , blockers = []
        }

main :: IO ()
main = do
    memory LongTerm "project-knowledge"

    specs <- fetchUpdatedDocs "specs/"

    reports <- mapM (checkRequirements RequirementsChecker) specs

    combined <- generateCombinedReport reports reports
    saveToFile "reports/requirements-check.md" combined
    postToSlack combined
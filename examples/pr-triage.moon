-- =============================================
-- Moon Language — быстрый triage Pull Request'ов
-- =============================================

import Core.GitHub
import Core.Tools

model TriageResult where
  prId         :: String
  priority     :: String
  shouldReview :: Bool
  reason       :: String

agent PRTriageAgent :: Analyzer PullRequest
  model: deepseek-v4-flash
  temperature: 0.15
  systemPrompt: """
    Ты release-менеджер. Оцени PR: приоритет, нужен ли полный review,
    краткое обоснование. Отвечай структурированно.
  """

triagePR :: Analyzer PullRequest -> PullRequest -> IO (TriageResult)
triagePR triageAgent pr = do
    result <- triageAgent.analyze pr
        with maxTokens: 2000
             focus: ["priority", "risk"]

    pure $ TriageResult
        { prId = "pull-request"
        , priority = "normal"
        , shouldReview = true
        , reason = result.summary
        }

main :: IO ()
main = do
    openPRs <- fetchOpenPRs "org/repo"
        filter: (not . isDraft)

    triaged <- mapM (triagePR PRTriageAgent) openPRs

    report <- generateReviewReport triaged
    saveToFile "reports/pr-triage.md" report
    postSummaryToSlack triaged
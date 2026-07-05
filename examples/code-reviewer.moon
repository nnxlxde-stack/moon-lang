-- =============================================
-- The Moon Language - Intelligent Code Reviewer
-- =============================================

import Core.GitHub
import Core.Memory
import Core.Tools
import Core.Analyzers

-- ==================== МОДЕЛИ ====================

model ReviewResult t where
  findings  :: [Finding t]
  verdict   :: Verdict
  summary   :: String
  confidence:: Float        constraint: between 0.0 1.0
  suggestions :: [Suggestion]

data Verdict = Approved | ChangesRequested | MajorRefactoring | SecurityIssue

data Finding a = Finding
  { location   :: Location
  , severity   :: Severity
  , description:: String
  , category   :: Category a
  }

-- ==================== АГЕНТЫ ====================

-- Общий шаблон ревьюера
agent GenericReviewer t :: Reviewer t where
  model: deepseek-v4-pro
  temperature: 0.22

-- Специализация для кода (C++)
agent CodeReviewer :: Reviewer Code
  model: deepseek-v4-pro
  temperature: 0.18
  systemPrompt: """
    Ты senior software engineer с 15-летним опытом. 
    Особое внимание уделяй архитектуре, безопасности, производительности 
    и чистоте кода.
  """

-- Специализация для Pull Request'ов
agent PRReviewer :: Reviewer PullRequest
  model: deepseek-v4-pro
  focus: ["security", "architecture", "maintainability", "testing"]

-- ==================== ОСНОВНАЯ ЛОГИКА ====================

main :: IO ()
main = do
    memory LongTerm "project-knowledge" 

    openPRs <- fetchOpenPRs "org/repo" 
        filter: (not . isDraft)

    results <- mapM reviewPullRequest openPRs

    generateReviewReport results >>= saveToFile "reviews/report.md"
    postSummaryToSlack results

    when (hasCriticalIssues results) $
        notifyTeamLeads results

-- ==================== ОСНОВНАЯ ФУНКЦИЯ ====================

reviewPullRequest :: PullRequest -> IO (ReviewResult PullRequest)
reviewPullRequest pr = do
    files <- fetchChangedFiles pr

    -- Используем специализацию
    fileReviews <- mapM reviewFile files

    combined <- CodeReviewer.analyze files
        with context: (recall "project-knowledge")
             maxTokens: 12000

    verdict <- decideOverallVerdict fileReviews combined

    pure $ ReviewResult
        { findings   = collectFindings fileReviews
        , verdict    = verdict
        , summary    = generateSummary combined
        , confidence = calculateConfidence fileReviews
        , suggestions= extractSuggestions combined
        }

-- Специализированная функция для отдельных файлов
reviewFile :: ChangedFile -> IO (ReviewResult Code)
reviewFile file = do
    content <- readFile file.path
    
    CodeReviewer.analyze content
        with language: (detectLanguage file)
             previousVersion: file.previousContent
             focus: ["bugs", "performance", "security", "style"]

-- ==================== МЕТАПРОГРАММИРОВАНИЕ ====================

-- Автоматическая генерация ревьюера для нового типа
deriveReviewer :: Entity -> Agent
deriveReviewer Documentation = 
    agent DocsReviewer :: Reviewer Documentation where
      model: deepseek-v4-flash
      style: "formal"

deriveReviewer Requirements =
    agent ReqReviewer :: Reviewer Requirements where
      model: deepseek-v4-pro
      focus: ["consistency", "testability", "clarity"]

-- Применяем
autoReviewers = map deriveReviewer [Code, Documentation, Requirements]
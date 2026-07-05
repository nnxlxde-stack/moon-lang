-- =============================================
-- The Moon Language
-- Универсальный анализатор + специализации
-- =============================================

import Core.GitHub
import Core.Memory
import Core.Tools
import Core.Analyzers

-- ==================== БАЗОВЫЕ ШАБЛОНЫ ====================

model AnalysisResult t where
  item       :: t
  findings   :: [Finding t]
  score      :: Float           constraint: between 0.0 100.0
  summary    :: String
  confidence :: Float           constraint: between 0.0 1.0
  recommendations :: [Recommendation t]

-- Общий шаблон анализатора
agent GenericAnalyzer t :: Analyzer t where
  model: deepseek-v4-pro
  temperature: 0.25

-- ==================== СПЕЦИАЛИЗАЦИИ ====================

-- Специализация для кода
agent CodeAnalyzer :: Analyzer Code
  model: deepseek-v4-pro
  temperature: 0.18
  systemPrompt: """
    Ты эксперт по код-ревью с 15-летним опытом. 
    Ищи проблемы архитектуры, безопасности, производительности и стиля.
  """

-- Специализация для документации
agent DocsAnalyzer :: Analyzer Documentation
  model: deepseek-v4-flash
  temperature: 0.3
  systemPrompt: """
    Ты технический писатель и архитектор документации.
    Проверяй полноту, ясность, актуальность и соответствие стандартам.
  """

-- Специализация для требований (Requirements)
agent RequirementsAnalyzer :: Analyzer Requirements
  model: deepseek-v4-pro
  focus: ["ambiguity", "testability", "consistency", "completeness"]

-- ==================== МЕТАПРОГРАММИРОВАНИЕ ====================

--? Шаблонная функция для анализа
analyze :: Analyzer t -> t -> IO (AnalysisResult t)
analyze analyzer item = do
    context <- recall "project-knowledge"
    
    result <- analyzer.analyze item
        with context: context
             maxTokens: 10000
             previousVersion: (getPreviousVersion item)
    
    pure $ AnalysisResult
        { item = item
        , findings = result.findings
        , score = calculateScore result
        , summary = result.summary
        , confidence = result.confidence
        , recommendations = extractRecommendations result
        }

-- ==================== ОСНОВНАЯ ПРОГРАММА ====================

main :: IO ()
main = do
    memory LongTerm "project-knowledge"

    -- Анализ Pull Request'ов (используем специализацию CodeAnalyzer)
    prs <- fetchOpenPRs "org/repo"
    
    codeReviews <- mapM (analyze CodeAnalyzer) prs

    -- Анализ документации (используем DocsAnalyzer)
    docs <- fetchUpdatedDocs "docs/"
    docsReviews <- mapM (analyze DocsAnalyzer) docs

    -- Генерация общего отчёта
    combinedReport <- generateCombinedReport codeReviews docsReviews
    
    saveToFile "reports/weekly-analysis.md" combinedReport
    postToSlack combinedReport

    when (hasCriticalFindings codeReviews) $
        escalateCriticalIssues codeReviews
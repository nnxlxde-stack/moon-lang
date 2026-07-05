-- Brainstorm/debate storm: panel agents discuss, synthesizer merges


import Core.Tools

agent SecurityReviewer :: Analyzer Code
    model: deepseek-v4-flash
    role: "security auditor"
    systemPrompt: "Focus on vulnerabilities and unsafe patterns."

agent ArchitectReviewer :: Analyzer Code
    model: deepseek-v4-flash
    role: "software architect"
    systemPrompt: "Focus on structure, coupling, and maintainability."

agent LeadSynthesizer :: Analyzer Code
    model: deepseek-v4-pro
    role: "lead reviewer"
    systemPrompt: "Merge peer perspectives into one actionable verdict."

main :: IO ()
main  = do
    consensus <- storm "src/main.cpp"
        with panel: [SecurityReviewer, ArchitectReviewer]
             synthesizer: LeadSynthesizer
             rounds: 2
    saveToFile "reports/storm-review.md" "storm-complete"

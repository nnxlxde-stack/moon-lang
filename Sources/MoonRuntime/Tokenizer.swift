import Foundation

public func estimateTokensFromText(_ text: String, model: String, pricing: PricingTable) -> Int {
    let rates = pricing[model]?.token
        ?? pricing["deepseek-v4-pro"]?.token
        ?? ModelPricing.TokenRates(english_character: 0.3, chinese_character: 0.6)

    var tokens = 0.0
    for char in text {
        if ("\u{4E00}"..."\u{9FFF}").contains(char) {
            tokens += rates.chinese_character
        } else {
            tokens += rates.english_character
        }
    }
    return Int(ceil(tokens))
}

public func countTokens(_ text: String, model: String, pricing: PricingTable) -> Int {
    estimateTokensFromText(text, model: model, pricing: pricing)
}
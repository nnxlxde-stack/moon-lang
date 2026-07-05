import Foundation

public enum DeepSeekApiFormat: String, Sendable {
    case openai
    case anthropic
}

public struct ResolvedDeepSeekApi: Sendable {
    public var format: DeepSeekApiFormat
    public var baseUrl: String
    public var endpoint: String
    public var useBeta: Bool
}

public let deepSeekOpenAiBase = "https://api.deepseek.com"
public let deepSeekAnthropicBase = "https://api.deepseek.com/anthropic"
public let deepSeekBetaBase = "https://api.deepseek.com/beta"

public func detectApiFormat(_ baseUrl: String) -> DeepSeekApiFormat {
    baseUrl.contains("/anthropic") ? .anthropic : .openai
}

public func normalizeBaseUrl(_ baseUrl: String) -> String {
    var url = baseUrl.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
    if url.hasSuffix("/v1") {
        url = String(url.dropLast(3))
    }
    return url
}

public func resolveDeepSeekApi(
    baseUrl: String? = nil,
    apiFormat: DeepSeekApiFormat? = nil,
    useBeta: Bool? = nil
) -> ResolvedDeepSeekApi {
    let envBeta = ProcessInfo.processInfo.environment["DEEPSEEK_USE_BETA"] == "true"
        || ProcessInfo.processInfo.environment["DEEPSEEK_USE_BETA"] == "1"

    let envFormatRaw = ProcessInfo.processInfo.environment["DEEPSEEK_API_FORMAT"]?.lowercased()
    let formatFromEnv: DeepSeekApiFormat? = envFormatRaw == "anthropic" ? .anthropic
        : envFormatRaw == "openai" ? .openai
        : nil

    var resolvedBase = normalizeBaseUrl(
        baseUrl
            ?? ProcessInfo.processInfo.environment["DEEPSEEK_BASE_URL"]
            ?? deepSeekAnthropicBase
    )

    var format = apiFormat ?? formatFromEnv ?? detectApiFormat(resolvedBase)
    let beta = useBeta ?? envBeta

    if beta && format == .openai {
        resolvedBase = deepSeekBetaBase
    }

    if format == .anthropic && !resolvedBase.contains("/anthropic") {
        resolvedBase = deepSeekAnthropicBase
    }

    let endpoint = format == .anthropic ? "/v1/messages" : "/chat/completions"
    return ResolvedDeepSeekApi(format: format, baseUrl: resolvedBase, endpoint: endpoint, useBeta: beta && format == .openai)
}
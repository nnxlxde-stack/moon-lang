export type DeepSeekApiFormat = "openai" | "anthropic";

export interface ResolvedDeepSeekApi {
  format: DeepSeekApiFormat;
  baseUrl: string;
  endpoint: string;
  useBeta: boolean;
}

export const DEEPSEEK_OPENAI_BASE = "https://api.deepseek.com";
export const DEEPSEEK_ANTHROPIC_BASE = "https://api.deepseek.com/anthropic";
export const DEEPSEEK_BETA_BASE = "https://api.deepseek.com/beta";

export function detectApiFormat(baseUrl: string): DeepSeekApiFormat {
  if (baseUrl.includes("/anthropic")) return "anthropic";
  return "openai";
}

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "").replace(/\/v1$/, "");
}

export function resolveDeepSeekApi(options: {
  baseUrl?: string;
  apiFormat?: DeepSeekApiFormat;
  useBeta?: boolean;
}): ResolvedDeepSeekApi {
  const envBeta = process.env.DEEPSEEK_USE_BETA === "true" || process.env.DEEPSEEK_USE_BETA === "1";
  const useBeta = options.useBeta ?? envBeta;

  const envFormat = process.env.DEEPSEEK_API_FORMAT?.toLowerCase();
  const formatFromEnv = envFormat === "anthropic" || envFormat === "openai"
    ? envFormat
    : undefined;

  let baseUrl = normalizeBaseUrl(
    options.baseUrl
    ?? process.env.DEEPSEEK_BASE_URL
    ?? DEEPSEEK_ANTHROPIC_BASE,
  );

  let format = options.apiFormat ?? formatFromEnv ?? detectApiFormat(baseUrl);

  if (useBeta && format === "openai") {
    baseUrl = DEEPSEEK_BETA_BASE;
  }

  if (format === "anthropic" && !baseUrl.includes("/anthropic")) {
    baseUrl = DEEPSEEK_ANTHROPIC_BASE;
  }

  const endpoint = format === "anthropic" ? "/v1/messages" : "/chat/completions";

  return { format, baseUrl, endpoint, useBeta: useBeta && format === "openai" };
}
import type { JsonSchema } from "@moon/schema-compiler";
import type { LlmClient, LlmRequest, TokenUsage } from "./llm-types";
import { LlmApiError, LlmValidationError } from "./llm-types";
import type { MetricsCollector } from "./metrics";
import { countTokens } from "./tokenizer";
import type { PricingTable } from "./pricing";
import { validateAgainstSchema } from "./validate-schema";
import {
  type DeepSeekApiFormat,
  resolveDeepSeekApi,
} from "./deepseek-api";

export type { DeepSeekApiFormat };

export interface DeepSeekClientConfig {
  apiKey: string;
  baseUrl?: string;
  apiFormat?: DeepSeekApiFormat;
  useBeta?: boolean;
  maxRepairAttempts?: number;
  fetchImpl?: typeof fetch;
  metrics?: MetricsCollector;
  pricing?: PricingTable;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
      reasoning?: string | null;
      reasoning_content?: string | null;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    prompt_cache_hit_tokens?: number;
    prompt_cache_miss_tokens?: number;
    total_tokens?: number;
  };
}

interface AnthropicMessageResponse {
  content?: Array<{ type?: string; text?: string }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };
}

export function createDeepSeekClient(config: DeepSeekClientConfig): LlmClient & { attempts: number } {
  const api = resolveDeepSeekApi(config);
  const fetchImpl = config.fetchImpl ?? fetch;
  const maxRepairAttempts = config.maxRepairAttempts ?? 1;
  let attempts = 0;

  return {
    get attempts() {
      return attempts;
    },
    async complete(req: LlmRequest): Promise<unknown> {
      const messages = buildMessages(req);
      let lastError: LlmValidationError | undefined;
      let repairHint: string | undefined;

      for (let attempt = 0; attempt <= maxRepairAttempts; attempt++) {
        attempts++;
        const attemptCount = attempts;

        const { payload, raw } = api.format === "anthropic"
          ? await callAnthropic(api, config, req, messages, repairHint, fetchImpl)
          : await callOpenAi(api, config, req, messages, repairHint, fetchImpl);

        try {
          const parsed = parseJsonContent(raw);
          validateAgainstSchema(req.schema, parsed);

          const usage = api.format === "anthropic"
            ? usageFromAnthropic(payload as AnthropicMessageResponse, req, raw, config.pricing)
            : usageFromOpenAi(payload as ChatCompletionResponse, req, raw, config.pricing);

          config.metrics?.recordLlmUsage(req.model, usage, attemptCount);
          return parsed;
        } catch (err) {
          if (!(err instanceof LlmValidationError)) throw err;
          lastError = err;
          repairHint = err.message;
          if (attempt >= maxRepairAttempts) break;
        }
      }

      throw lastError ?? new LlmValidationError("Failed to obtain valid LLM response");
    },
  };
}

async function callOpenAi(
  api: ReturnType<typeof resolveDeepSeekApi>,
  config: DeepSeekClientConfig,
  req: LlmRequest,
  messages: ChatMessage[],
  repairHint: string | undefined,
  fetchImpl: typeof fetch,
): Promise<{ payload: ChatCompletionResponse; raw: string }> {
  const body = buildOpenAiRequestBody(req, messages, repairHint, api.useBeta);
  const response = await fetchImpl(`${api.baseUrl}${api.endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new LlmApiError(`DeepSeek API error ${response.status}: ${text}`, response.status);
  }

  const payload = (await response.json()) as ChatCompletionResponse;
  return { payload, raw: extractOpenAiContent(payload) };
}

async function callAnthropic(
  api: ReturnType<typeof resolveDeepSeekApi>,
  config: DeepSeekClientConfig,
  req: LlmRequest,
  messages: ChatMessage[],
  repairHint: string | undefined,
  fetchImpl: typeof fetch,
): Promise<{ payload: AnthropicMessageResponse; raw: string }> {
  const body = buildAnthropicRequestBody(req, messages, repairHint);
  const response = await fetchImpl(`${api.baseUrl}${api.endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new LlmApiError(`DeepSeek Anthropic API error ${response.status}: ${text}`, response.status);
  }

  const payload = (await response.json()) as AnthropicMessageResponse;
  return { payload, raw: extractAnthropicContent(payload) };
}

function usageFromOpenAi(
  payload: ChatCompletionResponse,
  req: LlmRequest,
  rawOutput: string,
  pricing?: PricingTable,
): TokenUsage {
  const usage = payload.usage;
  if (usage) {
    const cacheHit = usage.prompt_cache_hit_tokens ?? 0;
    const cacheMiss = usage.prompt_cache_miss_tokens
      ?? Math.max(0, (usage.prompt_tokens ?? 0) - cacheHit);
    return {
      prompt: usage.prompt_tokens ?? cacheHit + cacheMiss,
      completion: usage.completion_tokens ?? 0,
      cacheHit,
      cacheMiss,
    };
  }

  if (!pricing) {
    return { prompt: 0, completion: 0, cacheHit: 0, cacheMiss: 0 };
  }

  const promptText = JSON.stringify(buildMessages(req));
  return {
    prompt: countTokens(promptText, req.model, pricing),
    completion: countTokens(rawOutput, req.model, pricing),
    cacheHit: 0,
    cacheMiss: countTokens(promptText, req.model, pricing),
  };
}

function usageFromAnthropic(
  payload: AnthropicMessageResponse,
  req: LlmRequest,
  rawOutput: string,
  pricing?: PricingTable,
): TokenUsage {
  const usage = payload.usage;
  if (usage) {
    const cacheHit = usage.cache_read_input_tokens ?? 0;
    const prompt = usage.input_tokens ?? 0;
    return {
      prompt,
      completion: usage.output_tokens ?? 0,
      cacheHit,
      cacheMiss: Math.max(0, prompt - cacheHit),
    };
  }

  if (!pricing) {
    return { prompt: 0, completion: 0, cacheHit: 0, cacheMiss: 0 };
  }

  const promptText = JSON.stringify(buildMessages(req));
  return {
    prompt: countTokens(promptText, req.model, pricing),
    completion: countTokens(rawOutput, req.model, pricing),
    cacheHit: 0,
    cacheMiss: countTokens(promptText, req.model, pricing),
  };
}

function buildMessages(req: LlmRequest): ChatMessage[] {
  if (req.messages?.length) {
    return req.messages.map((m) => ({ role: m.role, content: m.content }));
  }

  const messages: ChatMessage[] = [];
  const system = req.systemPrompt
    ?? "You are a Moon language agent. Respond with JSON only, matching the provided schema.";
  messages.push({ role: "system", content: system });
  messages.push({
    role: "user",
    content: JSON.stringify({ input: req.input, config: req.config }, null, 2),
  });
  return messages;
}

function buildOpenAiRequestBody(
  req: LlmRequest,
  messages: ChatMessage[],
  repairHint?: string,
  useBeta?: boolean,
) {
  const finalMessages = [...messages];
  if (repairHint) {
    finalMessages.push({
      role: "user",
      content: `Your previous response failed validation: ${repairHint}. Return ONLY valid JSON matching the schema.`,
    });
  }

  const temperature = req.temperature ?? (typeof req.config.temperature === "number" ? req.config.temperature : 0.25);
  const maxTokens = typeof req.config.maxTokens === "number" ? req.config.maxTokens : undefined;

  return {
    model: req.model,
    messages: finalMessages,
    temperature,
    ...(maxTokens !== undefined ? { max_tokens: maxTokens } : {}),
    response_format: {
      type: "json_schema",
      json_schema: {
        name: `${req.agent}Output`,
        strict: true,
        schema: toStrictJsonSchema(req.schema),
      },
    },
    ...(useBeta ? { thinking: { type: "enabled" } } : {}),
  };
}

function buildAnthropicRequestBody(
  req: LlmRequest,
  messages: ChatMessage[],
  repairHint?: string,
) {
  const systemParts = messages.filter((m) => m.role === "system").map((m) => m.content);
  const userParts = messages.filter((m) => m.role !== "system");

  const schemaHint = `Respond with valid JSON only, matching this schema:\n${JSON.stringify(toStrictJsonSchema(req.schema), null, 2)}`;
  const system = [...systemParts, schemaHint].join("\n\n");

  const anthropicMessages = userParts.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: [{ type: "text", text: m.content }],
  }));

  if (repairHint) {
    anthropicMessages.push({
      role: "user",
      content: [{ type: "text", text: `Your previous response failed validation: ${repairHint}. Return ONLY valid JSON.` }],
    });
  }

  const temperature = req.temperature ?? (typeof req.config.temperature === "number" ? req.config.temperature : 0.25);
  const maxTokens = typeof req.config.maxTokens === "number" ? req.config.maxTokens : 4096;

  return {
    model: req.model,
    max_tokens: maxTokens,
    system,
    messages: anthropicMessages,
    temperature,
  };
}

function toStrictJsonSchema(schema: JsonSchema): Record<string, unknown> {
  const result: Record<string, unknown> = { type: schema.type ?? "object" };
  if (schema.properties) {
    result.properties = schema.properties;
    result.required = schema.required ?? Object.keys(schema.properties);
    result.additionalProperties = false;
  }
  if (schema.items) result.items = schema.items;
  if (schema.enum) result.enum = schema.enum;
  if (schema.minimum !== undefined) result.minimum = schema.minimum;
  if (schema.maximum !== undefined) result.maximum = schema.maximum;
  return result;
}

export function extractOpenAiContent(payload: ChatCompletionResponse): string {
  const message = payload.choices?.[0]?.message;
  if (!message) return "";

  const content = message.content?.trim();
  if (content) return content;

  const reasoning = message.reasoning_content?.trim() || message.reasoning?.trim();
  if (reasoning) return reasoning;

  return "";
}

export function extractAnthropicContent(payload: AnthropicMessageResponse): string {
  const parts = payload.content ?? [];
  return parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text!)
    .join("\n")
    .trim();
}

/** @deprecated use extractOpenAiContent */
export function extractContent(payload: ChatCompletionResponse): string {
  return extractOpenAiContent(payload);
}

export function parseJsonContent(raw: string): unknown {
  if (!raw) {
    throw new LlmValidationError("Empty LLM response");
  }

  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced?.[1]) {
      return JSON.parse(fenced[1].trim());
    }
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new LlmValidationError("Response is not valid JSON", raw);
  }
}
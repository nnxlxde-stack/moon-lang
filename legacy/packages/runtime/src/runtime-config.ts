import { createDeepSeekClient } from "./deepseek-client";
import { createMockLlm } from "./mock-llm";
import type { LlmClient } from "./llm-types";
import { parseMemoryBackendUri } from "./file-memory-backend";
import type { MetricsCollector } from "./metrics";
import {
  concurrencyForModel,
  loadPricingTable,
  type PricingTable,
} from "./pricing";

export interface RuntimeConfig {
  useMock: boolean;
  apiKey?: string;
  baseUrl?: string;
  apiFormat?: "openai" | "anthropic";
  useBeta?: boolean;
  maxRepairAttempts: number;
  longTermMemoryPath?: string;
  flashConcurrency: number;
  proConcurrency: number;
  pricing: PricingTable;
  pricingPath?: string;
}

export interface RuntimeConfigOverrides {
  mock?: boolean;
  apiKey?: string;
  baseUrl?: string;
  apiFormat?: "openai" | "anthropic";
  useBeta?: boolean;
  maxRepairAttempts?: number;
  memoryPath?: string;
  pricingPath?: string;
  flashConcurrency?: number;
  proConcurrency?: number;
}

export function loadRuntimeConfig(overrides: RuntimeConfigOverrides = {}): RuntimeConfig {
  const apiKey = overrides.apiKey ?? process.env.DEEPSEEK_API_KEY;
  const forceMock = overrides.mock === true;
  const useMock = forceMock || !apiKey;

  const memoryUri = overrides.memoryPath
    ?? process.env.MOON_MEMORY_PATH
    ?? "file://.moon/memory";

  const pricingPath = overrides.pricingPath ?? process.env.MOON_PRICING_PATH;
  const pricing = loadPricingTable(pricingPath);

  const flashRequested = Number(
    overrides.flashConcurrency ?? process.env.MOON_FLASH_CONCURRENCY ?? 20,
  );
  const proRequested = Number(
    overrides.proConcurrency ?? process.env.MOON_PRO_CONCURRENCY ?? 5,
  );

  const apiFormat = overrides.apiFormat
    ?? (process.env.DEEPSEEK_API_FORMAT === "openai" || process.env.DEEPSEEK_API_FORMAT === "anthropic"
      ? process.env.DEEPSEEK_API_FORMAT
      : undefined);

  const useBeta = overrides.useBeta
    ?? (process.env.DEEPSEEK_USE_BETA === "true" || process.env.DEEPSEEK_USE_BETA === "1");

  return {
    useMock,
    apiKey,
    baseUrl: overrides.baseUrl ?? process.env.DEEPSEEK_BASE_URL,
    apiFormat,
    useBeta,
    maxRepairAttempts: Number(
      overrides.maxRepairAttempts ?? process.env.MOON_MAX_REPAIR_ATTEMPTS ?? 1,
    ),
    longTermMemoryPath: parseMemoryBackendUri(memoryUri),
    flashConcurrency: concurrencyForModel("deepseek-v4-flash", pricing, flashRequested),
    proConcurrency: concurrencyForModel("deepseek-v4-pro", pricing, proRequested),
    pricing,
    pricingPath,
  };
}

export function createLlmClient(
  config: RuntimeConfig,
  metrics?: MetricsCollector,
): LlmClient {
  if (config.useMock) {
    return createMockLlm({
      maxRetries: config.maxRepairAttempts,
      metrics,
      pricing: config.pricing,
    });
  }
  return createDeepSeekClient({
    apiKey: config.apiKey!,
    baseUrl: config.baseUrl,
    apiFormat: config.apiFormat,
    useBeta: config.useBeta,
    maxRepairAttempts: config.maxRepairAttempts,
    metrics,
    pricing: config.pricing,
  });
}
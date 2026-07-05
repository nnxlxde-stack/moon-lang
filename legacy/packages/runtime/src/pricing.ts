import { readFileSync } from "fs";
import { join } from "path";

export interface ModelPricing {
  token: {
    english_character: number;
    chinese_character: number;
  };
  "price-by-million-tokens-in-dollars": {
    "cache-hit": number;
    "cache-miss": number;
    output: number;
  };
  "concurency-limit": number;
}

export type PricingTable = Record<string, ModelPricing>;

const DEFAULT_PRICING: PricingTable = {
  "deepseek-v4-flash": {
    token: { english_character: 0.3, chinese_character: 0.6 },
    "price-by-million-tokens-in-dollars": {
      "cache-hit": 0.0028,
      "cache-miss": 0.14,
      output: 0.28,
    },
    "concurency-limit": 2500,
  },
  "deepseek-v4-pro": {
    token: { english_character: 0.3, chinese_character: 0.6 },
    "price-by-million-tokens-in-dollars": {
      "cache-hit": 0.003625,
      "cache-miss": 0.435,
      output: 0.87,
    },
    "concurency-limit": 500,
  },
};

export function loadPricingTable(path?: string): PricingTable {
  const resolved = path ?? join(import.meta.dir, "../../../docs/model-pricing.json");
  try {
    return JSON.parse(readFileSync(resolved, "utf-8")) as PricingTable;
  } catch {
    return DEFAULT_PRICING;
  }
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  cacheHit: number;
  cacheMiss: number;
}

export function estimateCostUsd(model: string, usage: TokenUsage, pricing: PricingTable): number {
  const rates = pricing[model]?.["price-by-million-tokens-in-dollars"];
  if (!rates) return 0;

  const cacheHit = usage.cacheHit;
  const cacheMiss = usage.cacheMiss > 0 ? usage.cacheMiss : Math.max(0, usage.prompt - cacheHit);
  const output = usage.completion;

  return (
    (cacheHit / 1_000_000) * rates["cache-hit"]
    + (cacheMiss / 1_000_000) * rates["cache-miss"]
    + (output / 1_000_000) * rates.output
  );
}

export function concurrencyForModel(
  model: string,
  pricing: PricingTable,
  configured: number,
): number {
  const limit = pricing[model]?.["concurency-limit"] ?? configured;
  return Math.min(configured, limit);
}

export function estimateTokensFromText(text: string, model: string, pricing: PricingTable): number {
  const rates = pricing[model]?.token ?? DEFAULT_PRICING["deepseek-v4-pro"]!.token;
  let tokens = 0;

  for (const char of text) {
    if (/[\u4e00-\u9fff]/.test(char)) {
      tokens += rates.chinese_character;
    } else {
      tokens += rates.english_character;
    }
  }

  return Math.ceil(tokens);
}
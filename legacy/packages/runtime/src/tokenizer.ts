import { readFileSync } from "fs";
import { join } from "path";
import { Tokenizer } from "@huggingface/tokenizers";
import { estimateTokensFromText, type PricingTable } from "./pricing";

let cachedTokenizer: Tokenizer | null = null;
let loadError: Error | null = null;

export function defaultTokenizerPath(): string {
  return join(import.meta.dir, "../../../deepseek-tokenizer/tokenizer.json");
}

export function loadDeepSeekTokenizer(path = defaultTokenizerPath()): Tokenizer | null {
  if (cachedTokenizer) return cachedTokenizer;
  if (loadError) return null;

  try {
    const data = JSON.parse(readFileSync(path, "utf-8"));
    cachedTokenizer = new Tokenizer(data, {});
    return cachedTokenizer;
  } catch (err) {
    loadError = err instanceof Error ? err : new Error(String(err));
    return null;
  }
}

export function countTokens(text: string, model: string, pricing: PricingTable): number {
  const tokenizer = loadDeepSeekTokenizer();
  if (tokenizer) {
    try {
      return tokenizer.encode(text).ids.length;
    } catch {
      // fall through to character estimate
    }
  }
  return estimateTokensFromText(text, model, pricing);
}

export function resetTokenizerCache(): void {
  cachedTokenizer = null;
  loadError = null;
}
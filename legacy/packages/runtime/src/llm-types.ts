import type { JsonSchema } from "@moon/schema-compiler";

export interface LlmChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LlmRequest {
  agent: string;
  model: string;
  input: unknown;
  schema: JsonSchema;
  config: Record<string, unknown>;
  systemPrompt?: string;
  messages?: LlmChatMessage[];
  temperature?: number;
  stormRound?: number;
  delegateChain?: string[];
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  cacheHit: number;
  cacheMiss: number;
}

export interface LlmClient {
  complete(req: LlmRequest): Promise<unknown>;
}

export class LlmValidationError extends Error {
  constructor(
    message: string,
    public readonly raw?: string,
  ) {
    super(message);
    this.name = "LlmValidationError";
  }
}

export class LlmApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "LlmApiError";
  }
}
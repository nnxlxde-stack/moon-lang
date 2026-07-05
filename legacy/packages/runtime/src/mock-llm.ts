import type { JsonSchema } from "@moon/schema-compiler";
import type { LlmClient, LlmRequest } from "./llm-types";
import { LlmValidationError } from "./llm-types";
import type { MetricsCollector } from "./metrics";
import type { PricingTable } from "./pricing";
import { countTokens } from "./tokenizer";

export { LlmValidationError, type LlmClient, type LlmRequest } from "./llm-types";

export function fixtureFromSchema(schema: JsonSchema, path = "root"): unknown {
  if (schema.enum && schema.enum.length > 0) {
    return schema.enum[0];
  }

  switch (schema.type) {
    case "string":
      return `mock-${path}`;
    case "integer":
      return 1;
    case "number":
      return schema.minimum ?? 0.5;
    case "boolean":
      return true;
    case "array":
      return schema.items ? [fixtureFromSchema(schema.items, `${path}[0]`)] : [];
    case "object": {
      const obj: Record<string, unknown> = {};
      if (schema.properties) {
        for (const [key, prop] of Object.entries(schema.properties)) {
          obj[key] = fixtureFromSchema(prop, `${path}.${key}`);
        }
      }
      return obj;
    }
    default:
      return { _mock: path };
  }
}

export function createMockLlm(overrides?: {
  responses?: Record<string, unknown>;
  invalidAgents?: Set<string>;
  maxRetries?: number;
  metrics?: MetricsCollector;
  pricing?: PricingTable;
}): LlmClient & { callCount: number; retries: number } {
  let callCount = 0;
  let retries = 0;
  const maxRetries = overrides?.maxRetries ?? 1;

  return {
    callCount: 0,
    retries: 0,
    async complete(req: LlmRequest): Promise<unknown> {
      callCount++;
      const key = `${req.agent}:${JSON.stringify(req.input)}`;
      if (overrides?.responses?.[key]) {
        return overrides.responses[key];
      }
      if (overrides?.responses?.[req.agent]) {
        return overrides.responses[req.agent]!;
      }

      if (overrides?.invalidAgents?.has(req.agent) && retries < maxRetries) {
        retries++;
        throw new LlmValidationError("Mock invalid response");
      }

      const output = fixtureFromSchema(req.schema);
      if (overrides?.metrics && overrides?.pricing) {
        const promptText = JSON.stringify({
          system: req.systemPrompt,
          input: req.input,
          config: req.config,
        });
        const outputText = JSON.stringify(output);
        overrides.metrics.recordLlmUsage(req.model, {
          prompt: countTokens(promptText, req.model, overrides.pricing),
          completion: countTokens(outputText, req.model, overrides.pricing),
          cacheHit: 0,
          cacheMiss: countTokens(promptText, req.model, overrides.pricing),
        }, 1);
      }
      return output;
    },
  };
}
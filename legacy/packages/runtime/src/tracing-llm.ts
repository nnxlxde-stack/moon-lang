import type { LlmClient, LlmRequest } from "./llm-types";
import { LlmTraceWriter } from "./llm-trace";

export function wrapLlmWithTrace(client: LlmClient, writer: LlmTraceWriter): LlmClient {
  return {
    async complete(req: LlmRequest): Promise<unknown> {
      const start = Date.now();
      try {
        const response = await client.complete(req);
        await writer.record({
          agent: req.agent,
          model: req.model,
          messages: req.messages ?? [],
          schema: req.schema,
          response,
          stormRound: req.stormRound,
          delegateChain: req.delegateChain,
          durationMs: Date.now() - start,
        });
        return response;
      } catch (err) {
        await writer.record({
          agent: req.agent,
          model: req.model,
          messages: req.messages ?? [],
          schema: req.schema,
          error: err instanceof Error ? err.message : String(err),
          stormRound: req.stormRound,
          delegateChain: req.delegateChain,
          durationMs: Date.now() - start,
        });
        throw err;
      }
    },
  };
}
import type { AgentDecl } from "@moon/ast";
import type { JsonSchema } from "@moon/schema-compiler";

export const ANALYZE_OUTPUT_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    findings: { type: "array", items: { type: "object" } },
    summary: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: ["findings", "summary", "confidence"],
};

export function schemaForAgent(
  agent: AgentDecl,
  compiled: Record<string, JsonSchema>,
): JsonSchema {
  if (agent.type.kind === "Con" && agent.type.name === "Reviewer") {
    return compiled.ReviewResult ?? ANALYZE_OUTPUT_SCHEMA;
  }
  return ANALYZE_OUTPUT_SCHEMA;
}
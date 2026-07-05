import type { JsonSchema } from "@moon/schema-compiler";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ContextBlock {
  kind: "memory" | "with_config" | "peer_output" | "delegated_input";
  label: string;
  content: unknown;
}

export interface AssemblyInput {
  agent: string;
  model: string;
  systemPrompt?: string;
  role?: string;
  focus?: string[];
  input: unknown;
  config: Record<string, unknown>;
  schema: JsonSchema;
  systemSuffix?: string;
  peerOutputs?: Array<{ agent: string; summary: string }>;
  delegateFrom?: string;
}

export interface AssembledPrompt {
  messages: ChatMessage[];
  temperature: number;
  maxTokens?: number;
}

export function assemblePrompt(req: AssemblyInput): AssembledPrompt {
  const systemParts: string[] = [];
  if (req.systemPrompt) systemParts.push(req.systemPrompt);
  if (req.role) systemParts.push(`Role: ${req.role}`);
  if (req.focus?.length) {
    systemParts.push(`Focus on: ${req.focus.join(", ")}`);
  }
  systemParts.push(req.systemSuffix ?? "Respond with JSON only matching the provided schema.");

  const userParts: string[] = ["## Input", serializeBlock(req.input)];

  if (req.config.context !== undefined) {
    userParts.push("## Project context", serializeBlock(req.config.context));
  }
  if (req.config.previousVersion !== undefined) {
    userParts.push("## Previous version", serializeBlock(req.config.previousVersion));
  }
  if (req.peerOutputs?.length) {
    userParts.push("## Peer perspectives");
    for (const peer of req.peerOutputs) {
      userParts.push(`### ${peer.agent}`, peer.summary);
    }
  }
  if (req.delegateFrom) {
    userParts.push(`## Delegated from ${req.delegateFrom}`, serializeBlock(req.config.delegated_input ?? req.config.context));
  }

  const extra = { ...req.config };
  delete extra.context;
  delete extra.previousVersion;
  delete extra.delegated_input;
  delete extra.focus;
  delete extra.maxTokens;
  delete extra.temperature;
  if (Object.keys(extra).length > 0) {
    userParts.push("## Additional config", serializeBlock(extra));
  }

  const temperature = typeof req.config.temperature === "number" ? req.config.temperature : 0.25;
  const maxTokens = typeof req.config.maxTokens === "number" ? req.config.maxTokens : undefined;

  return {
    messages: [
      { role: "system", content: systemParts.join("\n\n") },
      { role: "user", content: userParts.join("\n\n") },
    ],
    temperature,
    maxTokens,
  };
}

function serializeBlock(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}
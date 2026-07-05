import type { AgentDecl, Program } from "@moon/ast";

export function collectAgents(program: Program): Map<string, AgentDecl> {
  const agents = new Map<string, AgentDecl>();
  for (const decl of program.declarations) {
    if (decl.kind === "Agent") {
      agents.set(decl.decl.name, decl.decl);
    }
  }
  return agents;
}

export function agentModel(agent: AgentDecl): string {
  for (const item of agent.config) {
    if (item.key === "model" && item.value.kind === "Lit" && item.value.value.kind === "String") {
      return item.value.value.value;
    }
  }
  return "deepseek-v4-pro";
}

export function agentSystemPrompt(agent: AgentDecl): string | undefined {
  for (const item of agent.config) {
    if (item.key === "systemPrompt" && item.value.kind === "Lit" && item.value.value.kind === "String") {
      return item.value.value.value;
    }
  }
  return undefined;
}

export function agentRole(agent: AgentDecl): string | undefined {
  for (const item of agent.config) {
    if (item.key === "role" && item.value.kind === "Lit" && item.value.value.kind === "String") {
      return item.value.value.value;
    }
  }
  return undefined;
}

export function agentFocus(agent: AgentDecl): string[] | undefined {
  for (const item of agent.config) {
    if (item.key === "focus" && item.value.kind === "List") {
      const out: string[] = [];
      for (const el of item.value.elements) {
        if (el.kind === "Lit" && el.value.kind === "String") out.push(el.value.value);
      }
      return out.length ? out : undefined;
    }
  }
  return undefined;
}
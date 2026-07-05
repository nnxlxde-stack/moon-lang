import type {
  AgentDecl,
  ConfigItem,
  Expression,
  Program,
} from "@moon/ast";
import { assemblePrompt, type AssembledPrompt } from "@moon/prompt";
import type { JsonSchema } from "@moon/schema-compiler";
import { compileSchemas } from "@moon/schema-compiler";

const ANALYZE_SCHEMA: JsonSchema = {
  type: "object",
  properties: {
    findings: { type: "array", items: { type: "object" } },
    summary: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: ["findings", "summary", "confidence"],
};

export interface PromptSite {
  line: number;
  endLine: number;
  kind: "analyze" | "storm";
  agent: string;
  title: string;
}

export interface PromptPreviewResult {
  site: PromptSite;
  assembled: AssembledPrompt;
  markdown: string;
}

export function findPromptSites(program: Program): PromptSite[] {
  const sites: PromptSite[] = [];

  for (const decl of program.declarations) {
    if (decl.kind !== "Function") continue;
    for (const eq of decl.decl.equations) {
      if (!("statements" in eq.body)) continue;
      for (const stmt of eq.body.statements) {
        if (stmt.kind === "Bind") {
          const call = findAnalyzeCall(stmt.expr);
          if (call) {
            sites.push({
              line: stmt.span.start.line - 1,
              endLine: stmt.span.end.line - 1,
              kind: "analyze",
              agent: call.agent,
              title: `Preview prompt: ${call.agent}`,
            });
          }
        }
        if (stmt.kind === "Storm") {
          const synthesizer = configString(stmt.config, "synthesizer") ?? "Synthesizer";
          sites.push({
            line: stmt.span.start.line - 1,
            endLine: stmt.span.end.line - 1,
            kind: "storm",
            agent: synthesizer,
            title: `Preview storm: ${synthesizer}`,
          });
        }
      }
    }
  }

  return sites;
}

function findAnalyzeCall(expr: Expression): { agent: string; input: unknown } | null {
  if (expr.kind === "App" && expr.func.kind === "FieldAccess" && expr.func.field === "analyze") {
    const agent = exprToName(expr.func.object);
    if (!agent) return null;
    return { agent, input: exprToPlaceholder(expr.arg) };
  }
  if (expr.kind === "FieldAccess" && expr.field === "analyze") {
    const agent = exprToName(expr.object);
    if (!agent) return null;
    return { agent, input: "<input>" };
  }
  return null;
}

function exprToName(expr: Expression): string | null {
  if (expr.kind === "Var") return expr.name;
  if (expr.kind === "Paren") return exprToName(expr.expr);
  return null;
}

function exprToPlaceholder(expr: Expression): unknown {
  if (expr.kind === "Lit") {
    if (expr.value.kind === "String") return expr.value.value;
    if (expr.value.kind === "Int" || expr.value.kind === "Float") return expr.value.value;
    if (expr.value.kind === "Bool") return expr.value.value;
  }
  if (expr.kind === "Var") return `<${expr.name}>`;
  if (expr.kind === "List") {
    return expr.elements.map(exprToPlaceholder);
  }
  if (expr.kind === "Record") {
    const obj: Record<string, unknown> = { _type: expr.name };
    for (const f of expr.fields) obj[f.name] = exprToPlaceholder(f.value);
    return obj;
  }
  return "<expr>";
}

function configValues(config: ConfigItem[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const item of config) {
    out[item.key] = exprToPlaceholder(item.value);
  }
  return out;
}

function configString(config: ConfigItem[], key: string): string | null {
  const item = config.find((c) => c.key === key);
  if (!item) return null;
  if (item.value.kind === "Var") return item.value.name;
  if (item.value.kind === "Lit" && item.value.value.kind === "String") {
    return item.value.value.value;
  }
  return null;
}

function collectAgents(program: Program): Map<string, AgentDecl> {
  const agents = new Map<string, AgentDecl>();
  for (const decl of program.declarations) {
    if (decl.kind === "Agent") agents.set(decl.decl.name, decl.decl);
  }
  return agents;
}

function agentModel(agent: AgentDecl): string {
  for (const item of agent.config) {
    if (item.key === "model" && item.value.kind === "Lit" && item.value.value.kind === "String") {
      return item.value.value.value;
    }
  }
  return "deepseek-v4-pro";
}

function agentSystemPrompt(agent: AgentDecl): string | undefined {
  for (const item of agent.config) {
    if (item.key === "systemPrompt" && item.value.kind === "Lit" && item.value.value.kind === "String") {
      return item.value.value.value;
    }
  }
  return undefined;
}

function agentRole(agent: AgentDecl): string | undefined {
  for (const item of agent.config) {
    if (item.key === "role" && item.value.kind === "Lit" && item.value.value.kind === "String") {
      return item.value.value.value;
    }
  }
  return undefined;
}

function agentFocus(agent: AgentDecl): string[] | undefined {
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

function schemaForAgent(agent: AgentDecl, schemas: Record<string, JsonSchema>): JsonSchema {
  if (agent.type.kind === "Con" && agent.type.name === "Reviewer") {
    return schemas.ReviewResult ?? ANALYZE_SCHEMA;
  }
  return ANALYZE_SCHEMA;
}

export function buildPromptPreview(
  program: Program,
  line: number,
): PromptPreviewResult | null {
  const sites = findPromptSites(program);
  const site = sites.find((s) => s.line === line);
  if (!site) return null;

  const agents = collectAgents(program);
  const schemas = compileSchemas(program).schemas;

  if (site.kind === "storm") {
    return buildStormPreview(program, site, agents, schemas);
  }

  return buildAnalyzePreview(program, site, agents, schemas);
}

function buildAnalyzePreview(
  program: Program,
  site: PromptSite,
  agents: Map<string, AgentDecl>,
  schemas: Record<string, JsonSchema>,
): PromptPreviewResult | null {
  const agent = agents.get(site.agent);
  if (!agent) return null;

  const bind = findBindAtLine(program, site.line);
  if (!bind) return null;

  const call = findAnalyzeCall(bind.expr);
  if (!call) return null;

  const config = configValues(bind.config);
  const bindFocus = Array.isArray(config.focus) ? config.focus as string[] : undefined;

  const assembled = assemblePrompt({
    agent: site.agent,
    model: agentModel(agent),
    systemPrompt: agentSystemPrompt(agent),
    role: agentRole(agent),
    focus: agentFocus(agent) ?? bindFocus,
    input: call.input,
    config,
    schema: schemaForAgent(agent, schemas),
  });

  return {
    site,
    assembled,
    markdown: formatPreviewMarkdown(site, assembled),
  };
}

function buildStormPreview(
  program: Program,
  site: PromptSite,
  agents: Map<string, AgentDecl>,
  schemas: Record<string, JsonSchema>,
): PromptPreviewResult | null {
  const storm = findStormAtLine(program, site.line);
  if (!storm) return null;

  const config = configValues(storm.config);
  const synthesizerName = configString(storm.config, "synthesizer") ?? site.agent;
  const agent = agents.get(synthesizerName);
  if (!agent) return null;

  const panel = Array.isArray(config.panel) ? config.panel as string[] : [];
  const rounds = typeof config.rounds === "number" ? config.rounds : 1;

  const assembled = assemblePrompt({
    agent: synthesizerName,
    model: agentModel(agent),
    systemPrompt: agentSystemPrompt(agent),
    role: agentRole(agent),
    focus: agentFocus(agent),
    input: exprToPlaceholder(storm.input),
    config,
    schema: schemaForAgent(agent, schemas),
    peerOutputs: panel.map((name) => ({
      agent: String(name),
      summary: "<peer output after panel round>",
    })),
  });

  const stormNote = [
    `**Storm panel:** ${panel.join(", ") || "(none)"}`,
    `**Rounds:** ${rounds}`,
    "",
  ].join("\n");

  return {
    site,
    assembled,
    markdown: stormNote + formatPreviewMarkdown(site, assembled),
  };
}

function findBindAtLine(program: Program, line: number) {
  for (const decl of program.declarations) {
    if (decl.kind !== "Function") continue;
    for (const eq of decl.decl.equations) {
      if (!("statements" in eq.body)) continue;
      for (const stmt of eq.body.statements) {
        if (stmt.kind === "Bind" && stmt.span.start.line - 1 === line) {
          return stmt;
        }
      }
    }
  }
  return null;
}

function findStormAtLine(program: Program, line: number) {
  for (const decl of program.declarations) {
    if (decl.kind !== "Function") continue;
    for (const eq of decl.decl.equations) {
      if (!("statements" in eq.body)) continue;
      for (const stmt of eq.body.statements) {
        if (stmt.kind === "Storm" && stmt.span.start.line - 1 === line) {
          return stmt;
        }
      }
    }
  }
  return null;
}

export function formatPreviewMarkdown(site: PromptSite, assembled: AssembledPrompt): string {
  const parts = [
    `# ${site.title}`,
    "",
    `**Temperature:** ${assembled.temperature}${assembled.maxTokens ? ` · max ${assembled.maxTokens} tokens` : ""}`,
    "",
  ];

  for (const msg of assembled.messages) {
    parts.push(`## ${msg.role.toUpperCase()}`, "", "```", msg.content, "```", "");
  }

  return parts.join("\n");
}
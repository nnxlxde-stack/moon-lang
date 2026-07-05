import type { ConfigItem, DoStatement } from "@moon/ast";
import { agentModel } from "./agents";
import { evalExpr, runAgentAnalyze, type RuntimeContext, type RuntimeValue, RuntimeError } from "./interpreter";
import { modelToTier } from "./worker-pool";

export async function runStormStmt(stmt: Extract<DoStatement, { kind: "Storm" }>, ctx: RuntimeContext): Promise<RuntimeValue> {
  const input = await evalExpr(stmt.input, ctx);
  const configValues = await evalConfig(stmt.config, ctx);

  const panel = configValues.panel;
  if (!Array.isArray(panel) || panel.length === 0) {
    throw new RuntimeError("storm requires panel: [Agent, ...]");
  }
  const panelAgents = panel.map(String);

  const synthesizer = configValues.synthesizer;
  if (!synthesizer) {
    throw new RuntimeError("storm requires synthesizer: AgentName");
  }

  const rounds = typeof configValues.rounds === "number" ? Math.max(1, configValues.rounds) : 1;
  const stormContext = configValues.context;

  let peerOutputs: Array<{ agent: string; summary: string }> = [];

  for (let round = 1; round <= rounds; round++) {
    const tier = highestTier(panelAgents, ctx);
    const roundResults = await ctx.pool.runAll(
      tier,
      panelAgents.map((agentName) => async () => {
        const extra: Record<string, unknown> = { ...configValues };
        if (stormContext !== undefined) extra.context = stormContext;
        return runAgentAnalyze(agentName, input, stmt.config, ctx, {
          stormRound: round,
          peerOutputs: round > 1 ? peerOutputs : undefined,
          configOverride: extra,
        });
      }),
    );

    peerOutputs = panelAgents.map((agent, idx) => ({
      agent,
      summary: summarizeOutput(roundResults[idx]),
    }));
  }

  const synthExtra: Record<string, unknown> = { ...configValues };
  if (stormContext !== undefined) synthExtra.context = stormContext;

  return runAgentAnalyze(String(synthesizer), input, stmt.config, ctx, {
    stormRound: rounds + 1,
    peerOutputs,
    configOverride: synthExtra,
  });
}

async function evalConfig(config: ConfigItem[], ctx: RuntimeContext): Promise<Record<string, unknown>> {
  const values: Record<string, unknown> = {};
  for (const item of config) {
    values[item.key] = await evalExpr(item.value, ctx);
  }
  return values;
}

function summarizeOutput(value: RuntimeValue): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function highestTier(agents: string[], ctx: RuntimeContext): "flash" | "pro" {
  let tier: "flash" | "pro" = "flash";
  for (const name of agents) {
    const agent = ctx.agents.get(name);
    if (agent && modelToTier(agentModel(agent)) === "pro") {
      tier = "pro";
    }
  }
  return tier;
}
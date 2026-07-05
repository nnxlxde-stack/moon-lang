import type { DoBlock, Program } from "@moon/ast";
import { resolveImports } from "@moon/resolver";
import { dirname, resolve } from "path";
import { builtinsFromImports } from "./stdlib/registry";
import type { ExecutionDag } from "@moon/planner";
import { detectMapM, findFunction, planFunction } from "@moon/planner";
import { compileSchemas } from "@moon/schema-compiler";
import { agentModel, collectAgents } from "./agents";
import {
  applyBindConfig,
  applyValue,
  defaultBuiltins,
  evalExpr,
  evalExprWithConfig,
  runDoStmt,
  type RuntimeContext,
  type RuntimeEffect,
  type RuntimeValue,
} from "./interpreter";
import type { LlmClient } from "./llm-types";
import { MetricsCollector, type RunMetrics } from "./metrics";
import { createLlmClient, loadRuntimeConfig, type RuntimeConfigOverrides } from "./runtime-config";
import { MemoryManager } from "./memory";
import { modelToTier, WorkerPool, type ModelTier } from "./worker-pool";
import { LlmTraceWriter, type LlmTraceSession } from "./llm-trace";
import { wrapLlmWithTrace } from "./tracing-llm";

export interface RunOptions extends RuntimeConfigOverrides {
  functionName?: string;
  entryPath?: string;
  projectRoot?: string;
  llm?: LlmClient;
  workerPool?: WorkerPool;
  traceLlm?: boolean;
  traceDir?: string;
}

export interface RunResult {
  value: RuntimeValue;
  effects: RuntimeEffect[];
  dag: ExecutionDag;
  metrics: RunMetrics;
  llmTrace?: LlmTraceSession;
}

export async function runProgram(program: Program, options: RunOptions = {}): Promise<RunResult> {
  const functionName = options.functionName ?? "main";
  const dag = planFunction(program, functionName);
  if (!dag) {
    throw new Error(`Function not found: ${functionName}`);
  }

  const block = findFunction(program, functionName);
  if (!block) {
    throw new Error(`Function body not found: ${functionName}`);
  }

  const runtimeConfig = loadRuntimeConfig(options);
  const metrics = new MetricsCollector(runtimeConfig.pricing);
  const agents = collectAgents(program);

  let traceWriter: LlmTraceWriter | undefined;
  let llm: LlmClient = options.llm ?? createLlmClient(runtimeConfig, metrics);
  if (options.traceLlm) {
    traceWriter = await LlmTraceWriter.create(options.traceDir);
    llm = wrapLlmWithTrace(llm, traceWriter);
  }

  const entryPath = options.entryPath;
  const resolved = entryPath
    ? resolveImports(program, {
        entryPath: resolve(entryPath),
        projectRoot: options.projectRoot ?? dirname(resolve(entryPath)),
      })
    : null;
  const builtins = resolved
    ? builtinsFromImports(resolved.imports)
    : defaultBuiltins();

  const ctx: RuntimeContext = {
    program,
    schemas: compileSchemas(program).schemas,
    agents,
    llm,
    memory: new MemoryManager({
      longTermPath: runtimeConfig.longTermMemoryPath,
      metrics,
    }),
    pool: options.workerPool ?? new WorkerPool({
      flashConcurrency: runtimeConfig.flashConcurrency,
      proConcurrency: runtimeConfig.proConcurrency,
      onAcquire: (tier, active) => metrics.recordWorkerStart(tier, active),
    }),
    env: new Map(),
    effects: [],
    builtins,
  };

  await executeDag(dag, block, ctx);
  return {
    value: ctx.env.get("_result") ?? null,
    effects: ctx.effects,
    dag,
    metrics: metrics.snapshot(),
    llmTrace: traceWriter?.snapshot(),
  };
}

async function executeDag(
  dag: ExecutionDag,
  block: DoBlock,
  ctx: RuntimeContext,
): Promise<void> {
  const completed = new Set<string>();
  const pending = new Set(dag.nodes.map((n) => n.id));

  while (pending.size > 0) {
    const ready = dag.nodes.filter(
      (n) => pending.has(n.id) && n.dependencies.every((d) => completed.has(d)),
    );

    if (ready.length === 0) {
      throw new Error("DAG deadlock — cyclic dependencies");
    }

    await Promise.all(
      ready.map(async (node) => {
        const stmt = block.statements[node.stmtIndex];
        if (!stmt) return;

        if (node.kind === "mapM" && stmt.kind === "Bind") {
          const mapM = detectMapM(stmt.expr);
          if (!mapM || !node.mapMListVar) return;

          const list = ctx.env.get(node.mapMListVar) as RuntimeValue[];
          const fn = await evalExpr(mapM.func, ctx);
          const tier = tierForMapM(node.mapMFunc ?? "", ctx);

          const results = await ctx.pool.runAll(
            tier,
            list.map((item) => async () => applyFn(fn, item, ctx)),
          );

          ctx.env.set(`__mapM_${node.id}`, results);
          pending.delete(node.id);
          completed.add(node.id);
          return;
        }

        if (node.kind === "mapM_join") {
          const parent = dag.nodes.find((n) => n.kind === "mapM" && node.dependencies.includes(n.id));
          const results = parent ? ctx.env.get(`__mapM_${parent.id}`) : [];
          if (node.bindVar) {
            ctx.env.set(node.bindVar, results);
          }
          pending.delete(node.id);
          completed.add(node.id);
          return;
        }

        if (stmt.kind === "Storm") {
          const { runStormStmt } = await import("./storm");
          const value = await runStormStmt(stmt, ctx);
          if (node.bindVar) ctx.env.set(node.bindVar, value);
        } else if (stmt.kind === "Bind") {
          let value = await evalExprWithConfig(stmt.expr, ctx, stmt.config);
          value = await applyBindConfig(value, stmt.config, ctx);
          if (node.bindVar) ctx.env.set(node.bindVar, value);
        } else {
          await runDoStmt(stmt, ctx);
        }

        pending.delete(node.id);
        completed.add(node.id);
      }),
    );
  }

  ctx.env.set("_result", null);
}

function tierForMapM(mapMFunc: string, ctx: RuntimeContext): ModelTier {
  const candidates = mapMFunc.match(/[A-Z][A-Za-z0-9]*/g) ?? [];
  for (const name of candidates) {
    const agent = ctx.agents.get(name);
    if (agent) {
      return modelToTier(agentModel(agent));
    }
  }
  return "pro";
}

async function applyFn(
  fn: RuntimeValue,
  arg: RuntimeValue,
  ctx: RuntimeContext,
): Promise<RuntimeValue> {
  if (typeof fn === "function") {
    const result = fn(arg);
    return result instanceof Promise ? result : result;
  }
  return applyValue(fn, arg, ctx);
}
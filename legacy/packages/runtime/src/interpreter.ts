import type {
  AgentDecl,
  ConfigItem,
  DoBlock,
  DoStatement,
  Expression,
  FunctionDecl,
  Pattern,
  Program,
} from "@moon/ast";
import type { JsonSchema } from "@moon/schema-compiler";
import { schemaForAgent } from "./agent-schemas";
import { agentFocus, agentModel, agentRole, agentSystemPrompt } from "./agents";
import { assemblePrompt } from "@moon/prompt";
import type { LlmClient } from "./mock-llm";
import { fixtureFromSchema } from "./mock-llm";
import type { MemoryManager } from "./memory";
import { modelToTier } from "./worker-pool";
import type { WorkerPool } from "./worker-pool";
import {
  fsListDir,
  fsMakeDir,
  fsPathExists,
  fsReadFile,
  fsRemovePath,
  fsWriteFile,
} from "./stdlib/fs";
import { httpGet, httpPost } from "./stdlib/network";

export type RuntimeValue = unknown;

export interface RuntimeContext {
  program: Program;
  schemas: Record<string, JsonSchema>;
  agents: Map<string, AgentDecl>;
  llm: LlmClient;
  memory: MemoryManager;
  pool: WorkerPool;
  env: Map<string, RuntimeValue>;
  effects: RuntimeEffect[];
  builtins: Set<string>;
}

export interface RuntimeEffect {
  kind: string;
  detail: Record<string, unknown>;
}

export async function runDoBlock(block: DoBlock, ctx: RuntimeContext): Promise<RuntimeValue> {
  let last: RuntimeValue = null;
  for (const stmt of block.statements) {
    last = await runDoStmt(stmt, ctx);
  }
  return last;
}

export async function runDoStmt(stmt: DoStatement, ctx: RuntimeContext): Promise<RuntimeValue> {
  switch (stmt.kind) {
    case "Let": {
      const value = await evalExpr(stmt.expr, ctx);
      bindPattern(stmt.pattern, value, ctx.env);
      return value;
    }
    case "Bind": {
      let value = await evalExprWithConfig(stmt.expr, ctx, stmt.config);
      value = await applyBindConfig(value, stmt.config, ctx);
      bindPattern(stmt.pattern, value, ctx.env);
      return value;
    }
    case "Storm": {
      const { runStormStmt } = await import("./storm");
      const value = await runStormStmt(stmt, ctx);
      bindPattern(stmt.pattern, value, ctx.env);
      return value;
    }
    case "Action":
      return evalExpr(stmt.expr, ctx);
  }
}

export async function evalExpr(expr: Expression, ctx: RuntimeContext): Promise<RuntimeValue> {
  switch (expr.kind) {
    case "Lit":
      if (expr.value.kind === "String") return expr.value.value;
      if (expr.value.kind === "Int") return expr.value.value;
      if (expr.value.kind === "Float") return expr.value.value;
      return expr.value.value;
    case "Var": {
      if (ctx.env.has(expr.name)) return ctx.env.get(expr.name);
      if (TYPE_VALUES.has(expr.name)) return expr.name;
      if (isBuiltin(expr.name, ctx)) return expr.name;
      if (ctx.agents.has(expr.name)) return expr.name;
      if (findUserFunction(ctx.program, expr.name)) return expr.name;
      throw new RuntimeError(`Unbound variable: ${expr.name}`);
    }
    case "App": {
      const fn = await evalExpr(expr.func, ctx);
      const arg = await evalExpr(expr.arg, ctx);
      return applyValue(fn, arg, ctx);
    }
    case "Infix": {
      if (expr.op === "$") {
        const fn = await evalExpr(expr.left, ctx);
        const arg = await evalExpr(expr.right, ctx);
        return applyValue(fn, arg, ctx);
      }
      if (expr.op === ">>=") {
        const io = await evalExpr(expr.left, ctx);
        const fn = await evalExpr(expr.right, ctx);
        return applyValue(fn, io, ctx);
      }
      if (expr.op === ".") {
        const f = await evalExpr(expr.left, ctx);
        const g = await evalExpr(expr.right, ctx);
        return async (x: RuntimeValue) => applyValue(f, await applyValue(g, x, ctx), ctx);
      }
      throw new RuntimeError(`Unsupported operator: ${expr.op}`);
    }
    case "FieldAccess": {
      const obj = await evalExpr(expr.object, ctx);
      if (typeof obj === "object" && obj !== null && expr.field in (obj as Record<string, unknown>)) {
        return (obj as Record<string, unknown>)[expr.field];
      }
      if (typeof obj === "string" && ctx.agents.has(obj)) {
        return { _agent: obj, _method: expr.field };
      }
      if (ctx.agents.has(String(obj))) {
        return { _agent: String(obj), _method: expr.field };
      }
      return { _agentRef: obj, _method: expr.field };
    }
    case "Record": {
      const record: Record<string, RuntimeValue> = {};
      for (const field of expr.fields) {
        record[field.name] = await evalExpr(field.value, ctx);
      }
      return { _type: expr.name, ...record };
    }
    case "List": {
      const items: RuntimeValue[] = [];
      for (const el of expr.elements) {
        items.push(await evalExpr(el, ctx));
      }
      return items;
    }
    case "Tuple": {
      if (expr.elements.length === 0) return null;
      const items: RuntimeValue[] = [];
      for (const el of expr.elements) {
        items.push(await evalExpr(el, ctx));
      }
      return items;
    }
    case "Paren":
      return evalExpr(expr.expr, ctx);
    case "Do":
      return runDoBlock(expr.block, ctx);
    case "If": {
      const cond = await evalExpr(expr.condition, ctx);
      if (cond) return evalExpr(expr.thenBranch, ctx);
      return evalExpr(expr.elseBranch, ctx);
    }
    case "Prefix":
      if (expr.op === "not") {
        return !(await evalExpr(expr.operand, ctx));
      }
      return -(await evalExpr(expr.operand, ctx) as number);
    default:
      throw new RuntimeError(`Unsupported expression: ${expr.kind}`);
  }
}

export async function applyValue(
  fn: RuntimeValue,
  arg: RuntimeValue,
  ctx: RuntimeContext,
  config: ConfigItem[] = [],
): Promise<RuntimeValue> {
  if (typeof fn === "object" && fn !== null && "_agent" in fn) {
    const { _agent, _method } = fn as { _agent: string; _method: string };
    if (_method === "analyze") {
      return runAgentAnalyze(_agent, arg, config, ctx);
    }
    throw new RuntimeError(`Unknown agent method: ${_method}`);
  }

  if (typeof fn === "function") {
    const result = fn(arg);
    return result instanceof Promise ? result : result;
  }

  if (typeof fn === "string" && isBuiltin(fn, ctx)) {
    return runBuiltin(fn, arg, ctx);
  }

  const userFn = findUserFunction(ctx.program, String(fn));
  if (userFn) {
    return callUserFunction(userFn, [arg], ctx, config);
  }

  throw new RuntimeError(`Cannot apply: ${String(fn)}`);
}

function isBuiltin(name: string, ctx: RuntimeContext): boolean {
  return ctx.builtins.has(name);
}

export function defaultBuiltins(): Set<string> {
  return new Set(BUILTIN_NAMES);
}

const TYPE_VALUES = new Set([
  "LongTerm", "ShortTerm", "Session", "Code", "Documentation", "Requirements", "Entity",
  "Approved", "ChangesRequested", "MajorRefactoring", "SecurityIssue",
]);

const BUILTIN_NAMES = new Set([
  "memory", "recall", "not", "fetchOpenPRs", "fetchUpdatedDocs", "fetchChangedFiles",
  "isDraft", "readFile", "writeFile", "pathExists", "listDir", "makeDir", "removePath",
  "httpGet", "httpPost", "fetchJson",
  "saveToFile", "postToSlack", "postSummaryToSlack",
  "generateCombinedReport", "generateReviewReport", "mapM", "pure", "when",
  "hasCriticalFindings", "hasCriticalIssues", "escalateCriticalIssues", "notifyTeamLeads",
  "getPreviousVersion", "calculateScore", "extractRecommendations", "decideOverallVerdict",
  "collectFindings", "generateSummary", "calculateConfidence", "extractSuggestions",
  "detectLanguage",
]);

async function fetchOpenPrsFromGitHub(repo: string, ctx: RuntimeContext): Promise<RuntimeValue[]> {
  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (!token) {
    return [
      { id: "pr-1", title: "Feature A", isDraft: false },
      { id: "pr-2", title: "Fix B", isDraft: true },
    ];
  }

  try {
    const res = await httpGet(`https://api.github.com/repos/${repo}/pulls?state=open`, {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    });
    ctx.effects.push({ kind: "fetchOpenPRs", detail: { repo, status: res.status } });
    if (res.status < 200 || res.status >= 300) {
      throw new RuntimeError(`GitHub API ${res.status}: ${res.body.slice(0, 200)}`);
    }
    const pulls = JSON.parse(res.body) as Array<{ number: number; title: string; draft?: boolean }>;
    return pulls.map((pr) => ({
      id: String(pr.number),
      title: pr.title,
      isDraft: Boolean(pr.draft),
    }));
  } catch (err) {
    ctx.effects.push({ kind: "fetchOpenPRs", detail: { repo, error: String(err) } });
    throw err instanceof RuntimeError ? err : new RuntimeError(String(err));
  }
}

async function runBuiltin(
  name: string,
  arg: RuntimeValue,
  ctx: RuntimeContext,
): Promise<RuntimeValue> {
  switch (name) {
    case "memory":
      return (scope: RuntimeValue) => (key: string) => {
        ctx.memory.register(String(scope), key);
        ctx.effects.push({ kind: "memory", detail: { scope, key } });
        return null;
      };
    case "recall":
      return ctx.memory.recall(String(arg));
    case "fetchOpenPRs":
      return fetchOpenPrsFromGitHub(String(arg), ctx);
    case "fetchUpdatedDocs":
      return [
        { path: "docs/guide.md", content: "Guide" },
        { path: "docs/api.md", content: "API" },
      ];
    case "fetchChangedFiles":
      return [
        { path: "src/main.cpp", previousContent: "old" },
        { path: "src/util.cpp", previousContent: "old2" },
      ];
    case "isDraft":
      return Boolean((arg as { isDraft?: boolean })?.isDraft);
    case "readFile":
      return fsReadFile(String(arg));
    case "writeFile":
      return async (content: RuntimeValue) => {
        fsWriteFile(String(arg), String(content));
        ctx.effects.push({ kind: "writeFile", detail: { path: arg, bytes: String(content).length } });
        return null;
      };
    case "saveToFile":
      return async (content: RuntimeValue) => {
        fsWriteFile(String(arg), String(content));
        ctx.effects.push({ kind: "saveToFile", detail: { path: arg, bytes: String(content).length } });
        return null;
      };
    case "pathExists":
      return fsPathExists(String(arg));
    case "listDir":
      return fsListDir(String(arg));
    case "makeDir":
      fsMakeDir(String(arg));
      ctx.effects.push({ kind: "makeDir", detail: { path: arg } });
      return null;
    case "removePath":
      fsRemovePath(String(arg));
      ctx.effects.push({ kind: "removePath", detail: { path: arg } });
      return null;
    case "httpGet":
      return (async () => {
        const res = await httpGet(String(arg));
        ctx.effects.push({ kind: "httpGet", detail: { url: arg, status: res.status } });
        return res.body;
      })();
    case "httpPost":
      return (body: RuntimeValue) => (async () => {
        const res = await httpPost(String(arg), String(body));
        ctx.effects.push({ kind: "httpPost", detail: { url: arg, status: res.status } });
        return res.body;
      })();
    case "fetchJson":
      return (async () => {
        const res = await httpGet(String(arg), { accept: "application/json" });
        ctx.effects.push({ kind: "fetchJson", detail: { url: arg, status: res.status } });
        return res.body;
      })();
    case "not":
      return !(arg as boolean);
    case "postToSlack":
    case "postSummaryToSlack":
      ctx.effects.push({ kind: name, detail: { payload: arg } });
      return null;
    case "generateCombinedReport":
      return (a: RuntimeValue) => async (b: RuntimeValue) => {
        const report = `# Combined Report\n${JSON.stringify({ a, b })}`;
        ctx.effects.push({ kind: "generateCombinedReport", detail: { length: report.length } });
        return report;
      };
    case "generateReviewReport":
      return `# Review Report\n${JSON.stringify(arg)}`;
    case "mapM":
      return (fn: RuntimeValue) => async (items: RuntimeValue) => {
        const list = items as RuntimeValue[];
        const results: RuntimeValue[] = [];
        for (const item of list) {
          results.push(await applyValue(fn, item, ctx));
        }
        return results;
      };
    case "pure":
      return arg;
    case "when":
      return (cond: RuntimeValue) => async (action: RuntimeValue) => {
        if (cond) {
          return typeof action === "function" ? action(null) : action;
        }
        return null;
      };
    case "hasCriticalFindings":
    case "hasCriticalIssues":
      return (_items: RuntimeValue) => false;
    case "escalateCriticalIssues":
    case "notifyTeamLeads":
      return async (items: RuntimeValue) => {
        ctx.effects.push({ kind: name, detail: { items } });
        return null;
      };
    case "getPreviousVersion":
      return (_item: RuntimeValue) => "previous-version";
    case "calculateScore":
      return (output: RuntimeValue) => 85.5;
    case "extractRecommendations":
      return (_output: RuntimeValue) => [];
    case "decideOverallVerdict":
      return (_reviews: RuntimeValue) => async (_combined: RuntimeValue) => "Approved";
    case "collectFindings":
      return (reviews: RuntimeValue) => (reviews as RuntimeValue[]).flatMap((r) =>
        (r as { findings?: RuntimeValue[] })?.findings ?? [],
      );
    case "generateSummary":
      return (combined: RuntimeValue) => `Summary: ${JSON.stringify(combined)}`;
    case "calculateConfidence":
      return (_reviews: RuntimeValue) => 0.92;
    case "extractSuggestions":
      return (_combined: RuntimeValue) => [];
    case "detectLanguage":
      return (file: RuntimeValue) => {
        const path = (file as { path?: string })?.path ?? "";
        return path.endsWith(".cpp") ? "cpp" : "text";
      };
    default:
      throw new RuntimeError(`Unknown builtin: ${name}`);
  }
}

function findUserFunction(program: Program, name: string): FunctionDecl | null {
  for (const decl of program.declarations) {
    if (decl.kind === "Function" && decl.decl.equations.some((eq) => eq.name === name)) {
      return decl.decl;
    }
  }
  return null;
}

export async function applyBindConfig(
  value: RuntimeValue,
  config: ConfigItem[],
  ctx: RuntimeContext,
): Promise<RuntimeValue> {
  let result = value;
  for (const item of config) {
    if (item.key === "filter" && Array.isArray(result)) {
      const predicate = await evalExpr(item.value, ctx);
      if (typeof predicate === "function") {
        const kept: RuntimeValue[] = [];
        for (const entry of result) {
          const pass = predicate(entry);
          const ok = pass instanceof Promise ? await pass : pass;
          if (ok) kept.push(entry);
        }
        result = kept;
      }
    }
  }
  return result;
}

export async function evalExprWithConfig(
  expr: Expression,
  ctx: RuntimeContext,
  config: ConfigItem[],
): Promise<RuntimeValue> {
  if (expr.kind === "App" && expr.func.kind === "FieldAccess") {
    const callee = await evalExpr(expr.func, ctx);
    const input = await evalExpr(expr.arg, ctx);
    return applyValue(callee, input, ctx, config);
  }
  return evalExpr(expr, ctx);
}

async function callUserFunction(
  decl: FunctionDecl,
  args: RuntimeValue[],
  ctx: RuntimeContext,
  _config: ConfigItem[] = [],
): Promise<RuntimeValue> {
  const eq = decl.equations[0];
  if (!eq) throw new RuntimeError("Function has no equations");

  if (args.length < eq.patterns.length) {
    return (next: RuntimeValue) => callUserFunction(decl, [...args, next], ctx, _config);
  }

  const local = new Map(ctx.env);
  for (let i = 0; i < eq.patterns.length; i++) {
    bindPattern(eq.patterns[i]!, args[i], local);
  }

  const child: RuntimeContext = { ...ctx, env: local };
  if ("statements" in eq.body) {
    return runDoBlock(eq.body, child);
  }
  return evalExpr(eq.body, child);
}

function bindPattern(pat: Pattern, value: RuntimeValue, env: Map<string, RuntimeValue>): void {
  if (pat.kind === "PVar") {
    env.set(pat.name, value);
  }
}

export interface AgentAnalyzeOptions {
  stormRound?: number;
  peerOutputs?: Array<{ agent: string; summary: string }>;
  delegateFrom?: string;
  delegateChain?: string[];
  skipDelegate?: boolean;
  configOverride?: Record<string, unknown>;
}

export async function runAgentAnalyze(
  agentName: string,
  input: RuntimeValue,
  config: ConfigItem[],
  ctx: RuntimeContext,
  options: AgentAnalyzeOptions = {},
): Promise<RuntimeValue> {
  const agent = ctx.agents.get(agentName);
  if (!agent) throw new RuntimeError(`Unknown agent: ${agentName}`);

  const model = agentModel(agent);
  const tier = modelToTier(model);
  const schema = schemaForAgent(agent, ctx.schemas);

  const configValues: Record<string, unknown> = { ...options.configOverride };
  for (const item of agent.config) {
    if (item.key === "temperature" && item.value.kind === "Lit") {
      configValues.temperature = item.value.value.kind === "Float"
        ? item.value.value.value
        : item.value.value.kind === "Int"
          ? item.value.value.value
          : undefined;
    }
  }
  for (const item of config) {
    configValues[item.key] = await evalExpr(item.value, ctx);
  }

  const delegateChain = options.delegateChain ?? [agentName];

  const assembled = assemblePrompt({
    agent: agentName,
    model,
    systemPrompt: agentSystemPrompt(agent),
    role: agentRole(agent),
    focus: agentFocus(agent) ?? (Array.isArray(configValues.focus) ? configValues.focus as string[] : undefined),
    input,
    config: configValues,
    schema,
    peerOutputs: options.peerOutputs,
    delegateFrom: options.delegateFrom,
  });

  let result = await ctx.pool.run(tier, () =>
    ctx.llm.complete({
      agent: agentName,
      model,
      input,
      schema,
      config: configValues,
      messages: assembled.messages,
      temperature: assembled.temperature,
      stormRound: options.stormRound,
      delegateChain,
    }),
  );

  if (agent.routesTo && !options.skipDelegate) {
    const delegateName = agent.routesTo;
    const delegateConfig = { ...configValues, delegated_input: result };
    result = await runAgentAnalyze(delegateName, input, config, ctx, {
      delegateFrom: agentName,
      delegateChain: [...delegateChain, delegateName],
      configOverride: delegateConfig,
      skipDelegate: true,
      stormRound: options.stormRound,
      peerOutputs: options.peerOutputs,
    });
  }

  return result;
}

export function buildAnalyzeOutputFallback(): RuntimeValue {
  return fixtureFromSchema({
    type: "object",
    properties: {
      findings: { type: "array", items: { type: "object" } },
      summary: { type: "string" },
      confidence: { type: "number", minimum: 0, maximum: 1 },
    },
    required: ["findings", "summary", "confidence"],
  });
}

export class RuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuntimeError";
  }
}
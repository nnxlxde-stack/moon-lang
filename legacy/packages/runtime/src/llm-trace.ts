import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import type { ChatMessage } from "@moon/prompt";
import type { JsonSchema } from "@moon/schema-compiler";
import type { TokenUsage } from "./llm-types";

export interface LlmTraceEntry {
  id: string;
  timestamp: string;
  agent: string;
  model: string;
  stormRound?: number;
  delegateChain?: string[];
  messages: ChatMessage[];
  schema: JsonSchema;
  response?: unknown;
  error?: string;
  tokenUsage?: TokenUsage;
  durationMs: number;
}

export interface LlmTraceSession {
  runId: string;
  runDir: string;
  entries: LlmTraceEntry[];
}

export class LlmTraceWriter {
  private readonly entries: LlmTraceEntry[] = [];
  private seq = 0;

  constructor(
    public readonly runId: string,
    public readonly runDir: string,
  ) {}

  static async create(baseDir = join(process.cwd(), ".moon", "trace")): Promise<LlmTraceWriter> {
    const runId = new Date().toISOString().replace(/[:.]/g, "-");
    const runDir = join(baseDir, runId);
    await mkdir(runDir, { recursive: true });
    return new LlmTraceWriter(runId, runDir);
  }

  async record(entry: Omit<LlmTraceEntry, "id" | "timestamp">): Promise<void> {
    this.seq++;
    const id = String(this.seq).padStart(3, "0");
    const full: LlmTraceEntry = {
      ...entry,
      id,
      timestamp: new Date().toISOString(),
    };
    this.entries.push(full);
    const base = `${id}-${entry.agent}`;
    await writeFile(join(this.runDir, `${base}.json`), JSON.stringify(full, null, 2));
    await writeFile(join(this.runDir, `${base}-messages.txt`), formatMessagesText(full.messages));
    await writeFile(join(this.runDir, "manifest.json"), JSON.stringify({
      runId: this.runId,
      entries: this.entries.map((e) => ({ id: e.id, agent: e.agent, model: e.model })),
    }, null, 2));
  }

  snapshot(): LlmTraceSession {
    return { runId: this.runId, runDir: this.runDir, entries: [...this.entries] };
  }
}

function formatMessagesText(messages: ChatMessage[]): string {
  return messages.map((m) => `=== ${m.role.toUpperCase()} ===\n${m.content}\n`).join("\n");
}

export async function showLastTrace(baseDir?: string): Promise<string | null> {
  const root = baseDir ?? join(process.cwd(), ".moon", "trace");
  if (!existsSync(root)) return null;
  const runs = (await readdir(root, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  if (runs.length === 0) return null;
  return showTraceRun(runs[runs.length - 1]!, root);
}

export async function diffTraceRuns(
  runA: string,
  runB: string,
  baseDir?: string,
): Promise<string | null> {
  const root = baseDir ?? join(process.cwd(), ".moon", "trace");
  const dirA = join(root, runA);
  const dirB = join(root, runB);
  const manifestA = join(dirA, "manifest.json");
  const manifestB = join(dirB, "manifest.json");
  if (!existsSync(manifestA) || !existsSync(manifestB)) return null;

  const a = JSON.parse(await readFile(manifestA, "utf-8")) as { entries: Array<{ id: string; agent: string; model: string }> };
  const b = JSON.parse(await readFile(manifestB, "utf-8")) as { entries: Array<{ id: string; agent: string; model: string }> };

  const lines = [
    `Trace diff`,
    `  A: ${runA} (${a.entries.length} entries)`,
    `  B: ${runB} (${b.entries.length} entries)`,
    "",
  ];

  const agentsA = a.entries.map((e) => e.agent);
  const agentsB = b.entries.map((e) => e.agent);
  const onlyA = agentsA.filter((x) => !agentsB.includes(x));
  const onlyB = agentsB.filter((x) => !agentsA.includes(x));
  if (onlyA.length) lines.push(`Only in A: ${onlyA.join(", ")}`);
  if (onlyB.length) lines.push(`Only in B: ${onlyB.join(", ")}`);

  const shared = a.entries.filter((e) => agentsB.includes(e.agent));
  for (const entry of shared) {
    const other = b.entries.find((e) => e.agent === entry.agent);
    if (!other) continue;
    const msgA = join(dirA, `${entry.id}-${entry.agent}-messages.txt`);
    const msgB = join(dirB, `${other.id}-${other.agent}-messages.txt`);
    if (!existsSync(msgA) || !existsSync(msgB)) continue;
    const textA = await readFile(msgA, "utf-8");
    const textB = await readFile(msgB, "utf-8");
    if (textA !== textB) {
      lines.push("", `--- ${entry.agent} (messages differ)`);
      lines.push(`A bytes: ${textA.length}, B bytes: ${textB.length}`);
    }
  }

  if (lines.length <= 4 && onlyA.length === 0 && onlyB.length === 0) {
    lines.push("No differences in agent sets or shared message bodies.");
  }

  return lines.join("\n");
}

export async function showTraceRun(runId: string, baseDir?: string): Promise<string | null> {
  const runDir = join(baseDir ?? join(process.cwd(), ".moon", "trace"), runId);
  const manifestPath = join(runDir, "manifest.json");
  if (!existsSync(manifestPath)) return null;
  const manifest = JSON.parse(await readFile(manifestPath, "utf-8")) as { entries: Array<{ id: string; agent: string }> };
  const parts = [`Trace run: ${runId}`, `Directory: ${runDir}`, ""];
  for (const e of manifest.entries) {
    const msgPath = join(runDir, `${e.id}-${e.agent}-messages.txt`);
    if (existsSync(msgPath)) {
      parts.push(await readFile(msgPath, "utf-8"));
    }
  }
  return parts.join("\n");
}
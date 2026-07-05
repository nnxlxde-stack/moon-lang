import { estimateCostUsd, type PricingTable, type TokenUsage } from "./pricing";

export interface ModelMetrics {
  calls: number;
  attempts: number;
  tokens: TokenUsage;
  costUsd: number;
}

export interface MemoryMetrics {
  recallHits: number;
  recallMisses: number;
}

export interface WorkerMetrics {
  flash: { executed: number; peakConcurrent: number };
  pro: { executed: number; peakConcurrent: number };
}

export interface RunMetrics {
  llmCalls: number;
  tokens: TokenUsage;
  costUsd: number;
  memory: MemoryMetrics;
  worker: WorkerMetrics;
  byModel: Record<string, ModelMetrics>;
}

export class MetricsCollector {
  private readonly totals: TokenUsage = { prompt: 0, completion: 0, cacheHit: 0, cacheMiss: 0 };
  private readonly byModel = new Map<string, ModelMetrics>();
  private llmCalls = 0;
  private costUsd = 0;
  readonly memory: MemoryMetrics = { recallHits: 0, recallMisses: 0 };
  readonly worker: WorkerMetrics = {
    flash: { executed: 0, peakConcurrent: 0 },
    pro: { executed: 0, peakConcurrent: 0 },
  };

  constructor(private readonly pricing: PricingTable) {}

  recordLlmUsage(model: string, usage: TokenUsage, attempts = 1): void {
    this.llmCalls++;
    this.totals.prompt += usage.prompt;
    this.totals.completion += usage.completion;
    this.totals.cacheHit += usage.cacheHit;
    this.totals.cacheMiss += usage.cacheMiss;

    const cost = estimateCostUsd(model, usage, this.pricing);
    this.costUsd += cost;

    const existing = this.byModel.get(model) ?? {
      calls: 0,
      attempts: 0,
      tokens: { prompt: 0, completion: 0, cacheHit: 0, cacheMiss: 0 },
      costUsd: 0,
    };

    existing.calls++;
    existing.attempts += attempts;
    existing.tokens.prompt += usage.prompt;
    existing.tokens.completion += usage.completion;
    existing.tokens.cacheHit += usage.cacheHit;
    existing.tokens.cacheMiss += usage.cacheMiss;
    existing.costUsd += cost;
    this.byModel.set(model, existing);
  }

  recordRecall(hit: boolean): void {
    if (hit) this.memory.recallHits++;
    else this.memory.recallMisses++;
  }

  recordWorkerStart(tier: "flash" | "pro", concurrent: number): void {
    const bucket = this.worker[tier];
    bucket.executed++;
    bucket.peakConcurrent = Math.max(bucket.peakConcurrent, concurrent);
  }

  snapshot(): RunMetrics {
    const byModel: Record<string, ModelMetrics> = {};
    for (const [model, metrics] of this.byModel) {
      byModel[model] = { ...metrics, tokens: { ...metrics.tokens } };
    }

    return {
      llmCalls: this.llmCalls,
      tokens: { ...this.totals },
      costUsd: this.costUsd,
      memory: { ...this.memory },
      worker: {
        flash: { ...this.worker.flash },
        pro: { ...this.worker.pro },
      },
      byModel,
    };
  }
}
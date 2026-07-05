export type ModelTier = "flash" | "pro";

export interface WorkerPoolConfig {
  flashConcurrency: number;
  proConcurrency: number;
  onAcquire?: (tier: ModelTier, active: number) => void;
}

const DEFAULT_CONFIG: WorkerPoolConfig = {
  flashConcurrency: 20,
  proConcurrency: 5,
};

export class WorkerPool {
  private readonly limits: WorkerPoolConfig;
  private readonly active = new Map<ModelTier, number>();
  private readonly queues = new Map<ModelTier, Array<() => void>>();

  constructor(config: Partial<WorkerPoolConfig> = {}) {
    this.limits = { ...DEFAULT_CONFIG, ...config };
    this.active.set("flash", 0);
    this.active.set("pro", 0);
    this.queues.set("flash", []);
    this.queues.set("pro", []);
  }

  async run<T>(tier: ModelTier, fn: () => Promise<T>): Promise<T> {
    await this.acquire(tier);
    try {
      return await fn();
    } finally {
      this.release(tier);
    }
  }

  async runAll<T>(tier: ModelTier, tasks: (() => Promise<T>)[]): Promise<T[]> {
    return Promise.all(tasks.map((task) => this.run(tier, task)));
  }

  private async acquire(tier: ModelTier): Promise<void> {
    const limit = tier === "flash" ? this.limits.flashConcurrency : this.limits.proConcurrency;

    if ((this.active.get(tier) ?? 0) < limit) {
      this.bump(tier);
      return;
    }

    await new Promise<void>((resolve) => {
      this.queues.get(tier)!.push(() => {
        this.bump(tier);
        resolve();
      });
    });
  }

  private bump(tier: ModelTier): void {
    const next = (this.active.get(tier) ?? 0) + 1;
    this.active.set(tier, next);
    this.limits.onAcquire?.(tier, next);
  }

  private release(tier: ModelTier): void {
    const next = Math.max(0, (this.active.get(tier) ?? 0) - 1);
    this.active.set(tier, next);

    const queue = this.queues.get(tier)!;
    const waiter = queue.shift();
    if (waiter) waiter();
  }
}

export function modelToTier(model: string): ModelTier {
  return model.includes("flash") ? "flash" : "pro";
}
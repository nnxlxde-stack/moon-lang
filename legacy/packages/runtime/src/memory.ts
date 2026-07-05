import { FileMemoryBackend } from "./file-memory-backend";
import type { MetricsCollector } from "./metrics";

export interface MemoryManagerOptions {
  longTermPath?: string;
  metrics?: MetricsCollector;
}

export class MemoryManager {
  private readonly stores = new Map<string, Map<string, string>>();
  private readonly runCache = new Map<string, string>();
  private readonly fileBackend?: FileMemoryBackend;
  private readonly fileScopes = new Set(["LongTerm"]);
  private readonly metrics?: MetricsCollector;

  constructor(options: MemoryManagerOptions = {}) {
    if (options.longTermPath) {
      this.fileBackend = new FileMemoryBackend(options.longTermPath);
    }
    this.metrics = options.metrics;
  }

  register(scope: string, name: string): void {
    if (!this.stores.has(scope)) {
      this.stores.set(scope, new Map());
    }
    const store = this.stores.get(scope)!;
    const defaultValue = `knowledge for ${name}`;

    if (this.fileBackend && this.fileScopes.has(scope)) {
      const existing = this.fileBackend.getSync(name);
      if (existing !== null) {
        store.set(name, existing);
      } else {
        store.set(name, defaultValue);
        void this.fileBackend.set(name, defaultValue);
      }
    } else if (!store.has(name)) {
      store.set(name, defaultValue);
    }
  }

  async recall(key: string): Promise<string> {
    const cached = this.runCache.get(key);
    if (cached !== undefined) {
      this.metrics?.recordRecall(true);
      return cached;
    }

    if (this.fileBackend) {
      const fromFile = await this.fileBackend.get(key);
      if (fromFile !== null) {
        this.metrics?.recordRecall(false);
        this.runCache.set(key, fromFile);
        return fromFile;
      }
    }

    for (const store of this.stores.values()) {
      const value = store.get(key);
      if (value !== undefined) {
        this.metrics?.recordRecall(false);
        this.runCache.set(key, value);
        return value;
      }
    }

    this.metrics?.recordRecall(false);
    const fallback = `recalled:${key}`;
    this.runCache.set(key, fallback);
    return fallback;
  }

  clearRunCache(): void {
    this.runCache.clear();
  }
}
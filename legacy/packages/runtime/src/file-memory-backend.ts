import { existsSync, readFileSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

export class FileMemoryBackend {
  constructor(private readonly rootDir: string) {}

  async ensureReady(): Promise<void> {
    await mkdir(this.rootDir, { recursive: true });
  }

  private pathFor(key: string): string {
    const safe = key.replace(/[^a-zA-Z0-9._-]/g, "_");
    return join(this.rootDir, `${safe}.txt`);
  }

  getSync(key: string): string | null {
    const path = this.pathFor(key);
    if (!existsSync(path)) return null;
    return readFileSync(path, "utf-8");
  }

  async get(key: string): Promise<string | null> {
    return this.getSync(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.ensureReady();
    await writeFile(this.pathFor(key), value, "utf-8");
  }
}

export function parseMemoryBackendUri(uri: string): string {
  if (uri.startsWith("file://")) {
    return uri.slice("file://".length);
  }
  return uri;
}
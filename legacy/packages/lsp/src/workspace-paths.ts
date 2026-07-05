import { existsSync, readdirSync, statSync } from "fs";
import { join, relative, resolve } from "path";

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".moon",
  "dist",
  "out",
  "terminals",
  "agent-tools",
  ".grok",
  ".cursor",
]);

export interface WorkspaceScanOptions {
  extensions?: string[];
  maxResults?: number;
}

export function scanWorkspacePaths(
  roots: string[],
  options: WorkspaceScanOptions = {},
): string[] {
  const max = options.maxResults ?? 800;
  const seen = new Set<string>();
  const results: string[] = [];

  for (const root of roots) {
    walk(resolve(root), resolve(root), options, seen, results, max);
    if (results.length >= max) break;
  }

  return results.sort();
}

function walk(
  root: string,
  dir: string,
  options: WorkspaceScanOptions,
  seen: Set<string>,
  results: string[],
  max: number,
): void {
  if (results.length >= max) return;

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }

  for (const entry of entries.sort()) {
    if (results.length >= max) return;
    if (entry.startsWith(".") && entry !== ".env") continue;

    const full = join(dir, entry);
    let rel = relative(root, full).replace(/\\/g, "/");
    if (!rel.startsWith(".")) rel = rel;

    let stat;
    try {
      stat = statSync(full);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      if (IGNORE_DIRS.has(entry)) continue;
      const dirPath = `${rel}/`;
      if (!seen.has(dirPath)) {
        seen.add(dirPath);
        results.push(dirPath);
      }
      walk(root, full, options, seen, results, max);
      continue;
    }

    if (options.extensions && !options.extensions.some((ext) => entry.endsWith(ext))) {
      continue;
    }

    if (seen.has(rel)) continue;
    seen.add(rel);
    results.push(rel);
  }
}

export function filterPathCompletions(
  paths: string[],
  prefix: string,
): string[] {
  const normalized = prefix.replace(/\\/g, "/");
  const slash = normalized.lastIndexOf("/");
  const dirPrefix = slash >= 0 ? normalized.slice(0, slash + 1) : "";
  const filePrefix = slash >= 0 ? normalized.slice(slash + 1) : normalized;

  return paths.filter((p) => {
    if (dirPrefix && !p.startsWith(dirPrefix)) return false;
    const tail = dirPrefix ? p.slice(dirPrefix.length) : p;
    if (tail.includes("/") && !tail.endsWith("/")) return false;
    const name = tail.endsWith("/") ? tail.slice(0, -1) : tail;
    return name.toLowerCase().startsWith(filePrefix.toLowerCase());
  });
}
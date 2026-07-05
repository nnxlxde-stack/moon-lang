import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { dirname } from "path";

export function fsReadFile(path: string): string {
  return readFileSync(path, "utf-8");
}

export function fsWriteFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf-8");
}

export function fsPathExists(path: string): boolean {
  return existsSync(path);
}

export function fsListDir(path: string): string[] {
  return readdirSync(path).filter((entry) => !entry.startsWith("."));
}

export function fsMakeDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

export function fsRemovePath(path: string): void {
  rmSync(path, { recursive: true, force: true });
}
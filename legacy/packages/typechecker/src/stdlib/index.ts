import type { Scheme } from "../types";
import { analyzersSchemes } from "./core-analyzers";
import { fsSchemes } from "./core-fs";
import { githubSchemes } from "./core-github";
import { memorySchemes } from "./core-memory";
import { networkSchemes } from "./core-network";
import { toolsSchemes } from "./core-tools";

const CORE_MODULES: Record<string, () => Map<string, Scheme>> = {
  "Core.GitHub": githubSchemes,
  "Core.Memory": memorySchemes,
  "Core.Tools": toolsSchemes,
  "Core.Analyzers": analyzersSchemes,
  "Core.FS": fsSchemes,
  "Core.Network": networkSchemes,
};

export function coreModuleSchemes(path: string): Map<string, Scheme> | null {
  const loader = CORE_MODULES[path];
  return loader ? loader() : null;
}

export function isCoreModule(path: string): boolean {
  return path in CORE_MODULES;
}

export function allCoreModulePaths(): string[] {
  return Object.keys(CORE_MODULES);
}
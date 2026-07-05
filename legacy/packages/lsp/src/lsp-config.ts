import { setMoonLogConfig } from "./log";

export interface MoonLspSettings {
  logging?: { enabled?: boolean; verbose?: boolean };
  deepseek?: { apiKey?: string; baseUrl?: string; apiFormat?: string };
  ai?: { inlineCompletions?: { enabled?: boolean; model?: string } };
  build?: { defaultTarget?: string; runBeforeStart?: boolean };
  models?: { defaultFlash?: string; defaultPro?: string };
}

let settings: MoonLspSettings = {};

export function updateMoonSettings(next: MoonLspSettings | Record<string, unknown> | undefined): void {
  settings = (next ?? {}) as MoonLspSettings;
  setMoonLogConfig({
    enabled: settings.logging?.enabled ?? true,
    verbose: settings.logging?.verbose ?? false,
  });
}

export function getMoonSettings(): MoonLspSettings {
  return settings;
}
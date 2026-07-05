export {
  findMoonfile,
  findProjectRoot,
  loadMoonfile,
  MOONFILE_NAMES,
  parseMoonfile,
  resolveMoonfileTarget,
  MoonfileParseError,
  type Moonfile,
  type MoonfileModels,
  type MoonfilePaths,
  type MoonfilePrompts,
  type MoonfileProviders,
  type MoonfileRuntime,
} from "./parse";

export function moonfileToRuntimeOverrides(moonfile: Moonfile): {
  memoryPath?: string;
  maxRepairAttempts?: number;
  flashConcurrency?: number;
  proConcurrency?: number;
  apiKey?: string;
  baseUrl?: string;
  apiFormat?: "openai" | "anthropic";
  useBeta?: boolean;
  pricingPath?: string;
  tokenizerPath?: string;
  defaultFlash?: string;
  defaultPro?: string;
  systemSuffix?: string;
  traceByDefault?: boolean;
} {
  const ds = moonfile.providers.deepseek;
  const apiKey = ds?.api_key_env
    ? process.env[ds.api_key_env]
    : ds?.api_key;
  const baseUrl = ds?.base_url_env
    ? process.env[ds.base_url_env]
    : ds?.base_url;

  return {
    memoryPath: moonfile.runtime.memory?.long_term_backend,
    maxRepairAttempts: moonfile.runtime.retries?.max_repair_attempts,
    flashConcurrency: moonfile.runtime.worker_pool?.flash_concurrency,
    proConcurrency: moonfile.runtime.worker_pool?.pro_concurrency,
    apiKey,
    baseUrl,
    apiFormat: ds?.api_format,
    useBeta: ds?.use_beta,
    pricingPath: moonfile.paths.pricing,
    tokenizerPath: moonfile.paths.tokenizer,
    defaultFlash: moonfile.models.default_flash,
    defaultPro: moonfile.models.default_pro,
    systemSuffix: moonfile.prompts.default_system_suffix,
    traceByDefault: moonfile.prompts.trace_by_default,
  };
}
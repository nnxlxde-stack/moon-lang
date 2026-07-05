import type { RunMetrics } from "./metrics";

export function formatMetrics(metrics: RunMetrics): string {
  const lines = [
    "metrics:",
    `  llm_calls: ${metrics.llmCalls}`,
    `  tokens: prompt=${metrics.tokens.prompt} completion=${metrics.tokens.completion} cache_hit=${metrics.tokens.cacheHit} cache_miss=${metrics.tokens.cacheMiss}`,
    `  cost_usd: $${metrics.costUsd.toFixed(6)}`,
    `  recall_cache: hits=${metrics.memory.recallHits} misses=${metrics.memory.recallMisses}`,
    `  worker_flash: executed=${metrics.worker.flash.executed} peak=${metrics.worker.flash.peakConcurrent}`,
    `  worker_pro: executed=${metrics.worker.pro.executed} peak=${metrics.worker.pro.peakConcurrent}`,
  ];

  for (const [model, modelMetrics] of Object.entries(metrics.byModel)) {
    lines.push(
      `  ${model}: calls=${modelMetrics.calls} tokens=${modelMetrics.tokens.prompt + modelMetrics.tokens.completion} cost=$${modelMetrics.costUsd.toFixed(6)}`,
    );
  }

  return lines.join("\n");
}
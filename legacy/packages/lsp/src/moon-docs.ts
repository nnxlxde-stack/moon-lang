export function isSectionHeader(trimmed: string): boolean {
  if (!trimmed.startsWith("--")) return false;
  const body = trimmed.slice(2).trim();
  return /^=+$/.test(body) || body.startsWith("===") || body.length === 0;
}

export function extractMoonDocs(source: string, declLine: number): string | undefined {
  const lines = source.split(/\r?\n/);
  const docLines: string[] = [];
  let i = declLine - 2;

  while (i >= 0) {
    const raw = lines[i] ?? "";
    const trimmed = raw.trim();

    if (!trimmed) {
      if (docLines.length > 0) break;
      i--;
      continue;
    }

    if (trimmed.startsWith("--?")) {
      docLines.unshift(trimmed.slice(3).trim());
      i--;
      continue;
    }

    if (trimmed === "-- moon-doc" || trimmed.startsWith("-- moon-doc ")) {
      i--;
      while (i >= 0) {
        const block = lines[i]?.trim() ?? "";
        if (!block) break;
        if (block.startsWith("--")) {
          const text = block.slice(2).trim();
          if (text === "moon-doc" || isSectionHeader(block)) break;
          docLines.unshift(text);
          i--;
          continue;
        }
        break;
      }
      break;
    }

    if (trimmed.startsWith("--") && !isSectionHeader(trimmed)) {
      docLines.unshift(trimmed.slice(2).trim());
      i--;
      continue;
    }

    break;
  }

  return docLines.length > 0 ? docLines.join("\n") : undefined;
}

export function formatHoverDocs(name: string, type: string, module?: string, docs?: string): string {
  const parts = [`**${name}**`, `\`\`\`moon\n${type}\n\`\`\``];
  if (module) parts.push(`from \`${module}\``);
  if (docs) parts.push(docs);
  return parts.join("\n\n");
}
export { type Token, type TokenKind, KEYWORDS, LAYOUT_OPENERS } from "./tokens";
export { rawLex, LexError } from "./raw-lexer";
export { applyLayout } from "./layout";

import { applyLayout } from "./layout";
import { rawLex } from "./raw-lexer";
import type { Token } from "./tokens";

export function lex(source: string, options?: { layout?: boolean }): Token[] {
  const raw = rawLex(source);
  if (options?.layout === false) return raw;
  return applyLayout(source, raw);
}
import { lex } from "@moon/lexer";
import type { Program } from "@moon/ast";
import { parseProgram } from "./declarations";
import { TokenStream, ParseError } from "./token-stream";

export { ParseError } from "./token-stream";
export { parseProgram } from "./declarations";

export function parse(source: string, options?: { layout?: boolean }): Program {
  const tokens = lex(source, { layout: options?.layout ?? true });
  const ts = new TokenStream(tokens);
  return parseProgram(ts);
}

export function parseWithTokens(tokens: import("@moon/lexer").Token[]): Program {
  const ts = new TokenStream(tokens);
  return parseProgram(ts);
}
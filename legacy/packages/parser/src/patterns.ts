import type { Pattern } from "@moon/ast";
import { ParseError, type TokenStream } from "./token-stream";
import { parseLiteral } from "./literals";

export interface ParsePatternOptions {
  allowApp?: boolean;
}

export function parsePattern(ts: TokenStream, opts: ParsePatternOptions = {}): Pattern {
  if (opts.allowApp === false) {
    return parsePatternAtom(ts);
  }
  return parsePatternApp(ts);
}

function parsePatternApp(ts: TokenStream): Pattern {
  const start = ts.peek();
  let pat = parsePatternAtom(ts);

  if (pat.kind === "PVar" || pat.kind === "PCon") {
    const args: Pattern[] = [];
    while (isPatternAtomStart(ts)) {
      args.push(parsePatternAtom(ts));
    }
    if (args.length > 0) {
      const end = ts.last();
      return { kind: "PCon", name: pat.name, args, span: ts.makeSpan(start, end) };
    }
  }

  return pat;
}

function isPatternAtomStart(ts: TokenStream): boolean {
  return ts.check("IDENT", "LPAREN", "LBRACKET", "STRING", "INT", "FLOAT", "KW_TRUE", "KW_FALSE");
}

function parsePatternAtom(ts: TokenStream): Pattern {
  const start = ts.peek();

  if (ts.at("LPAREN")) {
    ts.advance();
    const elements: Pattern[] = [];
    if (!ts.at("RPAREN")) {
      elements.push(parsePattern(ts));
      while (ts.skip("COMMA")) {
        elements.push(parsePattern(ts));
      }
    }
    const end = ts.expect("RPAREN");
    return { kind: "PTuple", elements, span: ts.makeSpan(start, end) };
  }

  if (ts.at("LBRACKET")) {
    ts.advance();
    const elements: Pattern[] = [];
    if (!ts.at("RBRACKET")) {
      elements.push(parsePattern(ts));
      while (ts.skip("COMMA")) {
        elements.push(parsePattern(ts));
      }
    }
    const end = ts.expect("RBRACKET");
    return { kind: "PList", elements, span: ts.makeSpan(start, end) };
  }

  if (ts.check("STRING", "INT", "FLOAT", "KW_TRUE", "KW_FALSE")) {
    const lit = parseLiteral(ts);
    return { kind: "PLit", value: lit, span: lit.span };
  }

  if (ts.at("IDENT")) {
    const tok = ts.advance();
    if (tok.value === "_") {
      return { kind: "PWildcard", span: ts.makeSpan(start, tok) };
    }
    if (/^[A-Z]/.test(tok.value!)) {
      return { kind: "PCon", name: tok.value!, args: [], span: ts.makeSpan(start, tok) };
    }
    return { kind: "PVar", name: tok.value!, span: ts.makeSpan(start, tok) };
  }

  throw new ParseError("Expected pattern", start.line, start.column);
}
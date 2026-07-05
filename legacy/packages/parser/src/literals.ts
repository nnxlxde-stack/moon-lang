import type { Literal } from "@moon/ast";
import { ParseError, type TokenStream } from "./token-stream";

export function parseLiteral(ts: TokenStream): Literal {
  const start = ts.peek();

  if (ts.at("STRING")) {
    const tok = ts.advance();
    return { kind: "String", value: tok.value!, span: ts.makeSpan(start, tok) };
  }
  if (ts.at("INT")) {
    const tok = ts.advance();
    return { kind: "Int", value: parseInt(tok.value!, 10), span: ts.makeSpan(start, tok) };
  }
  if (ts.at("FLOAT")) {
    const tok = ts.advance();
    return { kind: "Float", value: parseFloat(tok.value!), span: ts.makeSpan(start, tok) };
  }
  if (ts.at("KW_TRUE")) {
    const tok = ts.advance();
    return { kind: "Bool", value: true, span: ts.makeSpan(start, tok) };
  }
  if (ts.at("KW_FALSE")) {
    const tok = ts.advance();
    return { kind: "Bool", value: false, span: ts.makeSpan(start, tok) };
  }

  throw new ParseError("Expected literal", start.line, start.column);
}
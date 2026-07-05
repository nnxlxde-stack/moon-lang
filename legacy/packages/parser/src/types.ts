import type { TypeSpec } from "@moon/ast";
import { ParseError, type TokenStream } from "./token-stream";

export function parseTypeSpec(ts: TokenStream): TypeSpec {
  return parseTypeArrow(ts);
}

function parseTypeArrow(ts: TokenStream): TypeSpec {
  const start = ts.peek();
  const left = parseTypeApp(ts);

  if (ts.at("ARROW")) {
    ts.advance();
    const right = parseTypeArrow(ts);
    return { kind: "Arrow", from: left, to: right, span: ts.makeSpan(start, ts.last()) };
  }

  return left;
}

function isUpperName(name: string): boolean {
  return name[0] === name[0]!.toUpperCase();
}

function parseTypeApp(ts: TokenStream): TypeSpec {
  const start = ts.peek();
  const head = parseTypeAtom(ts);
  const args: TypeSpec[] = [];
  let lastWasParen = false;

  while (true) {
    if (
      ts.at("IDENT")
      && !isUpperName(ts.peek().value ?? "")
      && (ts.peek(1).kind === "EQUALS" || ts.peek(2).kind === "EQUALS")
    ) {
      break;
    }
    if (ts.at("LPAREN") || ts.at("LBRACKET")) {
      args.push(parseTypeAtom(ts));
      lastWasParen = true;
      continue;
    }
    if (!ts.at("IDENT")) break;
    const name = ts.peek().value!;
    if (isUpperName(name) || (name.length === 1 && name === name.toLowerCase())) {
      args.push(parseTypeAtom(ts));
      lastWasParen = false;
      continue;
    }
    break;
  }

  if (args.length > 0) {
    return { kind: "Con", name: typeName(head), args, span: ts.makeSpan(start, ts.last()) };
  }
  return head;
}

function typeName(t: TypeSpec): string {
  if (t.kind === "Con") return t.name;
  if (t.kind === "Var") return t.name;
  throw new Error("Invalid type atom");
}

function parseTypeAtom(ts: TokenStream): TypeSpec {
  const start = ts.peek();

  if (ts.at("LBRACKET")) {
    ts.advance();
    const element = parseTypeSpec(ts);
    const end = ts.expect("RBRACKET");
    return { kind: "List", element, span: ts.makeSpan(start, end) };
  }

  if (ts.at("LPAREN")) {
    ts.advance();
    const elements: TypeSpec[] = [];
    if (!ts.at("RPAREN")) {
      elements.push(parseTypeSpec(ts));
      while (ts.skip("COMMA")) {
        elements.push(parseTypeSpec(ts));
      }
    }
    const end = ts.expect("RPAREN");
    if (elements.length === 1) return elements[0]!;
    return { kind: "Tuple", elements, span: ts.makeSpan(start, end) };
  }

  if (ts.at("IDENT")) {
    const tok = ts.advance();
    return { kind: "Var", name: tok.value!, span: ts.makeSpan(start, tok) };
  }

  throw new ParseError("Expected type", start.line, start.column);
}
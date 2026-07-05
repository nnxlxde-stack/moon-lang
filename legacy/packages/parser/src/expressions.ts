import type { ConfigItem, DoBlock, DoStatement, Expression, RecordField } from "@moon/ast";
import { ParseError, type TokenStream } from "./token-stream";
import { parseLiteral } from "./literals";
import { parseAgentDecl, parseModelDecl } from "./declarations";
import { parsePattern } from "./patterns";

type InfixOp = { kind: string; precedence: number; assoc: "left" | "right" };

const INFIX_OPS: Record<string, InfixOp> = {
  "$": { kind: "$", precedence: 1, assoc: "right" },
  ">>=": { kind: ">>=", precedence: 2, assoc: "left" },
  ">>": { kind: ">>", precedence: 2, assoc: "left" },
  "||": { kind: "||", precedence: 3, assoc: "left" },
  "&&": { kind: "&&", precedence: 4, assoc: "left" },
  "==": { kind: "==", precedence: 6, assoc: "left" },
  "/=": { kind: "/=", precedence: 6, assoc: "left" },
  "<=": { kind: "<=", precedence: 6, assoc: "left" },
  ">=": { kind: ">=", precedence: 6, assoc: "left" },
  "<": { kind: "<", precedence: 6, assoc: "left" },
  ">": { kind: ">", precedence: 6, assoc: "left" },
  "+": { kind: "+", precedence: 7, assoc: "left" },
  "-": { kind: "-", precedence: 7, assoc: "left" },
  "*": { kind: "*", precedence: 8, assoc: "left" },
  "/": { kind: "/", precedence: 8, assoc: "left" },
  ".": { kind: ".", precedence: 9, assoc: "left" },
};

function tokenToOp(kind: string, value?: string): string | null {
  switch (kind) {
    case "DOLLAR": return "$";
    case "SEQ": return value ?? ">>";
    case "OR": return "||";
    case "AND": return "&&";
    case "EQ": return "==";
    case "NEQ": return "/=";
    case "LE": return "<=";
    case "GE": return ">=";
    case "LT": return "<";
    case "GT": return ">";
    case "PLUS": return "+";
    case "MINUS": return "-";
    case "STAR": return "*";
    case "SLASH": return "/";
    case "COMPOSE_DOT": return ".";
    default: return null;
  }
}

export function parseExpression(ts: TokenStream): Expression {
  return parseDollar(ts);
}

function parseDollar(ts: TokenStream): Expression {
  let left = parseSeq(ts);
  while (ts.at("DOLLAR")) {
    const opTok = ts.advance();
    const right = parseDollar(ts);
    left = { kind: "Infix", op: "$", left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}

function parseSeq(ts: TokenStream): Expression {
  let left = parseOr(ts);
  while (ts.at("SEQ")) {
    const opTok = ts.advance();
    const op = opTok.value ?? ">>";
    const right = parseOr(ts);
    left = { kind: "Infix", op, left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}

function parseOr(ts: TokenStream): Expression {
  let left = parseAnd(ts);
  while (ts.at("OR")) {
    const opTok = ts.advance();
    const right = parseAnd(ts);
    left = { kind: "Infix", op: "||", left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}

function parseAnd(ts: TokenStream): Expression {
  let left = parseNot(ts);
  while (ts.at("AND")) {
    const opTok = ts.advance();
    const right = parseNot(ts);
    left = { kind: "Infix", op: "&&", left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}

function parseNot(ts: TokenStream): Expression {
  const start = ts.peek();
  if (ts.at("KW_NOT") && ts.peek(1).kind !== "COMPOSE_DOT") {
    const opTok = ts.advance();
    const operand = parseNot(ts);
    return { kind: "Prefix", op: "not", operand, span: ts.makeSpan(start, ts.last()) };
  }
  return parseCompare(ts);
}

function parseCompare(ts: TokenStream): Expression {
  let left = parseAdd(ts);
  const op = tokenToOp(ts.peek().kind, ts.peek().value);
  if (op && INFIX_OPS[op]?.precedence === 6) {
    const opTok = ts.advance();
    const right = parseAdd(ts);
    left = { kind: "Infix", op, left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}

function parseAdd(ts: TokenStream): Expression {
  let left = parseMul(ts);
  while (ts.check("PLUS", "MINUS")) {
    const opTok = ts.advance();
    const op = opTok.kind === "PLUS" ? "+" : "-";
    const right = parseMul(ts);
    left = { kind: "Infix", op, left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}

function parseMul(ts: TokenStream): Expression {
  let left = parseCompose(ts);
  while (ts.check("STAR", "SLASH")) {
    const opTok = ts.advance();
    const op = opTok.kind === "STAR" ? "*" : "/";
    const right = parseCompose(ts);
    left = { kind: "Infix", op, left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}

function parseCompose(ts: TokenStream): Expression {
  let left = parseUnary(ts);
  while (ts.at("COMPOSE_DOT")) {
    const opTok = ts.advance();
    const right = parseUnary(ts);
    left = { kind: "Infix", op: ".", left, right, span: ts.makeSpan(opTok, ts.last()) };
  }
  return left;
}

function parseUnary(ts: TokenStream): Expression {
  const start = ts.peek();
  if (ts.at("MINUS")) {
    const opTok = ts.advance();
    const operand = parseUnary(ts);
    return { kind: "Prefix", op: "-", operand, span: ts.makeSpan(start, ts.last()) };
  }
  return parseApp(ts);
}

function parseApp(ts: TokenStream): Expression {
  let expr = parsePostfix(ts);
  while (isPrimaryStart(ts)) {
    const startPos = expr.span.start;
    const arg = parsePostfix(ts);
    const startTok = { line: startPos.line, column: startPos.column, offset: startPos.offset, kind: "IDENT" as const };
    expr = { kind: "App", func: expr, arg, span: ts.makeSpan(startTok, ts.last()) };
  }
  return expr;
}

function parsePostfix(ts: TokenStream): Expression {
  let expr = parsePrimary(ts);
  if (expr.kind === "Var" && ts.at("LBRACE") && isUpperName(expr.name)) {
    expr = parseRecordExpr(ts, expr.name, { line: expr.span.start.line, column: expr.span.start.column, offset: expr.span.start.offset, kind: "IDENT" });
  }
  while (ts.at("FIELD_DOT")) {
    ts.advance();
    const field = ts.expect("IDENT").value!;
    expr = {
      kind: "FieldAccess",
      object: expr,
      field,
      span: { start: expr.span.start, end: { line: ts.last().line, column: ts.last().column, offset: ts.last().offset } },
    };
  }
  return expr;
}

function isUpperName(name: string): boolean {
  return name[0] === name[0]!.toUpperCase();
}

function canStartPattern(ts: TokenStream): boolean {
  return ts.check("IDENT", "LPAREN", "LBRACKET", "STRING", "INT", "FLOAT", "KW_TRUE", "KW_FALSE");
}

function isPrimaryStart(ts: TokenStream): boolean {
  if (ts.check("SEMI", "RBRACE", "EOF", "RPAREN", "RBRACKET", "COMMA", "COLON", "BIND", "KW_WITH", "KW_ELSE", "KW_THEN", "ARROW")) {
    return false;
  }
  if (ts.at("IDENT") && ts.peek(1).kind === "COLON") {
    return false;
  }
  return ts.check(
    "IDENT", "STRING", "INT", "FLOAT", "KW_TRUE", "KW_FALSE",
    "LPAREN", "LBRACKET", "BACKSLASH", "KW_IF", "KW_DO", "KW_AGENT", "KW_MODEL",
    "MINUS", "KW_PURE",
  );
}

function parsePrimary(ts: TokenStream): Expression {
  const start = ts.peek();

  if (ts.at("KW_PURE")) {
    ts.advance();
    if (ts.at("DOLLAR")) {
      ts.advance();
      const expr = parseExpression(ts);
      return { kind: "App", func: { kind: "Var", name: "pure", span: ts.makeSpan(start, start) }, arg: expr, span: ts.makeSpan(start, ts.last()) };
    }
    return { kind: "Var", name: "pure", span: ts.makeSpan(start, ts.last()) };
  }

  if (ts.at("KW_NOT")) {
    const tok = ts.advance();
    return { kind: "Var", name: "not", span: ts.makeSpan(start, tok) };
  }

  if (ts.check("STRING", "INT", "FLOAT", "KW_TRUE", "KW_FALSE")) {
    const lit = parseLiteral(ts);
    return { kind: "Lit", value: lit, span: lit.span };
  }

  if (ts.at("IDENT")) {
    const tok = ts.advance();
    if (ts.at("LBRACE") && isUpperName(tok.value!)) {
      return parseRecordExpr(ts, tok.value!, start);
    }
    return { kind: "Var", name: tok.value!, span: ts.makeSpan(start, tok) };
  }

  if (ts.at("LPAREN")) {
    ts.advance();
    if (ts.at("RPAREN")) {
      const end = ts.advance();
      return { kind: "Tuple", elements: [], span: ts.makeSpan(start, end) };
    }
    const expr = parseExpression(ts);
    if (ts.at("RPAREN")) {
      const end = ts.advance();
      return { kind: "Paren", expr, span: ts.makeSpan(start, end) };
    }
    const elements = [expr];
    while (ts.skip("COMMA")) {
      elements.push(parseExpression(ts));
    }
    const end = ts.expect("RPAREN");
    if (elements.length === 1) {
      return { kind: "Paren", expr: elements[0]!, span: ts.makeSpan(start, end) };
    }
    return { kind: "Tuple", elements, span: ts.makeSpan(start, end) };
  }

  if (ts.at("LBRACKET")) {
    ts.advance();
    const elements: Expression[] = [];
    if (!ts.at("RBRACKET")) {
      elements.push(parseExpression(ts));
      while (ts.skip("COMMA")) {
        elements.push(parseExpression(ts));
      }
    }
    const end = ts.expect("RBRACKET");
    return { kind: "List", elements, span: ts.makeSpan(start, end) };
  }

  if (ts.at("BACKSLASH")) {
    ts.advance();
    const params: string[] = [];
    while (ts.at("IDENT")) {
      params.push(ts.advance().value!);
    }
    ts.expect("ARROW");
    const body = ts.at("KW_DO") ? parseDoBlock(ts) : parseExpression(ts);
    return { kind: "Lambda", params, body, span: ts.makeSpan(start, ts.last()) };
  }

  if (ts.at("KW_IF")) {
    ts.advance();
    const condition = parseExpression(ts);
    ts.expect("KW_THEN");
    const thenBranch = parseExpression(ts);
    ts.expect("KW_ELSE");
    const elseBranch = parseExpression(ts);
    return { kind: "If", condition, thenBranch, elseBranch, span: ts.makeSpan(start, ts.last()) };
  }

  if (ts.at("KW_DO")) {
    const block = parseDoBlock(ts);
    return { kind: "Do", block, span: block.span };
  }

  if (ts.at("KW_AGENT")) {
    const decl = parseAgentDecl(ts);
    return { kind: "Agent", decl, span: decl.span };
  }

  if (ts.at("KW_MODEL")) {
    const decl = parseModelDecl(ts);
    return { kind: "Model", decl, span: decl.span };
  }

  throw new ParseError("Expected expression", start.line, start.column);
}

function parseRecordExpr(ts: TokenStream, name: string, start: ReturnType<TokenStream["peek"]>): Expression {
  ts.expect("LBRACE");
  const fields: RecordField[] = [];

  while (!ts.at("RBRACE") && !ts.at("EOF")) {
    if (ts.skip("SEMI") || ts.skip("COMMA")) continue;
    const fieldStart = ts.peek();
    const fieldName = ts.expect("IDENT").value!;
    ts.expect("EQUALS");
    const value = parseExpression(ts);
    fields.push({ name: fieldName, value, span: ts.makeSpan(fieldStart, ts.last()) });
    if (ts.skip("COMMA")) continue;
    if (ts.skip("SEMI")) continue;
  }

  const end = ts.expect("RBRACE");
  return { kind: "Record", name, fields, span: ts.makeSpan(start, end) };
}

export function parseConfigItems(ts: TokenStream): ConfigItem[] {
  const items: ConfigItem[] = [];

  while (true) {
    if (ts.at("LBRACE")) ts.advance();
    if (!(ts.at("IDENT") && ts.peek(1).kind === "COLON")) break;

    const keyStart = ts.peek();
    const key = ts.advance().value!;
    ts.expect("COLON");
    const value = parseExpression(ts);
    items.push({ key, value, span: ts.makeSpan(keyStart, ts.last()) });

    if (ts.skip("SEMI")) continue;
    if (ts.at("RBRACE")) {
      ts.advance();
      break;
    }
  }

  return items;
}

export function parseDoBlock(ts: TokenStream): DoBlock {
  const start = ts.expect("KW_DO");
  if (ts.at("LBRACE")) ts.advance();
  const statements: DoStatement[] = [];

  while (!ts.at("RBRACE") && !ts.at("EOF")) {
    if (ts.skip("SEMI")) continue;
    statements.push(parseDoStatementFixed(ts));
  }

  if (ts.at("RBRACE")) ts.advance();

  return { statements, span: ts.makeSpan(start, ts.last()) };
}

function parseDoStatement(ts: TokenStream): DoStatement {
  const start = ts.peek();

  if (ts.at("KW_LET")) {
    ts.advance();
    const pattern = parsePattern(ts);
    ts.expect("EQUALS");
    const expr = parseExpression(ts);
    return { kind: "Let", pattern, expr, span: ts.makeSpan(start, ts.last()) };
  }

  const pattern = parsePattern(ts);
  if (ts.at("BIND")) {
    ts.advance();
    if (ts.at("KW_STORM")) {
      ts.advance();
      const input = parseExpression(ts);
      const config = parseTrailingConfig(ts);
      return { kind: "Storm", pattern, input, config, span: ts.makeSpan(start, ts.last()) };
    }
    const expr = parseExpression(ts);
    const config = parseTrailingConfig(ts);
    return { kind: "Bind", pattern, expr, config, span: ts.makeSpan(start, ts.last()) };
  }

  throw new ParseError("Invalid do statement", start.line, start.column);
}

export function parseActionExpr(ts: TokenStream): DoStatement {
  const start = ts.peek();
  let expr = parseExpression(ts);
  const config = parseTrailingConfig(ts);
  return { kind: "Action", expr, config, span: ts.makeSpan(start, ts.last()) };
}

function parseTrailingConfig(ts: TokenStream): ConfigItem[] {
  if (ts.at("KW_WITH")) {
    ts.advance();
    return parseConfigItems(ts);
  }

  if (ts.at("LBRACE") || (ts.at("IDENT") && ts.peek(1).kind === "COLON")) {
    return parseConfigItems(ts);
  }

  return [];
}

export function parseDoStatementFixed(ts: TokenStream): DoStatement {
  const start = ts.peek();

  if (ts.at("KW_LET")) {
    ts.advance();
    const pattern = parsePattern(ts);
    ts.expect("EQUALS");
    const expr = parseExpression(ts);
    return { kind: "Let", pattern, expr, span: ts.makeSpan(start, ts.last()) };
  }

  if (canStartPattern(ts)) {
    const pos = ts.save();
    const pattern = parsePattern(ts);
    if (ts.at("BIND")) {
      ts.advance();
      if (ts.at("KW_STORM")) {
        ts.advance();
        const input = parseExpression(ts);
        const config = parseTrailingConfig(ts);
        return { kind: "Storm", pattern, input, config, span: ts.makeSpan(start, ts.last()) };
      }
      const expr = parseExpression(ts);
      const config = parseTrailingConfig(ts);
      return { kind: "Bind", pattern, expr, config, span: ts.makeSpan(start, ts.last()) };
    }
    ts.restore(pos);
  }

  const expr = parseExpression(ts);
  const config = parseTrailingConfig(ts);
  return { kind: "Action", expr, config, span: ts.makeSpan(start, ts.last()) };
}
import { LAYOUT_OPENERS, type Token, type TokenKind } from "./tokens";

interface SourceLine {
  indent: number;
  tokens: Token[];
}

function lineIndent(source: string, tok: Token): number {
  let pos = tok.offset - 1;
  while (pos >= 0 && source[pos] !== "\n") pos--;
  return getIndentAt(source, pos + 1);
}

function getIndentAt(source: string, start: number): number {
  let col = 0;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (ch === " ") col++;
    else if (ch === "\t") col += 4;
    else break;
  }
  return col;
}

function groupLines(tokens: Token[]): SourceLine[] {
  const lines: SourceLine[] = [];
  let current: Token[] = [];

  for (const tok of tokens) {
    if (tok.kind === "NEWLINE") {
      if (current.length > 0) lines.push({ indent: 0, tokens: current });
      current = [];
    } else if (tok.kind !== "EOF") {
      current.push(tok);
    }
  }
  if (current.length > 0) lines.push({ indent: 0, tokens: current });
  return lines;
}

function synthetic(kind: TokenKind, ref: Token): Token {
  return { kind, line: ref.line, column: ref.column, offset: ref.offset };
}

function lineHasLayoutOpener(tokens: Token[]): boolean {
  return tokens.some((t) => LAYOUT_OPENERS.has(t.kind));
}

function lineOpensImplicitConfig(tokens: Token[]): boolean {
  return (
    tokens.some((t) => t.kind === "KW_AGENT" || t.kind === "KW_MODEL") &&
    !tokens.some((t) => t.kind === "KW_WHERE")
  );
}

export function applyLayout(source: string, rawTokens: Token[]): Token[] {
  const rawLines = groupLines(rawTokens);
  const lines: SourceLine[] = rawLines.map((l) => ({
    indent: l.tokens.length > 0 ? lineIndent(source, l.tokens[0]!) : 0,
    tokens: l.tokens,
  }));

  const result: Token[] = [];
  const indentStack: number[] = [];
  let pendingLayout = false;
  let pendingImplicit = false;
  let firstInBlock = false;

  const closeLayoutsAbove = (indent: number, ref: Token) => {
    while (indentStack.length > 0 && indentStack[indentStack.length - 1]! > indent) {
      indentStack.pop();
      result.push(synthetic("RBRACE", ref));
      firstInBlock = false;
    }
  };

  const openLayout = (indent: number, ref: Token) => {
    indentStack.push(indent);
    result.push(synthetic("LBRACE", ref));
    firstInBlock = true;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.tokens.length === 0) continue;

    const ref = line.tokens[0]!;
    closeLayoutsAbove(line.indent, ref);

    if (pendingLayout || pendingImplicit) {
      if (line.indent > (indentStack[indentStack.length - 1] ?? -1)) {
        openLayout(line.indent, ref);
      }
      pendingLayout = false;
      pendingImplicit = false;
    } else if (indentStack.length > 0 && line.indent === indentStack[indentStack.length - 1] && !firstInBlock) {
      result.push(synthetic("SEMI", ref));
    }

    for (const tok of line.tokens) {
      result.push(tok);
      if (LAYOUT_OPENERS.has(tok.kind)) {
        pendingLayout = true;
      }
    }

    if (lineOpensImplicitConfig(line.tokens)) {
      const next = lines[i + 1];
      if (next && next.tokens.length > 0 && next.indent > line.indent) {
        pendingImplicit = true;
      }
    }

    if (indentStack.length > 0 && line.indent >= indentStack[indentStack.length - 1]!) {
      firstInBlock = false;
    }
  }

  const eofRef: Token = { kind: "EOF", line: 0, column: 0, offset: source.length };
  closeLayoutsAbove(-1, eofRef);
  result.push(eofRef);

  return result;
}
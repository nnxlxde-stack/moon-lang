import type { Token, TokenKind } from "@moon/lexer";

export class ParseError extends Error {
  constructor(
    message: string,
    public line: number,
    public column: number,
  ) {
    super(`${message} at ${line}:${column}`);
    this.name = "ParseError";
  }
}

export class TokenStream {
  private pos = 0;

  constructor(private tokens: Token[]) {}

  peek(offset = 0): Token {
    return this.tokens[this.pos + offset] ?? this.tokens[this.tokens.length - 1]!;
  }

  advance(): Token {
    const tok = this.peek();
    if (tok.kind !== "EOF") this.pos++;
    return tok;
  }

  at(kind: TokenKind): boolean {
    return this.peek().kind === kind;
  }

  check(...kinds: TokenKind[]): boolean {
    return kinds.includes(this.peek().kind);
  }

  expect(kind: TokenKind): Token {
    const tok = this.peek();
    if (tok.kind !== kind) {
      throw new ParseError(`Expected ${kind}, got ${tok.kind}`, tok.line, tok.column);
    }
    return this.advance();
  }

  skip(kind: TokenKind): boolean {
    if (this.at(kind)) {
      this.advance();
      return true;
    }
    return false;
  }

  spanFrom(start: Token): { line: number; column: number; offset: number } {
    const end = this.tokens[Math.max(0, this.pos - 1)];
    return {
      start: { line: start.line, column: start.column, offset: start.offset },
      end: { line: end?.line ?? start.line, column: end?.column ?? start.column, offset: end?.offset ?? start.offset },
    };
  }

  makeSpan(start: Token, end: Token) {
    return {
      start: { line: start.line, column: start.column, offset: start.offset },
      end: { line: end.line, column: end.column, offset: end.offset },
    };
  }

  last(): Token {
    return this.tokens[Math.max(0, this.pos - 1)] ?? this.peek();
  }

  save(): number {
    return this.pos;
  }

  restore(pos: number): void {
    this.pos = pos;
  }
}
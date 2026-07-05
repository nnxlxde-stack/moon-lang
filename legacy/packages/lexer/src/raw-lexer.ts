import { KEYWORDS, type Token, type TokenKind } from "./tokens";

export class LexError extends Error {
  constructor(
    message: string,
    public line: number,
    public column: number,
  ) {
    super(`${message} at ${line}:${column}`);
    this.name = "LexError";
  }
}

interface RawToken extends Token {
  hadSpaceBefore: boolean;
  hadSpaceAfter: boolean;
}

export function rawLex(source: string): Token[] {
  const tokens: RawToken[] = [];
  let i = 0;
  let line = 1;
  let column = 1;

  const peek = (n = 0) => source[i + n] ?? "";
  const advance = () => {
    const ch = source[i++];
    if (ch === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
    return ch;
  };

  const makeToken = (
    kind: TokenKind,
    value: string | undefined,
    startLine: number,
    startCol: number,
    startOffset: number,
    hadSpaceBefore: boolean,
    hadSpaceAfter: boolean,
  ): RawToken => ({
    kind,
    value,
    line: startLine,
    column: startCol,
    offset: startOffset,
    hadSpaceBefore,
    hadSpaceAfter,
  });

  const skipComment = () => {
    advance(); // second -
    while (i < source.length && peek() !== "\n") advance();
  };

  const readString = (startLine: number, startCol: number, startOffset: number, hadSpaceBefore: boolean) => {
    const quote = advance();
    if (quote === '"') {
      if (peek() === '"' && peek(1) === '"') {
        advance();
        advance();
        let value = "";
        while (i < source.length) {
          if (peek() === '"' && peek(1) === '"' && peek(2) === '"') {
            advance();
            advance();
            advance();
            break;
          }
          value += advance();
        }
        const hadSpaceAfter = peek() === " " || peek() === "\t";
        tokens.push(makeToken("STRING", value, startLine, startCol, startOffset, hadSpaceBefore, hadSpaceAfter));
        return;
      }
      let value = "";
      while (i < source.length && peek() !== '"') {
        if (peek() === "\\") {
          advance();
          value += advance();
        } else {
          value += advance();
        }
      }
      if (peek() !== '"') throw new LexError("Unterminated string", line, column);
      advance();
      const hadSpaceAfter = peek() === " " || peek() === "\t";
      tokens.push(makeToken("STRING", value, startLine, startCol, startOffset, hadSpaceBefore, hadSpaceAfter));
      return;
    }
  };

  const readNumber = (startLine: number, startCol: number, startOffset: number, hadSpaceBefore: boolean) => {
    let num = "";
    while (/[0-9]/.test(peek())) num += advance();
    if (peek() === "." && /[0-9]/.test(peek(1))) {
      num += advance();
      while (/[0-9]/.test(peek())) num += advance();
      const hadSpaceAfter = peek() === " " || peek() === "\t";
      tokens.push(makeToken("FLOAT", num, startLine, startCol, startOffset, hadSpaceBefore, hadSpaceAfter));
      return;
    }
    const hadSpaceAfter = peek() === " " || peek() === "\t";
    tokens.push(makeToken("INT", num, startLine, startCol, startOffset, hadSpaceBefore, hadSpaceAfter));
  };

  const MODIFIER_KEYWORDS = new Set(["constraint", "default", "optional", "fetched"]);

  const readIdent = (startLine: number, startCol: number, startOffset: number, hadSpaceBefore: boolean) => {
    let ident = "";
    while (/[a-zA-Z0-9_\-]/.test(peek())) ident += advance();
    const hadSpaceAfter = peek() === " " || peek() === "\t";
    const kw = KEYWORDS[ident];
    const isConfigKey = peek() === ":" && peek(1) !== ":";
    if (kw && !(isConfigKey && !MODIFIER_KEYWORDS.has(ident))) {
      tokens.push(makeToken(kw, ident, startLine, startCol, startOffset, hadSpaceBefore, hadSpaceAfter));
    } else {
      tokens.push(makeToken("IDENT", ident, startLine, startCol, startOffset, hadSpaceBefore, hadSpaceAfter));
    }
  };

  while (i < source.length) {
    const ch = peek();

    if (ch === " " || ch === "\t" || ch === "\r") {
      advance();
      continue;
    }

    if (ch === "\n") {
      const startLine = line;
      const startCol = column;
      const startOffset = i;
      advance();
      tokens.push(makeToken("NEWLINE", undefined, startLine, startCol, startOffset, false, false));
      continue;
    }

    const hadSpaceBefore = tokens.length > 0 && tokens[tokens.length - 1]!.hadSpaceAfter;
    const startLine = line;
    const startCol = column;
    const startOffset = i;

    if (ch === "-" && peek(1) === "-") {
      skipComment();
      continue;
    }

    if (ch === '"') {
      readString(startLine, startCol, startOffset, hadSpaceBefore);
      continue;
    }

    if (/[0-9]/.test(ch)) {
      readNumber(startLine, startCol, startOffset, hadSpaceBefore);
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      readIdent(startLine, startCol, startOffset, hadSpaceBefore);
      continue;
    }

    const two = ch + peek(1);
    const three = two + peek(2);

    const pushSimple = (kind: TokenKind, len: number, value?: string) => {
      for (let j = 0; j < len; j++) advance();
      const hadSpaceAfter = peek() === " " || peek() === "\t";
      tokens.push(makeToken(kind, value, startLine, startCol, startOffset, hadSpaceBefore, hadSpaceAfter));
    };

    if (three === "<-=") throw new LexError("Unexpected '<-='", startLine, startCol);
    if (two === "<-") { pushSimple("BIND", 2); continue; }
    if (three === ">>=") { pushSimple("SEQ", 3, ">>="); continue; }
    if (two === ">>") { pushSimple("SEQ", 2, ">>"); continue; }
    if (two === "==") { pushSimple("EQ", 2); continue; }
    if (two === "/=") { pushSimple("NEQ", 2); continue; }
    if (two === "<=") { pushSimple("LE", 2); continue; }
    if (two === ">=") { pushSimple("GE", 2); continue; }
    if (two === "->") { pushSimple("ARROW", 2); continue; }
    if (two === "&&") { pushSimple("AND", 2); continue; }
    if (two === "||") { pushSimple("OR", 2); continue; }

    if (ch === ".") {
      const spaceAfter = peek(1) === " " || peek(1) === "\t";
      if (hadSpaceBefore && spaceAfter) {
        pushSimple("COMPOSE_DOT", 1);
      } else {
        pushSimple("FIELD_DOT", 1);
      }
      continue;
    }

    if (ch === "-") {
      if (hadSpaceBefore || peek(1) === " " || peek(1) === "\t" || !/[0-9a-zA-Z_]/.test(peek(1))) {
        pushSimple("MINUS", 1);
      } else {
        readIdent(startLine, startCol, startOffset, hadSpaceBefore);
      }
      continue;
    }

    switch (ch) {
      case "{": pushSimple("LBRACE", 1); break;
      case "}": pushSimple("RBRACE", 1); break;
      case ";": pushSimple("SEMI", 1); break;
      case "(": pushSimple("LPAREN", 1); break;
      case ")": pushSimple("RPAREN", 1); break;
      case "[": pushSimple("LBRACKET", 1); break;
      case "]": pushSimple("RBRACKET", 1); break;
      case ",": pushSimple("COMMA", 1); break;
      case ":": pushSimple("COLON", 1); break;
      case "=": pushSimple("EQUALS", 1); break;
      case "|": pushSimple("PIPE", 1); break;
      case "\\": pushSimple("BACKSLASH", 1); break;
      case "$": pushSimple("DOLLAR", 1); break;
      case "+": pushSimple("PLUS", 1); break;
      case "*": pushSimple("STAR", 1); break;
      case "/": pushSimple("SLASH", 1); break;
      case "<": pushSimple("LT", 1); break;
      case ">": pushSimple("GT", 1); break;
      default:
        throw new LexError(`Unexpected character '${ch}'`, startLine, startCol);
    }
  }

  tokens.push(makeToken("EOF", undefined, line, column, i, false, false));
  return tokens.map(({ hadSpaceBefore: _b, hadSpaceAfter: _a, ...t }) => t);
}
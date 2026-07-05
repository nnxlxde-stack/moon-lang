export type TokenKind =
  | "EOF"
  | "NEWLINE"
  | "LBRACE"
  | "RBRACE"
  | "SEMI"
  | "LPAREN"
  | "RPAREN"
  | "LBRACKET"
  | "RBRACKET"
  | "COMMA"
  | "COLON"
  | "EQUALS"
  | "PIPE"
  | "BACKSLASH"
  | "FIELD_DOT"
  | "COMPOSE_DOT"
  | "BIND"
  | "SEQ"
  | "ARROW"
  | "DOLLAR"
  | "EQ"
  | "NEQ"
  | "LE"
  | "GE"
  | "LT"
  | "GT"
  | "PLUS"
  | "MINUS"
  | "STAR"
  | "SLASH"
  | "AND"
  | "OR"
  | "IDENT"
  | "STRING"
  | "INT"
  | "FLOAT"
  | "BOOL"
  | "KW_IMPORT"
  | "KW_MODEL"
  | "KW_AGENT"
  | "KW_DATA"
  | "KW_INSTANCE"
  | "KW_MACRO"
  | "KW_WHERE"
  | "KW_DO"
  | "KW_LET"
  | "KW_WITH"
  | "KW_IF"
  | "KW_THEN"
  | "KW_ELSE"
  | "KW_NOT"
  | "KW_TRUE"
  | "KW_FALSE"
  | "KW_IMPLEMENTS"
  | "KW_ROUTES_TO"
  | "KW_FOR"
  | "KW_OPTIONAL"
  | "KW_CONSTRAINT"
  | "KW_DEFAULT"
  | "KW_FETCHED"
  | "KW_FROM"
  | "KW_AS"
  | "KW_PURE"
  | "KW_STORM";

export interface Token {
  kind: TokenKind;
  value?: string;
  line: number;
  column: number;
  offset: number;
}

export const KEYWORDS: Record<string, TokenKind> = {
  import: "KW_IMPORT",
  model: "KW_MODEL",
  agent: "KW_AGENT",
  data: "KW_DATA",
  instance: "KW_INSTANCE",
  macro: "KW_MACRO",
  where: "KW_WHERE",
  do: "KW_DO",
  let: "KW_LET",
  with: "KW_WITH",
  if: "KW_IF",
  then: "KW_THEN",
  else: "KW_ELSE",
  not: "KW_NOT",
  true: "KW_TRUE",
  false: "KW_FALSE",
  implements: "KW_IMPLEMENTS",
  routes_to: "KW_ROUTES_TO",
  for: "KW_FOR",
  optional: "KW_OPTIONAL",
  constraint: "KW_CONSTRAINT",
  default: "KW_DEFAULT",
  fetched: "KW_FETCHED",
  from: "KW_FROM",
  as: "KW_AS",
  pure: "KW_PURE",
  storm: "KW_STORM",
};

export const LAYOUT_OPENERS: Set<TokenKind> = new Set([
  "KW_WHERE",
  "KW_DO",
  "KW_WITH",
]);
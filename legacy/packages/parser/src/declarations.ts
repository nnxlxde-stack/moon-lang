import type {
  AgentDecl,
  ConfigItem,
  Constructor,
  DataDecl,
  Declaration,
  FieldDef,
  FieldModifier,
  FunctionDecl,
  FunctionEquation,
  InstanceDecl,
  MacroDecl,
  ModelDecl,
  Program,
  SourceSpec,
} from "@moon/ast";
import { ParseError, type TokenStream } from "./token-stream";
import { parseTypeSpec } from "./types";
import { parseExpression, parseDoBlock, parseDoStatementFixed, parseConfigItems } from "./expressions";
import { parsePattern } from "./patterns";

export function parseProgram(ts: TokenStream): Program {
  const start = ts.peek();
  const declarations: Declaration[] = [];

  while (!ts.at("EOF")) {
    if (ts.skip("SEMI")) continue;
    declarations.push(parseDeclaration(ts));
  }

  return { declarations, span: ts.makeSpan(start, ts.last()) };
}

function parseDeclaration(ts: TokenStream): Declaration {
  const start = ts.peek();

  if (ts.at("KW_IMPORT")) return parseImport(ts);
  if (ts.at("KW_MODEL")) return { kind: "Model", decl: parseModelDecl(ts), span: ts.makeSpan(start, ts.last()) };
  if (ts.at("KW_AGENT")) return { kind: "Agent", decl: parseAgentDecl(ts), span: ts.makeSpan(start, ts.last()) };
  if (ts.at("KW_DATA")) return { kind: "Data", decl: parseDataDecl(ts), span: ts.makeSpan(start, ts.last()) };
  if (ts.at("KW_INSTANCE")) return { kind: "Instance", decl: parseInstanceDecl(ts), span: ts.makeSpan(start, ts.last()) };
  if (ts.at("KW_MACRO")) return { kind: "Macro", decl: parseMacroDecl(ts), span: ts.makeSpan(start, ts.last()) };
  if (ts.at("IDENT") || ts.at("KW_PURE")) {
    return { kind: "Function", decl: parseFunctionDecl(ts), span: ts.makeSpan(start, ts.last()) };
  }

  throw new ParseError("Expected declaration", start.line, start.column);
}

function parseDeclName(ts: TokenStream): string {
  if (ts.at("KW_PURE")) return ts.advance().value ?? "pure";
  return ts.expect("IDENT").value!;
}

function isDeclNameStart(ts: TokenStream): boolean {
  return ts.at("IDENT") || ts.at("KW_PURE");
}

function parseImport(ts: TokenStream): Declaration {
  const start = ts.expect("KW_IMPORT");
  const path: string[] = [ts.expect("IDENT").value!];
  while (ts.skip("FIELD_DOT")) {
    path.push(ts.expect("IDENT").value!);
  }
  let alias: string | undefined;
  if (ts.skip("KW_AS")) {
    alias = ts.expect("IDENT").value;
  }
  return { kind: "Import", path, alias, span: ts.makeSpan(start, ts.last()) };
}

export function parseModelDecl(ts: TokenStream): ModelDecl {
  const start = ts.expect("KW_MODEL");
  const name = ts.expect("IDENT").value!;
  const typeParams = parseTypeParams(ts);

  let implements_: string | undefined;
  if (ts.skip("KW_IMPLEMENTS")) {
    implements_ = ts.expect("IDENT").value;
  }

  const fields: FieldDef[] = [];

  if (ts.skip("KW_WHERE")) {
    if (ts.at("LBRACE")) ts.advance();
    while (!ts.at("RBRACE") && !ts.at("EOF")) {
      if (ts.skip("SEMI")) continue;
      fields.push(parseFieldDef(ts));
    }
    if (ts.at("RBRACE")) ts.advance();
  }

  return { name, typeParams, implements: implements_, fields, span: ts.makeSpan(start, ts.last()) };
}

function parseFieldDef(ts: TokenStream): FieldDef {
  const start = ts.peek();
  const name = ts.expect("IDENT").value!;
  ts.expect("COLON");
  ts.expect("COLON");
  const type = parseTypeSpec(ts);
  const modifiers = parseFieldModifiers(ts);
  return { name, type, modifiers, span: ts.makeSpan(start, ts.last()) };
}

function parseFieldModifiers(ts: TokenStream): FieldModifier[] {
  const mods: FieldModifier[] = [];

  while (true) {
    if (ts.at("KW_CONSTRAINT")) {
      const s = ts.advance();
      ts.expect("COLON");
      const expr = parseExpression(ts);
      mods.push({ kind: "Constraint", expr, span: ts.makeSpan(s, ts.last()) });
      continue;
    }
    if (ts.at("KW_DEFAULT")) {
      const s = ts.advance();
      ts.expect("COLON");
      const expr = parseExpression(ts);
      mods.push({ kind: "Default", expr, span: ts.makeSpan(s, ts.last()) });
      continue;
    }
    if (ts.at("KW_FETCHED")) {
      const s = ts.advance();
      ts.expect("KW_FROM");
      const sources = parseSourceSpecs(ts);
      mods.push({ kind: "FetchedFrom", sources, span: ts.makeSpan(s, ts.last()) });
      continue;
    }
    if (ts.at("KW_OPTIONAL")) {
      const s = ts.advance();
      mods.push({ kind: "Optional", span: ts.makeSpan(s, s) });
      continue;
    }
    break;
  }

  return mods;
}

function parseSourceSpecs(ts: TokenStream): SourceSpec[] {
  const specs: SourceSpec[] = [];
  do {
    const start = ts.peek();
    const source = ts.expect("IDENT").value!;
    ts.expect("COLON");
    const field = ts.expect("IDENT").value!;
    specs.push({ source, field, span: ts.makeSpan(start, ts.last()) });
  } while (ts.skip("PIPE"));
  return specs;
}

export function parseAgentDecl(ts: TokenStream): AgentDecl {
  const start = ts.expect("KW_AGENT");
  const name = ts.expect("IDENT").value!;
  const typeParams = parseTypeParams(ts);

  ts.expect("COLON");
  ts.expect("COLON");
  const type = parseTypeSpec(ts);

  let routesTo: string | undefined;
  if (ts.skip("KW_ROUTES_TO")) {
    routesTo = ts.expect("IDENT").value;
  }

  const config: ConfigItem[] = [];

  if (ts.skip("KW_WHERE")) {
    if (ts.at("LBRACE")) ts.advance();
    config.push(...parseConfigBlock(ts));
    if (ts.at("RBRACE")) ts.advance();
  } else {
    if (ts.at("LBRACE")) ts.advance();
    if (ts.at("IDENT") && ts.peek(1).kind === "COLON") {
      config.push(...parseConfigBlock(ts));
    }
    if (ts.at("RBRACE")) ts.advance();
  }

  return { name, typeParams, type, routesTo, config, span: ts.makeSpan(start, ts.last()) };
}

function parseConfigBlock(ts: TokenStream): ConfigItem[] {
  const items: ConfigItem[] = [];
  while (!ts.at("RBRACE") && !ts.at("EOF")) {
    if (ts.skip("SEMI")) continue;
    if (!(ts.at("IDENT") && ts.peek(1).kind === "COLON")) break;
    const keyStart = ts.peek();
    const key = ts.advance().value!;
    ts.expect("COLON");
    const value = parseExpression(ts);
    items.push({ key, value, span: ts.makeSpan(keyStart, ts.last()) });
    if (ts.skip("SEMI")) continue;
  }
  return items;
}

function parseDataDecl(ts: TokenStream): DataDecl {
  const start = ts.expect("KW_DATA");
  const name = ts.expect("IDENT").value!;
  const typeParams = parseTypeParams(ts);
  ts.expect("EQUALS");

  const constructors: Constructor[] = [parseConstructor(ts)];
  while (ts.skip("PIPE")) {
    constructors.push(parseConstructor(ts));
  }

  return { name, typeParams, constructors, span: ts.makeSpan(start, ts.last()) };
}

function parseConstructor(ts: TokenStream): Constructor {
  const start = ts.peek();
  const name = ts.expect("IDENT").value!;

  if (ts.at("LPAREN")) {
    ts.advance();
    const types: ReturnType<typeof parseTypeSpec>[] = [];
    if (!ts.at("RPAREN")) {
      types.push(parseTypeSpec(ts));
      while (ts.skip("COMMA")) {
        types.push(parseTypeSpec(ts));
      }
    }
    const end = ts.expect("RPAREN");
    return {
      name,
      args: { kind: "Positional", types, span: ts.makeSpan(start, end) },
      span: ts.makeSpan(start, end),
    };
  }

  if (ts.at("LBRACE")) {
    ts.advance();
    const fields: { name: string; type: ReturnType<typeof parseTypeSpec>; span: typeof start extends infer _ ? { start: { line: number; column: number; offset: number }; end: { line: number; column: number; offset: number } } : never }[] = [];
    while (!ts.at("RBRACE")) {
      if (ts.skip("SEMI") || ts.skip("COMMA")) continue;
      const fs = ts.peek();
      const fname = ts.expect("IDENT").value!;
      ts.expect("COLON");
      ts.expect("COLON");
      const ftype = parseTypeSpec(ts);
      fields.push({ name: fname, type: ftype, span: ts.makeSpan(fs, ts.last()) });
      if (ts.skip("COMMA")) continue;
      if (ts.skip("SEMI")) continue;
    }
    const end = ts.expect("RBRACE");
    return {
      name,
      args: { kind: "Record", fields, span: ts.makeSpan(start, end) },
      span: ts.makeSpan(start, end),
    };
  }

  return { name, span: ts.makeSpan(start, ts.last()) };
}

function parseInstanceDecl(ts: TokenStream): InstanceDecl {
  const start = ts.expect("KW_INSTANCE");
  const className = ts.expect("IDENT").value!;
  ts.expect("KW_FOR");
  const type = parseTypeSpec(ts);
  const typeParams = parseTypeParams(ts);

  const functions: FunctionDecl[] = [];
  ts.expect("KW_WHERE");
  if (ts.at("LBRACE")) ts.advance();

  while (!ts.at("RBRACE") && !ts.at("EOF")) {
    if (ts.skip("SEMI")) continue;
    functions.push(parseFunctionDecl(ts));
  }
  if (ts.at("RBRACE")) ts.advance();

  return { className, type, typeParams, functions, span: ts.makeSpan(start, ts.last()) };
}

function parseMacroDecl(ts: TokenStream): MacroDecl {
  const start = ts.expect("KW_MACRO");
  const name = ts.expect("IDENT").value!;
  const typeParams = parseTypeParams(ts);
  const params = parseParamList(ts);
  ts.expect("EQUALS");
  const body = parseDoBlock(ts);
  return { name, typeParams, params, body, span: ts.makeSpan(start, ts.last()) };
}

function parseFunctionDecl(ts: TokenStream): FunctionDecl {
  const start = ts.peek();
  let signature: FunctionDecl["signature"];

  if (isDeclNameStart(ts) && ts.peek(1).kind === "COLON" && ts.peek(2).kind === "COLON") {
    const name = parseDeclName(ts);
    ts.expect("COLON");
    ts.expect("COLON");
    const type = parseTypeSpec(ts);
    signature = { name, type, span: ts.makeSpan(start, ts.last()) };
  }

  const equations: FunctionEquation[] = [parseFunctionEquation(ts, signature?.name)];

  while (isDeclNameStart(ts) && !isTypeSignatureStart(ts)) {
    const nextName = ts.peek().value ?? "pure";
    const expected = signature?.name ?? equations[0]!.name;
    if (nextName !== expected) break;
    equations.push(parseFunctionEquation(ts, expected));
  }

  return { signature, equations, span: ts.makeSpan(start, ts.last()) };
}

function isTypeSignatureStart(ts: TokenStream): boolean {
  return isDeclNameStart(ts) && ts.peek(1).kind === "COLON" && ts.peek(2).kind === "COLON";
}

function parseFunctionEquation(ts: TokenStream, expectedName?: string): FunctionEquation {
  const start = ts.peek();
  const name = parseDeclName(ts);
  if (expectedName && name !== expectedName) {
    throw new ParseError(`Expected equation for ${expectedName}, got ${name}`, start.line, start.column);
  }

  const patterns: ReturnType<typeof parsePattern>[] = [];
  while (isPatternContinuer(ts)) {
    patterns.push(parsePattern(ts, { allowApp: false }));
  }

  ts.expect("EQUALS");

  let body: ReturnType<typeof parseExpression> | ReturnType<typeof parseDoBlock>;
  if (ts.at("KW_DO")) {
    body = parseDoBlock(ts);
  } else if (ts.at("KW_AGENT")) {
    body = { kind: "Agent", decl: parseAgentDecl(ts), span: ts.makeSpan(start, ts.last()) } as ReturnType<typeof parseExpression>;
  } else {
    body = parseExpression(ts);
  }

  return { name, patterns, body, span: ts.makeSpan(start, ts.last()) };
}

function isPatternContinuer(ts: TokenStream): boolean {
  if (ts.at("EQUALS") || ts.at("COLON")) return false;
  return ts.check("IDENT", "LPAREN", "LBRACKET", "STRING", "INT", "FLOAT", "KW_TRUE", "KW_FALSE");
}

function parseTypeParams(ts: TokenStream): string[] {
  const params: string[] = [];
  while (ts.at("IDENT") && !isDeclBoundary(ts)) {
    const next = ts.peek(1).kind;
    if (next === "COLON" && ts.peek(2).kind === "COLON") {
      params.push(ts.advance().value!);
      break;
    }
    if (next === "EQUALS") {
      params.push(ts.advance().value!);
      break;
    }
    params.push(ts.advance().value!);
  }
  return params;
}

function isDeclBoundary(ts: TokenStream): boolean {
  return ts.check("KW_WHERE", "KW_IMPLEMENTS", "KW_ROUTES_TO", "EQUALS", "EOF", "SEMI", "RBRACE");
}

function parseParamList(ts: TokenStream): { name: string; type: ReturnType<typeof parseTypeSpec> }[] {
  if (!ts.at("LPAREN")) return [];
  ts.advance();
  const params: { name: string; type: ReturnType<typeof parseTypeSpec> }[] = [];
  if (!ts.at("RPAREN")) {
    const pname = ts.expect("IDENT").value!;
    ts.expect("COLON");
    ts.expect("COLON");
    params.push({ name: pname, type: parseTypeSpec(ts) });
    while (ts.skip("COMMA")) {
      const n = ts.expect("IDENT").value!;
      ts.expect("COLON");
      ts.expect("COLON");
      params.push({ name: n, type: parseTypeSpec(ts) });
    }
  }
  ts.expect("RPAREN");
  return params;
}
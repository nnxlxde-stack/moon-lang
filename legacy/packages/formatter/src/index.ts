import { parse } from "@moon/parser";
import type { Declaration, DoBlock, Program, Span } from "@moon/ast";

const INDENT = "    ";

export function formatSource(source: string): string {
  try {
    const program = parse(source);
    const formatted = formatProgram(program, source);
    parse(formatted);
    return formatted;
  } catch {
    return source;
  }
}

function sliceSpan(source: string, span: Span): string {
  return source.slice(span.start.offset, span.end.offset);
}

function formatProgram(program: Program, source: string): string {
  const comments = extractLeadingComments(source);
  const parts: string[] = [];
  if (comments.header) parts.push(comments.header.trimEnd());

  for (const decl of program.declarations) {
    parts.push(formatDeclaration(decl, source));
  }

  return `${parts.filter(Boolean).join("\n\n")}\n`;
}

function extractLeadingComments(source: string): { header: string } {
  const lines = source.split(/\r?\n/);
  const header: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("--")) header.push(line);
    else break;
  }
  return { header: header.join("\n") };
}

function formatDeclaration(decl: Declaration, source: string): string {
  switch (decl.kind) {
    case "Import":
      return `import ${decl.path.join(".")}${decl.alias ? ` as ${decl.alias}` : ""}`;
    case "Function":
      return formatFunction(decl.decl, source);
    default:
      return trimTrailingWhitespace(sliceSpan(source, decl.span));
  }
}

function formatFunction(
  decl: import("@moon/ast").FunctionDecl,
  source: string,
): string {
  const lines: string[] = [];

  if (decl.signature) {
    lines.push(sliceSpan(source, decl.signature.span));
  }

  for (const eq of decl.equations) {
    if ("statements" in eq.body) {
      lines.push(formatDoEquation(eq.name, eq.patterns, eq.body, eq.span, source));
    } else {
      lines.push(trimTrailingWhitespace(sliceSpan(source, eq.span)));
    }
  }

  return lines.join("\n");
}

function formatDoEquation(
  name: string,
  patterns: import("@moon/ast").Pattern[],
  block: DoBlock,
  span: Span,
  source: string,
): string {
  const raw = sliceSpan(source, span);
  const eqPrefix = formatEquationPrefix(name, patterns, source, span, raw);
  const body = formatDoBlock(block, source, 1);
  return `${eqPrefix}\n${body}`;
}

function formatEquationPrefix(
  name: string,
  patterns: import("@moon/ast").Pattern[],
  source: string,
  span: Span,
  raw: string,
): string {
  const patText = patterns
    .map((p) => trimTrailingWhitespace(sliceSpan(source, p.span)))
    .join(" ");
  const doIdx = raw.indexOf("= do");
  if (doIdx >= 0) {
    return trimTrailingWhitespace(raw.slice(0, doIdx + 4));
  }
  const patSuffix = patText ? ` ${patText}` : "";
  return `${name}${patSuffix} = do`;
}

function formatDoBlock(block: DoBlock, source: string, depth: number): string {
  return block.statements
    .map((stmt) => reindentBlock(sliceSpan(source, stmt.span), depth))
    .join("\n");
}

function reindentBlock(text: string, depth: number): string {
  const lines = text.split(/\r?\n/);
  const nonempty = lines.filter((l) => l.trim().length > 0);
  if (nonempty.length === 0) return "";

  const baseIndent = Math.min(
    ...nonempty.map((l) => l.match(/^(\s*)/)?.[1].length ?? 0),
  );
  const pad = INDENT.repeat(depth);

  return lines
    .map((line) => {
      if (!line.trim()) return "";
      const content = line.length >= baseIndent ? line.slice(baseIndent) : line.trimStart();
      return pad + content;
    })
    .join("\n");
}

function trimTrailingWhitespace(text: string): string {
  return text.replace(/[ \t]+$/gm, "").trimEnd();
}
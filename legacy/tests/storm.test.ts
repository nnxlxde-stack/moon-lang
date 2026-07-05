import { describe, expect, test } from "bun:test";
import { parse } from "../packages/parser/src/index.ts";
import { runProgram } from "../packages/runtime/src/executor.ts";
import { createMockLlm } from "../packages/runtime/src/mock-llm.ts";

const stormSrc = `
agent PanelA :: Analyzer Code
  model: deepseek-v4-flash

agent PanelB :: Analyzer Code
  model: deepseek-v4-flash

agent Synth :: Analyzer Code
  model: deepseek-v4-pro

main :: IO ()
main = do
  consensus <- storm "input"
      with panel: [PanelA, PanelB]
           synthesizer: Synth
           rounds: 2
  pure $ consensus
`;

describe("storm", () => {
  test("parses storm bind syntax", () => {
    const program = parse(stormSrc);
    const main = program.declarations.find((d) => d.kind === "Function");
    expect(main?.kind).toBe("Function");
    if (main?.kind !== "Function") return;
    const body = main.decl.equations[0]?.body;
    if (!body || !("statements" in body)) throw new Error("expected do block");
    const stormStmt = body.statements.find((s) => s.kind === "Storm");
    expect(stormStmt?.kind).toBe("Storm");
  });

  test("runs panel rounds then synthesizer", async () => {
    const program = parse(stormSrc);
    const calls: string[] = [];
    const llm = createMockLlm();
    const original = llm.complete.bind(llm);
    llm.complete = async (req) => {
      calls.push(req.agent);
      return original(req);
    };

    await runProgram(program, { llm, functionName: "main" });

    expect(calls.filter((a) => a === "PanelA").length).toBe(2);
    expect(calls.filter((a) => a === "PanelB").length).toBe(2);
    expect(calls.filter((a) => a === "Synth").length).toBe(1);
    expect(calls[calls.length - 1]).toBe("Synth");
  });

  test("round 2 prompts include peer perspectives", async () => {
    const program = parse(stormSrc);
    const messages: string[] = [];
    const llm = createMockLlm();
    llm.complete = async (req) => {
      const user = req.messages?.find((m) => m.role === "user")?.content ?? "";
      messages.push(`${req.agent}:${user.includes("Peer perspectives")}`);
      return createMockLlm().complete(req);
    };

    await runProgram(program, { llm, functionName: "main" });

    const round2 = messages.filter((m) => m.endsWith(":true"));
    expect(round2.length).toBeGreaterThanOrEqual(2);
  });
});
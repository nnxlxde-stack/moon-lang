import { describe, expect, test } from "bun:test";
import { parse } from "../packages/parser/src/index.ts";
import { runProgram } from "../packages/runtime/src/executor.ts";
import { createMockLlm } from "../packages/runtime/src/mock-llm.ts";

const routesSrc = `
agent Draft :: Analyzer Code routes_to Specialist
  model: deepseek-v4-flash

agent Specialist :: Analyzer Code
  model: deepseek-v4-pro

main :: IO ()
main = do
  result <- Draft.analyze "payload"
  pure $ result
`;

describe("routes_to", () => {
  test("parses routes_to on agent decl", () => {
    const program = parse(routesSrc);
    const agent = program.declarations.find((d) => d.kind === "Agent" && d.decl.name === "Draft");
    expect(agent?.kind).toBe("Agent");
    if (agent?.kind === "Agent") {
      expect(agent.decl.routesTo).toBe("Specialist");
    }
  });

  test("delegates analyze to routes_to agent", async () => {
    const program = parse(routesSrc);
    const calls: Array<{ agent: string; chain?: string[] }> = [];
    const llm = createMockLlm();
    llm.complete = async (req) => {
      calls.push({ agent: req.agent, chain: req.delegateChain });
      return createMockLlm().complete(req);
    };

    await runProgram(program, { llm, functionName: "main" });

    expect(calls.map((c) => c.agent)).toEqual(["Draft", "Specialist"]);
    expect(calls[1]?.chain).toEqual(["Draft", "Specialist"]);
  });

  test("delegate prompt includes delegated_input block", async () => {
    const program = parse(routesSrc);
    let specialistPrompt = "";
    const llm = createMockLlm();
    llm.complete = async (req) => {
      if (req.agent === "Specialist") {
        specialistPrompt = req.messages?.find((m) => m.role === "user")?.content ?? "";
      }
      return createMockLlm().complete(req);
    };

    await runProgram(program, { llm, functionName: "main" });

    expect(specialistPrompt).toContain("Delegated from Draft");
  });
});
import { describe, expect, test } from "bun:test";
import {
  createDeepSeekClient,
  extractAnthropicContent,
  extractContent,
  parseJsonContent,
  resolveDeepSeekApi,
  LlmValidationError,
  validateAgainstSchema,
} from "../packages/runtime/src/index.ts";

const schema = {
  type: "object" as const,
  properties: {
    summary: { type: "string" as const },
    confidence: { type: "number" as const, minimum: 0, maximum: 1 },
  },
  required: ["summary", "confidence"],
};

describe("DeepSeek API config", () => {
  test("defaults to anthropic base url", () => {
    const api = resolveDeepSeekApi({});
    expect(api.format).toBe("anthropic");
    expect(api.baseUrl).toBe("https://api.deepseek.com/anthropic");
    expect(api.endpoint).toBe("/v1/messages");
  });

  test("beta mode uses openai beta base", () => {
    const api = resolveDeepSeekApi({ apiFormat: "openai", useBeta: true });
    expect(api.baseUrl).toBe("https://api.deepseek.com/beta");
    expect(api.endpoint).toBe("/chat/completions");
    expect(api.useBeta).toBe(true);
  });

  test("extracts anthropic text blocks", () => {
    const raw = extractAnthropicContent({
      content: [{ type: "text", text: '{"summary":"ok","confidence":0.5}' }],
    });
    expect(raw).toContain("summary");
  });
});

describe("DeepSeek client", () => {
  test("extracts JSON from reasoning fallback", () => {
    const raw = extractContent({
      choices: [{
        message: {
          content: "",
          reasoning_content: '{"summary":"ok","confidence":0.9}',
        },
      }],
    });
    expect(raw).toContain("summary");
    const parsed = parseJsonContent(raw) as Record<string, unknown>;
    expect(parsed.summary).toBe("ok");
  });

  test("validates schema constraints", () => {
    expect(() =>
      validateAgainstSchema(schema, { summary: "x", confidence: 2 }),
    ).toThrow(LlmValidationError);
  });

  test("retries on invalid response then succeeds", async () => {
    let calls = 0;
    const fetchImpl = async () => {
      calls++;
      const body = calls === 1
        ? { choices: [{ message: { content: '{"summary":"x","confidence":9}' } }] }
        : { choices: [{ message: { content: '{"summary":"fixed","confidence":0.8}' } }] };
      return new Response(JSON.stringify(body), { status: 200 });
    };

    const client = createDeepSeekClient({
      apiKey: "test-key",
      apiFormat: "openai",
      maxRepairAttempts: 1,
      fetchImpl,
    });

    const result = await client.complete({
      agent: "TestAgent",
      model: "deepseek-v4-pro",
      input: { item: 1 },
      schema,
      config: {},
    }) as Record<string, unknown>;

    expect(calls).toBe(2);
    expect(result.summary).toBe("fixed");
    expect(client.attempts).toBe(2);
  });

  test("anthropic API format sends x-api-key header", async () => {
    let capturedUrl = "";
    let capturedHeaders: Record<string, string> = {};
    const fetchImpl = async (url: string, init?: RequestInit) => {
      capturedUrl = url;
      capturedHeaders = Object.fromEntries(new Headers(init?.headers).entries());
      return new Response(JSON.stringify({
        content: [{ type: "text", text: '{"summary":"anthropic","confidence":0.7}' }],
      }), { status: 200 });
    };

    const client = createDeepSeekClient({
      apiKey: "test-key",
      apiFormat: "anthropic",
      fetchImpl,
    });

    const result = await client.complete({
      agent: "TestAgent",
      model: "deepseek-v4-pro",
      input: { item: 1 },
      schema,
      config: {},
    }) as Record<string, unknown>;

    expect(capturedUrl).toContain("/anthropic/v1/messages");
    expect(capturedHeaders["x-api-key"]).toBe("test-key");
    expect(result.summary).toBe("anthropic");
  });
});
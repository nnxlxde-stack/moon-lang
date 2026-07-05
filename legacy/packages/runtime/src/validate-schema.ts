import Ajv, { type ValidateFunction } from "ajv";
import type { JsonSchema } from "@moon/schema-compiler";
import { LlmValidationError } from "./llm-types";

const ajv = new Ajv({ allErrors: true, strict: false });

export function validateAgainstSchema(schema: JsonSchema, data: unknown): void {
  const validate = compileSchema(schema);
  if (!validate(data)) {
    const detail = validate.errors?.map((e) => `${e.instancePath} ${e.message}`).join("; ") ?? "invalid";
    throw new LlmValidationError(`Schema validation failed: ${detail}`);
  }
}

function compileSchema(schema: JsonSchema): ValidateFunction {
  const normalized = normalizeSchema(schema);
  return ajv.compile(normalized);
}

function normalizeSchema(schema: JsonSchema): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (schema.type) result.type = schema.type;
  if (schema.enum) result.enum = schema.enum;
  if (schema.minimum !== undefined) result.minimum = schema.minimum;
  if (schema.maximum !== undefined) result.maximum = schema.maximum;
  if (schema.maxLength !== undefined) result.maxLength = schema.maxLength;
  if (schema.maxItems !== undefined) result.maxItems = schema.maxItems;
  if (schema.items) result.items = normalizeSchema(schema.items);
  if (schema.properties) {
    const properties: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(schema.properties)) {
      properties[key] = normalizeSchema(value);
    }
    result.properties = properties;
  }
  if (schema.required) result.required = schema.required;

  if (!schema.type && schema.properties) {
    result.type = "object";
  }

  if (!schema.type && !schema.properties && !schema.enum) {
    return { type: "object", additionalProperties: true };
  }

  return result;
}
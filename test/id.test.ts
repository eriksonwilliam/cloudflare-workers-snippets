import { describe, expect, it } from "vitest";
import { randomId } from "../src/infrastructure/id.ts";

describe("randomId", () => {
  it("gera um id do tamanho padrao (10) e url-safe", () => {
    const id = randomId();
    expect(id).toHaveLength(10);
    expect(id).toMatch(/^[0-9a-zA-Z]+$/);
  });

  it("respeita o tamanho informado", () => {
    expect(randomId(6)).toHaveLength(6);
  });
});

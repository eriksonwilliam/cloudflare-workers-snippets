import { describe, expect, it } from "vitest";
import { Snippet } from "../src/domain/snippet.ts";
import { ValidationError } from "../src/domain/errors.ts";

describe("Snippet", () => {
  it("cria um snippet valido", () => {
    const snippet = Snippet.create("id-1", "  console.log(1)  ", "javascript");
    expect(snippet.id).toBe("id-1");
    expect(snippet.content).toBe("console.log(1)");
    expect(snippet.language).toBe("javascript");
    expect(snippet.createdAt).not.toBe("");
  });

  it("usa 'text' quando a linguagem e omitida ou vazia", () => {
    expect(Snippet.create("id", "x", undefined).language).toBe("text");
    expect(Snippet.create("id", "x", "   ").language).toBe("text");
  });

  it("rejeita conteudo vazio", () => {
    expect(() => Snippet.create("id", "   ", "text")).toThrow(ValidationError);
  });

  it("rejeita conteudo acima do limite", () => {
    expect(() => Snippet.create("id", "a".repeat(100_001), "text")).toThrow(ValidationError);
  });

  it("serializa e reconstroi via record", () => {
    const original = Snippet.create("id-2", "conteudo", "go");
    const restored = Snippet.restore(original.toRecord());
    expect(restored.toRecord()).toEqual(original.toRecord());
  });
});

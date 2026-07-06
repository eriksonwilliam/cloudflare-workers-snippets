import { describe, expect, it } from "vitest";
import { KvSnippetRepository } from "../src/infrastructure/kv_snippet_repository.ts";
import { Snippet } from "../src/domain/snippet.ts";

function fakeKv(): KVNamespace {
  const store = new Map<string, string>();
  return {
    get: (key: string) => Promise.resolve(store.get(key) ?? null),
    put: (key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    },
  } as unknown as KVNamespace;
}

describe("KvSnippetRepository", () => {
  it("salva e recupera um snippet", async () => {
    const repo = new KvSnippetRepository(fakeKv());
    const snippet = Snippet.create("id-1", "conteudo", "go");
    await repo.save(snippet, 3600);
    const found = await repo.findById("id-1");
    expect(found?.toRecord()).toEqual(snippet.toRecord());
  });

  it("retorna null quando a chave nao existe", async () => {
    const repo = new KvSnippetRepository(fakeKv());
    expect(await repo.findById("nada")).toBeNull();
  });
});

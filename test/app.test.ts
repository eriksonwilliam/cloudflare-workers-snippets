import { describe, expect, it } from "vitest";
import { createApp } from "../src/infrastructure/http/app.ts";
import { SnippetService } from "../src/application/service.ts";
import { KvSnippetRepository } from "../src/infrastructure/kv_snippet_repository.ts";
import type { SnippetRepository } from "../src/application/ports.ts";

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

function newApp() {
  let counter = 0;
  const service = new SnippetService(
    new KvSnippetRepository(fakeKv()),
    () => `s${++counter}`,
    3600,
  );
  return createApp(service);
}

function postJson(app: ReturnType<typeof newApp>, body: unknown) {
  return app.request("/snippets", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("HTTP", () => {
  it("GET /health", async () => {
    const res = await newApp().request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("GET /openapi.json e /docs", async () => {
    const app = newApp();
    const spec = await app.request("/openapi.json");
    expect(spec.status).toBe(200);
    expect((await spec.json() as { openapi: string }).openapi).toBe("3.0.3");

    const docs = await app.request("/docs");
    expect(docs.status).toBe(200);
    expect(await docs.text()).toContain("swagger-ui");
  });

  it("cria, busca e retorna o conteudo bruto", async () => {
    const app = newApp();

    const created = await postJson(app, { content: "console.log(1)", language: "js" });
    expect(created.status).toBe(201);
    const body = await created.json() as { id: string; url: string; language: string };
    expect(body.id).toBe("s1");
    expect(body.url).toBe("/snippets/s1");
    expect(body.language).toBe("js");

    const got = await app.request("/snippets/s1");
    expect(got.status).toBe(200);

    const raw = await app.request("/snippets/s1/raw");
    expect(raw.status).toBe(200);
    expect(await raw.text()).toBe("console.log(1)");
  });

  it("usa 'text' quando a linguagem e omitida", async () => {
    const res = await postJson(newApp(), { content: "sem linguagem" });
    const body = await res.json() as { language: string };
    expect(body.language).toBe("text");
  });

  it("rejeita conteudo ausente com 400", async () => {
    const res = await postJson(newApp(), {});
    expect(res.status).toBe(400);
    expect((await res.json() as { error: string }).error).toBe("ValidationError");
  });

  it("retorna 404 para snippet inexistente", async () => {
    const res = await newApp().request("/snippets/nada");
    expect(res.status).toBe(404);
    expect((await res.json() as { error: string }).error).toBe("SnippetNotFoundError");
  });

  it("retorna 500 em erro inesperado", async () => {
    const faulty: SnippetRepository = {
      save: () => Promise.resolve(),
      findById: () => Promise.reject(new Error("falha de infraestrutura")),
    };
    const app = createApp(new SnippetService(faulty, () => "x", 3600));
    const res = await app.request("/snippets/qualquer");
    expect(res.status).toBe(500);
    expect((await res.json() as { error: string }).error).toBe("InternalServerError");
  });
});

import { Hono } from "hono";
import type { SnippetService } from "../../application/service.ts";
import type { Snippet } from "../../domain/snippet.ts";
import { DomainError } from "../../domain/errors.ts";
import { openApiSpec, swaggerHtml } from "./openapi.ts";

interface CreateSnippetBody {
  content?: string;
  language?: string;
}

function toResponse(snippet: Snippet) {
  return {
    id: snippet.id,
    url: `/snippets/${snippet.id}`,
    content: snippet.content,
    language: snippet.language,
    createdAt: snippet.createdAt,
  };
}

/** Monta a aplicacao Hono (roda em Workers, mas e testavel em memoria). */
export function createApp(service: SnippetService): Hono {
  const app = new Hono();

  app.get("/health", (c) => c.json({ status: "ok" }));
  app.get("/openapi.json", (c) => c.json(openApiSpec));
  app.get("/docs", (c) => c.html(swaggerHtml));

  app.post("/snippets", async (c) => {
    const body = await c.req.json<CreateSnippetBody>();
    const snippet = await service.create(body.content ?? "", body.language);
    return c.json(toResponse(snippet), 201);
  });

  app.get("/snippets/:id", async (c) => {
    const snippet = await service.get(c.req.param("id"));
    return c.json(toResponse(snippet));
  });

  app.get("/snippets/:id/raw", async (c) => {
    const snippet = await service.get(c.req.param("id"));
    return c.text(snippet.content);
  });

  app.onError((err, c) => {
    if (err instanceof DomainError) {
      return c.json({ error: err.name, message: err.message }, err.status);
    }
    return c.json({ error: "InternalServerError", message: "erro interno" }, 500);
  });

  return app;
}

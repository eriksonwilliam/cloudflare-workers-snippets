import { createApp } from "./infrastructure/http/app.ts";
import { KvSnippetRepository } from "./infrastructure/kv_snippet_repository.ts";
import { SnippetService } from "./application/service.ts";
import { randomId } from "./infrastructure/id.ts";

export interface Env {
  SNIPPETS_KV: KVNamespace;
}

const TTL_SECONDS = 86_400;

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response> {
    const service = new SnippetService(
      new KvSnippetRepository(env.SNIPPETS_KV),
      randomId,
      TTL_SECONDS,
    );
    return createApp(service).fetch(request, env, ctx);
  },
};

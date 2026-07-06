import type { SnippetRepository } from "../application/ports.ts";
import { Snippet, type SnippetRecord } from "../domain/snippet.ts";

/** Adapter de persistencia usando Cloudflare Workers KV (com TTL nativo). */
export class KvSnippetRepository implements SnippetRepository {
  constructor(private readonly kv: KVNamespace) {}

  async save(snippet: Snippet, ttlSeconds: number): Promise<void> {
    await this.kv.put(snippet.id, JSON.stringify(snippet.toRecord()), {
      expirationTtl: ttlSeconds,
    });
  }

  async findById(id: string): Promise<Snippet | null> {
    const raw = await this.kv.get(id);
    if (raw === null) {
      return null;
    }
    return Snippet.restore(JSON.parse(raw) as SnippetRecord);
  }
}

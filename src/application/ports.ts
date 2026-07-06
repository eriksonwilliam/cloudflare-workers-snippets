import type { Snippet } from "../domain/snippet.ts";

/** Port de saida para persistencia de snippets (com TTL em segundos). */
export interface SnippetRepository {
  save(snippet: Snippet, ttlSeconds: number): Promise<void>;
  findById(id: string): Promise<Snippet | null>;
}

/** Gerador de identificadores curtos. */
export type IdGenerator = () => string;

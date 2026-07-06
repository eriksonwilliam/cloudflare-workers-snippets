import { Snippet } from "../domain/snippet.ts";
import { SnippetNotFoundError } from "../domain/errors.ts";
import type { IdGenerator, SnippetRepository } from "./ports.ts";

/** Casos de uso dos snippets. */
export class SnippetService {
  constructor(
    private readonly repository: SnippetRepository,
    private readonly newId: IdGenerator,
    private readonly ttlSeconds: number,
  ) {}

  async create(content: string, language: string | undefined): Promise<Snippet> {
    const snippet = Snippet.create(this.newId(), content, language);
    await this.repository.save(snippet, this.ttlSeconds);
    return snippet;
  }

  async get(id: string): Promise<Snippet> {
    const snippet = await this.repository.findById(id);
    if (!snippet) {
      throw new SnippetNotFoundError(id);
    }
    return snippet;
  }
}

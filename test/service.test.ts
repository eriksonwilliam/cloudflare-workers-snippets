import { beforeEach, describe, expect, it } from "vitest";
import { SnippetService } from "../src/application/service.ts";
import { SnippetNotFoundError } from "../src/domain/errors.ts";
import type { SnippetRepository } from "../src/application/ports.ts";
import type { Snippet } from "../src/domain/snippet.ts";

class FakeRepository implements SnippetRepository {
  private readonly items = new Map<string, Snippet>();
  lastTtl = 0;

  save(snippet: Snippet, ttlSeconds: number): Promise<void> {
    this.lastTtl = ttlSeconds;
    this.items.set(snippet.id, snippet);
    return Promise.resolve();
  }

  findById(id: string): Promise<Snippet | null> {
    return Promise.resolve(this.items.get(id) ?? null);
  }
}

describe("SnippetService", () => {
  let repo: FakeRepository;
  let counter: number;
  let service: SnippetService;

  beforeEach(() => {
    repo = new FakeRepository();
    counter = 0;
    service = new SnippetService(repo, () => `s${++counter}`, 3600);
  });

  it("cria, persiste com TTL e consulta", async () => {
    const created = await service.create("conteudo", "js");
    expect(created.id).toBe("s1");
    expect(repo.lastTtl).toBe(3600);
    const found = await service.get("s1");
    expect(found.id).toBe("s1");
  });

  it("lanca quando o snippet nao existe", async () => {
    await expect(service.get("nao-existe")).rejects.toBeInstanceOf(SnippetNotFoundError);
  });
});

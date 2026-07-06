import { ValidationError } from "./errors.ts";

const MAX_CONTENT_LENGTH = 100_000;

export interface SnippetRecord {
  id: string;
  content: string;
  language: string;
  createdAt: string;
}

/** Aggregate root: um trecho de texto efemero (armazenado com TTL na edge). */
export class Snippet {
  private constructor(
    readonly id: string,
    readonly content: string,
    readonly language: string,
    readonly createdAt: string,
  ) {}

  static create(id: string, content: string, language: string | undefined): Snippet {
    const normalized = content.trim();
    if (normalized.length === 0 || normalized.length > MAX_CONTENT_LENGTH) {
      throw new ValidationError("conteudo invalido (1 a 100000 caracteres)");
    }
    const lang = (language ?? "text").trim() || "text";
    return new Snippet(id, normalized, lang, new Date().toISOString());
  }

  static restore(record: SnippetRecord): Snippet {
    return new Snippet(record.id, record.content, record.language, record.createdAt);
  }

  toRecord(): SnippetRecord {
    return {
      id: this.id,
      content: this.content,
      language: this.language,
      createdAt: this.createdAt,
    };
  }
}

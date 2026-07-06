/** Erro base do dominio. `status` carrega o codigo HTTP correspondente. */
export abstract class DomainError extends Error {
  abstract readonly status: 400 | 404;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ValidationError extends DomainError {
  readonly status = 400;
}

export class SnippetNotFoundError extends DomainError {
  readonly status = 404;

  constructor(id: string) {
    super(`snippet nao encontrado: ${id}`);
  }
}

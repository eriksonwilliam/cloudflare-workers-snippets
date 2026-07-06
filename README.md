# cloudflare-workers-snippets

Serviço de **snippets de texto efêmeros** (estilo pastebin) rodando na **edge**
com **Cloudflare Workers + Hono + Workers KV**. Os snippets expiram sozinhos via
o **TTL nativo do KV** — um caso de uso genuinamente edge/serverless.

É o par "Cloudflare" da leva edge da série (ao lado do
[deno-edge-flags](https://github.com/eriksonwilliam/deno-edge-flags)), mostrando
um **runtime diferente**: isolates V8 na rede da Cloudflare, com `wrangler` e KV.

## Destaques

- **Cloudflare Workers** — runtime de isolates (não Node/Deno), deploy global
  em segundos com `wrangler`.
- **Workers KV** — armazenamento chave-valor na edge, com **expiração nativa**
  (`expirationTtl`): o snippet some sozinho após o TTL.
- **Hono** — mesmo framework do projeto Deno; roda em Workers e é **testável em
  memória** (sem subir servidor) via `app.request()`.
- **Arquitetura em camadas** — o domínio não conhece o KV nem o Hono; o KV é só
  um adapter atrás de um port.
- **Cobertura 100%** — linha, branch, função e statement (vitest + v8).
- **OpenAPI/Swagger** — documentação interativa em `/docs`.

## Stack

- **Runtime:** Cloudflare Workers (workerd)
- **Framework:** Hono 4
- **Storage:** Workers KV (TTL)
- **Testes:** Vitest (cobertura 100%)
- **Build/deploy:** Wrangler 4

## Arquitetura

```
src/
├── domain/                 # Snippet, erros — TypeScript puro
├── application/            # SnippetService + ports (SnippetRepository, IdGenerator)
├── infrastructure/
│   ├── id.ts               # gerador de id (CSPRNG)
│   ├── kv_snippet_repository.ts   # adapter Workers KV
│   └── http/               # Hono: app (rotas + erros), OpenAPI
└── index.ts                # entry do Worker (fetch handler)
```

## Como rodar

### Local (KV simulado via Miniflare)

```bash
npm install
npm run dev            # wrangler dev — http://localhost:8787
```

### Deploy na Cloudflare

```bash
# cria o namespace KV e cola o id no wrangler.toml
npx wrangler kv namespace create SNIPPETS_KV
npm run deploy
```

## Endpoints

| Método | Rota                   | Descrição                          |
| ------ | ---------------------- | ---------------------------------- |
| POST   | `/snippets`            | Cria um snippet (expira via TTL)   |
| GET    | `/snippets/{id}`       | Busca um snippet (JSON)            |
| GET    | `/snippets/{id}/raw`   | Conteúdo bruto (`text/plain`)      |
| GET    | `/docs`                | Swagger UI                         |
| GET    | `/health`              | Health check                       |

Exemplo:

```bash
curl -X POST localhost:8787/snippets \
  -H "Content-Type: application/json" \
  -d '{"content":"console.log(42)","language":"javascript"}'
# -> { "id": "xU9pH1W3XL", "url": "/snippets/xU9pH1W3XL", ... }

curl localhost:8787/snippets/xU9pH1W3XL/raw
```

## Testes e cobertura

```bash
npm run coverage       # exige 100% (linha e branch)
```

A lógica é testada em memória (sem subir o Worker), com um KV falso implementando
o mesmo contrato. O `index.ts` (entry) e os arquivos só de tipos ficam fora da
métrica; o build do Worker é validado por `wrangler deploy --dry-run` na CI.

## Licença

MIT.

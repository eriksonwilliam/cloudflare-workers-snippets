export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "cloudflare-workers-snippets API",
    description: "Snippets de texto efemeros na edge (Cloudflare Workers + KV).",
    version: "0.1.0",
  },
  tags: [{ name: "snippets", description: "Operacoes de snippets" }],
  paths: {
    "/health": {
      get: { summary: "Health check", responses: { "200": { description: "OK" } } },
    },
    "/snippets": {
      post: {
        tags: ["snippets"],
        summary: "Cria um snippet",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateSnippetRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Snippet criado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Snippet" } },
            },
          },
          "400": { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/snippets/{id}": {
      get: {
        tags: ["snippets"],
        summary: "Busca um snippet",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Snippet",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Snippet" } },
            },
          },
          "404": { $ref: "#/components/responses/Error" },
        },
      },
    },
    "/snippets/{id}/raw": {
      get: {
        tags: ["snippets"],
        summary: "Retorna o conteudo bruto (text/plain)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Conteudo", content: { "text/plain": {} } },
          "404": { $ref: "#/components/responses/Error" },
        },
      },
    },
  },
  components: {
    responses: {
      Error: {
        description: "Erro",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
    },
    schemas: {
      CreateSnippetRequest: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string", example: "console.log('oi')" },
          language: { type: "string", example: "javascript" },
        },
      },
      Snippet: {
        type: "object",
        properties: {
          id: { type: "string" },
          url: { type: "string", example: "/snippets/abc123" },
          content: { type: "string" },
          language: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: { error: { type: "string" }, message: { type: "string" } },
      },
    },
  },
};

export const swaggerHtml = `<!DOCTYPE html>
<html lang="pt-br">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>cloudflare-workers-snippets - API</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
      globalThis.onload = () => {
        globalThis.ui = SwaggerUIBundle({ url: "/openapi.json", dom_id: "#swagger-ui" });
      };
    </script>
  </body>
</html>`;

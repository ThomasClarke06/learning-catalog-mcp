# learning-catalog-mcp

A small Model Context Protocol (MCP) server in TypeScript that exposes a multi-tenant learning catalogue to AI assistants such as Claude Code.

It shows all three MCP server primitives:

| Primitive | Name | What it does |
|---|---|---|
| Tool | `search_courses` | Keyword search, with an optional level filter |
| Tool | `get_course` | Full details of one course |
| Tool | `recommend_learning_path` | Courses for a skill, ordered beginner to advanced |
| Resource | `catalog://courses` | The whole catalogue for this org, as JSON |
| Prompt | `study_plan` | A reusable prompt that builds a weekly study plan using the tools |

## Tenant isolation

Courses are either shared or belong to one organisation. The org comes from the server's config (`ORG_ID`), not from tool arguments, so the model cannot ask for another organisation's content. In a real product the org would come from the authenticated user's token.

## Run it

```bash
npm install
npm run smoke-test
```

`smoke-test` builds the server, starts it over stdio and calls it as an MCP client: it lists the tools, resources and prompts, runs two searches, and checks that one org cannot see another org's courses.

## Use it from Claude Code

```bash
npm run build
claude mcp add learning-catalog -e ORG_ID=acme -- node "$(pwd)/dist/server.js"
```

Then ask Claude something like "Use the learning catalogue to plan how I'd learn RAG in 3 hours a week".

## Use it from ChatGPT (HTTP mode)

The same tools also run over the Streamable HTTP transport, which remote clients such as ChatGPT use. The server runs in stateless mode and checks the Host header to block DNS rebinding.

```bash
npm run build
cloudflared tunnel --url http://localhost:3000   # prints https://<random>.trycloudflare.com
ALLOWED_HOSTS=<random>.trycloudflare.com npm run start:http
```

In ChatGPT, turn on developer mode, then create a connector with the URL `https://<random>.trycloudflare.com/mcp` and no authentication.

`npm run smoke-test:http` calls a running HTTP server (default `http://localhost:3000/mcp`, override with `MCP_URL`).

## Stack

TypeScript, `@modelcontextprotocol/sdk`, zod for input schemas, stdio and Streamable HTTP transports, Express.

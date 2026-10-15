# learning-catalog-mcp

A small Model Context Protocol (MCP) server in TypeScript that exposes a multi-tenant learning catalogue to AI assistants such as Claude Code.

It shows all three MCP server primitives:

| Primitive | Name | What it does |
|---|---|---|
| Tool | `search_courses` | Keyword search, with an optional level filter |
| Tool | `get_course` | Full details of one course |
| Tool | `recommend_learning_path` | Courses for a skill, ordered beginner to advanced |
| Tool | `search_course_content` | RAG: semantic search over lesson text, returning cited passages |
| Resource | `catalog://courses` | The whole catalogue for this org, as JSON |
| Prompt | `study_plan` | A reusable prompt that builds a weekly study plan using the tools |

## Tenant isolation

Courses are either shared or belong to one organisation. The org comes from the server's config (`ORG_ID`), not from tool arguments, so the model cannot ask for another organisation's content. In a real product the org would come from the authenticated user's token.

## RAG search

`search_course_content` answers questions from the lesson text of the courses (`src/rag/`):

1. Chunking: each course's lesson text is split into one chunk per `## ` section, keeping the course and section as the citation.
2. Embedding: chunks are embedded locally with `Xenova/all-MiniLM-L6-v2` (384 dimensions) via Transformers.js. No API key; the model downloads once (about 90MB) on first use.
3. Vector store: an in-memory store with cosine similarity, built on the first search. The org filter runs before scoring, so one org can never retrieve another org's chunks.
4. Retrieval: the question is embedded and the top passages above a similarity threshold are returned. If nothing is close enough, the tool tells the model to say it could not find an answer rather than guess.

The model that calls the tool (Claude, ChatGPT) does the generation step, so this is agentic RAG: the model decides when to search.

Known limitation: a small embedding model can rank the wrong passage first. For example, "how do I stop the AI making things up?" puts the Acme AI policy above the hallucinations lesson because both mention AI. Next steps would be hybrid search (keyword plus vector), a re-ranker, and a small evaluation set of questions with expected passages.

## Run it

```bash
npm install
npm run smoke-test
```

`smoke-test` builds the server, starts it over stdio and calls it as an MCP client: it lists the tools, resources and prompts, runs keyword and RAG searches, and checks that one org cannot see another org's courses or lesson content.

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

TypeScript, `@modelcontextprotocol/sdk`, zod for input schemas, stdio and Streamable HTTP transports, Express, Transformers.js for local embeddings.

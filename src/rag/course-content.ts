// Lesson text for some courses, split into "## " sections. This is what the RAG search indexes.
export const courseContent: Record<string, string> = {
  'llm-intro': `
## Tokens and cost
Models read and write text as tokens, roughly three quarters of a word each. You pay for input and output tokens, so long prompts and long answers cost more.

## Context windows
The context window is everything the model can see at once: instructions, chat history, tool results and its own answer. When a conversation gets too long, summarise or trim older messages.

## Structured outputs
Ask for JSON that matches a schema, and use the provider's strict mode where available. Your code can then rely on the shape of the answer instead of parsing free text.
`,
  'rag-patterns': `
## Why retrieval
Language models only know what they were trained on. Retrieval finds the relevant parts of your own documents at question time and adds them to the prompt, so answers are grounded in your data.

## Chunking
Split documents into small pieces before indexing, ideally along headings or paragraphs. Each chunk should cover one idea and keep its source, so answers can cite where they came from.

## Hybrid search and re-ranking
Keyword search is good at exact terms and codes, vector search is good at meaning. Combine both, then use a re-ranker to put the most relevant chunks first.
`,
  'llm-evals': `
## Reducing hallucinations
Models predict likely text, not true text, so they sometimes make things up. Ground answers in retrieved sources, ask for citations, and allow the model to say it does not know.

## Golden datasets
Keep a fixed set of example inputs with known good outputs. Run it every time you change a prompt or model, and compare scores before you ship.

## Feedback in production
Collect thumbs up and down, log inputs and outputs, and review failures every week. Real usage finds problems your test set missed.
`,
  'mcp-servers': `
## Tools, resources and prompts
Tools are actions the model can call. Resources are data the application can attach. Prompts are reusable templates the user can run.

## Transports
Use stdio for local servers that the client starts itself, and Streamable HTTP for remote servers shared by many users. Remote servers should use OAuth.

## Security
Treat tool results as data, not instructions, because of prompt injection. Give tools the least privilege they need and require approval for actions that change data.
`,
  'aws-serverless': `
## Queues for background work
Put slow jobs on an SQS queue and process them with workers. Retries and a dead-letter queue stop one bad message from blocking the rest.

## Lambda limits
Lambda suits short, event-driven tasks. It has a maximum run time and cold starts, so long-running jobs belong on containers such as ECS.
`,
  'acme-ai-policy': `
## Customer data and AI tools
Acme staff must not paste customer personal data into public AI tools. Use the approved company assistant, which keeps data inside our account.

## Reviewing AI output
Anything an AI tool writes for a customer must be reviewed by a person before it is sent.
`,
  'globex-sales-kickoff': `
## Sales targets
Globex aims to grow enterprise revenue by 30 percent this year, focusing on the retail sector.
`,
};

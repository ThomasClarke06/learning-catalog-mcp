// Starts the server as a child process and talks to it as an MCP client, like Claude Code would.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['dist/server.js'],
  env: { ...process.env, ORG_ID: 'acme' } as Record<string, string>,
});

const client = new Client({ name: 'smoke-test', version: '1.0.0' });
await client.connect(transport);

const { tools } = await client.listTools();
console.log('Tools:', tools.map(tool => tool.name).join(', '));

const { resources } = await client.listResources();
console.log('Resources:', resources.map(resource => resource.uri).join(', '));

const { prompts } = await client.listPrompts();
console.log('Prompts:', prompts.map(prompt => prompt.name).join(', '));

const search = await client.callTool({ name: 'search_courses', arguments: { query: 'rag embeddings' } });
console.log('\nsearch_courses("rag embeddings"):\n' + (search.content as { text: string }[])[0].text);

const path = await client.callTool({ name: 'recommend_learning_path', arguments: { skill: 'ai' } });
console.log('\nrecommend_learning_path("ai") for acme:\n' + (path.content as { text: string }[])[0].text);

const otherOrg = await client.callTool({ name: 'search_courses', arguments: { query: 'globex sales' } });
console.log('\nsearch_courses("globex sales") from acme (should find nothing):\n' + (otherOrg.content as { text: string }[])[0].text);

await client.close();

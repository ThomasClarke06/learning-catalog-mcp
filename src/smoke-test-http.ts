// Calls a running HTTP server (npm run start:http) as an MCP client, like ChatGPT would.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const url = new URL(process.env.MCP_URL ?? 'http://localhost:3000/mcp');

const client = new Client({ name: 'smoke-test-http', version: '1.0.0' });
await client.connect(new StreamableHTTPClientTransport(url));

const { tools } = await client.listTools();
console.log(`Connected to ${url.href}`);
console.log('Tools:', tools.map(tool => tool.name).join(', '));

const search = await client.callTool({ name: 'search_courses', arguments: { query: 'mcp' } });
console.log('\nsearch_courses("mcp"):\n' + (search.content as { text: string }[])[0].text);

await client.close();

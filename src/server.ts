import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { createServer } from './create-server.js';

const orgId = process.env.ORG_ID ?? 'acme';

await createServer(orgId).connect(new StdioServerTransport());
// stdout is the protocol channel for stdio servers, so log to stderr only.
console.error(`learning-catalog MCP server running on stdio (org: ${orgId})`);

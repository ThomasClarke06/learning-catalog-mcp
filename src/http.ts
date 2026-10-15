import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { createServer } from './create-server.js';

const orgId = process.env.ORG_ID ?? 'acme';
const port = Number(process.env.PORT ?? 3000);
// Add your tunnel's hostname here (e.g. abc.trycloudflare.com) so requests through it pass the Host header check.
const tunnelHosts = (process.env.ALLOWED_HOSTS ?? '').split(',').map(host => host.trim()).filter(Boolean);

const app = createMcpExpressApp({ allowedHosts: ['localhost', '127.0.0.1', ...tunnelHosts] });

// Stateless mode: a fresh server and transport per request, so no session state to manage.
app.post('/mcp', async (req, res) => {
  const server = createServer(orgId);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => {
    void transport.close();
    void server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null });
    }
  }
});

app.all('/mcp', (_req, res) => {
  res.status(405).set('Allow', 'POST').json({ jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed' }, id: null });
});

app.listen(port, '127.0.0.1', () => {
  console.error(`learning-catalog MCP server on http://localhost:${port}/mcp (org: ${orgId})`);
  if (tunnelHosts.length) {
    console.error(`Also accepting requests for: ${tunnelHosts.join(', ')}`);
  }
});

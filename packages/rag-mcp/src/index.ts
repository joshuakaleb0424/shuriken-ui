import express from 'express'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { z } from 'zod'
import { mcpAuthToken, ragConfig } from './config.js'
import { embed } from './ollama.js'
import { search } from './qdrant.js'

const config = ragConfig()
const authToken = mcpAuthToken()
const port = Number.parseInt(process.env.PORT || '3000', 10)

function server(): McpServer {
  const instance = new McpServer({ name: 'shuriken-ui-docs', version: '4.0.0' })
  instance.tool(
    'search_shuriken_docs',
    'Search the Shuriken UI documentation and component source. Use this before answering questions about Shuriken UI APIs, components, composables, installation, or usage.',
    {
      query: z.string().min(2).describe('Natural-language question or keywords to search for.'),
      limit: z.number().int().min(1).max(10).default(6).describe('Maximum number of documentation excerpts to return.'),
      version: z.string().optional().describe('Installed Shuriken UI version. Omit to search the server default.'),
    },
    async ({ query, limit, version }) => {
      const [vector] = await embed(config, [query])
      const results = await search(config, vector, limit, version || config.packageVersion)
      return {
        content: [{ type: 'text', text: JSON.stringify(results.map(({ score, payload }) => ({ score, ...payload })), null, 2) }],
      }
    },
  )
  return instance
}

const app = express()
app.use(express.json({ limit: '1mb' }))
app.get('/health', (_request, response) => response.status(200).json({ status: 'ok' }))
app.use('/mcp', (request, response, next) => {
  const authorization = request.header('authorization')
  if (authorization !== `Bearer ${authToken}`) {
    response.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
})
app.post('/mcp', async (request, response, next) => {
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    })
    const instance = server()
    await instance.connect(transport)
    await transport.handleRequest(request, response, request.body)
    response.once('finish', () => void transport.close())
  }
  catch (error) {
    next(error)
  }
})
app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error)
  response.status(500).json({ error: 'Internal server error' })
})
app.listen(port, '0.0.0.0', () => console.info(`Shuriken UI RAG MCP listening on port ${port}`))

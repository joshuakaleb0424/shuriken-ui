export interface RagConfig {
  collection: string
  embeddingModel: string
  ollamaUrl: string
  packageVersion: string
  qdrantUrl: string
}

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} must be set`)
  }
  return value
}

function url(name: string, fallback: string): string {
  const value = process.env[name]?.trim() || fallback
  return value.replace(/\/$/, '')
}

export function ragConfig(): RagConfig {
  return {
    collection: process.env.RAG_COLLECTION?.trim() || 'shuriken-ui-v4',
    embeddingModel: process.env.RAG_EMBEDDING_MODEL?.trim() || 'nomic-embed-text',
    ollamaUrl: url('RAG_OLLAMA_URL', 'http://ollama:11434'),
    packageVersion: process.env.RAG_PACKAGE_VERSION?.trim() || '4.0.0',
    qdrantUrl: url('RAG_QDRANT_URL', 'http://qdrant:6333'),
  }
}

export function mcpAuthToken(): string {
  return required('MCP_AUTH_TOKEN')
}

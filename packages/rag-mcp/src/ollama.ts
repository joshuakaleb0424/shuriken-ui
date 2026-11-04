import type { RagConfig } from './config.js'

interface EmbedResponse {
  embeddings: number[][]
}

export async function embed(config: RagConfig, inputs: string[]): Promise<number[][]> {
  const response = await fetch(`${config.ollamaUrl}/api/embed`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: config.embeddingModel, input: inputs }),
  })

  if (!response.ok) {
    throw new Error(`Ollama embedding request failed (${response.status}): ${await response.text()}`)
  }

  const data = await response.json() as EmbedResponse
  if (!data.embeddings?.length || data.embeddings.length !== inputs.length) {
    throw new Error('Ollama returned an invalid embedding response')
  }

  return data.embeddings
}

export async function pullModel(config: RagConfig): Promise<void> {
  const response = await fetch(`${config.ollamaUrl}/api/pull`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: config.embeddingModel, stream: false }),
  })

  if (!response.ok) {
    throw new Error(`Ollama model pull failed (${response.status}): ${await response.text()}`)
  }
}

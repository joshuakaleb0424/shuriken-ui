import type { RagConfig } from './config.js'

export interface ChunkPayload {
  content: string
  heading: string
  kind: 'component-source' | 'composable-source' | 'documentation'
  name: string
  package: string
  source: string
  version: string
}

interface QdrantPoint {
  payload: ChunkPayload
  score: number
}

export async function collectionExists(config: RagConfig): Promise<boolean> {
  const response = await fetch(`${config.qdrantUrl}/collections/${encodeURIComponent(config.collection)}`)
  if (response.status === 404) return false
  if (!response.ok) throw new Error(`Qdrant collection lookup failed (${response.status}): ${await response.text()}`)
  return true
}

export async function createCollection(config: RagConfig, vectorSize: number): Promise<void> {
  const response = await fetch(`${config.qdrantUrl}/collections/${encodeURIComponent(config.collection)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ vectors: { size: vectorSize, distance: 'Cosine' } }),
  })
  if (!response.ok) throw new Error(`Qdrant collection creation failed (${response.status}): ${await response.text()}`)
}

export async function deleteCollection(config: RagConfig): Promise<void> {
  const response = await fetch(`${config.qdrantUrl}/collections/${encodeURIComponent(config.collection)}`, { method: 'DELETE' })
  if (!response.ok && response.status !== 404) throw new Error(`Qdrant collection deletion failed (${response.status}): ${await response.text()}`)
}

export async function upsert(
  config: RagConfig,
  points: Array<{ id: string, vector: number[], payload: ChunkPayload }>,
): Promise<void> {
  const response = await fetch(`${config.qdrantUrl}/collections/${encodeURIComponent(config.collection)}/points?wait=true`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ points }),
  })
  if (!response.ok) throw new Error(`Qdrant upsert failed (${response.status}): ${await response.text()}`)
}

export async function search(
  config: RagConfig,
  vector: number[],
  limit: number,
  version?: string,
): Promise<QdrantPoint[]> {
  const filter = version
    ? { must: [{ key: 'version', match: { value: version } }] }
    : undefined
  const response = await fetch(`${config.qdrantUrl}/collections/${encodeURIComponent(config.collection)}/points/query`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: vector, limit, with_payload: true, filter }),
  })
  if (!response.ok) throw new Error(`Qdrant search failed (${response.status}): ${await response.text()}`)

  const data = await response.json() as { result: { points: QdrantPoint[] } }
  return data.result.points
}

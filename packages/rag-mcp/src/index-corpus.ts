import { resolve } from 'node:path'
import { loadCorpus } from './corpus.js'
import { ragConfig } from './config.js'
import { embed } from './ollama.js'
import { collectionExists, createCollection, deleteCollection, upsert } from './qdrant.js'

const BATCH_SIZE = 32
const config = ragConfig()
const repositoryRoot = resolve(process.argv[2] || process.cwd())
const recreate = process.argv.includes('--recreate')

async function waitFor(name: string, endpoint: string): Promise<void> {
  for (let attempt = 1; attempt <= 60; attempt++) {
    try {
      const response = await fetch(endpoint)
      if (response.ok) return
    }
    catch {
      // The service is still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 1_000))
  }
  throw new Error(`${name} did not become available within 60 seconds`)
}

await Promise.all([
  waitFor('Ollama', `${config.ollamaUrl}/api/tags`),
  waitFor('Qdrant', `${config.qdrantUrl}/collections`),
])
const corpus = await loadCorpus(repositoryRoot, config.packageVersion)

if (!corpus.length) throw new Error('No documentation or source files found to index')
if (recreate) await deleteCollection(config)

for (let index = 0; index < corpus.length; index += BATCH_SIZE) {
  const batch = corpus.slice(index, index + BATCH_SIZE)
  const vectors = await embed(config, batch.map(({ payload }) => payload.content))
  if (index === 0 && !(await collectionExists(config))) {
    await createCollection(config, vectors[0].length)
  }
  await upsert(config, batch.map((chunk, position) => ({ ...chunk, vector: vectors[position] })))
  console.info(`Indexed ${Math.min(index + batch.length, corpus.length)}/${corpus.length} chunks`)
}

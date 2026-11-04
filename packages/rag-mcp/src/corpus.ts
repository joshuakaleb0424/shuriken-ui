import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import type { ChunkPayload } from './qdrant.js'

const MAX_CHUNK_CHARS = 2_400
const OVERLAP_CHARS = 240

interface SourceDocument {
  content: string
  kind: ChunkPayload['kind']
  name: string
  source: string
}

async function files(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? files(path) : [path]
  }))
  return nested.flat()
}

function title(content: string, fallback: string): string {
  return /^#\s+(.+)$/m.exec(content)?.[1]?.trim() || fallback
}

function chunks(content: string): Array<{ content: string, heading: string }> {
  const sections = content.split(/(?=^#{1,3}\s+)/m)
  const result: Array<{ content: string, heading: string }> = []

  for (const section of sections) {
    const heading = /^#{1,3}\s+(.+)$/m.exec(section)?.[1]?.trim() || 'Overview'
    for (let index = 0; index < section.length; index += MAX_CHUNK_CHARS - OVERLAP_CHARS) {
      const value = section.slice(index, index + MAX_CHUNK_CHARS).trim()
      if (value) result.push({ content: value, heading })
      if (index + MAX_CHUNK_CHARS >= section.length) break
    }
  }

  return result
}

function id(value: string): string {
  const hash = createHash('sha256').update(value).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`
}

export async function loadCorpus(repositoryRoot: string, version: string): Promise<Array<{ id: string, payload: ChunkPayload }>> {
  const definitions: Array<{ directory: string, extension: string, kind: ChunkPayload['kind'] }> = [
    { directory: 'docs/content', extension: '.md', kind: 'documentation' },
    { directory: 'packages/nuxt/src/runtime/components', extension: '.vue', kind: 'component-source' },
    { directory: 'packages/nuxt/src/runtime/composables', extension: '.ts', kind: 'composable-source' },
  ]
  const documents: SourceDocument[] = []

  for (const definition of definitions) {
    const directory = join(repositoryRoot, definition.directory)
    for (const path of await files(directory)) {
      if (!path.endsWith(definition.extension)) continue
      const content = await readFile(path, 'utf8')
      documents.push({
        content,
        kind: definition.kind,
        name: title(content, path.split('/').pop()?.replace(/\.(md|ts|vue)$/, '') || 'Untitled'),
        source: relative(repositoryRoot, path),
      })
    }
  }

  return documents.flatMap((document) => chunks(document.content).map(({ content, heading }, index) => {
    const payload: ChunkPayload = {
      content,
      heading,
      kind: document.kind,
      name: document.name,
      package: '@joshuakaleb/shuriken-ui-nuxt',
      source: document.source,
      version,
    }
    return { id: id(`${payload.source}:${index}:${content}`), payload }
  }))
}

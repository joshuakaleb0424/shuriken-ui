# Shuriken UI RAG MCP

This service makes the Shuriken UI documentation available to Codex through two local services:

- **Ollama** generates embeddings only; it does not generate answers.
- **Qdrant** stores and searches documentation chunks.

The MCP server is read-only. Each user's Codex client calls `search_shuriken_docs`, then generates the answer with that user's own model access.

## Deploy with Coolify

1. Create a Git-backed Docker Compose application in Coolify.
2. Set its Compose file to `deploy/coolify/rag-mcp.compose.yaml`.
3. Add these environment variables in Coolify:

   ```env
   MCP_AUTH_TOKEN=<a-long-random-team-secret>
   OLLAMA_IMAGE=ollama/ollama:<tested-pinned-tag>
   QDRANT_IMAGE=qdrant/qdrant:<tested-pinned-tag>
   ```

   `MCP_AUTH_TOKEN` protects the public MCP endpoint. Keep Qdrant and Ollama private: only assign a public HTTPS domain to the `mcp` service, targeting port `3000`.

4. Deploy the stack.
5. Wait for `ollama-init` to download the embedding model and `indexer` to build the Qdrant collection. Both are one-time services and will show as completed. The `mcp` service starts only after the indexer succeeds.

   On every deployment, the indexer refreshes documentation from `docs/content`, component source, and composable source embedded in the MCP image. It deliberately recreates the collection so deleted or changed documentation cannot remain searchable.

Coolify manages the two named volumes declared in the Compose file. Back up `qdrant-data` and `ollama-data` before upgrades.

## Configure Codex for each teammate

Each teammate sets a local secret, outside the repository:

```sh
export SHURIKEN_RAG_MCP_TOKEN='<the-team-access-token>'
```

Then add the remote MCP server to their Codex configuration:

```toml
[mcp_servers.shuriken_ui_docs]
url = "https://mcp.example.com/mcp"
bearer_token_env_var = "SHURIKEN_RAG_MCP_TOKEN"
```

They can verify it with:

```sh
codex mcp list
```

The endpoint uses Streamable HTTP at `/mcp` and accepts only `Authorization: Bearer <token>` requests. To rotate access, update `MCP_AUTH_TOKEN` in Coolify, redeploy, and distribute the new token through the team's password manager.

## Tools

### `search_shuriken_docs`

Searches documentation and source chunks. Inputs:

- `query` — question or keywords.
- `limit` — 1–10 results, defaults to 6.
- `version` — optional installed package version. It defaults to the deployed corpus version.

Every result includes the source path, section heading, package version, similarity score, and the original excerpt, so Codex can cite and verify it.

# Abilitya Assistant

The `main` branch is the source of truth for the production Abilitya Assistant skills and the custom-marketplace package named **Abilitya Assistant (Prod)**.

The repository plugin connects ChatGPT and Codex to the production Executor MCP through the production Vercel proxy. Public releases are submitted through the OpenAI Platform using the skills from `main` and the production MCP endpoint. The `staging` branch maintains its own staging-specific plugin identity, MCP endpoint, namespace, and network-link instructions.

The proxy reads `EXECUTOR_API_KEY`, `EXECUTOR_MCP_PATH`, and optionally `EXECUTOR_ORIGIN`. Configure those variables independently in the production and staging Vercel deployments.

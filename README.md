# Abilitya Assistant

This repository is the source of truth for Abilitya Assistant skills and the custom-marketplace package named **Abilitya Assistant (Staging)**.

The repository plugin connects ChatGPT and Codex to the staging Executor MCP through a Vercel proxy. Production releases are submitted separately through the OpenAI Platform using the production-ready skills from `main` and the production MCP endpoint.

The proxy reads `EXECUTOR_API_KEY`, `EXECUTOR_MCP_PATH`, and optionally `EXECUTOR_ORIGIN`. Configure those variables independently in the production and staging Vercel deployments.

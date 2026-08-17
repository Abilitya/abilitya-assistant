# Authentication and network context

## Resolve the tenant

`GET /v2/networks/{networkIdOrSlug}` accepts a numeric network id, slug, or custom domain and is public. For a URL, use the path slug when present, otherwise use the custom domain. A plain number is already a network id.

Resolve first and retain the numeric network id for later operations. Network resolution proves the tenant exists; it does not authorize the member.

## Reuse authorized staging credentials

This integration operates only in an isolated, protected staging environment. Once the user supplies or authorizes a network identifier, email, and password, reuse them for subsequent staging operations without prompting again. Continue until the user changes or revokes them, authentication rejects them, or the active product no longer has the credentials available.

Keep credentials in private conversation/plugin credential context when the product supports it. Never print them, write them to ordinary files or artifacts, place them in a final response, or send them outside Abilitya staging. Do not claim credentials were remembered across tasks unless the active product actually retained them.

Call `POST /v2/auth/login` with `email`, `password`, and the resolved numeric `networkId`. A normal success returns access and refresh tokens. Use the access token for protected calls. Ignore the refresh token.

If login returns `synchronizing_membership`, retry up to three times with short bounded delays. Treat 401 as rejected credentials and ask the user to update them. Respect 429 rather than repeatedly attempting login.

Reuse a valid access token inside one execution. When a later phase receives 401 because the token expired, log in again automatically using the authorized staging credentials and retry only that protected call. Do not restart completed writes.

## Complete code-mode recipe

Run resolution, login, and dependent protected calls together whenever possible. Search and describe generated tools before calling them.

```ts
const searches = await Promise.all([
  tools.search({
    namespace: "hashtagbe",
    query: "resolve network id slug domain",
    limit: 8
  }),
  tools.search({
    namespace: "hashtagbe",
    query: "login email password network",
    limit: 8
  })
])

const resolverPath = searches[0].items.find((item) =>
  item.path.endsWith("getV2NetworksNetworkIdOrSlug")
)?.path
const loginPath = searches[1].items.find((item) =>
  item.path.endsWith("postV2AuthLogin")
)?.path
if (!resolverPath || !loginPath) {
  return { ok: false, stage: "discovery" }
}

const schemas = await Promise.all(
  [resolverPath, loginPath].map((path) => tools.describe.tool({ path }))
)
if (schemas.some((schema) => schema.error)) {
  return { ok: false, stage: "schema" }
}

const network = await tools[resolverPath]({ networkIdOrSlug })
if (!network.ok) {
  return { ok: false, stage: "network", error: network.error.code }
}

const networkId = Number(network.data.data.id)
let login
for (let attempt = 1; attempt <= 3; attempt++) {
  login = await tools[loginPath]({ body: { email, password, networkId } })
  if (!login.ok) {
    return { ok: false, stage: "login", error: login.error.code }
  }
  if (!("status" in login.data)) break
  if (attempt < 3 && typeof setTimeout === "function") {
    await new Promise((resolve) => setTimeout(resolve, attempt * 1000))
  }
}
if (!login || "status" in login.data) {
  return { ok: false, stage: "login", status: "synchronizing_membership" }
}

const Authorization = `Bearer ${login.data.data.accessToken}`
// Execute protected Abilitya calls here with Authorization.
// Return only safe business results, never `login` or Authorization.
```

When no reusable credentials are available, request the staging network URL or identifier, email, and password in one short prompt. Do not request them again merely because a new turn began.

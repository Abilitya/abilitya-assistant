# Upload workflows

Uploads create reusable media ids. A file has no product meaning until another operation attaches its upload id to a network, content item, promotion, raffle, profile, or other resource.

## Contents

- [Upload V2](#upload-v2)
- [File and chunk rules](#file-and-chunk-rules)
- [Phase 1: initialize and request part 1](#phase-1-discover-authenticate-initialize-and-request-part-1)
- [Phase 2: upload one byte range](#phase-2-upload-one-byte-range)
- [Subsequent parts](#request-each-subsequent-signed-url)
- [Phase 3: complete and poll](#phase-3-complete-and-poll)
- [Attach the upload to another entity](#attach-the-upload-to-another-entity)
- [Direct upload fallback](#direct-upload-fallback)

## Upload V2

Prefer Upload V2 for attached files. It has three stages:

1. Use Executor to resolve the network, authenticate, initialize the upload, and request a signed URL for the next part.
2. Use an HTTP-capable runtime to `PUT` that part's bytes to storage and capture its ETag. Repeat stages 1–2 sequentially for every part.
3. Use Executor to authenticate if necessary, complete the multipart upload, and poll until an `uploadId` appears.

Do not use `fetch` inside Executor QuickJS; network fetches are disabled there. The storage `PUT` is not a Abilitya OpenAPI operation. In Codex desktop, use the local shell HTTP client. Do not initialize until the active product can access the file bytes and perform HTTPS `PUT` requests.

### File and chunk rules

- Determine the exact original name, MIME type, and byte size before initialization.
- Default to 5 MiB chunks (`5242880` bytes). Every non-final part must be at least 5 MiB; the final part may be smaller.
- Calculate `totalParts = Math.ceil(size / 5242880)` and stop if it exceeds 10000.
- Files above 100 MB must be MP4, M4V, or WEBM video.
- Set `isCompressed: false` unless the agent actually compressed the file.

### Phase 1: discover, authenticate, initialize, and request part 1

Provide `networkIdOrSlug`, `email`, `password`, `mimeType`, `originalName`, and `size` from private execution context.

```ts
const searches = await Promise.all([
  tools.search({ namespace: "hashtagbe", query: "resolve network id slug domain", limit: 8 }),
  tools.search({ namespace: "hashtagbe", query: "login email password network", limit: 8 }),
  tools.search({ namespace: "hashtagbe", query: "upload v2 initialize multipart", limit: 8 }),
  tools.search({ namespace: "hashtagbe", query: "upload v2 part signed url", limit: 8 })
])

const findPath = (index, suffix) =>
  searches[index].items.find((item) => item.path.endsWith(suffix))?.path

const resolverPath = findPath(0, "getV2NetworksNetworkIdOrSlug")
const loginPath = findPath(1, "postV2AuthLogin")
const initPath = findPath(2, "postUploadsV2Init")
const signedUrlPath = findPath(3, "getUploadsV2PartSignedUrl")
if (!resolverPath || !loginPath || !initPath || !signedUrlPath) {
  return { ok: false, stage: "discovery" }
}

const schemas = await Promise.all(
  [resolverPath, loginPath, initPath, signedUrlPath].map((path) =>
    tools.describe.tool({ path })
  )
)
if (schemas.some((schema) => schema.error)) {
  return { ok: false, stage: "schema" }
}

const network = await tools[resolverPath]({ networkIdOrSlug })
if (!network.ok) return { ok: false, stage: "network", error: network.error.code }

const networkId = Number(network.data.data.id)
const login = await tools[loginPath]({ body: { email, password, networkId } })
if (!login.ok) return { ok: false, stage: "login", error: login.error.code }
if ("status" in login.data) return { ok: false, stage: "login", status: login.data.status }
const Authorization = `Bearer ${login.data.data.accessToken}`

const init = await tools[initPath]({
  Authorization,
  body: { mimeType, originalName, size }
})
if (!init.ok) return { ok: false, stage: "init", error: init.error.code }

const signed = await tools[signedUrlPath]({
  Authorization,
  fileStorageUploadId: init.data.fileStorageUploadId,
  fileStorageUploadKey: init.data.key,
  filesStorageUploadPartNumber: 1
})
if (!signed.ok) {
  return { ok: false, stage: "signed_url", partNumber: 1, error: signed.error.code }
}

return {
  ok: true,
  networkId,
  fileStorageUploadId: init.data.fileStorageUploadId,
  key: init.data.key,
  requestId: init.data.requestId,
  partNumber: 1,
  signedUrl: signed.data.signedUrl
}
```

Treat the returned identifiers and signed URL as private intermediate state. Do not repeat initialization after a successful response.

### Phase 2: upload one byte range

For part number `N`, calculate:

- `offset = (N - 1) * 5242880`
- `length = min(5242880, size - offset)`

On macOS/Linux, stream that exact range without creating a temporary part file:

```sh
dd if="$FILE_PATH" bs=1 skip="$OFFSET" count="$LENGTH" 2>/dev/null \
  | curl --fail-with-body --silent --show-error \
      --request PUT \
      --header "Content-Type: $MIME_TYPE" \
      --data-binary @- \
      --dump-header - \
      "$SIGNED_URL"
```

Require a 2xx response and an `ETag` header. Remove only the ETag's surrounding quotes. Record `{ partNumber, etag }` in order.

If a part fails, request a new signed URL for that same part and retry it up to three times with exponential backoff. Do not reinitialize the upload and do not advance to the next part until the current part succeeds.

### Request each subsequent signed URL

For each remaining `partNumber`, authenticate with the reusable staging credentials if the prior access token is unavailable or expired, discover/describe `getUploadsV2PartSignedUrl`, and call:

```ts
const signed = await tools[signedUrlPath]({
  Authorization,
  fileStorageUploadId,
  fileStorageUploadKey: key,
  filesStorageUploadPartNumber: partNumber
})
if (!signed.ok) {
  return { ok: false, stage: "signed_url", partNumber, error: signed.error.code }
}
return { ok: true, partNumber, signedUrl: signed.data.signedUrl }
```

Immediately upload that part before requesting the next URL.

### Phase 3: complete and poll

Provide the retained `fileStorageUploadId`, `key`, `requestId`, and ordered `uploadedParts`. Reuse the authorized credentials automatically.

```ts
const searches = await Promise.all([
  tools.search({ namespace: "hashtagbe", query: "login email password network", limit: 8 }),
  tools.search({ namespace: "hashtagbe", query: "upload v2 complete multipart", limit: 8 }),
  tools.search({ namespace: "hashtagbe", query: "upload v2 request status upload id", limit: 8 })
])

const loginPath = searches[0].items.find((item) => item.path.endsWith("postV2AuthLogin"))?.path
const completePath = searches[1].items.find((item) => item.path.endsWith("postUploadsV2Complete"))?.path
const statusPath = searches[2].items.find((item) => item.path.endsWith("getUploadsV2RequestIdStatus"))?.path
if (!loginPath || !completePath || !statusPath) {
  return { ok: false, stage: "discovery" }
}

const schemas = await Promise.all(
  [loginPath, completePath, statusPath].map((path) => tools.describe.tool({ path }))
)
if (schemas.some((schema) => schema.error)) {
  return { ok: false, stage: "schema" }
}

const login = await tools[loginPath]({ body: { email, password, networkId } })
if (!login.ok) return { ok: false, stage: "login", error: login.error.code }
if ("status" in login.data) return { ok: false, stage: "login", status: login.data.status }
const Authorization = `Bearer ${login.data.data.accessToken}`

const completed = await tools[completePath]({
  Authorization,
  body: {
    fileStorageUploadId,
    fileStorageUploadKey: key,
    filesStorageUploadParts: uploadedParts,
    isCompressed: false
  }
})
if (!completed.ok) {
  return { ok: false, stage: "complete", error: completed.error.code }
}

let lastStatus = null
for (let attempt = 1; attempt <= 20; attempt++) {
  const result = await tools[statusPath]({ Authorization, requestId })
  if (!result.ok) {
    return { ok: false, stage: "status", error: result.error.code }
  }

  lastStatus = result.data.data
  if (lastStatus?.uploadId) {
    return {
      ok: true,
      uploadId: lastStatus.uploadId,
      status: lastStatus.status,
      url: lastStatus.link
    }
  }
  if (
    lastStatus?.status === "cancelled" ||
    lastStatus?.status === "transcoded_failed"
  ) {
    return {
      ok: false,
      stage: "processing",
      status: lastStatus.status,
      reason: lastStatus.reason
    }
  }

  if (typeof setTimeout === "function") {
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(1000 * 2 ** (attempt - 1), 8000))
    )
  }
}
return { ok: false, stage: "processing_timeout", status: lastStatus?.status }
```

Treat the first response containing `uploadId` as success even when `status` is `created_upload`. This was verified with a one-part PNG and a two-part MP4; the MP4 moved from `validating` to `created_upload` before returning its upload id.

### Attach the upload to another entity

An upload is usually an intermediate result, not the end of the user's request. When the user asked to create or update another entity, continue immediately after polling returns `uploadId`:

1. Search for and describe the entity operation instead of guessing its path or request fields.
2. Pass the numeric upload id—not the signed URL, storage key, or final media URL—to the schema field that represents the media. Common shapes include a singular field such as `cover`, `mobileCover`, or `logo`, and collections such as `medias`; always follow the described schema.
3. Keep the entity operation in the same authenticated execution when possible. If the byte-transfer phase split the workflow, authenticate again with the reusable staging credentials and continue without re-uploading the file.
4. Return success only after the requested entity exists or has been updated. If that operation fails, retain and report the safe upload id so the entity operation can be retried without creating a duplicate upload.

For a content post whose described create schema accepts `cover?: number`, continue with this verified pattern:

```ts
const matches = await tools.search({
  namespace: "hashtagbe",
  query: "create content post cover title description",
  limit: 12
})
const createContentPath =
  matches.items.find((item) =>
    item.path.endsWith("contentPublishing.postContents")
  )?.path ?? matches.items.find((item) => item.path.endsWith("postContents"))?.path
if (!createContentPath) {
  return { ok: false, stage: "content_discovery", uploadId }
}

const schema = await tools.describe.tool({ path: createContentPath })
if (schema.error) return { ok: false, stage: "content_schema", uploadId }

const created = await tools[createContentPath]({
  Authorization,
  body: {
    type: "post",
    title,
    description,
    cover: Number(uploadId)
  }
})
if (!created.ok) {
  return {
    ok: false,
    stage: "create_content",
    uploadId,
    error: created.error.code
  }
}

return {
  ok: true,
  uploadId,
  contentId: created.data.data.id,
  type: created.data.data.type,
  status: created.data.data.status,
  coverId: created.data.data.cover?.id
}
```

Confirm that the returned entity references the expected upload when the response exposes that relationship. This upload-to-cover recipe was verified in staging with a WebP upload followed by creation of a `post`; the returned content's cover id matched the upload id.

## Direct upload fallback

Use `POST /uploads` for an already-public image URL or when the active environment cannot perform the signed storage `PUT`. Inspect every returned item because a successful HTTP response can contain per-file errors. SVG is rejected by the direct route.

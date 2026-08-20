# Education API workflow

Use this reference for endpoint discovery, sequencing, and invariants. Always search and describe the live Executor tools before constructing a request; the live schema takes precedence.

## Contents

- [Discovery vocabulary](#discovery-vocabulary)
- [Data model](#data-model)
- [Create and update](#create-and-update)
- [Read and verify](#read-and-verify)
- [Ordering](#ordering)
- [Publication](#publication)

## Discovery vocabulary

Search Executor with concise combinations of these terms:

- `education modules catalog manageable`
- `create update education module`
- `education module items lesson folder`
- `publish all education module items`
- `education module item detail`
- `education module order ETag`
- `extract URL metadata`
- `uploads` or `upload v2 multipart`

Expected endpoint concepts include creating/updating/deleting modules, creating/updating/deleting module items, catalog/module/item reads, module ordering, and module-item ordering. Call only the exact paths returned by discovery.

## Data model

- A module owns an image cover, title, rich description, publication state, catalog order, and a lesson count.
- The cover is required on create and must reference an existing image upload. A PDF, video, missing upload, or other non-image media is invalid.
- Module titles are capped at 50 characters.
- Module descriptions accept sanitized HTML and must remain within 500 characters after formatting.
- A module starts empty. Creating it does not create lessons or folders.
- Module items have a title capped at 150 characters, a fixed type of `folder` or `lesson`, a publication state, and an order.
- A folder is always at the module root. Its body and parent must be null. Folders cannot nest.
- A lesson may be at the module root with `parentId: null` or inside one folder from the same module. Its body accepts sanitized HTML.
- Root folders and root lessons share one ordering scope. Lessons inside a folder share that folder's ordering scope.

## Create and update

Create the module first, then create its items:

1. Upload or resolve the module cover image.
2. Create the module with `coverId`, `title`, `description`, and normally omitted or false `isPublished`.
3. Create root folders in desired order and retain their returned ids privately for dependent lesson calls.
4. Create root lessons and folder lessons in desired order. For a folder lesson, pass the returned folder id as `parentId`.

Use the returned `data` as saved truth. The API trims titles, sanitizes HTML, assigns ids/order/timestamps, resolves cover data, and applies the publication default.

Updates are partial:

- Patch a module to change cover, title, description, or publication state.
- Patch an item to change title, publication state, lesson body, or lesson folder placement.
- Do not send immutable, derived, or absent fields such as item type, timestamps, or lesson counts.
- Do not use a body id to redirect a path-selected target.

Deleting a folder moves its active child lessons back to the module root. Treat deletion as a material action and follow the parent confirmation rules.

## Read and verify

- Use the module catalog with `manageable: true` to include drafts. It returns module cards and lesson counts but omits the item tree.
- Use module detail with `manageable: true` to retrieve the compact folder/lesson menu. It intentionally omits lesson bodies.
- Use item detail with `manageable: true` to retrieve a lesson's sanitized body HTML or inspect one folder.
- After writes, trust the write response. Do not interpret an immediate cached GET as failure or repeat the write.
- Verify rich lesson content from returned `body.html`. If sanitization removed a custom marker or URL, do not claim the corresponding embed succeeded.

## Ordering

New modules append to the active catalog. New items append to their current active scope. Prefer creating in intended order.

When reordering is necessary:

- Read the module catalog and take its current HTTP `ETag` before moving a module.
- Read module detail and take its current HTTP `ETag` before moving a folder or lesson.
- Send that exact opaque value in `If-Match` with the zero-based target `order`.
- Capture the next ETag returned by each successful reorder before another reorder.
- On a `412` revision conflict, refresh the relevant catalog/tree and preserve the intended placement only if it still makes sense. Do not overwrite newer ordering silently.
- Orders beyond the scope size move the item to the end. A move to the current position is a successful no-op.

## Publication

Default all converted modules and items to drafts. Set `isPublished: true` only after an explicit publish instruction. A published empty module is visible with zero lessons, so avoid publishing containers before their intended lessons are ready unless the user specifically asks for that state.

When the user asks to publish a complete module, use this exact sequence:

1. Discover and call the manager-only **Publish all education module items** operation for the module. It takes the module id and no request body, publishes every active draft folder and lesson, ignores already-published and soft-deleted items, and returns the number of items changed.
2. PATCH the module itself with only `isPublished: true`.
3. Confirm both successful write responses, including the bulk operation's changed-item count and the module's published state. If the bulk operation reports a server error while downstream lesson updates may be running, refetch the manageable module/tree before deciding whether to retry.

The bulk item operation is state-idempotent: a repeat never unpublishes items and reports zero unless new drafts were added. Use it for a complete-module publish, not as a replacement for publishing one specifically selected item. Do not reverse the sequence: a published module with draft items may expose an incomplete member experience.

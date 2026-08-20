---
name: education-module-creation
description: Bundled Education capability of Abilitya Assistant. Create, edit, structure, and populate Abilitya staging education modules, folders, and rich-HTML lessons; convert notes, PDFs, documents, lecture videos, YouTube links, and other supplied learning material into courses. Use within the Abilitya Assistant experience whenever a user asks for Education, learning or training modules, courses, lessons, module folders, lesson HTML, or conversion of source material into structured learning content.
---

# Abilitya Education Capability

Create and edit Education modules, folders, and lessons on Abilitya staging. Convert supplied source material faithfully into a useful learning sequence. Keep the user-facing conversation under Abilitya Assistant and continue applying the parent skill's authentication, upload, privacy, confirmation, cached-read, and completion rules.

## Load the needed references

- Read [education-api.md](references/education-api.md) before any module, folder, or lesson API operation.
- Read [rich-lesson-html.md](references/rich-lesson-html.md) before composing or editing lesson HTML.
- Read [material-conversion.md](references/material-conversion.md) when converting notes, PDFs, documents, recordings, videos, or links into Education.
- Read [source-coverage.md](references/source-coverage.md) before converting any supplied source material into modules or lessons.
- Read [long-form-video.md](references/long-form-video.md) whenever a supplied video or video URL is source material for a module.
- Read the parent [uploads reference](../abilitya-assistant/references/uploads.md) before uploading a cover, lesson image, or lesson video.
- Read the parent [authentication reference](../abilitya-assistant/references/authentication-and-network-context.md) before login.

## Treat the live catalog as authoritative

- Search Executor by intent, inspect every selected tool with `tools.describe.tool(...)`, and build requests only from the live `inputTypeScript`.
- Never guess a tool path or request field from this skill. Use the API reference for discovery terms, sequencing, and invariants only.
- Branch on every `{ ok: false }` result. Treat successful write responses as authoritative because immediate GET responses can be cached.
- Operate only on Abilitya staging.

## Choose the learning structure

Before converting multi-topic material, determine which structure the user wants:

1. One Education module containing topic folders and lessons; or
2. Multiple topic-focused Education modules, each containing its own folders and lessons.

If the user has not made this choice clear, ask one short clarifying question before creating anything. Give a concrete example based on their material. Do not silently choose between these models.

Use folders only when they improve navigation. Folders are root-level and cannot contain folders. Lessons may be placed at the module root or inside one folder.

## Creation workflow

1. Resolve the target network and authenticate the manager.
2. Inspect all supplied material and create a source-coverage map before writing lessons. Identify its hierarchy, substantive claims, examples, definitions, chronology, evidence, source links, existing media, natural lesson boundaries, and gaps without inventing unsupported claims. A conversion request means a comprehensive learning companion by default, not a compact gist.
3. Resolve the module structure choice when it is not already explicit.
4. Prepare a concise proposed outline when conversion requires meaningful editorial restructuring. Keep it proportional to the request; do not add a redundant confirmation when the user's explicit create instruction already authorizes the outlined creation.
5. Prepare a cover for every module. Use a user-supplied module cover when provided. Otherwise search for an appropriate, attributable image relevant to that module, prefer official or authoritative sources, upload it, and use the returned image upload id. Do not treat an image merely embedded in source notes as the requested module cover unless the user identifies it as such or it is unmistakably cover artwork.
6. Preserve relevant images already present in the source material: extract or obtain the actual image bytes or authoritative source URL, upload each image, and place its returned media URL in the corresponding lesson HTML. If the source has no images, do not search for, generate, or add lesson images unless the user explicitly asks. This restriction applies to lesson imagery, not the required module cover.
7. Use only videos the user supplies or explicitly asks to locate. Never search for, generate, or add a lesson video on your own. For a supplied video source, install and use the `summarize` CLI as described in the long-form-video reference to obtain a transcript and understand the material. Upload local video files before composing HTML. Use a supplied supported video URL directly.
8. Compose semantic lesson HTML using the supported blocks and exact recipes in the rich-HTML reference. Allow no more than one video total per lesson. Put it at or near the top as the primary content when available.
   Do not repeat the lesson title as an H1 or opening heading in the lesson body. The lesson title is already rendered on the lesson details page; begin the body with introductory or substantive content.
9. Validate every rich card or inline-card URL through URL extraction before saving it. Use a raw text link when a preview is unnecessary. Do not create a rich preview whose extraction lacks meaningful metadata.
10. Create the module container first, then its root folders, then lessons with the returned folder ids. Create in intended display order when possible so append behavior produces the correct tree.
11. Create modules, folders, and lessons as drafts by default. Set `isPublished: true` only when the user explicitly asks to publish. When publishing a completed module, first use the manager-only bulk **Publish all items** operation, then PATCH the module with `isPublished: true`; verify both results. Publishing a module does not implicitly authorize publishing its items, and publishing items does not implicitly authorize publishing the module.
12. Use reorder endpoints only when needed. Read the appropriate fresh ETag immediately before reordering and handle revision conflicts as described in the API reference.
13. Verify each write from its returned DTO: cover, title, type, parent relationship, draft/publication state, sanitized body HTML, and assigned order. Check that the sanitizer retained every required rich-media marker before claiming completion.

## Editing workflow

- Read the manageable module catalog and module tree before choosing targets. Read item detail when lesson body content is needed.
- Patch only fields the user requested or fields necessarily affected by the requested structural change.
- Never change an item's type. Move a lesson with `parentId`; do not attempt to nest a folder.
- Preserve valid existing rich HTML and media unless the user asks to replace or remove them.
- Ask for confirmation before deletion or a separate publication action when the parent confirmation rules require it.

## Completion

Report the module titles, folder/lesson structure, draft or published state, and important carried-over media in plain language. Mention any source material that could not be represented. Do not expose tokens, upload ids, internal tool paths, ETags, signed URLs, or raw API responses.

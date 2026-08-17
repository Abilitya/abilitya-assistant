---
name: content-creation
description: Bundled Content capability of Abilitya Assistant. Create Abilitya Content entities on staging, including Posts, Shorts/Stories, external Videos, Hosted Videos, Streaming, Link/Web content, Announcements, Documents, Events, Galleries, and Scratch content. Use within the Abilitya Assistant experience whenever a user asks to create, draft, upload, or publish network Content, names one of those Content types, requests a Content CTA, or wants client-tailored Content. Do not use for Social Feed posts unless the user explicitly says feed, social feed, or feed post.
---

# Abilitya Content Capability

Create a Content entity with the correct type, media, metadata, interests, author, visibility, and optional CTA. This is an internal specialist capability of Abilitya Assistant, not a separate assistant. Keep the user-facing conversation under Abilitya Assistant and operate only on Abilitya staging through Executor.

## Route language correctly

- Treat “content post,” “create content and a post,” or an unqualified “post” inside a content request as Content type `post`.
- Route to Social Feed only when the user explicitly says “feed,” “social feed,” or “feed post.” Never substitute a Feed post for Content type `post`.
- Use the user-facing label Short for internal type `story` in conversation.
- Treat “link content” as internal type `web`.
- Ask one short clarifying question only when the requested type remains genuinely ambiguous.

Read [content-types.md](references/content-types.md) only for the product meaning, editorial intent, and member-facing rendering behavior of the selected type. Never use that reference to decide what fields can be sent. Read the parent skill’s [authentication-and-network-context.md](../abilitya-assistant/references/authentication-and-network-context.md) before login. Read [uploads.md](../abilitya-assistant/references/uploads.md) whenever the live request schema calls for uploaded media.

## Absolute schema precedence

The live Executor/OpenAPI `inputTypeScript` is the sole authority for request construction. It alone determines which fields exist, which are required or optional, their types, and their accepted values. Product documentation describes what Content types are and how clients render them; it is not an API contract.

If documentation, examples, frontend forms, remembered schemas, or this skill conflict with the live schema, follow the live schema without exception. Never send a field absent from the live schema. Never treat a live-optional field as API-required because the product docs or frontend form marks it required.

## Workflow

1. Resolve the target network and authenticate the acting member. Every agent or sub-agent must perform its own network resolution and login before protected reads or writes. Never pass an access token between agents or executions.
2. Search Executor for network customizations, network update, URL extraction, interests, content creation, and any dependent business object such as partners, promotions, or surveys. Describe every selected tool before composing requests.
3. Determine the exact Content type from the user’s words. Inspect the live `POST /contents` schema immediately before building the body; it is the only request-shape source of truth.
4. Ensure the selected type is enabled in `customization.contents[type]`. If it is disabled, authenticate and enable only that type while preserving the other content flags.
5. Treat successful write responses as authoritative. Abilitya GET endpoints can remain cached for up to two minutes. When a PATCH response returns the requested content flag as enabled, continue; do not immediately refetch, see stale data, and undo or block the workflow.
6. Prepare every field and asset required by the live schema. Reuse user-supplied media. When the live schema accepts a cover and the product experience benefits from one, find a relevant existing online image from the client, rights holder, or another authoritative source, upload it, and pass its id. Never invoke image generation or synthesize, illustrate, draw, fabricate, or otherwise create a new image asset for Content. For every Short/Story, accept only portrait video whose pixel height is greater than its pixel width and prefer an exact or near-9:16 source. Inspect the source dimensions before upload; reject horizontal and square video even when the API would accept it. Do not crop, stretch, rotate, or pad a horizontal source merely to satisfy this rule unless the user explicitly requests that transformation and the result is visually reviewed. If no suitable vertical video exists, continue searching trustworthy sources or stop and ask the user for one; never publish a horizontal Story that the vertical client will crop. When the live schema requires video media for a Short or Hosted Video and none is available, stop and ask the user for a video or an explicit source to scan; do not substitute an image. For Announcements, follow the dedicated asset workflow below.
7. For `video`, `streaming`, and `web`, use URL extraction when the live tools and schema support it. Use extracted metadata only in fields accepted by the live create schema. Treat generic or default placeholder images as extraction failure, including URLs or filenames such as `default.png`, `placeholder`, `fallback`, `no-image`, or an image that is blank, transparent, generic, or unrelated to the destination. Never upload or attach such an image as the Content cover. Find another relevant image URL from the destination page, its official owner, or another trustworthy attributable source; upload that replacement and verify that its returned image URL or renditions are non-placeholder and renderable before creating the Content. Consult [content-types.md](references/content-types.md) for the resulting member experience, not request validation.
8. Resolve at least one relevant interest from the target network for every Content item and pass its numeric id in a non-empty `interests` array. This requirement applies even when the user did not explicitly name an interest and even when the live schema marks `interests` optional. Infer the best matching interest from the Content topic. Never reuse interest ids from another network. Never call `POST /contents` with `interests` omitted or empty. If no relevant network-owned interest exists, stop before Content creation and ask the user whether to add an appropriate network interest; do not silently publish uncategorized Content.
9. Create through the Content endpoint using only fields accepted by its current live schema. Include the user’s requested author, schedule, privacy, and CTA only when that schema accepts them. An explicit “create this content” request authorizes the create call and the status returned by that call. Ask separately before notifications/boosts, later approval/rejection, or any unrelated broadcast.
10. Verify from the create response: type, title, status, attached cover/media, a non-empty interests collection containing the requested network-owned ids, CTA, privacy, and author. For a Short/Story, also verify from returned media metadata or a later authoritative detail read that the attached video remains portrait and has the expected dimensions after processing; do not infer suitability merely from a filename, social URL, upload success, or playable video. For image-led Content, inspect returned originals or renditions rather than trusting a truthy cover field. Follow the dedicated Announcement verification below. If the response lacks enough detail, perform one later authoritative detail read when cache timing permits and do not claim completion until it passes.

## Announcement assets

1. Source assets in this order: client; verified sponsor or partner; unrelated established advertiser. Generic ads must use the advertiser's official assets and destination and must not imply a relationship with the client.
2. Download source files locally. Never use direct remote-URL upload for Announcement covers.
3. Remove baked-in solid-color, transparent, letterbox, or pillarbox borders. Crop, never stretch, into final desktop and mobile files of at least `1558×250` and `512×250`. Cropping existing authoritative images is allowed and is not image generation. Do not upscale.
4. Desktop and mobile may use separate crops or official responsive variants from the same campaign. Preview the exact final files at their target aspect ratios; reject visible borders, clipped focal subjects, embedded-text conflicts, or softness.
5. Upload both prepared files through Upload V2. Before Content creation, inspect the stored originals and require at least `1558×250` for `cover` and `512×250` for `mobileCover`. A source file's dimensions, upload success, or a truthy cover field is not proof. If storage exposes only a smaller original or rendition, stop instead of publishing.
6. After creation, verify both covers, CTA, interest, privacy, author, status, and schedule from the write response. Never send a boost or notification unless separately authorized.

## CTA dependencies

- Shorts and Announcements can use CTAs.
- Web/email/WhatsApp/buy/order CTAs require the matching destination data.
- Promotion CTA: resolve or create the Partner first, then create the Promotion, then attach its id to the Content. Never create a Promotion without a Partner.
- Survey CTA: resolve or create the Survey before attaching its id.
- Check that dependent schedules overlap the Content schedule. Ask for confirmation if the live API warns about a schedule conflict.

## Completion

Report the created Content type, title, returned status, and important attachments/CTA in plain language. Send the network link as `https://community-staging.hashtag.be/NETWORK_SLUG_HERE`. Do not expose network ids, raw slugs, upload ids, tokens, or internal tool paths.

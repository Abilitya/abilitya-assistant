# Orchestration

## Contents

1. Request parsing
2. Phase order
3. Sub-agent waves
4. Authentication isolation
5. Retry and idempotency
6. Resuming onboarding

## Request parsing

Build an internal brief containing:

- canonical client name and category;
- create-new or existing-network mode;
- target network identifier when supplied;
- authorized staging owner identity and credentials;
- user-supplied logo, kit, campaign, or brand assets;
- baseline quantities with only explicit category overrides applied;
- requested exclusions, links, locale, access model, or presentation date.

Do not ask for information that authoritative research or the active staging context can resolve safely.

## Phase order

1. Research enough client identity to avoid creating the wrong network.
2. Create the lead and save business details, or resolve the existing network.
3. Pause only when onboarding requires the email confirmation code.
4. Convert the lead, resolving Football Club `teamId` when applicable.
5. Authenticate and configure logo, links, Content flags, and theme.
6. Start Content production only after the required types are enabled.
7. Run the completion audit and repair safe gaps.

Configuration may run concurrently only when operations do not overwrite the same nested customization object. Prefer one settings PATCH for logo, links, and Content flags. Theme remains a separate complete-theme PATCH.

## Sub-agent waves

Use dedicated sub-agents because research, source selection, downloads, and editorial creation are independent quality surfaces. With three worker slots available beside the coordinator, run waves:

### Wave 1

- **Social-video agent:** discover official Instagram, Facebook, TikTok when accessible, and YouTube Shorts; upload and create the requested Stories.
- **Opinion agent:** research timely themes and create original Posts with covers and at least two related source links each.
- **Web-news agent:** create Link/Web contents from varied authoritative external pages with uploaded or extracted covers.

### Wave 2

- **Announcement agent:** follow the Content capability's **Announcement assets** workflow, select an authoritative CTA, and create the Announcement with verified desktop and mobile covers. Never use image generation.
- **Events agent:** create verified upcoming Events first, then realistic network-owned community Events if necessary. Keep all member-facing copy free of internal workflow language and disclaimers.

The coordinator may perform one Wave 2 role itself when concurrency or latency makes that more reliable, but preserve distinct research responsibility. Give each worker exact quantity, target network, source rules, no-notification rule, and completion fields. Do not pass access tokens. Inherited authorized staging credentials may be reused privately; every worker resolves and logs in independently.

Wait for every worker. Consolidate created titles, types, statuses, source URLs, fallbacks, and failures. A worker's research notes are not proof of creation; require successful Content write results.

## Authentication isolation

Each worker must:

1. read the applicable Abilitya skills;
2. resolve the target network;
3. log in with the authorized staging credentials;
4. keep its access token inside its own active execution;
5. return only safe business results.

## Retry and idempotency

- Retry transient lookup, login synchronization, signed-URL, upload part, processing, and rate-limit failures with bounded backoff.
- Re-request a signed URL for the same failed part; never reinitialize a successful upload.
- Preserve a created upload id when downstream Content creation fails and retry attachment/creation with that upload.
- Treat a successful create or PATCH response as authoritative; do not duplicate a write because a cached GET looks stale.
- Before retrying an uncertain Content create, use a safe manageable lookup by title/type when available. Avoid a second create when the first may have succeeded.
- Stop and report deterministic validation, authorization, or unsupported-media failures after exhausting safe alternatives.

## Resuming onboarding

Lead onboarding spans the email-code turn. Retain the lead id and token only in the private active-task context. After the user supplies the code, confirm the same lead and continue automatically through contracts, team resolution, conversion, configuration, and population. Never start a duplicate lead merely because the earlier execution ended.

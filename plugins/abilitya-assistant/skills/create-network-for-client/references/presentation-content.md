# Presentation Content

## Contents

1. Baseline matrix
2. Shared quality rules
3. Stories
4. Opinion Posts
5. Announcement
6. Link/Web
7. Events

## Baseline matrix

| Format | Default | Required presentation qualities |
| --- | ---: | --- |
| Short/Story | 7 | Uploaded vertical video, varied official sources/topics |
| Post | 3 | Original opinion, cover, substantial description, at least two `links` |
| Announcement | 1 | Prepared and stored at least 1558×250 desktop and 512×250 mobile, concise copy, useful CTA when available |
| Link/Web | 3 | External URL, title, description, valid cover |
| Event | 2 | Future schedule, organizer, cover, venue/link when appropriate |

Apply user quantity overrides independently. Zero or “no X” disables only that format.

## Shared quality rules

- Inspect the live Content create schema immediately before each format's first write.
- Enable the type before creation and trust the settings PATCH response.
- Prefer `publishedBy: "network"` for a client showcase.
- Use public visibility unless the user requests otherwise.
- Resolve network-owned interest ids when useful; never reuse ids from another network.
- Vary topics, imagery, titles, and source domains when credible alternatives exist.
- Use polished titles and descriptions that read naturally in the client’s language/locale.
- Never boost or notify as part of baseline population.

## Stories

- Upload real video media through Upload V2 and wait for an upload id.
- Prefer 9:16 source video; accept other vertical-friendly formats when the content remains usable.
- Create one Story per video rather than reusing the same upload.
- Use concise titles and descriptions; include source attribution where appropriate.
- Do not fabricate video from static imagery.

## Opinion Posts

- Select distinct strategic or audience-relevant questions: leadership, product direction, transfers, tactics, market position, innovation, customer experience, culture, or outlook.
- Separate reported facts from editorial judgment.
- Write original analysis rather than summarizing one article.
- Attach a relevant cover.
- Pass at least two source URLs in the live `links: string[]` field. If fewer than two trustworthy sources exist for a proposed topic, choose a better-supported topic.

## Announcement

- Choose a concrete CTA such as official store, tickets, booking, registration, product page, or campaign landing page.
- Follow the Content capability's **Announcement assets** workflow for sourcing, local trimming/cropping, Upload V2, and stored-dimension verification.
- Keep the short description within the product's concise banner expectations.
- Set `launchesAt` to exactly one hour before the current creation time so the Announcement is immediately visible, and set a sensible future expiry. Verify the create response preserves the past launch time. Do not send notifications.
- Use `web_page` only when the live schema accepts it and a valid destination is present.

## Link/Web

- Prefer timely official or reputable external articles across different themes.
- Use URL extraction when available, then curate the result.
- Always pass a cover id, title, description, and canonical external link when accepted by the live schema.
- Avoid duplicate URLs, paywalled pages that cannot render a useful preview, and unsupported redirect links.

## Events

For verified Events, use the published start/end, organizer, venue, and official destination.

For original network-owned community Events:

- choose plausible future dates relative to the current date and avoid schedule conflicts;
- choose an evergreen format appropriate to the audience, such as a watch party, fan meetup, history night, Q&A, community challenge, members' gathering, or season discussion;
- use the network as organizer and an online or generic community venue unless a specific physical venue is verified;
- avoid named opponents, scores, external partners, performers, discounts, ticket inventory, physical addresses, or other unverified third-party claims;
- write concise promotional copy exactly as a real community manager would;
- never mention staging, presentations, showcases, demos, concepts, previews, simulations, fictional status, verification status, or any other internal workflow context;
- never add a disclaimer or explain why the Event was created;
- include a cover and an appropriate generic or official client link when supported.

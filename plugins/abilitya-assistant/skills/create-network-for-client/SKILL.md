---
name: create-network-for-client
description: Create or transform a Abilitya staging network into a presentation-ready client showcase. Use when a business user asks to create, prepare, populate, demo, pitch, or build a network for a named prospective client, club, brand, retailer, organization, or existing staging network. Automatically handles onboarding or existing-network authentication, client research, Football Club team resolution, interests, logo, links, all Content-type enablement, brand-derived light and dark themes, and a realistic multi-format Content library produced with sub-agents. Explicit per-format quantities override only that format's baseline.
---

# Create Network for Client

Build a polished Abilitya staging network that the business team can open and present immediately.

## Compose the bundled capabilities

Read and follow these sibling skills before acting:

- `../abilitya-assistant/SKILL.md` for staging, discovery, authentication, onboarding, uploads, confirmations, cached reads, and privacy.
- `../content-creation/SKILL.md` for Content creation and live-schema precedence.
- `../network-theme-designer/SKILL.md` for complete accessible themes and gradient preservation.

Read their directly required references for each phase. Treat this skill as orchestration policy; never replace the specialist rules with remembered API shapes.

## Default deliverable

Unless the user overrides a quantity, produce:

- 7 Shorts/Stories with uploaded video media;
- 3 original opinion Posts, each with a relevant cover and at least two source URLs in `links`;
- 1 image-led Announcement with a useful CTA when a trustworthy destination exists;
- 3 Link/Web contents, each with a valid cover, title, description, and external URL;
- 2 Event contents with covers;
- all supported Content types enabled, even when the baseline does not populate every type.

An explicit quantity changes only that category. “With 10 stories and 5 events” keeps every other baseline unchanged. A clear request to omit or disable a category supersedes the baseline for that category.

Read [orchestration.md](references/orchestration.md) before starting. Read [research-and-sourcing.md](references/research-and-sourcing.md) before client research or downloading media. Read [presentation-content.md](references/presentation-content.md) before creating Content. Read [completion-checklist.md](references/completion-checklist.md) before reporting completion.

## Member-facing realism

Every Content item must read as authentic, finished content for the network's audience. Never mention or imply in a title, description, organizer name, venue, CTA, or other member-facing field that Content is for staging, a client presentation, a showcase, a demo, a pitch, a prototype, a fallback, a concept, a preview, simulated, fictional, unverified, or not publicly confirmed. Do not expose operational caveats, sourcing notes, internal workflow language, or AI commentary in Content. Apply factual guardrails by choosing safer claims, not by adding disclaimers.

## Execution contract

1. Parse the request into client identity, create-or-reuse mode, credentials, supplied assets, requested quantities, exclusions, and presentation date if given.
2. Research the client from current authoritative sources. Resolve the official name, business category, website, logo, brand colors, social accounts, useful commercial links, timely topics, and upcoming moments.
3. Create the network when it does not exist. Reuse an existing network when the user supplies one.
4. Configure identity, realistic interests, logo, supported links, Content types, and theme before populating Content.
5. Spawn dedicated research-and-publishing sub-agents in bounded waves. Every sub-agent must resolve the network and log in independently.
6. Verify all writes from authoritative write responses. Retry safe transient failures without duplicating leads, uploads, or Content.
7. Return the network link plus a concise inventory, sources, fallbacks, and any incomplete item.

For every baseline Announcement, set `launchesAt` to exactly one hour before the creation attempt, using an absolute ISO timestamp derived from the current clock. Never round forward or use a nominal time later on the same day. This deliberate backdating keeps the Announcement immediately eligible for public discovery despite clock skew, processing time, or cache delay. Keep `expiresAt` sensibly in the future and verify the write response preserves a launch time in the past.

Continue autonomously. Pause only for required user-only information such as a lead email code, missing credentials, an inaccessible required attachment, or a materially ambiguous client identity.

## New network rules

- Collect only missing owner identity and credential fields, default an unspecified expected member count to 1,000 without asking, then start Network Onboarding immediately.
- Treat all current onboarding contracts and terms as pre-accepted. Retrieve and submit the latest required contract ids automatically. Never pause for approval, ask for confirmation, display contract details, or mention contract acceptance to the user.
- Pause for the six-digit email code and preserve the private lead continuation exactly as the parent skill requires.
- Generate realistic interests from the client's products, audience, geography, activities, competitions, and editorial themes.
- Infer a public network unless the user requests another supported access model.
- Choose a concise client-facing name suitable for a presentation; do not expose raw ids or slugs.

### Football clients

When the client is a football club or team:

- create a Football Club experience, not a generic Community;
- use the live soccer-team lookup to resolve the senior men's team from the official club name;
- pass the verified provider `teamId` during network conversion;
- never select a women's, academy, youth, reserve, or similarly named team unless the request explicitly targets it;
- ask the user to choose only when multiple senior teams remain genuinely plausible after authoritative research.

For non-football clients, choose the app type that best matches the client's presentation use case, defaulting to Community when no specialist experience clearly fits.

## Initial configuration

- Upload and apply the user-supplied logo when provided. Otherwise, use image search to find an official, opaque, roughly square logo whose background fills the image edge-to-edge, with no borders or padding, and whose centered mark stays clear and recognizable when circularly cropped at `48×48` pixels. Prefer direct upload; make at most one minimal crop when necessary. Trust successful upload and network-update responses instead of waiting for public caches.
- Enable every Content type accepted by the current network customization contract. Preserve unrelated customization fields and trust the PATCH response over cached GETs.
- Add `shopUrl`, `bookingUrl`, and `ticketUrl` only when each destination is authoritative and relevant. Do not invent or substitute aggregator URLs.
- Create both light and dark themes from client branding. In this automatic flow, do not ask the user to choose a color, style, or neutral direction: infer them from the research and default to a **brand-immersive, vibrant presentation theme**, not the theme capability's conservative generic neutral treatment.
- Build a theme brief with a primary brand color, a supporting brand color, and a brand-informed neutral direction before generating tokens. For football clubs, use home/dark and away/light kits when available. For other clients, derive the brief from official brand guidelines, website UI, packaging, campaign art, or supplied references.
- Make the brand recognizable before the logo or Content imagery is considered. Carry brand character into large structural areas such as header surfaces, elevated surfaces, navigation states, contextual ramps, borders, and overlays—not only `surface_brand`, buttons, icons, and text accents.
- Avoid pure-white/gray light foundations and generic near-black/gray dark foundations unless that restraint is itself central to the client's documented visual identity. Prefer accessible brand-tinted foundations and visibly related elevation steps. Do not flood every surface with the primary color; preserve hierarchy, Content legibility, and breathing room.
- Use the supporting color selectively to create contrast and a memorable focal point. Do not collapse every brand-context token to one identical color when a coherent light-to-dark ramp would produce more depth.
- Make light and dark modes feel like two expressions of the same brand. Each mode must deliver a presentation-worthy “wow moment”; do not treat one as the branded mode and the other as a neutral fallback.
- Change only theme colors through the theme capability. Preserve gradients and protected semantic color families.
- After applying the theme, inspect the rendered network at desktop width in both available modes when the UI permits switching. If the page still reads primarily as a generic white/gray or black/gray product shell with muted brand accents, revise the palette before Content population or completion.

## Original community Events

Prefer verified upcoming fixtures, launches, sales, conferences, performances, or campaigns. When enough verified external Events cannot be found, satisfy the remaining baseline with realistic network-owned community Events:

- choose an evergreen format appropriate to the audience, such as a watch party, fan meetup, history night, Q&A, community challenge, members' gathering, or season discussion;
- write concise promotional copy exactly as a real community manager would;
- use the network as organizer and an online or generic community venue unless a specific physical venue is verified;
- choose sensible future dates;
- avoid invented opponents, scores, external partners, performers, discounts, ticket inventory, physical addresses, or other claims involving third parties;
- never add disclaimers or explain why the Event was created.

## Safety and quality

- Operate only on Abilitya staging.
- Use original editorial writing; distinguish opinion from reported fact.
- Prefer official client-owned media and sources. Preserve attribution.
- Never boost, broadcast, notify, approve later, redeem, delete, or perform another separately confirmable action unless explicitly authorized.
- Do not treat an uploaded asset as completion until it is attached to the intended network or Content entity.
- Do not claim the showcase is ready until the completion checklist passes or every remaining gap is reported plainly.

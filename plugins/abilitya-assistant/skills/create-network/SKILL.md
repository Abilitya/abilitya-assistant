---
name: create-network
description: Create a new Abilitya network through guided onboarding. Use when a user asks to create, start, or launch an Abilitya network, community, course platform, private member space, paid creator offering, UGC community, social experience, or focused campaign funnel. Infer the use case from the request, ask only for important missing decisions, obtain explicit contract acceptance, create the network, and route selected follow-up configuration to the relevant bundled capabilities.
---

# Create an Abilitya Network

Guide a user from an idea to a correctly configured new Abilitya network. This is an interactive onboarding workflow: infer what is already clear, ask concise follow-ups when important choices remain unresolved, and do not turn network creation into automatic bulk content generation.

## Compose the Abilitya capabilities

Read and follow:

- `../abilitya-assistant/SKILL.md` for Executor discovery, privacy, confirmation, uploads, and shared behavior;
- `../abilitya-assistant/references/network-onboarding.md` for the live lead, email-confirmation, contract-id, and conversion sequence.

After creation, load only the specialist capability needed for the user's chosen setup:

- `../education-module-creation/SKILL.md` for courses and lessons;
- `../private-access/SKILL.md` for invite-only membership-code access;
- `../paywall-access/SKILL.md` for one-time paid access;
- `../subscription-access/SKILL.md` for recurring memberships;
- `../introduction-page/SKILL.md` when a paid setup needs its introduction page;
- `../network-theme-designer/SKILL.md` for an applied light-and-dark theme;
- `../content-creation/SKILL.md` for Stories, Promotions-linked Content, Posts, and other editorial Content.

Do not load or execute every specialist workflow by default.

## Understand the intended network

Build an internal configuration brief from what the user already said. Classify these dimensions without forcing the user through a fixed questionnaire:

1. **Owner identity:** individual creator, organization, or brand.
2. **Primary purpose:** education, exclusive creator content, community, UGC, social feed, campaign funnel, or a general mixed network.
3. **Access model:** public, Private/invite-only, one-time Purchasable access, or recurring Subscribable access.
4. **Member participation:** consume-only, user-generated content, Social Feed, or both UGC and Social Feed.
5. **Focused funnel:** whether the experience centers on one Story or Promotion reached from a QR code or external access point, and whether it needs a locked exit, lead collection, poll, quiz, digital raffle, or reward.
6. **Identity and presentation:** name, audience, logo/assets, and whether a visual direction already exists.

Use the following signals as routing guidance, not as permission to add features the user did not request:

| User intent or signal | Infer or clarify | Route after creation |
| --- | --- | --- |
| “My courses,” lessons, training, academy | Education-focused; clarify individual versus organization and desired access | Education capability |
| Exclusive creator content, Patreon-like membership | Creator-oriented; clarify one-time versus recurring payment | Introduction Page plus Paywall or Subscription capability |
| Invite-only, members only, membership code | Private access | Private Access capability |
| Members should upload or publish | UGC enabled; confirm the exact member contribution model | Live network customization tools |
| Community conversation or activity feed | Social Feed enabled; keep it distinct from Content Posts | Live network customization and Social Feed tools |
| QR code to one Story or Promotion | Focused campaign funnel; clarify CTA, data collection, reward, timing, and supplied assets | Content plus live Promotion, survey, poll, quiz, or raffle tools as required |
| Recognizable organization or brand | Brand-owned network; ask for supplied assets and authorization before publishing them | Theme and optional Content capabilities only as requested |
| “Create a network” with no purpose | Do not guess the configuration | Ask the minimum intent questions below |

Do not assume that a course network must be paid, that a creator network must allow UGC, or that a brand network needs AI-generated content.

## Ask only for unresolved decisions

When the request already identifies the purpose, acknowledge the inferred direction and ask only about choices that materially change the network. For example, “I need a network for my courses” establishes an Education focus; it does not establish whether the owner is an individual or organization, whether access is public or paid, or whether members can contribute.

For a vague request, group the missing questions into one concise prompt:

- Is the network for you personally or for an organization or brand?
- What should members primarily do there?
- Should access be public, invite-only, a one-time purchase, or a subscription?
- Should members create content or use a Social Feed?
- Do you already have a name, logo, and visual direction?

Skip every question whose answer is already clear. Ask follow-ups later when a selected specialist capability requires details such as price, billing interval, campaign reward, or membership-code wording.

Before onboarding, summarize the interpreted configuration in plain language and let the user correct it. This summary is not an extra approval gate; it prevents creating the wrong network.

## Required contract acceptance

These are the complete legal documents that must currently be accepted for network creation:

- [Abilitya Code of Conduct](https://be-code-of-conduct.abilitya.tech/) — contract type `beCodeOfConduct`
- [Abilitya Privacy Policy](https://be-privacy-policy.abilitya.tech/) — contract type `bePrivacyPolicy`

Before creating a lead or network, link both documents and ask approximately:

> Please read the Abilitya Code of Conduct and Abilitya Privacy Policy linked above, then confirm that you accept both so I can proceed with creating your network.

Require an explicit affirmative acceptance of both documents. Do not infer acceptance from the request to create a network, silence, prior unrelated activity, or acceptance by another person. If the user declines or gives an ambiguous response, do not begin onboarding.

After explicit acceptance, use the onboarding workflow to retrieve the current English contract records for exactly the two contract types above. Submit their current ids during network conversion; never hardcode contract ids. The acceptance applies to this active onboarding request. Ask again if the user intentionally restarts with a new lead or different owner.

Keep this section as the single maintained list of required onboarding contracts. If legal requirements change, update the links and contract types here together, then keep the contract-id retrieval in the onboarding reference aligned with this list.

## Create the network

After intent and contract acceptance are settled:

1. Collect only missing owner identity fields required by the live lead schema: first name, last name, email, and password. Offer an optional logo without making it a blocker.
2. Begin the lead flow, preserve its private continuation, and request the six-digit email confirmation code.
3. Confirm the same lead when the user supplies the code. Never create a duplicate lead merely because the workflow crossed a turn.
4. Derive a concise network name, realistic initial interests, and the closest supported user-facing app type from the agreed purpose. Ask only when more than one materially different choice remains plausible.
5. Retrieve the two accepted contract ids and convert the lead using the live schema.
6. Treat the successful conversion response as authoritative. Read the created network slug and construct its canonical link as `http://community.hashtag.be/<slug>`. Always return that clickable link; do not omit it merely because the API returned the slug without a complete URL. Do not expose the slug separately or expose raw ids or tokens.

Do not call existing-network member login before the network exists. After creation, reuse the authorized owner credentials only as permitted by the parent capability.

## Configure only the selected use case

Network creation authorizes the agreed foundation, not every optional feature.

- **Education:** create the Education-oriented foundation, then offer or perform module creation only when requested.
- **Private:** configure Private access and authentication through the Private Access capability. Changing the access type does not invent membership codes.
- **Paid:** establish the Introduction Page prerequisite, then configure either Purchasable or Subscribable access. Never collect payment-card data or complete a member purchase during setup.
- **UGC:** set `isUserContentGenOn: true` only when the user wants member-created content and the live schema confirms the field and request shape.
- **Social Feed:** enable or configure the feed only when requested. Do not substitute a Content Post for a Feed post or vice versa.
- **Focused Story or Promotion funnel:** inspect the live Story, Promotion, CTA, survey, quiz, poll, and digital-raffle schemas needed for the chosen funnel. Set `exitBehavior: "locked"` only when the user wants a non-dismissible Story experience and the live schema supports it. Collect the campaign assets, timing, requested participant data, destination, and reward rules before publishing.
- **General public network:** keep optional monetization, UGC, feed, and campaign features off unless selected.

Do not create a bulk content library, source brand media, or invent campaigns merely because the network belongs to a brand. Create or populate Content only when the user explicitly asks.

## Theme and assets

- For an individual creator without a defined identity, complete network creation first and then ask what colors, mood, or reference imagery they want.
- For an organization or brand, prefer user-supplied logos, brand guides, and campaign assets. When none are supplied and the user asks for a theme, research official public brand guidance, propose the inferred direction, and let the user correct it before applying.
- Do not download, publish, or claim ownership of brand assets merely because the brand is well known.
- Follow the Theme capability for complete accessible light and dark modes; do not construct remembered theme payloads here.

## Completion

Report the created network and its canonical clickable URL, summarize the selected purpose and access model, and state which requested features were configured. Then offer only the most relevant unfinished next steps, such as adding course material, creating membership plans, importing invitation codes, configuring the Social Feed, building the focused campaign, supplying assets, or choosing a theme.

Never claim that an optional specialist setup is complete when only the base network was created.

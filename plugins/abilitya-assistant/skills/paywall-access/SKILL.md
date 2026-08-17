---
name: paywall-access
description: Bundled Abilitya Assistant capability for configuring, converting, refreshing, or auditing a staging network with one-time paid access. Use when a user asks for a paywall, Purchasable access, a network purchase price or currency, `/paywall` verification, or the commercial step after an Introduction Page is active. Do not use for recurring subscription bundles.
---

# Abilitya Paywall Access Capability

Configure the one-time purchase gate, preserve the branded Introduction Page, and verify the deployed purchase experience. Keep the user-facing conversation under Abilitya Assistant.

Continue applying the parent skill's live-tool discovery, authentication, privacy, confirmation, and cached-read rules. Read and follow the sibling [Introduction Page capability](../introduction-page/SKILL.md) when the required intro is missing or incomplete. Use the Browser capability for deployed visual QA.

Read [contract-and-rendering.md](references/contract-and-rendering.md) before choosing a price, writing the PATCH, or auditing `/paywall`.

## Workflow

1. Resolve the staging network, authenticate the manager, and read its current customization.
2. Discover and describe the live resolver, login, customization read, and network PATCH tools. Treat their current schemas as authoritative.
3. Confirm that `customization.isIntroLandingActive` is true and the intro has its required media and landing settings. Build or repair the Introduction Page first when necessary.
4. Determine the requested currency and one-time price. Ask only when the user has not supplied them and no safe business assumption is appropriate. State any assumed commercial value in the completion response. If currency is not specified by the user, default to EUR.
5. Read `paywallMinValue` when available. The manager validation requires the price in major currency units to be strictly greater than that minimum. Support only currencies accepted by the live schema and manager UI; currently EUR and USD.
6. Convert the entered price to integer minor units exactly once before the API call. For example, `9.99` or `9,99` becomes `999`.
7. PATCH only the access fields that must change: `accessType: "purchasable"`, `currency`, and `paywall: { type: "network", price }`. Include `public` only when required by the current schema; expect the backend to normalize the effective flags.
8. Treat the PATCH response as authoritative. Verify `accessType`, the mutually exclusive access flags, currency, paywall type, and price from that response. Do not repeat a successful write because a cached public read omits or delays the paywall object.
9. Visit `https://community-staging.hashtag.be/<slug>/paywall` while unauthorized. Allow for backend and ISR cache delay with bounded reloads.
10. Inspect one desktop viewport above 768 px and one mobile viewport at or below 768 px. Verify the branded intro media and copy, formatted price, premium CTA, benefits, regulation control, login affordance, legibility, and absence of horizontal overflow.
11. Keep the deployed `/paywall` tab available to the user. Return the live link, one-time price and currency, desktop/mobile result, and any observed cache or rendering defect.

## Boundaries

- Operate only on Abilitya staging.
- Never complete a purchase, enter card details, save a payment method, or use the user's financial data unless the user separately and explicitly authorizes that exact transaction.
- Do not create subscription bundles or switch to Subscribable access; that is a separate recurring-billing workflow.
- Do not change intro media, copy, theme, minimum age, authentication providers, or unrelated settings unless requested or required to make the paywall valid.
- Do not expose paywall ids, payment secrets, Stripe client secrets, tokens, credentials, or raw API responses.
- Do not claim that the paywall is visually ready from the PATCH alone.

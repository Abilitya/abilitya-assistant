---
name: subscription-access
description: Bundled Abilitya Assistant capability for configuring, converting, refreshing, or auditing a staging network with recurring paid access and subscription bundles. Use when a user asks for Subscribable access, recurring membership plans, billing cycles, trials, bundle visibility/status/order, `/subscribe` verification, or subscription catalog management. Do not use for a one-time Purchasable paywall.
---

# Abilitya Subscription Access Capability

Configure recurring access, create a coherent sellable bundle catalog, and verify the deployed subscription landing page. Keep the user-facing conversation under Abilitya Assistant.

Continue applying the parent skill's live-tool discovery, authentication, privacy, confirmation, and cached-read rules. Read the sibling [Introduction Page capability](../introduction-page/SKILL.md) when the required intro is missing or incomplete. Use the Browser capability for deployed visual QA.

Read [contract-and-lifecycle.md](references/contract-and-lifecycle.md) before changing access, creating or editing bundles, or auditing `/subscribe`.

## Workflow

1. Resolve the staging network, authenticate the manager, and read the current customization and manageable bundle catalog.
2. Discover and describe the live resolver, login, network PATCH, and every subscription endpoint needed for the task. Treat current schemas as authoritative.
3. Confirm that the Introduction Page is active and complete. Build or repair it before enabling paid recurring access.
4. Determine currency and catalog design. Reuse explicit choices. If unspecified, choose a small coherent set such as monthly plus discounted annual, explain the assumption afterward, and avoid trials unless requested. If currency is not specified by the user, default to EUR.
5. Inspect existing manageable bundles before writing. Never create duplicates from a cached or partial catalog.
6. Convert displayed prices to integer minor units exactly once. Validate titles, interval limits, visibility, status, and trial shape.
7. Create processor-backed bundles deliberately. Prefer public and active for normal discovery; set explicit order. Verify each response because retries can create processor state.
8. PATCH the network with Subscribable access and the chosen currency. Expect the backend to normalize access flags so only Subscribable remains true.
9. Treat write responses as authoritative. Later list the public catalog without manager-only filters to confirm checkout discovery.
10. Visit `https://community-staging.hashtag.be/<slug>/subscribe` while unauthorized. Allow for bounded cache delay without repeating mutations.
11. Inspect desktop above 768 px and mobile at or below 768 px. Verify branded intro media/copy, intended plans, price/cycle formatting, trial or Subscribe labels, savings copy, CTA colors, benefits, regulation, carousel behavior, and document-level overflow.
12. Keep the deployed `/subscribe` tab available. Return the link, catalog summary, access state, desktop/mobile result, assumptions, and defects.

## Boundaries

- Operate only on Abilitya staging.
- Never collect card details, create a setup intent, start a member subscription, or complete billing unless separately authorized.
- Treat bundle deletion as destructive: it soft-deletes offers and queues asynchronous period-end cancellation for active subscriptions. Require explicit confirmation.
- Treat price, interval, trial, status, privacy, and deletion changes as commercial changes. Do not broaden them beyond the request.
- Do not assume editing a bundle migrates existing processor subscriptions; it changes future catalog behavior.
- Do not expose bundle ids, processor ids, payment-method ids, request ids, client secrets, tokens, credentials, or raw API responses.
- Do not claim readiness from the access PATCH alone; a Subscribable network needs a discoverable active bundle and visual verification.

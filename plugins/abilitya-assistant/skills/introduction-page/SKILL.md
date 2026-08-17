---
name: introduction-page
description: Bundled Abilitya Assistant capability for creating, activating, refreshing, or auditing a branded staging introduction page. Use when a user asks to configure introductory media, CTA/background imagery, landing copy, benefit lists, regulation text, the intro switch, or desktop/mobile verification at `/:slug/intro`; also use as the introduction-page prerequisite before later purchasable or subscribable access setup.
---

# Abilitya Introduction Page Capability

Create a complete branded entry page, save it on Abilitya staging, and verify the deployed experience at desktop and mobile widths. Keep the user-facing conversation under Abilitya Assistant.

Continue applying the parent skill's live-tool discovery, authentication, privacy, upload, confirmation, and cached-read rules. Use the Browser capability for deployed visual QA.

Read [contract-and-rendering.md](references/contract-and-rendering.md) before selecting assets, writing the PATCH, or auditing the deployed page.

## Workflow

1. Resolve the target staging network, authenticate the manager, and read the current customization.
2. Discover and describe the live resolver, login, customization read, upload, and network PATCH tools. Treat the live schemas as authoritative.
3. Select a required 9:16 image or video under 100 MB for primary intro media. Prefer a strong network-owned upload already used by approved Content; otherwise upload authoritative client-owned media. Verify its actual dimensions and crop.
4. Select optional 16:9 images under 100 MB for the desktop CTA and background. These do not appear on mobile.
5. Write CTA title, subtitle, and description; button title and subtitle; feature heading/list; and regulation text. Keep the CTA description within the manager UI's 100-character limit.
6. PATCH only `customization.isIntroLandingActive` and `customization.intro`. Send upload ids, not media URLs. Treat the write response as authoritative.
7. Verify the saved response contains the active flag, all requested media relationships, and every landing setting.
8. Visit `https://community-staging.hashtag.be/<slug>/intro` while unauthenticated. Allow for backend and ISR cache delay; use bounded reloads without repeating a successful PATCH.
9. Inspect one desktop viewport above 768 px and one mobile viewport at or below 768 px. Close the cookie banner if it blocks inspection. Verify assets, crops, copy, CTA color, legibility, benefits, regulation control, and absence of horizontal overflow.
10. Return the live intro link, asset/copy summary, desktop/mobile result, and any remaining defect. Do not claim completion from the PATCH alone.

## PATCH shape

Follow the described live schema. The expected business shape is:

```ts
{
  customization: {
    isIntroLandingActive: true,
    intro: {
      mediaIntroId,
      imageCallToActionId,
      imageBackgroundId,
      landingSettings: {
        callToActionTitle,
        callToActionSubtitle,
        callToActionDescription,
        buttonTitle,
        buttonSubtitle,
        featuresTitle,
        featuresList,
        regulation
      }
    }
  }
}
```

Use `null` for an intentionally removed optional CTA/background asset only when accepted by the live schema. The backend validates every supplied upload relationship.

## Boundaries

- Operate only on Abilitya staging.
- Do not change access type, price, subscription bundles, Content, or notifications unless explicitly requested.
- Public intro pages gate unauthenticated entry until authentication. Private access optionally uses an intro before its membership-code gate; route that setup through the sibling [Private Access capability](../private-access/SKILL.md). Purchasable and subscribable access require an intro; route them through the Paywall and Subscription capabilities.
- Prefer authoritative or user-supplied imagery over generated client-branded visuals.
- Do not repeat a successful write because a cached GET or ISR page is stale.

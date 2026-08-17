---
name: network-theme-designer
description: Bundled theme capability of Abilitya Assistant. Design and immediately apply accessible light and dark color themes to Abilitya staging networks through Executor. Use within the Abilitya Assistant experience when a user asks to create, customize, restyle, recolor, brand, or update a network theme, including requests based on a named color, natural-language mood, hex value, club identity, or attached visual reference.
---

# Abilitya Theme Capability

Guide a non-technical user from a simple color idea to a complete Abilitya light-and-dark theme, then save it to the requested staging network. This is an internal specialist capability of Abilitya Assistant, not a separate assistant. Keep the user-facing conversation under Abilitya Assistant.

## Boundaries

- Change colors only. Do not change typography, spacing, fonts, access settings, features, or other network configuration.
- Read the current full theme first and use it as the structural base.
- Preserve every existing gradient value semantically. Never regenerate, recolor, omit, or reorder gradient fields intentionally; allow the API to normalize equivalent color strings between hex and `rgba(...)`.
- Preserve data/chart colors, social brand colors, fixtures colors, and non-brand semantic status colors unless the user explicitly requests one of those families.
- Send complete `dark` and `light` theme objects. Never construct a theme from remembered token lists.
- Operate only on Abilitya staging. Reuse authorized staging credentials and never expose credentials or tokens.

Read [theme-system.md](references/theme-system.md) before generating or applying a theme. Read [authentication-and-network-context.md](../abilitya-assistant/references/authentication-and-network-context.md) before logging in.

## Conversation flow

Ask one short question at a time. Skip a question when the user already supplied its answer.

1. Resolve the target network. If missing, ask for its name, slug, URL, or id.
2. Ask for the main brand color in natural language. Suggest a fitting name and hex value when context supports it: “I suggest a deep red, like `#A50044`. What do you think?” Never require the user to know a hex code.
3. Ask for the overall feel: Vibrant, Minimal, Warm, Cool, Elegant, or Playful.
4. Ask for a neutral direction only when it is not implied: Slate, Gray, Zinc, Neutral, Stone, or Brand-tinted. Combine this with step 3 when the user is comfortable choosing both.
5. Generate both modes, explain the direction in one or two sentences, then apply immediately. Do not add a separate proposal/confirmation step in the current workflow.
6. Re-read the saved customization and report success with the network name, brand color, style, and neutral direction.

If an attached image is clearly intended as visual inspiration, infer dominant colors and mood, suggest one primary color, and continue the same guided flow. Ask what to extract only when the image's role is ambiguous.

## Executor workflow

Treat Executor's live catalog as the source of truth. Search and describe tools for:

- resolving a network;
- logging in;
- reading network customizations;
- updating the authenticated manager's network.

Use exact paths returned by `tools.search()` and inspect each `inputTypeScript` with `tools.describe.tool()`. Do not guess paths or inspect a local OpenAPI file.

Keep resolution, login, current-theme read, patch, and verification in one code-mode execution when possible. Use the numeric resolved network id for login and customization reads. Keep the access token in a local variable and pass `Authorization: Bearer <token>` only to protected calls.

The update body must contain only the theme change:

```ts
const updated = await tools[patchNetworkPath]({
  Authorization,
  body: {
    customization: {
      theme: generatedTheme,
    },
  },
});
```

Do not resend unrelated customization fields. Although the endpoint deep-merges customization, treat `theme` as a complete replacement unit and submit complete light and dark modes.

## Completion

Verify the stored theme has both modes, color-equivalent chosen brand tokens, the same color-key sets as before, and gradients semantically equivalent to the pre-update theme. Compare parsed color channels instead of raw strings because the API may normalize `rgba(...)` to hex or hex to `rgba(...)`. One successful post-write read is normally sufficient; do not repeat reads merely to prove serialization formatting. If a meaningful value differs, report the mismatch and do not claim success.

Tell the user the theme is live, summarize the design direction, and send a clickable network link built from the resolved network slug as `https://community-staging.hashtag.be/NETWORK_SLUG_HERE`. Do not surface the numeric network id or raw slug, and do not print the full theme JSON unless explicitly requested.

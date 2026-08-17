# Abilitya theme system

## Contents

- Theme shape and invariants
- Guided choices
- Token families
- Palette construction
- Accessibility checks
- Code-mode recipe
- Verification

## Theme shape and invariants

The active customization contains:

```ts
type Theme = {
  dark: {
    name?: string;
    colors: Record<string, string>;
    gradients: Record<string, Gradient>;
  };
  light: {
    name?: string;
    colors: Record<string, string>;
    gradients: Record<string, Gradient>;
  };
};
```

Fetch the active theme from the live customization endpoint. Deep-clone it before editing. Keep the mode names when present. Preserve the exact key sets in both `colors` objects and preserve both `gradients` objects unchanged.

Never use a small example palette as the submitted theme. Examples are inspiration only; the live theme is the schema and completeness source.

## Guided choices

### Brand color

Accept ordinary descriptions such as “deep red,” “Barcelona burgundy,” “electric blue,” or “soft forest green.” Suggest a hex value, but allow the user to answer with a color name, adjustment, or different hex.

When brand context is obvious, make a useful first suggestion without claiming an official color unless verified. For example:

> I suggest a deep burgundy, like `#A50044`, as the main color. Would you like that, or something brighter or darker?

### Style

- **Vibrant:** saturated brand accents, crisp separation, energetic surfaces.
- **Minimal:** restrained accents, low-chroma neutrals, quiet hierarchy.
- **Warm:** red/yellow undertones in neutrals, inviting surfaces.
- **Cool:** blue undertones, calm and professional surfaces.
- **Elegant:** deeper dark mode, refined low-chroma light mode, selective accents.
- **Playful:** brighter supporting brand shades and stronger interaction color.

### Neutral family

- **Slate:** cool blue-gray.
- **Gray:** conventional neutral gray.
- **Zinc:** subtly warm charcoal gray.
- **Neutral:** balanced gray without a visible undertone.
- **Stone:** warm beige-gray.
- **Brand-tinted:** low-saturation neutrals influenced by the brand hue.

## Token families

### Brand-derived tokens

Adjust these coherently in both modes:

- `surface_brand`
- `button_brand`
- `text_brand`
- `icon_brand`
- `context_brand_100`, `context_brand_200`, `context_brand_300`
- `overlay_brand_100`, `overlay_brand_A100`
- `chat_message_background`

Recolor the complete brand-token family for a custom theme. In particular, do not leave `button_brand`, `surface_brand`, `overlay_brand_100`, or another brand-related token on the default theme's orange; `overlay_brand_100` is the Introduction Page premium CTA background.

Use a darker brand shade for ordinary light-mode text when the main brand color does not reach 4.5:1 against its surface. Dark-mode brand accents may be slightly lighter or more saturated for visibility.

### Neutral and hierarchy tokens

Build a coherent progression for:

- `surface_primary`, `surface_secondary`, `surface_tertiary`
- `surface_header_primary`, `surface_header_secondary`
- `text_primary`, `text_secondary`, `text_tertiary`
- `icon_primary`
- `button_primary`, `button_neutral`
- `text_button_primary`, `text_button_neutral`
- `input_background`
- `border_100` through `border_500`
- `overlay_primary`, `overlay_secondary`, `overlay_tertiary`
- interaction state tokens when needed for the chosen neutral family

Dark surfaces progress from near-black to slightly lighter containers. Light surfaces progress from near-white to progressively darker containers. Do not make supporting text so subtle that it fails on surfaces where it is normally used.

### Paired tokens

Validate these pairs explicitly:

- `button_brand` with `text_button_brand`
- `button_primary` with `text_button_primary`
- `button_neutral` with `text_button_neutral`
- `button_negative` with `text_button_negative`
- `surface_primary` with `text_primary`, `text_secondary`, and `text_tertiary`
- `surface_secondary` with `text_primary` and `text_secondary`
- `surface_tertiary` with `text_primary`, `text_secondary`, and `text_tertiary`
- `surface_brand` with `text_button_brand`

### Preserve by default

Keep these unchanged unless explicitly requested:

- every gradient;
- `data_100` through `data_1250`;
- all `social_*` tokens;
- `fixtures_warning` and `fixtures_negative`;
- positive, negative, warning, info, help, and sponsored context families;
- destructive and success button colors.

## Palette construction

Start from the user's brand color and chosen style, then create related shades by adjusting lightness and saturation rather than choosing unrelated accents.

- Dark mode: very dark primary surface, two visible elevation steps, near-white primary text, muted secondary/tertiary text, and a brand accent that remains distinct on dark surfaces.
- Light mode: near-white primary surface, subtle container steps, near-black primary text, muted secondary/tertiary text, and a brand shade dark enough for text use.
- Brand-tinted neutrals: mix only a small amount of brand hue into low-saturation surfaces; they must still read as neutrals.
- Prefer one consistent CSS color format within newly changed tokens. Existing Abilitya themes accept hex and `rgba(...)`; `rgba(r, g, b, a)` is convenient for opacity tokens.

## Accessibility checks

Target WCAG AA:

- normal text: at least 4.5:1;
- large text: at least 3:1;
- meaningful non-text UI boundaries and controls: at least 3:1 where applicable.

Use these dependency-free helpers before patching:

```ts
function parseColor(value: string) {
  const hex = value.trim().match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i);
  if (hex) {
    const raw = hex[1];
    return {
      r: parseInt(raw.slice(0, 2), 16),
      g: parseInt(raw.slice(2, 4), 16),
      b: parseInt(raw.slice(4, 6), 16),
      a: hex[2] ? parseInt(hex[2], 16) / 255 : 1,
    };
  }
  const rgba = value.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (!rgba) throw new Error(`Unsupported color: ${value}`);
  return { r: +rgba[1], g: +rgba[2], b: +rgba[3], a: rgba[4] === undefined ? 1 : +rgba[4] };
}

function channel(value: number) {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(value: string) {
  const { r, g, b } = parseColor(value);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(foreground: string, background: string) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
```

The API accepts both hex and `rgba(...)` inputs and may normalize one valid format into the other when it stores or returns the theme. Treat formatting differences such as `rgba(154, 101, 0, 1)` versus `#9A6500` as equivalent. Never verify a saved color with raw string equality alone.

Use parsed channel values for saved-color comparisons:

```ts
function sameColor(a: string, b: string) {
  const left = parseColor(a);
  const right = parseColor(b);
  const close = (x: number, y: number) => Math.abs(x - y) < 0.001;
  return (
    close(left.r, right.r) &&
    close(left.g, right.g) &&
    close(left.b, right.b) &&
    close(left.a, right.a)
  );
}
```

Use opaque effective colors for contrast calculations. When a token has alpha, composite it over the actual surface before calculating or choose an opaque paired token. Do not claim a contrast ratio that was not calculated.

## Code-mode recipe

Discover first:

```ts
const searches = await Promise.all([
  tools.search({ namespace: "hashtagbe", query: "resolve network slug domain", limit: 10 }),
  tools.search({ namespace: "hashtagbe", query: "login email password network", limit: 10 }),
  tools.search({ namespace: "hashtagbe", query: "read network customization theme", limit: 10 }),
  tools.search({ namespace: "hashtagbe", query: "patch network theme customization", limit: 10 }),
]);
```

Describe the selected exact paths, then resolve, log in, and read the current theme. Generate `generatedTheme` by cloning `current.data.data.theme` and changing only the intended color values.

Before writing, validate structure:

```ts
function sameKeys(a: Record<string, unknown>, b: Record<string, unknown>) {
  return JSON.stringify(Object.keys(a).sort()) === JSON.stringify(Object.keys(b).sort());
}

if (!sameKeys(currentTheme.dark.colors, generatedTheme.dark.colors)) {
  return { ok: false, stage: "validation", reason: "dark color keys changed" };
}
if (!sameKeys(currentTheme.light.colors, generatedTheme.light.colors)) {
  return { ok: false, stage: "validation", reason: "light color keys changed" };
}
if (JSON.stringify(currentTheme.dark.gradients) !== JSON.stringify(generatedTheme.dark.gradients) ||
    JSON.stringify(currentTheme.light.gradients) !== JSON.stringify(generatedTheme.light.gradients)) {
  return { ok: false, stage: "validation", reason: "gradients changed" };
}
```

This pre-write comparison is intentionally exact because `generatedTheme` is a local clone and the API has not normalized it yet. Post-write verification must use semantic color comparison for any color-bearing values returned by the API.

Patch only the theme:

```ts
const saved = await tools[patchNetworkPath]({
  Authorization,
  body: { customization: { theme: generatedTheme } },
});
if (!saved.ok) {
  return { ok: false, stage: "theme update", error: saved.error.code };
}
```

Never return `Authorization`, login responses, credentials, or the entire theme unless the user explicitly requests the JSON.

## Verification

Re-read the public customization after the patch. Verify:

1. both `dark` and `light` exist;
2. the color key sets match the original;
3. the selected brand values are present and color-equivalent after parsing, regardless of whether the API returns hex or `rgba(...)`;
4. gradients have the same keys, directions, and color-equivalent start/middle/end values as the original, allowing harmless API color-format normalization;
5. the network id matches the resolved target.

Do not fail verification merely because the API serialized a color differently. A successful write response plus a re-read with matching parsed color channels, unchanged key sets, and unchanged gradient meaning is sufficient. Keep verification proportionate: one post-write customization read is normally enough.

Return only safe summary fields such as network name, network link, chosen brand hex, style, neutral family, and verification booleans. Do not surface the numeric network id or raw slug. Build the link from the resolved slug as `https://community-staging.hashtag.be/NETWORK_SLUG_HERE`.

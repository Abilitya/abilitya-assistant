# Introduction page contract and rendering

## API contract

`PATCH /v2/networks` partially updates and deep-merges customization. Send only the requested intro changes. The relevant fields are:

- `customization.isIntroLandingActive`
- `customization.intro.mediaIntroId`
- `customization.intro.imageCallToActionId`
- `customization.intro.imageBackgroundId`
- `customization.intro.landingSettings`

The live schema may expose `landingSettings` as an open object. Use these client-defined keys: `callToActionTitle`, `callToActionSubtitle`, `callToActionDescription`, `buttonTitle`, `buttonSubtitle`, `featuresTitle`, `featuresList`, and `regulation`.

## Manager requirements

With the intro switch active, the manager form requires primary media, CTA title/subtitle/description, button title/subtitle, features title, and regulation text. A feature list is supported. CTA description is limited to 100 characters and regulation to 10,000 characters.

- Primary media: required image or video, recommended 9:16, maximum 100 MB, rendered on desktop and mobile.
- CTA image: optional image, recommended 16:9, maximum 100 MB, desktop only.
- Background image: optional image, recommended 16:9, maximum 100 MB, desktop only.

## Rendering behavior

The intro route redirects home when the switch is off or an authentication token is already present.

Above 768 px, the page uses the background image with cover sizing and renders a two-column card: primary media on the left, then CTA image, copy, premium button, benefits, and regulation on the right.

At 768 px or below, the desktop background and CTA image are hidden. Primary media becomes the full-height hero, CTA content overlays its lower gradient, and “Discover more” leads to benefits and regulation below.

Video normally autoplays muted, supports tap-to-unmute, and uses HLS when the large rendition ends in `.m3u8`.

## Access behavior

- Public: unauthenticated visitors enter through `/intro` until login.
- Private: intro precedes the invitation-based private authentication flow.
- Purchasable: intro is required; access also depends on one-time payment.
- Subscribable: intro supports the commercial entry flow; access also depends on an active subscription.

## Visual audit

Verify the deployed route while unauthenticated. Check logo/name, primary media crop, desktop-only images, CTA color, copy wrapping, button, all features, regulation control, mobile scrollability, and horizontal overflow. Backend and ISR caches can lag for several minutes; reload without repeating the PATCH.

# Paywall contract and rendering

## Settings and API contract

The manager's Purchasable form collects the access type, currency, and one-time price. Minimum age is optional and is a general access setting rather than part of the paywall object.

`PATCH /v2/networks` is a partial update. The relevant business shape is:

```ts
{
  customization: {
    accessType: "purchasable",
    currency: "eur" | "usd",
    paywall: { type: "network", price: 999 }
  }
}
```

`paywall.price` is an integer in minor units because Stripe operates in minor units. Do not submit a formatted currency string or multiply a value that is already in cents. `type: "network"` is mandatory for whole-network one-time purchases.

The manager form requires both currency and price. It converts the displayed major-unit value to cents and accepts it only when the result is strictly greater than `paywallMinValue`. A minimum of 500 means 5.00 fails and 5.01 passes.

The backend rebuilds and validates the effective customization. A successful Purchasable update normally produces mutually exclusive flags: `purchasable: true`, with `public`, `private`, and `subscribable` false. Trust the returned effective state rather than submitted compatibility fields.

Purchasable and Subscribable access require an active Introduction Page. The manager UI blocks conversion to paid access when `isIntroLandingActive` is false. Authentication must remain enabled; `auth.authType: "disabled"` is valid only for Public access.

## Route and presentation

Both device route files render the shared `PaywallPage` only when `accessType === "purchasable"`; otherwise they redirect home.

The presentation reuses `intro.mediaIntro`, `intro.imageCallToAction`, `intro.imageBackground`, and `intro.landingSettings`. `customization.paywall.price` and `customization.currency` add the formatted one-time price to the premium button.

On desktop, the page renders the shared locked header and a two-column presentation over the intro background. On mobile, it uses the portrait media hero, an overlaid premium section, a “Discover more” affordance, and benefits/regulation below. The breakpoint is 768 px.

## Access and payment lifecycle

Unauthenticated visitors to protected routes are redirected client-side to `/paywall?return=...`, preserving remaining query parameters. This keeps ISR pages cacheable without reading cookies or headers during SSR.

Authentication identifies the member but does not authorize Purchasable access. `membership.isAccessAuthorized` is decisive. An unauthorized authenticated member proceeds from presentation to payment; an authorized member visiting `/paywall` is returned to the safe `return` path or home.

Starting the CTA creates a purchase and obtains a Stripe client secret, then Stripe Elements renders the payment form. A successful payment updates membership authorization, shows the success summary, and unlocks protected queries and backend content. The UI and query layer reduce unauthorized requests, but the backend remains final enforcement.

Never test visual setup by completing a purchase. Presentation-page verification is sufficient unless the user explicitly authorizes a dedicated transaction and payment method.

## Cache and QA behavior

Public network/customization reads and ISR routes can lag after a settings write. The access route, price payload, and client-rendered customization can become fresh at different moments. Preserve the successful PATCH result, use bounded reloads, and report a still-missing price as a cache/rendering defect instead of repeating the mutation.

Verify while unauthorized that `/paywall` remains on the paywall route; logo, login affordance, media, CTA, formatted price, benefits, and regulation render; the CTA uses the client brand; video starts muted; desktop-only media respect the breakpoint; and mobile has no horizontal overflow.

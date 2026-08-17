# Subscription contract and lifecycle

## Network access contract

Use `customization.accessType: "subscribable"` and set `customization.currency` to a live-supported currency. The backend normally normalizes the effective flags to `subscribable: true` with `public`, `private`, and `purchasable` false. Authentication must remain enabled. An active Introduction Page is required.

The `/subscribe` routes render `SubscriptionLandingPage` only for Subscribable access; otherwise they redirect home. Unauthorized protected navigation redirects to `/subscribe?return=...`. `membership.isAccessAuthorized`, subscription state, and access-deny reason decide entry.

## Bundle contract

```ts
{
  title: string,
  price: number,
  interval: number,
  intervalType: "day" | "week" | "month" | "year",
  hasFreemium: boolean,
  freemium?: { interval: number, intervalType: "day" | "week" | "month" | "year" },
  privacy: "public" | "unlisted",
  status: "active" | "disabled" | "deprecated" | "archived" | "deleted",
  order?: number
}
```

- Title is required and capped at 40 characters in the manager UI.
- Price uses minor units; `999` renders as 9.99 in the network currency.
- Current UI validation uses a 299-minor-unit baseline and intends prices above 2.99; rely on backend validation if local validation appears inconsistent.
- Regular intervals are 1–30; year intervals are 1–3. Backend maxima are 1095 days, 156 weeks, 36 months, or 3 years.
- When `hasFreemium` is true, send a complete `freemium`. When false, omit it; an empty object is invalid.
- Public appears in normal discovery; Unlisted requires a known-id flow.
- Active is available to new subscribers. Other statuses retire offers according to manager workflow.
- Order is one-based and controls card priority.

Creation makes processor product/price state before saving locally. Diagnose `InvalidProduct` or `InvalidPrice` before retrying. PATCH currently returns HTTP 201 and changes future catalog behavior without migrating existing subscriptions. DELETE accepts a non-empty ids array, soft-deletes bundles, and asynchronously schedules active subscription cancellation at processor period end.

Public list calls must omit `manageable` and manager-only status filters. Manager reads may use them. A missing requested id returns `data: null`, not 404.

## Landing rendering

`SubscriptionLandingPage` reuses the Introduction Page background, media, CTA copy, features, and regulation, then renders discoverable plans. It supports presentation, payment, saved-card selection, success, setup-intent error, payment error, and card-fingerprint/trial error screens.

Plan cards format price and interval, add billing and cancellation copy, and calculate comparative savings. Freemium changes the CTA to a free-trial label. The selected plan uses the branded CTA; audit all brand tokens so no default orange remains.

Desktop shows intro media beside the catalog. Mobile uses portrait media and a horizontally scrollable plan carousel; card rectangles can extend beyond the viewport while the document itself must not overflow.

## Member checkout lifecycle

1. List public bundles and select one.
2. Authenticate when needed.
3. Create a setup intent and pass its client secret only to the processor SDK.
4. Confirm card collection in the processor UI, then list saved payment methods.
5. For freemium, verify eligibility with the processor payment id. A restriction blocks the trial, not paid checkout.
6. POST payment-method and bundle ids. The response is only an asynchronous request id and does not authorize access.
7. Poll exchange gently. Null means pending; do not duplicate. Active and trial unlock access; processing remains pending; past, due, suspended, and canceled do not normally authorize access.

Only one request can be in progress per member. On `SubscriptionInProgressError`, continue the known exchange poll or wait.

Other endpoints list/delete payment methods, set the default method, fetch invoices for owned succeeded purchases, cancel, and reactivate. These mutations require their own explicit user intent.

## QA and caching

Network reads, bundle discovery, and ISR can converge separately. Preserve mutation responses, use bounded reloads, and never duplicate a processor-backed create because a page is stale.

Verify unauthenticated presentation unless checkout was separately authorized: route, media, public active plans in order, currency/cycles, savings/trial labels, CTA colors, benefits/regulation, muted video, desktop layout, mobile carousel, and no document-level overflow.

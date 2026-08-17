---
name: private-access
description: Bundled Abilitya Assistant capability for configuring, converting, or auditing invite-only staging networks. Use when a user asks for a Private network, private access, membership-code or invitation-code registration, the dedicated Private authentication type, optional intro-page behavior for a private network, or verification of the fixed authentication gate.
---

# Abilitya Private Access Capability

Configure invite-only access and verify that unauthenticated visitors cannot enter without a manager-issued membership code. Keep the user-facing conversation under Abilitya Assistant.

Continue applying the parent skill's live-tool discovery, authentication, privacy, confirmation, and cached-read rules. Use the sibling [Introduction Page capability](../introduction-page/SKILL.md) only when the user wants an intro page.

## Workflow

1. Resolve the staging network, authenticate the manager, and read the current customization.
2. Discover and describe the live resolver, login, customization read, and network PATCH tools.
3. PATCH the access model to Private. The expected effective configuration is `accessType: "private"`, `public: false`, and `auth.authType: "private"`. Send only fields required by the live schema; verify the coupled access/auth result from the write response.
4. Preserve the Introduction Page state unless the user asks to change it. Private networks can use an intro, but it is optional.
5. Optionally set `invitationCodeLabel` and `invitationCodeDisclaimer` for client-specific membership-code wording.
6. Verify from the successful response that only Private access is active and authentication is Private.
7. After cache convergence, verify unauthenticated behavior. Without an intro, ordinary routes must open the fixed, non-dismissible Private authentication modal. With an intro, `/intro` remains reachable and the fixed modal applies after leaving bypass routes.
8. Verify that registration asks for email, password, and a membership/invitation code. Do not attempt sign-up without a manager-provided valid code.
9. Return the network link, intro state, authentication result, and whether membership codes still need to be created or imported.

## Behavior and boundaries

- “Private network” means the Private access type, not private Content, a private chat, or an unlisted subscription bundle.
- Private access and Private authentication are coupled. The flow uses email/password plus membership code; Private is not a general-purpose auth option.
- The global gate waits for cache restoration, then opens fixed for unauthenticated users on non-bypass routes. Bypass routes include login, registration, password recovery, legal/privacy pages, notification preferences, cookie policy, `/intro`, and account deletion.
- Managers issue and manage membership codes separately, including bulk CSV import. Changing access type does not generate codes.
- Do not create, reveal, redeem, or test membership codes unless explicitly requested.
- Do not alter intro media, commercial bundles, prices, Content, theme, or unrelated settings.
- Operate only on Abilitya staging and never expose credentials, tokens, raw ids, or raw API responses.

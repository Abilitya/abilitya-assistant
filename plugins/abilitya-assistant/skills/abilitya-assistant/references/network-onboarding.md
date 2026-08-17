# Network onboarding

Network creation is a lead-continuation flow, not an existing-network login flow.

## Contents

1. Discover tools through Executor
2. Collect identity and network details
3. Preserve private continuation across the email-code turn
4. Confirm the email
5. Retrieve and apply pre-accepted current contracts
6. Resolve Football Club teams
7. Convert and verify the network
8. Recover from genuine continuation loss

## Executor discovery before every phase

Use Executor's live catalog rather than memorizing tool paths:

```ts
const { items } = await tools.search({
  namespace: "hashtagbe",
  query: "create network lead onboarding",
  limit: 12,
});

const match = items[0];
if (!match) return { ok: false, reason: "No onboarding tool was found." };

const schema = await tools.describe.tool({ path: match.path });
// Inspect schema.inputTypeScript before calling tools[match.path](input).
```

The catalog-search tool used for soccer-team discovery is Executor's `tools.search`. Search it with `namespace: "hashtagbe"` and queries such as `search soccer teams`, `football teams`, `team lookup`, `football provider`, and the required schema field `teamId`. If one query is weak, try singular/plural and provider-oriented variants, paginate while `hasMore` is true, deduplicate paths, and inspect candidate names and descriptions with `tools.describe.tool`. Do not declare the lookup missing after only the first query.

Before giving up on any onboarding capability, exhaust this search ladder:

1. Search the exact business operation and nouns.
2. Search shorter synonyms, singular/plural forms, provider terminology, and relevant request-field names.
3. Search broader verbs such as `get`, `list`, `search`, and `lookup`, paginate all promising result sets, and filter the combined results by path, name, and description.
4. Describe every plausible candidate before rejecting it.
5. If an authoritative candidate value is available and the final endpoint validates it safely without consuming the lead on failure, make one bounded validation attempt and handle the error explicitly.

Only after all five steps fail may the assistant report a live-catalog mismatch.

Search again for each distinct capability—lead creation, lead update, email confirmation, contracts, soccer-team lookup, and final network creation. Use the exact returned path. If a capability is absent, report the live-catalog mismatch; do not guess a path or inspect a local OpenAPI file.

## App type labels

Use these labels with people. Translate to the API value only inside code:

| User-facing label | API value |
| --- | --- |
| Community | `community` |
| Video Wall | `stories_wall` |
| Video Mix | `video_mix` |
| Football Club | `football_club` |
| CoHR | `cohr` |
| Clock Story | `clock_story` |
| Clock Promo | `clock_promo` |
| Clock Single | `clock_single` |
| Geo Shorts | `geo_shorts` |
| Education | `education` |

Never ask a non-technical user to choose an enum such as `football_club`. Ask, for example, “Should this be a Community, Video Wall, Video Mix, or Football Club experience?”

## 1. Collect the lead identity

Required by `POST /leads/networks`:

- first name;
- last name;
- email;
- password for the future owner account.

Optional fields include locale, latitude, longitude, and mobile phone. Infer names only from reliable current profile data and allow correction. Reuse an authorized staging email and password when available; ask only for missing values.

Call `POST /leads/networks`. It sends a six-digit numeric confirmation code by email and returns a lead id and continuation token. These values are not member credentials. They must remain available in the current Codex task's private tool/conversation context so the flow can resume after the user returns with the email code.

"Private" does not mean "forget these values" and does not require a still-running Executor execution. It means:

- allow the assistant to receive the values in the Executor tool result;
- retain them in the same active Codex task across the user's email-code reply;
- never copy them into commentary, a final response, `emit(...)`, a file, an artifact, a log, a memory store, or another task; and
- discard them only at the lifecycle boundaries listed below.

Do not end the phase with only a safe status and thereby lose the continuation. An Executor execution normally completes before the user returns with the code. Return a private continuation envelope to the assistant tool context, then give the user only the safe status in the assistant response.

When identity and network details are already available, create and update the lead in one execution. Return the minimum private continuation envelope needed by the next turn:

```ts
const created = await tools[createLeadPath]({
  body: { firstName, lastName, email, password, locale },
});
if (!created.ok) return safeError("lead creation", created.error);

const lead = created.data.data;
const updated = await tools[updateLeadPath]({
  id: lead.id,
  body: {
    communityName,
    accessType,
    numberOfMembers,
    description,
    token: lead.token,
  },
});
if (!updated.ok) {
  // Preserve continuation so this lead can be retried instead of duplicated.
  return {
    ok: false,
    stage: "network_details",
    error: safeError("network details", updated.error),
    _continuation: { leadId: lead.id, leadToken: lead.token },
  };
}

return {
  ok: true,
  status: "awaiting_email_confirmation",
  email,
  _continuation: { leadId: lead.id, leadToken: lead.token },
};
```

`_continuation` is for the assistant's private task state. Do not emit it or quote it to the user. In the user-facing response, say only that the lead was prepared and ask for the six-digit code.

## 2. Collect the network details

For `PATCH /leads/networks/{id}`, collect missing business details together:

- community/network name;
- access type: `public` or `private`;
- expected number of members;
- description;
- an optional image for the network logo;
- optional mobile phone;
- optional logo upload id, only when a usable upload already exists.

Tell the user that the logo image is optional and does not need to delay network creation. When they provide one and a usable upload id can be prepared during onboarding, include it in the lead update. Otherwise, retain the attached image only in the active task and, after conversion, authenticate to the new network, upload it, and set it as the network logo. Do not ask the user to attach the same image again when it remains available in the active task.

Send the lead token with the update. The community name becomes the basis for the final name and slug.

## 3. Confirm the email

Ask for the six-digit code delivered to the lead email, then call `POST /leads/network/confirm/email` with the lead id and code. If the code is missing or expired, offer `POST /leads/network/confirm/email/resend` using the lead id and lead token. Do not create a duplicate lead merely because confirmation failed.

Continue the same onboarding session after the user supplies the code. If an Executor execution is genuinely paused, resume it. Otherwise, start a new Executor execution and inject `leadId` from the active task's private continuation:

```ts
const confirmed = await tools[confirmEmailPath]({
  body: { code, leadId },
});
if (!confirmed.ok) return safeError("email confirmation", confirmed.error);
return {
  ok: true,
  status: "email_confirmed",
  _continuation: { leadId, leadToken },
};
```

Keep `leadToken` even though email confirmation itself does not use it; final conversion does. Do not discard either value after successful email confirmation.

## 4. Retrieve contract ids and initial configuration

`POST /networks` requires:

- lead id;
- lead token;
- at least one accepted contract id;
- an initial interests array.

It can also accept the internal app-type value, `interestCreatingMobileApp`, and, only for a Football Club, a provider `teamId`.

Users operating this AI agent have already accepted the current onboarding contracts. Use the current Contracts tools to retrieve the applicable latest contract ids and submit them during network conversion. Never hardcode contract ids. Do not ask the user to accept, do not display contract names or versions, and do not mention this contract step in conversation. Ask only for initial interests and the user-facing app type when they cannot be inferred. For a Football Club, resolve a valid provider team id; reject a team id for every other app type.

### Retrieve contracts before the new network exists

The Contracts read requires an existing network as resolution context even though the network being onboarded does not exist yet. Use this deterministic staging bootstrap:

1. Discover the public network resolver and resolve the known public staging network `super-app`.
2. Use the returned numeric network id only as context for reading the current default contracts. This does not attach the lead to `super-app` and does not change the target network.
3. Discover and inspect the Contracts read tool.
4. Request each required English contract separately, passing both `networkId` and `type`. Do not omit `type`, use `0`, invent a future network id, or call member login.
5. Retrieve the current versions of:
   - Community Terms of Use (`beCommunityTermsOfUse`)
   - #be Privacy Policy (`bePrivacyPolicy`)
   - #be Code of Conduct (`beCodeOfConduct`)
   - default Community Privacy Policy (`communityPrivacyPolicy`)
   - default Community Code of Conduct (`communityCodeOfConduct`)
   - Data Processor terms (`beDataProcessor`)
6. Keep only each returned id, type, version, and language. Never return the contract HTML unless the user asks to read it.
7. Keep the contract lookup internal and pass the latest required ids to final creation without mentioning them to the user.

```ts
const contractTypes = [
  "beCommunityTermsOfUse",
  "bePrivacyPolicy",
  "beCodeOfConduct",
  "communityPrivacyPolicy",
  "communityCodeOfConduct",
  "beDataProcessor",
];

const contracts = [];
for (const type of contractTypes) {
  const result = await tools[contractsPath]({
    networkId: bootstrapNetworkId,
    locale: "en",
    type,
  });
  if (!result.ok) return safeError(`contract ${type}`, result.error);

  const rows = Array.isArray(result.data.data)
    ? result.data.data
    : [result.data.data];
  contracts.push(
    ...rows.map(({ id, type, version, language }) => ({
      id,
      type,
      version,
      language,
    })),
  );
}

return {
  ok: true,
  contracts,
  _continuation: { leadId, leadToken },
};
```

An HTTP 401 or `connection_rejected` from a Contracts read does not automatically mean the Executor integration needs reauthentication. Before asking the user to reconnect anything, verify that:

- a real existing public staging network id was supplied;
- `type` was supplied explicitly;
- no stale `Authorization` value was supplied; and
- the static Executor connection is otherwise working.

Retry the corrected Contracts request. Ask for connection repair only when a correctly shaped read still fails and an unrelated public Abilitya read also proves the connection itself is broken.

### Football Club: resolve the team id

Do not ask the user for a provider id when the club name is enough. Search Executor for the live soccer/football team lookup, inspect its schema, then search the provider by club name:

```ts
const searchResult = await tools.search({
  namespace: "hashtagbe",
  query: "search soccer teams",
  limit: 20,
});

const teamTool = searchResult.items.find((item) =>
  /soccer|football/i.test(`${item.name} ${item.description ?? ""}`),
);
if (!teamTool) {
  return { ok: false, reason: "Soccer-team lookup is missing from Executor's live catalog." };
}

const teamSchema = await tools.describe.tool({ path: teamTool.path });
// Read teamSchema.inputTypeScript; commonly the lookup accepts { search: clubName }.
const teams = await tools[teamTool.path]({ search: clubName });
if (!teams.ok) return safeError("team lookup", teams.error);
```

Choose the senior men's team whose returned name matches the requested club. If several plausible teams remain, show their plain names and ask the user to choose. Never infer a women's, academy, or youth team from the club name alone. Carry the returned numeric id into final creation. The verified Juventus FC staging creation accepted men's team id `496`; treat that as an example, not a universal hardcoded value.

## 5. Convert the lead

Call `POST /networks` only after lead details, email confirmation, current contract-id retrieval, and initial configuration are complete. On success, the API creates the network and owner-membership process, derives a unique slug, and consumes/deletes the temporary lead.

Discover and inspect the final creation tool, then compose the request from the confirmed session:

```ts
const body = {
  leadId,
  token: leadToken,
  acceptedTerms: acceptedContractIds,
  interests,
  appType: appTypeValue,
  interestCreatingMobileApp,
  ...(appTypeValue === "football_club" ? { teamId } : {}),
};

const created = await tools[createNetworkPath]({ body });
if (!created.ok) return safeError("network creation", created.error);

const network = created.data.data;
return {
  ok: true,
  network: {
    name: network.name,
    link: `https://community-staging.hashtag.be/${network.slug}`,
    access: network.customization.accessType,
    appType: userFacingAppType(network.customization.appType),
  },
};
```

The internal conditional is important: include `teamId` for Football Club and omit it for all other app types. Verify the response contains the requested app type and, when exposed, the men's soccer-team id.

Report the new network name and its clickable staging link. Do not surface the numeric network id or raw slug. Always build the user-facing link from the returned slug in this exact form: `https://community-staging.hashtag.be/NETWORK_SLUG_HERE`. Then proactively offer the three most useful next steps in plain language: add a network logo when one is not already set, create the network's first content, or generate a custom light-and-dark theme. Do not begin any follow-up until the user chooses it. If the user already supplied a logo image during onboarding and asked for it to be used, complete that authorized logo setup after conversion instead of merely suggesting it again. Immediately discard the lead id, lead token, and confirmation code. Keep using the authorized staging owner credentials for later staging operations until the user changes or revokes them, authentication rejects them, or the active product no longer has them available.

## Resuming across turns

Network onboarding may resume across turns in the same Codex task. The lead id and lead token may bridge those turns only while all of the following remain true:

- the user is continuing the same network-onboarding request;
- the lead has not expired, been converted, or been cancelled;
- the values remain inside the same task's private tool/conversation context and are not shown in assistant messages or emitted with `emit(...)`;
- neither value is written to a file, memory, artifact, log, or another task.

The normal end of an Executor execution is not continuation loss. The normal arrival of the user's email-code reply in the same task is not continuation loss. In both cases, use the values retained in the active task and continue.

When the user supplies the six-digit email code, use it only for the immediate confirmation call and do not retain it afterward. If confirmation fails because the code expired or was mistyped, keep the same lead continuation and offer the resend endpoint; do not create a duplicate lead.

Discard the lead id and lead token immediately after successful conversion, cancellation, API-confirmed expiration, an intentional restart, or a request that switches to a different onboarding target. Claim that continuation was lost only when the active task truly no longer contains the values—for example after an unrecoverable context boundary or because work moved to another task. Do not infer loss merely because the earlier Executor call completed.

If continuation is genuinely unavailable, explain the exact boundary that removed it and ask before creating a replacement lead. Do not use this recovery rule preemptively to avoid beginning an onboarding flow that can be completed normally in one task.

If a post-creation step requires member login, such as uploading and attaching a logo after conversion, reuse the authorized staging owner credentials automatically. Ask again only when they are unavailable, rejected, changed, or revoked. Never place lead continuation secrets or credentials in ordinary files, artifacts, logs, or user-visible output.

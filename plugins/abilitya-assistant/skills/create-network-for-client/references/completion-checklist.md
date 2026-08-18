# Completion checklist

Audit the showcase before claiming it is ready.

## Network

- The target is the intended Abilitya staging network.
- New football clients use the Football Club experience and the verified senior-team provider id.
- The network has a realistic name, description, access model, and interests.
- The requested logo is attached. A fallback logo is official, opaque, `1:1`, and recognizable in its circular `48×48` render.
- All supported Content flags are enabled.
- Relevant official shop, booking, and ticket links are saved; irrelevant fields remain untouched.

## Theme

- Both light and dark modes exist.
- Client colors are recognizable and accessible across structural surfaces, not only small accents and buttons.
- The primary, supporting, and brand-informed neutral directions from the research brief are visibly represented.
- Neither mode reads as a generic white/gray or black/gray shell unless that restraint is demonstrably part of the client's identity.
- Header, navigation/elevation, contextual ramps, borders, and overlays form a coherent branded hierarchy without saturating every surface.
- Both modes feel presentation-ready and intentionally related; neither is a neutral fallback.
- Color-key sets match the prior complete theme.
- Gradients and protected semantic color families remain semantically unchanged.
- The theme write response or a non-stale verification confirms the intended brand tokens.
- A desktop visual inspection of the rendered network passes after the write; revise once when the result lacks an immediate brand-specific “wow moment.”

## Content

- Created counts meet each baseline or explicit override.
- Every returned Content item has the intended type and successful status.
- Stories reference uploaded video media.
- Posts have covers and at least two related links each.
- The Announcement's stored originals are verified at no less than 1558×250 desktop and 512×250 mobile; both are sharp, border-free, correctly cropped, and attached with the intended CTA.
- The Announcement launch time is exactly one hour before its creation attempt and is already in the past in the authoritative create response, making it immediately eligible for public discovery.
- Link/Web items have valid covers, titles, descriptions, and distinct external URLs.
- Events have future schedules, suitable covers, realistic audience-facing copy, and no internal workflow language or disclaimers.
- No boosts or notifications were sent.

## Repair policy

Repair safe deficiencies automatically: retry processing, attach a completed upload, replace a broken source, add a missing cover, or create a missing quantity. Do not duplicate already successful items. Stop for user input only when the remaining repair requires new authority or user-only information.

## Final response

Return:

- the client and network affected;
- a clickable `https://community-staging.hashtag.be/SLUG` link;
- configuration summary: app type, logo, theme direction, and saved commercial links;
- Content inventory by format and status;
- representative source links and any platform fallback;
- explicit incomplete items that genuinely remain after the repair policy.

Never return credentials, access tokens, upload ids, network ids, raw slugs, signed URLs, or internal tool paths.

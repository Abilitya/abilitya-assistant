# Abilitya Content types

## Contents

- Shared rules
- Type guide
- CTA and scheduling rules
- Live schema checklist

## Shared rules

Content is distinct from Social Feed. The Content endpoint creates typed editorial/media entities; Social Feed tools create feed nodes. A manager request containing “content” and “post” means Content type `post` unless it explicitly says Feed or Social Feed.

This reference explains product meaning and member-facing behavior. It is not a request schema. The live Executor/OpenAPI `inputTypeScript` alone determines what can be passed, what is required, and which values are valid. When anything here differs from the live schema, follow the live schema without exception.

Frontend form requirements can still guide editorial quality—for example, a Post experience is designed around a cover—but they cannot make an API-optional field required or authorize sending a field absent from the live schema.

The network’s enabled types live in `customization.contents`. Preserve unrelated flags when enabling a type. Trust the successful PATCH response because subsequent GET responses may be cached for up to two minutes.

## Type guide

| User label | Internal type | Typical product inputs | Member experience |
| --- | --- | --- | --- |
| Short / Story | `story` | Title; uploaded 9:16 video in `medias`; exit behavior; optional custom cover, description, schedule, countdown, address, CTA | Full-screen vertical autoplay surface and homepage section |
| Video | `video` | YouTube/Vimeo URL; extract title, description, image; upload cover when required | Embedded external player on the Content detail page |
| Hosted Video | `hosted_video` | Uploaded 16:9 video in `medias`; title; cover; rich description | Platform-hosted player with editorial detail page |
| Streaming | `streaming` | Supported live URL; extracted title/description/image; broadcast `startsAt`/`endsAt`; visibility expiry | Embedded YouTube/Vimeo Live/Twitch/Kick stream and native chat |
| Post | `post` | Title; cover; rich description; optional files and multiple links | Editorial/article detail page |
| Link / Web | `web` | External URL; extract title, description, image; upload cover when required | Preview plus CTA to continue on the source website |
| Announcement | `announcement` | Title; prepared desktop and mobile covers; launch and expiry; optional description up to 145 chars and CTA | Prominent homepage banner; no standalone detail page |
| Document | `document` | Title; cover; rich description; at least one uploaded file in `medias` | Editorial wrapper with downloadable files |
| Event | `event` | Title; cover; rich description; start time; organizer; venue; optional end and purchase link | Date/venue card with RSVP and ticket/join action |
| Gallery | `gallery` | Title; cover; one or more uploaded gallery images in `medias` | Image viewer with thumbnails |
| Scratch | `scratch` | Title; 9:16 scratch media; description; destination link; expiry | Interactive claim/reveal experience |

For Shorts and Hosted Videos, use Upload V2 when the live tools and request schema call for uploaded media. A Short/Story must use portrait video with height greater than width; prioritize exact or near-9:16 media. Inspect actual pixel dimensions before upload and confirm processed dimensions afterward. Reject landscape and square sources because the vertical client crops them severely. Do not treat a platform's “Short,” “Reel,” or similar label as proof of portrait orientation. Do not crop, stretch, rotate, or pad horizontal media into portrait unless the user explicitly requests the transformation and the output is visually reviewed. If the live schema requires a video and no suitable vertical source is available, ask the user for a video or a specific source to scan. Finding a relevant cover image online is an acceptable editorial fallback only when the live schema accepts a cover; fabricating or substituting a video is not.

For Announcement sourcing, preparation, Upload V2, and stored-dimension verification, follow the parent skill's **Announcement assets** workflow.

## CTA and scheduling behavior

Product clients can render CTA and scheduling behaviors described below. Send their fields only when accepted by the live schema.

Shorts and Announcements may support `none`, `web_page`, `promotion`, `survey`, `digital_raffle`, `email`, `whatsapp`, `buy_page`, and `order_page`; the live schema determines the currently accepted values.

- A Promotion requires a Partner in the same network before the Promotion can be created.
- A Survey or Promotion CTA requires its object id, not merely a URL.
- Announcements require both launch and expiry times.
- Streaming requires broadcast start/end and a visibility expiry.
- Scratch requires expiry; launch is optional.
- Other types can optionally use launch/expiry scheduling.

## Live schema checklist

Before each operation, discover and describe the exact live tools for:

- resolving the network;
- logging in;
- reading and updating customizations;
- extracting URL metadata when applicable;
- reading network interests;
- initializing/completing uploads when applicable;
- creating Content;
- creating or resolving Partner, Promotion, Survey, or Digital Raffle dependencies.

The create schema may expose fields such as `type`, `title`, `description`, `publishedBy`, `cover`, `mobileCover`, `medias`, `link`, `links`, `interests`, schedule dates, `privacy`, CTA fields, and type-specific fields. This list is illustrative only. Never copy it into a request without checking the current live `inputTypeScript`.

# Convert source material into Education

Use this workflow for notes, PDFs, documents, lecture recordings, supplied video links, and mixed source packages.

## Contents

- [Interpret the request](#interpret-the-request)
- [Preserve source fidelity](#preserve-source-fidelity)
- [Design the learning sequence](#design-the-learning-sequence)
- [Handle media](#handle-media)
- [Quality check](#quality-check)

## Interpret the request

Read or inspect every supplied artifact needed for the conversion. Identify the source language, audience, assumed knowledge, major topics, exercises, citations, images, videos, tables, quotations, and code examples.

Read [source-coverage.md](source-coverage.md) before designing the module. Its comprehensive-coverage standard applies unless the user explicitly asks for a summary, overview, highlights, or another shortened treatment.

Determine whether the user wants one multi-topic module with folders or multiple topic-focused modules. If unclear, ask before creation and illustrate the choice with their actual topics.

For a supplied video or video URL, read [long-form-video.md](long-form-video.md), install and use `summarize` when needed, and base the module on its verified transcript. Do not interpret a supplied YouTube link as permission to add that video to several lessons. One supplied lecture may be placed in one lesson only; other lessons can contain derived text grounded in the verified transcript.

## Preserve source fidelity

- Treat the source as the curriculum, not merely as inspiration for a brief summary. Preserve its depth, progression, examples, evidence, and qualifications in a teachable structure.
- Preserve the source's meaning, factual qualifications, terminology, citations, and attribution.
- Restructure for learning rather than copying page breaks or note-file boundaries mechanically.
- Distinguish source facts from brief connective explanation. Do not invent quotations, examples attributed to the source, credentials, statistics, or conclusions.
- Keep useful code, tables, lists, quotations, and diagrams in their supported semantic forms.
- Preserve original outbound references. Choose raw, inline-card, or card presentation based on teaching value and validate rich variants through URL extraction.
- State any inaccessible, illegible, unsupported, or omitted source material before claiming completion.

## Design the learning sequence

Create lessons with one clear purpose. Prefer a progression such as context, concepts, worked examples, practice, and recap when the material supports it; do not force this template onto every subject.

Do not use a small number of broad thematic lessons as a substitute for source coverage. Split dense material into as many lessons or folders as needed to represent it faithfully and readably.

Use folders as sections, not as empty decoration. Avoid folders containing only one lesson unless the grouping is meaningful or the user requested it. Keep lesson titles concrete and module titles within the API limit.

Within a lesson:

1. Put the single supplied video near the top when it is the primary teaching asset.
2. Introduce the lesson's goal or context.
3. Present the source material with headings, paragraphs, lists, tables, blockquotes, code blocks, images, and links as appropriate.
4. Add a concise recap or next step when supported by the material.

Do not create assessments, exercises, learning objectives, or conclusions that materially extend the source unless the user asks for instructional enhancement. Light organizational headings and transitions are allowed.

## Handle media

### Module covers

Every module requires a cover. Use a specifically supplied cover first. Otherwise search for a relevant, attributable image, preferring the subject's official site, rights holder, organization, or another authoritative source. Avoid generic placeholders, watermarked stock previews, unrelated decoration, low-resolution assets, and imagery whose reuse is clearly restricted. Upload the chosen image and use its numeric upload id for the module cover.

### Source images

Carry relevant images from the supplied material into the lesson where they support understanding. Extract or download the actual image, upload it, and use the final returned URL in `<img>`. Preserve captions or attribution in nearby paragraphs when present. Provide accurate alt text.

If the supplied material has no images, do not search for, generate, or add lesson images unless the user explicitly requests that enrichment. The independently required module-cover lookup is still allowed.

### Video

Use a video only when the user supplies it or explicitly requests a search. Never manufacture or search for one by default. Limit each lesson to one total video regardless of provider. A one-hour lecture can remain one primary video lesson while its textual material is divided into supporting lessons, but the same video should not be duplicated across lessons unless the user explicitly asks.

Upload local videos through the upload workflow and wait for a usable final URL. Use a supplied supported YouTube, Vimeo, or Twitch URL with the custom video HTML recipe. The independently required analysis/transcription route is defined in [long-form-video.md](long-form-video.md).

## Quality check

Before creating:

- Confirm the chosen one-module or multiple-module structure.
- Confirm every module has a planned cover.
- Confirm lesson imagery follows the source-only rule unless enrichment was requested.
- Confirm every lesson contains no more than one video and no unsolicited video.
- Confirm titles fit API limits.
- Confirm all content is planned as draft unless publication was explicit.

After creating:

- Verify the returned module and item hierarchy.
- Verify every expected lesson and source asset appears once in the intended place.
- Verify returned sanitized HTML retains semantic blocks and custom rich-media markers.
- Verify all modules and items remain drafts unless explicitly published.

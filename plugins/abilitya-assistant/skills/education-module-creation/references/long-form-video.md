# Long-form video source material

Use this reference whenever the user supplies a local video/audio file, YouTube link, or other supported video URL as source material for an Education module. The goal is to obtain a verified transcript, understand the lecture, and turn that understanding into accurate lessons.

## Set up Summarize automatically

`summarize` is the canonical extraction interface. Its setup is an expected part of this internal Education workflow: do not ask for permission to install it or its required runtime.

1. Check `summarize --version` and `summarize --help`.
2. If unavailable, ensure Node.js 24 or newer is available on the host, then install `@steipete/summarize` with npm or run it through `npx`. Use the platform's normal package/runtime installation path. Do not modify unrelated system configuration.
3. Run `summarize status --json` and, when needed, `summarize status --probe` to discover usable models, local transcription, browser capabilities, and configured CLI providers without printing secrets.
4. Install a media dependency only after the command reports it is missing. Re-run the exact failed command after changing the environment.

Never print, request, or write API keys. Treat model/provider configuration as private runtime state.

The upstream agent workflow is the source of truth for command behavior: <https://github.com/steipete/summarize/blob/c78ac23b2fc8bf73fc98ea8acdfcba25337b7e22/.agents/skills/summarize/SKILL.md>. Consult the installed CLI help before guessing flags.

## Extract the lecture before writing lessons

Prefer transcript extraction over a prose summary. Preserve timestamps so lesson boundaries and source checks remain traceable.

```sh
summarize "VIDEO_OR_FILE" --extract --format md --timestamps --timeout 2m
```

For automation, request JSON and parse only stdout; diagnostics are on stderr:

```sh
summarize "VIDEO_OR_FILE" --extract --json --timestamps --metrics off --timeout 2m
```

Require exit status `0` and non-empty extracted content. Inspect the result and diagnostics to establish whether it used captions, local transcription, or a provider. Do not claim to have watched, transcribed, or understood a lecture when this verification fails.

For YouTube, leave transcript selection on its default `auto` path unless diagnosing a failure. It prefers published captions/transcripts. Use `--youtube web` only to require web captions, or `--youtube yt-dlp` only to require download/transcription.

## Resolve transcription intelligently

Use the best available route without interrupting the user. Start with published captions/transcripts. If transcription is needed, use `--transcriber auto` and let `summarize` select available local or configured providers.

When the automatic path cannot produce usable content, try routes in this order:

1. A configured free model/provider.
2. An available local transcription path, including installed local speech models or browser/Chrome local capabilities.
3. The authenticated Codex CLI, using `--cli codex`, when its subscription/session is available.

Use a paid cloud provider only when already configured and available. Do not stop to collect credentials or ask the user to configure a model: the plugin is expected to make the available route work. If all routes fail, report the concrete capability that is missing and continue with any supplied notes, captions, or documents; do not fabricate lecture-derived material.

Use `--diarize` only when speaker separation materially affects the learning material. Never infer speaker identities.

## Convert the transcript into learning material

Process a long transcript chronologically in bounded sections, retaining timestamps and enough overlap to preserve topic transitions. Build a lecture map with:

- Major topics and their timestamp ranges
- Definitions, examples, demonstrations, and key claims
- Code, tables, quotations, and linked resources
- Topic changes suitable for lesson boundaries
- Low-confidence or incomplete passages to exclude or flag

Reconcile the section maps into one coherent outline before creating modules. Do not turn every time chunk into a lesson mechanically. Create lessons around meaningful concepts and ground all lecture-derived claims in the transcript.

When visual slides materially contribute to the lesson, run `summarize "VIDEO_OR_FILE" --slides --extract` and use only relevant extracted frames or text. Slide extraction can require `yt-dlp`; OCR can require `tesseract`. Install those only when the command reports them missing and the visual content is necessary.

## Keep the video placement intentional

Embed a supplied video in at most one lesson, normally the opening/full-lecture lesson, and put it near the top. Create the remaining lessons from the transcript without duplicating the video. Use timestamped raw links to the supplied hosted video only when they are useful and available; do not create extra video embeds.

## Verify before creation

- Confirm transcript extraction succeeded and contains the lecture's actual content.
- Cross-check the module outline against the timestamped lecture map.
- Preserve uncertainty instead of filling gaps with invented explanations.
- Keep all created modules, folders, and lessons as drafts unless the user explicitly requests publication.

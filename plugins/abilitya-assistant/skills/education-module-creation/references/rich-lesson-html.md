# Rich lesson HTML

Compose semantic, compact HTML. Lesson bodies are sanitized by the API, so verify the returned `body.html`. Do not add unsupported scripts, inline event handlers, iframes, or invented custom attributes.

## Contents

- [Supported content](#supported-content)
- [Block recipes](#block-recipes)
- [Images](#images)
- [Videos](#videos)
- [Links](#links)
- [Validation](#validation)

## Supported content

The editor supports:

- Paragraphs: `<p>`
- Headings: `<h1>`, `<h2>`, `<h3>`
- Unordered lists: `<ul><li><p>…</p></li></ul>`
- Ordered lists: `<ol><li><p>…</p></li></ol>`
- Images: `<img>`
- One custom video block per lesson
- Tables: `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, and `<td>`
- Blockquotes: `<blockquote>` containing paragraph children
- Code blocks: `<pre><code>` with an optional `language-*` class
- Horizontal rules: `<hr>`
- Hard breaks: `<br>`
- Inline bold: `<strong>`
- Inline italic: `<em>`
- Inline underline: `<u>`
- Inline strike-through: `<s>`
- Inline code: `<code>`
- Raw text links and rich card/inline link nodes

Use these structures rather than visual HTML hacks. Do not use headings below H3 because the configured editor exposes H1–H3 only.

## Block recipes

### Paragraphs and headings

The lesson title is rendered separately on the lesson details page. Do not repeat it as an H1 or opening heading in the lesson body.

```html
<p>An introductory paragraph with <strong>important language</strong>.</p>
<h2>Key idea</h2>
<h3>Worked example</h3>
```

### Lists

```html
<ul>
  <li><p>First point</p></li>
  <li><p>Second point</p></li>
</ul>

<ol>
  <li><p>First step</p></li>
  <li><p>Second step</p></li>
</ol>
```

### Blockquotes

Always place one or more `<p>` elements directly inside `<blockquote>`. Never put bare text directly inside it.

```html
<blockquote>
  <p>A quotation or emphasized takeaway.</p>
</blockquote>
```

Invalid:

```html
<blockquote>Bare text is not allowed here.</blockquote>
```

### Code blocks

Escape code as HTML text. Add a supported language hint when known; omit the class when unknown.

```html
<pre><code class="language-css">.card {
  display: grid;
}</code></pre>
```

Inline code uses `<code>display: grid</code>` outside `<pre>`.

## Code block best practices

- Put only source-confirmed code, code comments, or intentionally demonstrated terminal/data syntax inside `<pre><code>`. Explanatory prose belongs in paragraphs outside the code block.
- Never classify an entire mixed plaintext section as code because nearby lines contain syntax or because a percentage of its lines look code-like. When source block boundaries are unavailable, segment the material line by line and wrap only contiguous, confidently identified code lines.
- Preserve the source order by alternating paragraphs and code blocks when an explanation introduces or follows an example. Do not merge the explanation into the example.
- When classification is uncertain, fail closed: render the text as a paragraph and use inline `<code>` for identifiers or short expressions instead of creating a code block.
- Before saving, inspect every generated code block for natural-language sentences that are not source-authored code comments. Split any mixed block rather than converting prose into comments.
- For conversions from unstructured or flattened text, compare every generated code-block boundary with the source before writing. After writing, verify the semantic separation of prose and code in returned `body.html`, not merely that `<pre>` tags survived sanitization.

### Tables

Use semantic rows and cells. Include a header row when the first row labels columns.

```html
<table>
  <thead>
    <tr><th><p>Property</p></th><th><p>Purpose</p></th></tr>
  </thead>
  <tbody>
    <tr><td><p>display</p></td><td><p>Selects the layout model</p></td></tr>
  </tbody>
</table>
```

## Images

Upload the image first and use the returned renderable media URL, not a local path, signed upload URL, storage key, or numeric upload id.

```html
<img src="https://.../image.jpg" alt="Concise description of the diagram" title="Optional title">
```

Provide meaningful alt text based on what the image contributes to the lesson. Do not persist editor-only attributes such as `data-upload-id`, `data-uploading`, or `data-upload-error`.

## Videos

Allow at most one video block in the entire lesson. Place it at or near the beginning when video is the primary material. Persist only a ready video block.

### YouTube

Use the normalized user-supplied YouTube URL as the source. Do not create an iframe.

```html
<div data-content-video="true" data-video-src="https://www.youtube.com/watch?v=VIDEO_ID" data-video-provider="youtube" data-video-title="Lecture title" data-video-mime-type="" data-video-status="ready"></div>
```

The editor also supports Vimeo and Twitch with the same structure and the matching `data-video-provider`, but never add an external video unless the user supplied it or explicitly asked for one to be found.

### Uploaded video

Complete the upload and processing flow first. Use the final media URL from the completed upload as `data-video-src`.

```html
<div data-content-video="true" data-video-src="https://.../lecture.mp4" data-video-provider="upload" data-video-title="lecture.mp4" data-video-mime-type="video/mp4" data-video-status="ready"></div>
```

Do not persist a pending block, an upload id, or a signed storage URL.

## Links

Normalize links to absolute HTTP(S) URLs.

### Raw text link

Use descriptive text when possible:

```html
<p>Read the <a href="https://example.com/guide">complete guide</a>.</p>
```

### Rich card

Validate the URL through the URL extraction endpoint first. Require a meaningful title plus useful image/description metadata appropriate to a large preview.

```html
<a href="https://example.com/guide" data-rich-link-type="card"></a>
```

### Inline rich card

Validate the URL through URL extraction first. Require a meaningful title; favicon is preferred and the extracted image can serve as fallback.

```html
<p>Continue with <a href="https://example.com/guide" data-rich-link-type="inline"></a>.</p>
```

The renderer fetches current metadata at display time. Do not embed scraped title, description, image, or favicon inside the anchor. Extraction validates that the renderer is likely to produce a useful preview; it does not endorse the destination or prove it is safe.

## Validation

Before sending lesson HTML:

- Count custom video blocks and stop if there is more than one.
- Confirm every blockquote has paragraph children and no bare text.
- Confirm every uploaded image/video uses its final media URL.
- Confirm every card/inline URL passed metadata extraction.
- Confirm raw links have safe absolute HTTP(S) hrefs and useful visible text.
- Confirm code text is escaped and tables are structurally complete.
- Confirm every code block contains code rather than adjacent explanatory prose, and that uncertain text was left as a paragraph with inline code where appropriate.

After the write, inspect returned `body.html` and ensure the API retained the intended tags, semantic prose/code boundaries, video data attributes, image sources, and rich-link attributes.

# Abilitya app types

App type defines the network's product shell: its homepage, navigation emphasis, and which Content types the experience supports. Describe app types in member-facing language. Keep internal values inside tool calls.

This reference explains product meaning and selection. It is not a request schema. The live Executor/OpenAPI `inputTypeScript` remains authoritative for request fields and accepted values.

## Choosing an app type

Select an app type without asking only when the user explicitly names one or their requested experience makes the choice unmistakable. Examples include “Video Wall,” a football experience centered on fixtures, or a named Clock experience.

Treat “network” and “community” as interchangeable generic words for an Abilitya space unless the user clearly identifies Community as the app type or describes its broad default homepage. Phrases such as “create a community about X” or “build a community for X” do not select the Community app type and still require the normal app-type clarification.

When the choice is not certain, briefly describe the plausible app types and ask the user to pick one. Show all supported choices when the request is completely open-ended. Do not show internal enum values or expect the user to understand implementation terminology.

Education intent does not establish the Education app type. A request for courses, lessons, training, an academy, or an education network requires one focused clarification unless the user explicitly asks for the Education app type or describes its Feed-first homepage:

- **Education experience:** the Social Feed is permanently the homepage, and a separate Classroom page lists education modules. Editorial Content is not highlighted on the homepage; Stories are reachable from an author's details page.
- **Another app type with Education enabled:** the chosen Community, Video Wall, Video Mix, or Football Club homepage remains primary, while the network also gets a dedicated Social Feed page and Classroom page via Network Customizations toggles.

Treat Social Feed and Content as different surfaces. An app type can support a Social Feed without making it the homepage; only the Education app type hard-locks the Feed as the homepage.

Do not offer or select CoHR or Geo Shorts. They are not supported user-facing app types.

## Experience guide

### Community

Internal value: `community`

The broad default experience for clubs, brands, member groups, and mixed communities. Its homepage can highlight Stories, news, events, videos, galleries, documents, streams, and other editorial sections. A Social Feed can be enabled as a separate destination.

Allowed Content: Event, Reward, Web, Post, Video, Hosted Video, Document, Streaming, Story, Gallery, Scratch, and Announcement.

### Football Club

Internal value: `football_club`

The default Community-style experience with a dedicated football layer. It adds fixtures, results, standings, match details, and team configuration. Choose it when football data is central to the member experience, then resolve the senior men's team unless the user specifies another supported team category.

Allowed Content: Web, Post, Video, Hosted Video, Document, Streaming, Story, Gallery, Scratch, and Announcement.

### Video Wall

Internal value: `stories_wall`

A Story-first experience whose homepage is the Story wall rather than a general content hub. Stories can appear as one continuous list or grouped by interest. It is best when short, visual updates are the main product surface.

Allowed Content: Story, Scratch, and Announcement.

### Video Mix

Internal value: `video_mix`

A media-led experience that mixes videos, Hosted Videos, streams, Stories, and article-style Content such as Posts, Web links, and Documents into one homepage list. It does not separate each Content type into the broad sections used by Community. Choose it when members should browse a continuous mixed-media stream with a strong video emphasis.

Allowed Content: Announcement, Event, Web, Post, Video, Hosted Video, Document, Streaming, and Story.

### Education

Internal value: `education`

A Feed-first learning community. Education modules are enabled by default, the Social Feed is permanently the homepage, and the Classroom page lists modules. The homepage does not highlight editorial Content; Stories are available only through an author's details page. Choose this shell only when the user wants community conversation to be the home experience alongside the Classroom.

Allowed Content: Announcement, Event, and Streaming.

### Clock Story

Internal value: `clock_story`

A focused full-screen experience without the standard navigation or content homepage. It moves through before, live, and after stages around a scheduled Story or event. Choose it for a time-bound Story experience rather than a browsable community.

Allowed Content: Streaming, Video, Story, and Scratch.

### Clock Promo

Internal value: `clock_promo`

A focused full-screen promotional experience for a time-bound campaign. It is not a general community or mixed-content homepage. Choose it when the user explicitly wants a Clock Promo or clearly describes a promotion-led countdown experience; otherwise ask before selecting it.

Allowed Content: Streaming, Video, Story, and Scratch.

### Clock Single

Internal value: `clock_single`

A focused full-screen experience that moves from a countdown to one Story and then an end state. It has no general content feed, interest selector, or standard navigation shell. Choose it for one scheduled Story experience.

Allowed Content: Streaming, Video, Story, and Scratch.

## Selection examples

- “Create a Video Wall network” is explicit: use Video Wall.
- “Build a club app with fixtures and standings” clearly indicates Football Club.
- “Create a private community for friends to plan events and post updates” normally indicates Community, but still offer the comparison table to clarify.
- “Create a network for my courses” establishes Education functionality, not the homepage shell. Explain the Education experience versus another app type with Education enabled, then ask which the user prefers.
- “Create a community for videos” is ambiguous. Briefly compare Video Mix, Video Wall, and Community, then ask the user to choose.

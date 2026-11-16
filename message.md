---
title: Message
description: Displays a message in a conversation, with optional avatar, header, footer, and alignment.
base: base
component: true
---

<ComponentPreview
  styleName="base-rhea"
  name="message-demo"
  previewClassName="h-auto theme-blue"
/>

The `Message` component lays out a single message in a conversation. It handles the avatar, alignment, header, and footer around the message surface.

For AI apps, you can render reasoning steps, tool calls and assistant messages using the `Message` component.

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add message
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="message"
  title="components/ui/message.tsx"
  styleName="base-rhea"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message"
```

```tsx showLineNumbers
<Message>
  <MessageAvatar>
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  </MessageAvatar>
  <MessageContent>
    <Bubble>
      <BubbleContent>How can I help you today?</BubbleContent>
    </Bubble>
  </MessageContent>
</Message>
```

**Note:** `Message` owns the row layout—avatar, alignment, header, and footer.
Render the visible message surface inside it with
[`Bubble`](/docs/components/bubble). For the scroll container around a
conversation, use [`MessageScroller`](/docs/components/message-scroller).

## Composition

Use the following composition to build a message:

```text
Message
├── MessageAvatar
└── MessageContent
    ├── MessageHeader
    ├── Bubble
    └── MessageFooter
```

Use `MessageGroup` to stack consecutive messages from the same sender:

```text
MessageGroup
├── Message
└── Message
```

## Features

- Start and end alignment for sender and receiver rows via the `align` prop
- Avatar slot that anchors to the bottom of the message and stays clear of the footer
- Header and footer slots for sender names, status, and message actions
- Footer follows the message side; actions stay aligned on `align="end"` rows
- Group wrapper for stacking consecutive messages from the same sender
- Customizable styling through the `className` prop on every part

## Avatar

Use `MessageAvatar` to render an avatar next to the message. Set `align="end"` on the message to align the avatar to the end of the message.

<ComponentPreview
  styleName="base-rhea"
  name="message-avatar"
  previewClassName="h-auto theme-blue"
/>

| align   | Description                                         |
| ------- | --------------------------------------------------- |
| `start` | Align the message to the start of the conversation. |
| `end`   | Align the message to the end of the conversation.   |

## Group

Use `MessageGroup` to stack consecutive messages from the same sender. Render an empty `MessageAvatar` on the earlier messages to keep them aligned with the avatar on the last one.

<ComponentPreview
  styleName="base-rhea"
  name="message-group"
  previewClassName="h-auto theme-blue"
/>

## Header and Footer

Use `MessageHeader` for a sender name and `MessageFooter` for metadata such as a delivery or read status.

<ComponentPreview
  styleName="base-rhea"
  name="message-header-footer"
  previewClassName="h-auto theme-blue"
/>

## Actions

Place message-level actions in `MessageFooter`, such as copy, retry, or feedback buttons.

<ComponentPreview
  styleName="base-rhea"
  name="message-actions"
  previewClassName="h-auto theme-blue"
/>

## Attachment

<ComponentPreview
  styleName="base-rhea"
  name="message-attachment"
  previewClassName="h-auto theme-blue"
/>

## Accessibility

`Message` is a presentational layout wrapper. Accessibility comes from the content you place inside it.

### Label icon-only actions

Action buttons in `MessageFooter` are usually icon-only, so give each one an `aria-label`.

```tsx showLineNumbers
<MessageFooter>
  <Button variant="ghost" size="icon" aria-label="Copy">
    <CopyIcon />
  </Button>
</MessageFooter>
```

### Status updates

For in-progress messages, use a [`Marker`](/docs/components/marker) with `role="status"` so assistive tech announces the update as it appears.

```tsx showLineNumbers
<Message>
  <Marker role="status">
    <MarkerIcon>
      <Spinner />
    </MarkerIcon>
    <MarkerContent>Checking the logs...</MarkerContent>
  </Marker>
</Message>
```

## API Reference

### Message

The message row wrapper.

| Prop        | Type               | Default   | Description                                       |
| ----------- | ------------------ | --------- | ------------------------------------------------- |
| `align`     | `"start" \| "end"` | `"start"` | The alignment of the message in the conversation. |
| `className` | `string`           | -         | Additional classes to apply to the row.           |

### MessageGroup

Groups consecutive messages from the same sender.

| Prop        | Type     | Default | Description                                    |
| ----------- | -------- | ------- | ---------------------------------------------- |
| `className` | `string` | -       | Additional classes to apply to the group root. |

### MessageAvatar

The avatar slot, aligned to the bottom of the message. When the message has a `MessageFooter`, the avatar shifts up to stay aligned with the message surface instead of the footer.

| Prop        | Type     | Default | Description                                     |
| ----------- | -------- | ------- | ----------------------------------------------- |
| `className` | `string` | -       | Additional classes to apply to the avatar slot. |

### MessageContent

Wraps the header, message surface, and footer.

| Prop        | Type     | Default | Description                                      |
| ----------- | -------- | ------- | ------------------------------------------------ |
| `className` | `string` | -       | Additional classes to apply to the content slot. |

### MessageHeader

Displays content above the message, such as a sender name. Stays aligned to the start regardless of `align`.

| Prop        | Type     | Default | Description                                |
| ----------- | -------- | ------- | ------------------------------------------ |
| `className` | `string` | -       | Additional classes to apply to the header. |

### MessageFooter

Displays content below the message, such as status or actions. Aligns to the message side.

| Prop        | Type     | Default | Description                                |
| ----------- | -------- | ------- | ------------------------------------------ |
| `className` | `string` | -       | Additional classes to apply to the footer. |



---
title: Message Scroller
description: A chat scroll container that anchors turns, opens saved transcripts, follows streamed responses, loads history without jumping, and jumps to any message.
base: base
component: true
---

<ComponentPreview
  styleName="base-rhea"
  name="message-scroller-demo"
  className="rounded-[34px] sm:rounded-4xl"
  previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16"
/>

## What Makes a Great Streaming Chat Experience

Building a chat interface used to be simple. You create an inverted list with
an input. Type a message, it appends at the bottom. When a reply comes in, the
list grows and scrolls. Done.

Streaming breaks that model. Messages arrive in chunks while you may still be
reading, scrolling, or looking somewhere else entirely.

Now the challenge is preserving the reader's place while the conversation keeps
changing. Get that wrong and the experience feels jumpy: people are pulled to
the bottom, lose context, and have to find their way back.

In practice, this comes down to scroll: when to follow, when to hold, and when
to let the reader decide. A great streaming chat should:

1. **Move only when the reader asked to move.** If someone is reading, don’t pull them somewhere else. Auto-scroll should never be the default.
2. **Follow only while they’re following.** If they’re at the live edge, keep the stream in view. If they scroll away, leave them there.
3. **Every interaction is a signal.** Scrolling is not the only one. Selecting text, using the keyboard, opening a link, or searching should all stop the interface from moving.
4. **Start a new turn near the top of the viewport.** This gives the new turn somewhere it can be read from the beginning.
5. **Then stream in the answer.** The answer should grow into the screen, not immediately push everything away.
6. **Keep part of the previous conversation in context.** The prompt and reply should stay visually connected, and enough of the previous turn should remain visible so the reader knows where they are.
7. **Let new content arrive offscreen.** The conversation can keep streaming without changing what the reader is looking at.
8. **Show what’s happening out of view.** Make it clear when a response is still streaming or when new messages have arrived.
9. **Make it easy to return to the latest reply.** A “Jump to latest” action should bring the reader back and resume following.
10. **Let people jump anywhere in the conversation.** Long threads need message links, search, unread markers, and direct navigation.
11. **Reopen where the reader left off.** A saved conversation should open at the last meaningful turn. Often this is the last user message. Not the absolute bottom.
12. **Keep the reader’s place when layout changes.** Images load. Markdown expands. Code blocks render. Older messages appear above. None of that should make the reader lose their place.
13. **Handle interruptions without stealing position.** Stopping, retrying, regenerating, branching, or errors should not unexpectedly move the conversation.
14. **Stay responsive in long threads.** Streaming text, markdown, code, images, and long history should still feel responsive.
15. **Be accessible without the noise.** Keep the transcript navigable, preserve keyboard focus, and announce important events at a comfortable pace.

**Never move the reader against their intent.**

## MessageScroller

MessageScroller is a chat transcript scroller built for these behaviors.
`MessageScrollerProvider` owns the scroll state and transcript-row behavior:
opening position, streamed output, new-turn anchoring, prepended history,
visibility, and scroll controls. `MessageScroller` is the styled frame that
renders inside it.

MessageScroller is scoped to the scroll viewport. It does not own messages, AI state,
transport, persistence, branching, or model state. Your product code stays
focused on composing messages, markers, tools, attachments, and prompt inputs.

It gives you the scroll behavior that chat needs, without taking over the rest
of the chat UI. And it stays fast, even in long conversations with rich
markdown.

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add message-scroller
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Install the following dependencies:</Step>

```bash
npm install @shadcn/react
```

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="message-scroller"
  title="components/ui/message-scroller.tsx"
  styleName="base-rhea"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx
import { Message } from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
```

```tsx
<MessageScrollerProvider>
  <MessageScroller>
    <MessageScrollerViewport>
      <MessageScrollerContent>
        {messages.map((message) => (
          <MessageScrollerItem
            key={message.id}
            messageId={message.id}
            scrollAnchor={message.role === "user"}
          >
            <Message />
          </MessageScrollerItem>
        ))}
      </MessageScrollerContent>
    </MessageScrollerViewport>
    <MessageScrollerButton />
  </MessageScroller>
</MessageScrollerProvider>
```

`MessageScroller` fills its parent, so place it inside a height-constrained
container.

```tsx
<div className="flex h-screen flex-col">
  <MessageScrollerProvider>
    <MessageScroller className="flex-1">{/* transcript */}</MessageScroller>
  </MessageScrollerProvider>
</div>
```

## Composition

```tsx
<MessageScrollerProvider>
  <MessageScroller>
    <MessageScrollerViewport>
      <MessageScrollerContent>
        <MessageScrollerItem>
          {/* a message, marker, or row */}
        </MessageScrollerItem>
        <MessageScrollerItem />
        <MessageScrollerItem />
      </MessageScrollerContent>
    </MessageScrollerViewport>
    <MessageScrollerButton />
  </MessageScroller>
</MessageScrollerProvider>
```

- **`MessageScrollerProvider`** — the headless root. Owns scroll state and the
  behavior props for opening position, auto-scroll, anchoring, scroll commands,
  and visibility tracking.
- **`MessageScroller`** — the styled frame. Lays out the viewport, content, and
  controls inside the provider.
- **`MessageScrollerViewport`** — the scrollable element. Receives native scroll
  events and preserves the visible row when older messages are prepended.
- **`MessageScrollerContent`** — the transcript container. Holds the rows and
  provides the live-region defaults for new messages.
- **`MessageScrollerItem`** — the transcript row boundary. Wrap every direct
  child of the content so the scroller can measure, anchor, preserve position,
  track visibility, and jump to it. An item can be a message, marker, typing
  indicator, separator, join/leave event, or "load earlier" row.
- **`MessageScrollerButton`** — the scroll control. Scrolls to the start or end of the transcript and is inert until there is content in its direction.

## Core Concepts

### Anchoring Turns

A turn is the part of the conversation that starts a new exchange. In a simple
AI chat, that is usually the user's message and the assistant reply that follows.

An anchor is the row the viewport should treat as the start of that turn. Mark
that row with `scrollAnchor`. When a new anchor is appended, the viewport moves
it near the top and keeps a peek of the previous item above it, so the new turn
does not feel detached from its context.

```tsx
// This tells the scroller to anchor the user's message for the next turn.
<MessageScrollerItem
  messageId={message.id}
  scrollAnchor={message.role === "user"}
/>
```

Scroll anchors are not tied to message role. You can turn any row into an anchor:
a user message, a system marker, a handoff event, or anything else that starts a
meaningful turn. `MessageScroller` only needs to know which row should anchor the
viewport.

In the following example, the user's message is anchored. When you send a new message, the viewport anchors it near the top and appends the assistant reply below it. Toggle the anchor to the assistant's message to see the difference.

<ComponentPreview
  styleName="base-rhea"
  name="message-scroller-anchoring"
  className="rounded-[34px] sm:rounded-4xl"
  previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16"
/>

### Group Chat

In a group chat, the turn boundary is more specific than "the user message". It is often
the message that asks the model to respond, or a marker like "Marcus joined the
chat". Typing indicators and history controls usually should not anchor.

Because anchoring is role-independent, you can anchor a marker just as easily as
a message.

```tsx
<MessageScrollerItem messageId="marcus-joined" scrollAnchor>
  <Marker variant="separator">
    <MarkerContent>Marcus joined the chat</MarkerContent>
  </Marker>
</MessageScrollerItem>
```

<ComponentPreview
  styleName="base-rhea"
  name="message-scroller-group-chat"
  className="rounded-[34px] sm:rounded-4xl"
  previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16"
/>

### Keeping Context Visible

When a new turn starts, it should still feel like part of the same continuous
thread. `scrollPreviousItemPeek` keeps a slice of the previous item visible
above the anchor, so the reader keeps their context instead of feeling like the
conversation restarted on a blank page.

```tsx
// Keep 64px of the previous turn visible above the newly anchored row.
<MessageScrollerProvider scrollPreviousItemPeek={64}>
  <MessageScroller>{/* anchored turns */}</MessageScroller>
</MessageScrollerProvider>
```

Adjust the peek amount in the example below to see how it affects the conversation.

<ComponentPreview
  styleName="base-rhea"
  name="message-scroller-previous-context"
  className="rounded-[34px] sm:rounded-4xl"
  previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16"
/>

### Following the Live Edge

When the reader is at the live edge, either because they stayed there or
returned there, `autoScroll` keeps streamed replies in view as they grow.
Scrolling away from the live edge releases the view, whether by wheel, touch,
keyboard scroll keys, or dragging the scrollbar. An explicit message jump
releases it too. New chunks can then arrive without moving the reader.

`autoScroll` composes with turn anchoring. When a new turn anchors near the
top, the view stays put while the reply streams into the room below it. Once
the reply fills the viewport, the reader is back at the live edge and
follow-output takes over from the anchor.

```tsx
<MessageScrollerProvider autoScroll>
  <MessageScroller>{/* streamed turns */}</MessageScroller>
</MessageScrollerProvider>
```

<ComponentPreview
  styleName="base-rhea"
  name="message-scroller-streaming"
  className="rounded-[34px] sm:rounded-4xl"
  previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16"
/>

Calling `scrollToEnd`, or pressing `MessageScrollerButton`, re-engages
follow-output when `autoScroll` is enabled, so a reader who scrolled away can
return to the live edge and keep following. The root and viewport expose
`data-autoscrolling` while that programmatic scroll to the latest message runs,
so you can conditionally apply styles during the transition.

### Opening Saved Threads

It can seem reasonable to reopen a saved thread at the absolute end of the
transcript, but that often drops the reader into the conversation without enough
context. A better default is `"last-anchor"`: show the last meaningful turn,
like the user's latest message, with the reply below it.

That gives the reader an immediate place in the thread. They can see what they
asked, where the answer starts, and continue from there without reconstructing
the conversation from the bottom edge.

```tsx
<MessageScrollerProvider defaultScrollPosition="last-anchor">
  <MessageScroller>{/* transcript */}</MessageScroller>
</MessageScrollerProvider>
```

<ComponentPreview
  styleName="base-rhea"
  name="message-scroller-opening-position"
  className="rounded-[34px] sm:rounded-4xl"
  previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16"
  hideCode
/>

`"last-anchor"` is keyed on `scrollAnchor`, not message role. If no anchor
exists, or the last anchored turn already fits in the viewport, it falls back to
`"end"`.

Use `"start"` when you want to resume at the beginning of a conversation, or
`"end"` when the absolute latest message is the right place to land.

### Avoiding a Flash on Reload

A scroll container always opens at the top. HTML has no way to set `scrollTop`,
so a server-rendered transcript shows the oldest messages first. After
JavaScript runs, `defaultScrollPosition` moves the view, and you see a jump.

When `defaultScrollPosition` is `"end"` or `"last-anchor"`, the viewport has
`data-pending-scroll` until that position is applied. The styled viewport stays
hidden while the attribute is present, so you see the frame instead of the jump.
`"start"` does not need this.

If you want `"end"` visible on first paint, add an inline script right after the
viewport. Give the viewport an `id`, scroll it to the bottom, and remove
`data-pending-scroll`.

```tsx
const scrollToEndScript = `(function () {
  var viewport = document.getElementById("messages")
  if (!viewport) {
    return
  }
  viewport.scrollTop = viewport.scrollHeight
  viewport.removeAttribute("data-pending-scroll")
})()`

<MessageScroller>
  <MessageScrollerViewport id="messages" suppressHydrationWarning>
    <MessageScrollerContent>{/* transcript */}</MessageScrollerContent>
  </MessageScrollerViewport>
  <script dangerouslySetInnerHTML={{ __html: scrollToEndScript }} />
  <MessageScrollerButton />
</MessageScroller>
```

Put the script in your page, not in the scroller. It only works for `"end"`, and
only when the messages are already in the HTML. Add `suppressHydrationWarning` on
the viewport. If you use a Content Security Policy, pass a `nonce`.

Do not use this script with `"last-anchor"`. Skip it when messages load on the
client.

### Loading Earlier Messages

Loading earlier messages should not move the conversation the reader is already
looking at. When older rows are prepended above the current transcript,
`MessageScrollerViewport` preserves the visible row so the reader stays in the
same place while history loads above them.

This is enabled by default through `preserveScrollOnPrepend`.

<ComponentPreview
  styleName="base-rhea"
  name="message-scroller-load-history"
  className="rounded-[34px] sm:rounded-4xl"
  previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16"
/>

Use stable `messageId` values for message rows. That gives the scroller a
specific row to preserve instead of guessing from whichever pixel happens to sit
at the viewport edge.

### Animating New Messages

`MessageScrollerItem` can be animated directly. Create a motion version of the
item, keep `messageId` and `scrollAnchor` on it, and use transform and opacity
for the entrance.

A common chat pattern is to animate the user's message when it is sent, then let
the assistant reply stream into a regular row below it. Start the user row below
its final position so it feels like it rises from the live edge of the viewport.

```tsx
const MotionMessageScrollerItem = motion.create(MessageScrollerItem)
```

<ComponentPreview
  styleName="base-rhea"
  name="message-scroller-animation"
  className="rounded-[34px] sm:rounded-4xl"
  previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16"
/>

Avoid animating height, margin, or padding for row entrances; those changes can
fight the scroller's positioning work. If the reader prefers reduced motion,
skip the entrance animation and keep the scroll behavior the same.

### Jumping to Messages

Search results, permalinks, outline items, and toolbar buttons often need to
drive the transcript from outside the message list. Use `useMessageScroller` for
those controls. Because the hooks read from `MessageScrollerProvider`, they work
in any component inside the provider, including controls rendered outside the
`MessageScroller` frame.

```tsx
import { useMessageScroller } from "@/components/ui/message-scroller"
```

```tsx
const { scrollToMessage, scrollToEnd, scrollToStart } = useMessageScroller()
```

<ComponentPreview
  styleName="base-rhea"
  name="message-scroller-commands"
  className="rounded-[34px] sm:rounded-4xl"
  previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16"
  hideCode
/>

`scrollToMessage` targets the `messageId` on `MessageScrollerItem`, so rows that
need to be addressable should have stable ids. `scrollToMessage` returns `false`
when the target is not mounted and cannot be queued.

`scrollToMessage` can queue a target before items exist, which covers
client-resolved permalinks while the transcript mounts. After rows have mounted,
a missing id returns `false` instead of starting a guessed retry loop. A `true`
result means the scroll ran or was queued, not that the row is already in view.

### Tracking the Reader's Position

Use `useMessageScrollerVisibility` to track the reader's position in the
conversation. A common example is a table-of-contents or a jump menu that
highlights the current anchored turn.

```tsx
import { useMessageScrollerVisibility } from "@/components/ui/message-scroller"
```

```tsx
const { currentAnchorId, visibleMessageIds } = useMessageScrollerVisibility()
```

<ComponentPreview
  styleName="base-rhea"
  name="message-scroller-visibility"
  className="rounded-[34px] sm:rounded-4xl"
  previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16"
  hideCode
/>

`currentAnchorId` answers "where am I" by reporting the current anchored turn,
and it stays set after that anchor scrolls above the viewport. `visibleMessageIds`
answers "what is on screen", in document order.

Visibility is pay-for-what-you-use. Tracking only runs while something
subscribes to `useMessageScrollerVisibility`, and rows need a `messageId` to
participate.

### Reading Scroll State

Use `useMessageScrollerScrollable` when you need scroll state in JavaScript, such
as a status indicator or a custom "jump to latest" control. It reports which
edges the viewport can still scroll toward; "at the start/end" is the negation
(`!start` / `!end`), and "scrollable at all" is `start || end`. For styling the
scroller itself, prefer the `data-scrollable` attribute.

```tsx
import { useMessageScrollerScrollable } from "@/components/ui/message-scroller"
```

```tsx
const { start, end } = useMessageScrollerScrollable()
```

<ComponentPreview
  styleName="base-rhea"
  name="message-scroller-scrollable"
  className="rounded-[34px] sm:rounded-4xl"
  previewClassName="h-auto theme-blue bg-surface dark:bg-background p-4 min-[480px]:p-8 min-[560px]:p-10 sm:px-10 sm:py-16"
/>

## Performance

`MessageScroller` is benchmarked against large transcripts with markdown and
composed message rows.

Our performance goal for `MessageScroller` is to keep the scroll hot path outside of React state: no React rerenders for
transcript rows, no forced layout on every scroll, and as little off-screen paint
work as the browser can avoid.

Scroll position, anchoring, and follow-output are tracked imperatively and mirrored onto the root and viewport through `data-*` attributes, so scrolling and streaming do not rerender transcript rows.

The styled `MessageScrollerItem` also ships with `content-visibility: auto` and
`contain-intrinsic-size`. Rows stay in the DOM for selection, copy,
find-in-page, SSR, and assistive tech, but the browser can skip rendering work
for rows far outside the viewport.

Visibility tracking is pay-for-what-you-use. A jump menu or active
turn indicator costs nothing until something subscribes to
`useMessageScrollerVisibility`.

This is comfortable for the expected range of a chat transcript: hundreds to low
thousands of turns, including messages with markdown and composed components.

## Virtualization

Virtualization is intentionally left outside the primitive. `MessageScroller`
renders real DOM rows and stays fast well into the thousands of turns (see
[Performance](#performance)), so most transcripts never need it.

When a transcript is large enough to need virtualization, use
`MessageScrollerViewport` as the scroll element and let the virtualizer own the
rows.

```tsx showLineNumbers
import * as React from "react"
import { useVirtualizer } from "@tanstack/react-virtual"

function VirtualizedTranscript({
  messages,
}: {
  messages: Array<{ id: string; content: React.ReactNode }>
}) {
  const viewportRef = React.useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => 86,
    getItemKey: (index) => messages[index]?.id ?? index,
    overscan: 8,
  })

  return (
    <MessageScrollerProvider>
      <MessageScroller>
        <MessageScrollerViewport ref={viewportRef}>
          <MessageScrollerContent className="block min-h-full">
            <div
              className="relative w-full"
              style={{ height: virtualizer.getTotalSize() }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const message = messages[virtualItem.index]

                if (!message) {
                  return null
                }

                return (
                  <div
                    key={virtualItem.key}
                    ref={virtualizer.measureElement}
                    data-index={virtualItem.index}
                    className="absolute start-0 top-0 w-full"
                    style={{
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <Message>{message.content}</Message>
                  </div>
                )
              })}
            </div>
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}
```

## Accessibility

`MessageScroller` keeps the scroll container keyboard reachable and the
transcript announceable without forcing a specific message UI.

`MessageScrollerViewport` is a labelled, keyboard-focusable scroll region by
default. It uses `role="region"`, `aria-label="Messages"`, and `tabIndex={0}`,
so keyboard users can focus the transcript and scroll it directly.

`MessageScrollerContent` marks the transcript as a live region with
`role="log"` and `aria-relevant="additions"`. New rows can be announced, but
streamed text mutations do not have to be announced token by token.

```tsx
<MessageScrollerContent aria-busy={status === "streaming"}>
  {/* messages */}
</MessageScrollerContent>
```

Pass `aria-busy` while a turn streams if announcements should wait for the
completed message row.

`MessageScrollerButton` renders a real button. When there is nothing to scroll
toward, it sets `inert`, uses `tabIndex={-1}`, and exposes `data-active="false"`
so inactive scroll controls do not create extra focus stops.

## Unstyled

The behavior in `MessageScroller` comes from the `@shadcn/react` package. To use
it directly with your own markup and styles, see
[Message Scroller](/docs/react/message-scroller) under @shadcn/react.

## API Reference

The props, data attributes, and hooks for every part are documented on the
[@shadcn/react Message Scroller](/docs/react/message-scroller#api-reference) page.
They are identical for the styled component and the unstyled parts.


---
title: Bubble
description: Displays conversational content in a message bubble. Supports variants, alignment, grouping, reactions, and collapsible content.
base: base
component: true
---

<ComponentPreview
  styleName="base-rhea"
  name="bubble-demo"
  previewClassName="h-auto theme-blue"
/>

The `Bubble` component displays framed conversational content. Use it for chat text, short structured output, quoted replies, suggestions, and reactions.

For full-featured chat interfaces, use the [`Message`](/docs/components/message) component. `Bubble` is intentionally scoped to the bubble surface. Place avatars, names, timestamps, metadata, and message-level actions in [`Message`](/docs/components/message).

## Installation

<CodeTabs>

<TabsList>
  <TabsTrigger value="cli">Command</TabsTrigger>
  <TabsTrigger value="manual">Manual</TabsTrigger>
</TabsList>
<TabsContent value="cli">

```bash
npx shadcn@latest add bubble
```

</TabsContent>

<TabsContent value="manual">

<Steps className="mb-0 pt-2">

<Step>Copy and paste the following code into your project.</Step>

<ComponentSource
  name="bubble"
  title="components/ui/bubble.tsx"
  styleName="base-rhea"
/>

<Step>Update the import paths to match your project setup.</Step>

</Steps>

</TabsContent>

</CodeTabs>

## Usage

```tsx showLineNumbers
import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble"
```

```tsx showLineNumbers
<Bubble>
  <BubbleContent>
    I checked the registry output and removed the stale route.
  </BubbleContent>
  <BubbleReactions>
    <span>👍</span>
  </BubbleReactions>
</Bubble>
```

## Composition

Use the following composition to build a bubble:

```text
Bubble
├── BubbleContent
└── BubbleReactions
```

Use `BubbleGroup` to group consecutive bubbles from the same sender:

```text
BubbleGroup
├── Bubble
│   └── BubbleContent
└── Bubble
    └── BubbleContent
```

## Features

- Seven visual variants, from a strong primary bubble to unframed ghost content
- Start and end alignment for sender and receiver bubbles
- Reactions that anchor to the bubble edge with configurable side and alignment
- Bubbles size to their content, up to 80% of the container width
- Polymorphic content via `render` for link and button bubbles
- Customizable styling through the `className` prop on every part

## Variants

Use `variant` to change the visual treatment of the bubble.

<ComponentPreview
  styleName="base-rhea"
  name="bubble-variants"
  previewClassName="h-auto theme-blue"
/>

| Variant       | Description                                            |
| ------------- | ------------------------------------------------------ |
| `default`     | A strong primary bubble, usually for the current user. |
| `secondary`   | The standard neutral bubble for conversation content.  |
| `muted`       | A lower-emphasis bubble for quiet supporting content.  |
| `tinted`      | A subtle primary-tinted bubble.                        |
| `outline`     | A bordered bubble for secondary or rich content.       |
| `ghost`       | Unframed content for assistant text or rich content.   |
| `destructive` | A destructive bubble for error or failed actions.      |

A bubble sizes to its content, up to 80% of the container width. The `ghost` variant removes the max-width so assistant text and rich content can span the full row.

## Alignment

Use `align` on `Bubble` to align the bubble to the start or end of the conversation.

<ComponentPreview
  styleName="base-rhea"
  name="bubble-alignment"
  previewClassName="h-auto theme-blue"
/>

| align   | Description                                        |
| ------- | -------------------------------------------------- |
| `start` | Align the bubble to the start of the conversation. |
| `end`   | Align the bubble to the end of the conversation.   |

**Note:** When building chat interfaces, you probably want to use alignment on the `Message` component itself, not the `Bubble` component. You can use the `role` prop on the `Message` component to automatically align the bubble to the start or end of the conversation.

## Bubble Group

Use `BubbleGroup` to group consecutive bubbles from the same sender. Note the `align` prop should be set on the `Bubble` component itself, not the `BubbleGroup` component.

```text
BubbleGroup
├── Bubble
│   └── BubbleContent
└── Bubble
    └── BubbleContent
```

<ComponentPreview
  styleName="base-rhea"
  name="bubble-group-demo"
  previewClassName="h-auto theme-blue"
/>

## Links and Buttons

You can turn a bubble into a link or button by using the `render` prop on `BubbleContent`.

<ComponentPreview
  styleName="base-rhea"
  name="bubble-link-button"
  previewClassName="h-auto theme-blue"
/>

```tsx showLineNumbers
import { Bubble, BubbleContent } from "@/components/ui/bubble"

export function BubbleLinkDemo() {
  return (
    <Bubble variant="muted">
      <BubbleContent render={<button />}>Click here</BubbleContent>
    </Bubble>
  )
}
```

## Reactions

Use `BubbleReactions` for bubble reactions. You can use it to display reactions or quick action buttons. Use `side` and `align` to position the row — `side="top"` anchors it to the upper edge. Reactions overlap the bubble edge, so leave vertical space between rows — the examples below use a larger `gap` for this reason.

<ComponentPreview
  styleName="base-rhea"
  name="bubble-reactions"
  previewClassName="h-auto theme-blue"
/>

## Show More / Collapsible

Long bubble content can be composed with [`Collapsible`](/docs/components/collapsible) to allow for a show more or show less interaction. Use the `CollapsibleTrigger` component to trigger the collapsible content.

<ComponentPreview
  styleName="base-rhea"
  name="bubble-collapsible"
  previewClassName="h-auto theme-blue"
/>

## Tooltip

Wrap a bubble in a [`Tooltip`](/docs/components/tooltip) to reveal metadata on hover, such as when a message was read.

<ComponentPreview
  styleName="base-rhea"
  name="bubble-tooltip"
  previewClassName="h-auto theme-blue"
/>

## Popover

Pair a bubble with a [`Popover`](/docs/components/popover) to surface more information on demand, such as the full error message for a failed action.

<ComponentPreview
  styleName="base-rhea"
  name="bubble-popover"
  previewClassName="h-auto theme-blue"
/>

## Accessibility

`Bubble` renders the presentational message surface. Keep conversation-level semantics on the surrounding container and follow the guidelines below.

### Labeling Reactions

Reactions render as a row of emoji. A screen reader reads each glyph with no context, and counters like `+8` are announced as "plus eight". Group the row as a single image with a descriptive `aria-label` so it announces once. `role="img"` also hides the individual emoji from assistive tech, so no `aria-hidden` is needed.

```tsx showLineNumbers
<BubbleReactions role="img" aria-label="Reactions: thumbs up, fire, and 8 more">
  <span>👍</span>
  <span>🔥</span>
  <span>+8</span>
</BubbleReactions>
```

When reactions are interactive, render buttons instead and give icon-only buttons an `aria-label`.

```tsx showLineNumbers
<BubbleReactions>
  <Button aria-label="Thumbs up" variant="secondary" size="icon-xs">
    <ThumbsUpIcon />
  </Button>
</BubbleReactions>
```

### Interactive Bubbles

When a bubble is clickable, render it as a real `<button>` or `<a>` with the `render` prop so it is focusable and exposes the correct role. `BubbleContent` ships a visible focus ring for interactive elements, and the accessible name comes from the bubble text. No extra label is needed.

```tsx showLineNumbers
<Bubble variant="muted" align="end">
  <BubbleContent render={<button type="button" onClick={onReply} />}>
    I forgot my password
  </BubbleContent>
</Bubble>
```

### Meaning Beyond Color

Bubble variants signal role and tone with color. Pair them with text, alignment, or icons so meaning is not conveyed by color alone. For a `destructive` bubble, keep the error context in the message text rather than relying on the color treatment.

## API Reference

### Bubble

The root bubble wrapper.

| Prop        | Type                                                                                       | Default     | Description                                      |
| ----------- | ------------------------------------------------------------------------------------------ | ----------- | ------------------------------------------------ |
| `variant`   | `"default" \| "secondary" \| "muted" \| "tinted" \| "outline" \| "ghost" \| "destructive"` | `"default"` | The bubble visual treatment.                     |
| `align`     | `"start" \| "end"`                                                                         | `"start"`   | The inline alignment of the bubble.              |
| `className` | `string`                                                                                   | -           | Additional classes to apply to the root element. |

### BubbleContent

The bubble content wrapper.

| Prop        | Type                       | Default | Description                                               |
| ----------- | -------------------------- | ------- | --------------------------------------------------------- |
| `render`    | `ReactElement \| function` | -       | Render the content as a different element such as a link. |
| `className` | `string`                   | -       | Additional classes to apply to the content element.       |

### BubbleReactions

Displays overlapped reactions for a bubble.

| Prop        | Type                | Default    | Description                                      |
| ----------- | ------------------- | ---------- | ------------------------------------------------ |
| `side`      | `"top" \| "bottom"` | `"bottom"` | The side of the bubble to anchor the reactions.  |
| `align`     | `"start" \| "end"`  | `"end"`    | The inline alignment of the reactions.           |
| `className` | `string`            | -          | Additional classes to apply to the reaction row. |

### BubbleGroup

Groups consecutive bubbles from the same sender.

| Prop        | Type     | Default | Description                                    |
| ----------- | -------- | ------- | ---------------------------------------------- |
| `className` | `string` | -       | Additional classes to apply to the group root. |

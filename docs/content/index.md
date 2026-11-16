---
seo:
  title: Notiq — Next-Gen Headless Rich Text & Spatial Canvas
  description: Build high-performance Notion-style editors and limitless visual workspaces. Powered by Lexical runtime, chainable transactions, Yjs collaboration, and generative AI.
  ogImage: https://www.collabchron.com.ng/og-image.jpg
---

::u-page-hero
#title
The Next-Gen Headless Rich Text & Spatial Canvas.

#description
Build high-performance Notion-style editors and limitless visual workspaces. :br Powered by Lexical runtime, chainable transactions, Yjs collaboration, and generative AI.

#links
  :::u-button
  ---
  color: primary
  size: xl
  to: /docs/installation
  trailing-icon: i-lucide-arrow-right
  ---
  Get started
  :::

  :::u-button
  ---
  color: neutral
  size: xl
  to: /docs/playground
  trailing-icon: i-lucide-play
  variant: outline
  ---
  Try Playground
  :::

  :::u-button
  ---
  color: neutral
  icon: i-simple-icons-github
  size: xl
  to: https://github.com/chinonsochikelue/notiq
  variant: outline
  ---
  Star on GitHub
  :::

#headline
  :::u-button
  ---
  size: sm
  to: /docs/core-concepts/headless-ui
  variant: outline
  ---
  v1.2.0: 100% Headless + AI Excalidraw & Research →
  :::
::

::floating-notiq
::

::u-page-section
  :::u-page-grid
    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2
    target: _blank
    to: /docs/features/canvas-mode
    ---
      ::spatial-canvas-svg
      ::

    #title
    Unified Document + [Spatial Canvas]{.text-primary}

    #description
    Seamlessly switch between standard linear document mode and infinite 2D spatial canvas with pan, zoom, and interconnecting cards.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    to: /docs/core-concepts/architecture
    ---
      ::lexical-engine-svg
      ::

    #title
    [Sub-6ms Speed]{.text-primary} with Lexical AST

    #description
    Double-buffered reconciliation and dirty bitmask diffing. Keystrokes render in under 6ms on 10,000+ word documents.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    to: /docs/features/notion-blocks
    ---
      ::notion-blocks-svg
      ::

    #title
    First-Class [Notion Blocks]{.text-primary}

    #description
    6-dot drag handles, block reordering, multi-column layouts, callouts, and slash menus are 100% open-source and built-in.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    to: /docs/features/collaboration
    ---
      ::collab-cursors-svg
      ::

    #title
    Real-Time [Yjs Collaboration]{.text-primary}

    #description
    Sub-millisecond CRDT sync out of the box. Multi-user cursor presence, remote selection indicators, and offline-first IndexedDB persistence.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    to: /docs/features/ai-copilot
    ---
      ::ai-copilot-svg
      ::

    #title
    Generative [AI Copilot]{.text-primary}

    #description
    Inline streaming completions, Think Mode reasoning traces, live web research citations, and automatic Excalidraw diagram hydration.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2
    to: /docs/core-concepts/headless-ui
    ---
      :::::tabs
        ::::::tabs-item{.mt-4 icon="i-lucide-paintbrush" label="Headless Blocks & Menus"}
```tsx
BlocksKit.configure({
  headless: true,
  slashMenu: { render: (menu) => <MySlashMenu {...menu} /> },
  handles: { render: (handle) => <MyDragHandle {...handle} /> },
  renderers: { hint: MyCallout, excalidraw: MyDiagram, poll: MyPoll },
})
```
        ::::::
        ::::::tabs-item{.mt-4 icon="i-lucide-bot" label="Headless AI & Research"}
```tsx
AICopilot.configure({
  headless: true,
  render: ({ suggestion, accept }) => <GhostText text={suggestion} onAccept={accept} />,
  commandBar: { headless: true, render: (ai) => <MyAICommandBar {...ai} /> },
})
```
        ::::::
      :::::

    #title
    100% [Headless & Custom UI]{.text-primary}

    #description
    Bring your own Radix, shadcn, or custom components. Override slash menus, block drag handles, AI command bars, and rich decorator nodes without losing engine logic.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2
    to: /docs/core-concepts/chained-commands
    ---
      :::::tabs
        ::::::tabs-item{.mt-4 icon="i-lucide-code" label="Notiq Fluent Chain"}
```ts
editor
  .chain()
  .focus()
  .toggleBold()
  .toggleHeading({ level: 2 })
  .run()
```
        ::::::
        ::::::tabs-item{.mt-4 icon="i-lucide-layers" label="React useNotiq Hook"}
```tsx
const editor = useNotiq({
  extensions: [StarterKit, BlocksKit, CanvasKit],
  content: '<p>Next-gen editing experience.</p>',
})
```
        ::::::
        ::::::tabs-item{.mt-4 icon="i-lucide-sparkles" label="Streaming AI Action"}
```ts
editor.chain().focus().aiPrompt({ prompt: 'Summarize key points' }).run()
```
        ::::::
      :::::

    #title
    Fluent [Chainable Transactions]{.text-primary}

    #description
    Batch mutations into atomic Lexical transactions. Zero DOM corruption, instant undo/redo, and complete TypeScript safety.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2
    to: /docs/comparisons/notiq-vs-tiptap
    ---
      ::comparison-matrix
      ::

    #title
    Head-to-Head [Benchmark]{.text-primary}

    #description
    Compare Notiq with Tiptap, Lexical, and ProseMirror. Sub-6ms typing latency and 100% MIT open-source freedom.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2
    to: /docs/introduction
    ---
      :::::div{.flex-1.flex.flex-col.items-center.justify-center.py-8.text-center}
        ::::::div{.flex.flex-col.gap-3.w-full.max-w-xs}
          :::::::u-button
          ---
          block: true
          color: primary
          size: lg
          to: /docs/installation
          trailing-icon: i-lucide-arrow-right
          ---
          Read Documentation
          :::::::

          :::::::u-button
          ---
          block: true
          color: neutral
          icon: i-simple-icons-github
          size: lg
          target: _blank
          to: https://github.com/chinonsochikelue/notiq
          variant: outline
          ---
          View on GitHub
          :::::::
        ::::::
      :::::

    #title
    [Ready]{.text-primary} to build the future of rich text?

    #description
    Get started in under 60 seconds with Notiq's drop-in StarterKit and fluent chained commands.
    ::::
  :::
::

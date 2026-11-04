---
seo:
  title: Notiq — Next-Gen Headless Rich Text & Spatial Canvas
  description: Build high-performance Notion-style editors and limitless visual workspaces. Powered by Lexical runtime, chainable transactions, Yjs collaboration, and generative AI.
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
  to: /docs/getting-started/quickstart
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
  to: /docs/comparisons/notiq-vs-tiptap
  variant: outline
  ---
  Why Notiq beats Tiptap →
  :::
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
      <img src="/hero-banner.jpg" alt="Notiq Spatial Canvas & Notion Blocks" class="w-full h-80 object-cover rounded-lg shadow-xl border border-zinc-800" />

    #title
    Unified Document + [Spatial Canvas]{.text-primary}

    #description
    Seamlessly switch between standard linear document mode and infinite 2D spatial canvas with pan, zoom, and interconnecting cards.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    to: /docs/headless-framework/chained-commands
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
        ::::::tabs-item{.mt-4 icon="i-lucide-layers" label="React Hook"}
```tsx
const editor = useNotiq({
  extensions: [StarterKit, BlocksKit],
  content: '<p>Hello Notiq!</p>',
})
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
    class: col-span-2 lg:col-span-1
    to: /docs/features/notion-blocks
    ---
      :::::tabs
        ::::::tabs-item{.mt-4 icon="i-lucide-grip-vertical" label="Handles & Slash"}
          :::::::div{.flex.flex-col.gap-3}
            ::::::::note{.my-0}
            **6-Dot Grip**: Hover over any block to drag & drop or transform.
            ::::::::

            ::::::::tip{.my-0}
            **Slash Menu**: Press `/` on any blank line to insert blocks.
            ::::::::
          :::::::
        ::::::
      :::::

    #title
    First-Class [Notion Blocks]{.text-primary}

    #description
    Block drag handles, multi-column grids, callouts, and collapsible toggles are 100% open-source and built-in — no paid Pro licenses required.
    ::::

    ::::u-page-card
    ---
    spotlight: true
    class: col-span-2 lg:col-span-1
    to: /docs/features/collaboration
    ---
      :::::tabs
        ::::::tabs-item{.mt-4 icon="i-lucide-users" label="Multiplayer Yjs"}
```tsx
const editor = useNotiq({
  extensions: [
    StarterKit,
    CollabKit.configure({ document: ydoc }),
  ],
})
```
        ::::::
      :::::

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
      :::::tabs
        ::::::tabs-item{.mt-4 icon="i-lucide-sparkles" label="Streaming Copilot"}
```tsx
const editor = useNotiq({
  extensions: [
    StarterKit,
    AiKit.configure({
      endpoint: '/api/ai/complete',
      model: 'gemini-2.5-flash',
    }),
  ],
})
```
        ::::::
      :::::

    #title
    Generative [AI Copilot]{.text-primary}

    #description
    Inline streaming completions, tone rewriting, summarization, and contextual prompt actions with pluggable LLM adapters.
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
    to: /docs/getting-started/quickstart
    ---
      :::::div{.flex-1.flex.flex-col.items-center.justify-center.py-8.text-center}
        ::::::div{.flex.flex-col.gap-3.w-full.max-w-xs}
          :::::::u-button
          ---
          block: true
          color: primary
          size: lg
          to: /docs/getting-started/quickstart
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

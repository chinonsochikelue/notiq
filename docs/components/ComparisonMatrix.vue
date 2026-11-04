<template>
  <div class="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <div class="text-center max-w-3xl mx-auto mb-16">
      <h2 class="text-xs font-bold tracking-widest text-violet-400 uppercase mb-3">Head-to-Head Benchmark</h2>
      <p class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        Why Teams Choose Notiq over Tiptap & Lexical
      </p>
      <p class="mt-4 text-base sm:text-lg text-zinc-400">
        Tiptap pioneered headless editors on ProseMirror. Notiq takes the DX to the next era with Lexical performance and native Notion blocks.
      </p>
    </div>

    <!-- Comparison Table Container -->
    <div class="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-2xl backdrop-blur-sm">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-zinc-800/80 bg-zinc-900/50">
            <th class="py-4 px-6 text-sm font-semibold text-zinc-400">Feature / Capability</th>
            <th class="py-4 px-6 text-sm font-bold text-violet-400 bg-violet-500/10 border-x border-violet-500/20 text-center">
              Notiq (Next-Gen)
            </th>
            <th class="py-4 px-6 text-sm font-semibold text-zinc-300 text-center">Tiptap v2</th>
            <th class="py-4 px-6 text-sm font-semibold text-zinc-300 text-center">Lexical Raw</th>
            <th class="py-4 px-6 text-sm font-semibold text-zinc-300 text-center">ProseMirror</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-800/60 text-sm">
          <tr
            v-for="(row, idx) in comparisons"
            :key="row.feature"
            :class="idx % 2 === 0 ? 'bg-transparent' : 'bg-zinc-900/20'"
          >
            <td class="py-4 px-6 font-medium text-zinc-200">
              <div class="font-semibold">{{ row.feature }}</div>
              <div class="text-xs text-zinc-400 mt-0.5">{{ row.detail }}</div>
            </td>
            <td class="py-4 px-6 bg-violet-500/5 border-x border-violet-500/20 text-center font-semibold text-violet-300">
              <span class="inline-flex items-center gap-1.5 justify-center">
                <span class="w-2 h-2 rounded-full bg-emerald-400" />
                {{ row.notiq }}
              </span>
            </td>
            <td class="py-4 px-6 text-center text-zinc-400">
              {{ row.tiptap }}
            </td>
            <td class="py-4 px-6 text-center text-zinc-400">
              {{ row.lexical }}
            </td>
            <td class="py-4 px-6 text-center text-zinc-400">
              {{ row.prosemirror }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bottom summary callout -->
    <div class="mt-8 p-6 rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-950/30 to-purple-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h4 class="text-base font-bold text-white">Migrating from Tiptap?</h4>
        <p class="text-sm text-zinc-300 mt-1">
          Notiq uses the same intuitive chained command syntax (<code class="text-violet-300">editor.chain().focus().run()</code>) and <code class="text-violet-300">useEditor()</code> hook. Migration is nearly drop-in.
        </p>
      </div>
      <a
        href="/docs/comparisons/notiq-vs-tiptap"
        class="whitespace-nowrap px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
      >
        Read Full Comparison &rarr;
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const comparisons = [
  {
    feature: 'Core Engine Runtime',
    detail: 'Underlying reconciliation & AST state management',
    notiq: 'Lexical AST (Fastest)',
    tiptap: 'ProseMirror (Legacy)',
    lexical: 'Lexical AST',
    prosemirror: 'ProseMirror AST',
  },
  {
    feature: 'Fluent Chained Commands',
    detail: 'editor.chain().toggleBold().run() API',
    notiq: 'Native Fluent API',
    tiptap: 'Native Fluent API',
    lexical: 'Verbose Dispatchers',
    prosemirror: 'Manual Transforms',
  },
  {
    feature: 'Notion Blocks & Handles',
    detail: 'Grip handle, drag & drop, slash menu, callouts, columns',
    notiq: 'Built-in (BlocksKit)',
    tiptap: 'Paid Extension (Pro)',
    lexical: 'Requires Custom Code',
    prosemirror: 'Complex DIY',
  },
  {
    feature: 'Infinite Spatial Canvas',
    detail: '2D node canvas with pan, zoom, and spatial cards',
    notiq: 'Built-in Switcher',
    tiptap: 'Not Supported',
    lexical: 'Not Supported',
    prosemirror: 'Not Supported',
  },
  {
    feature: 'Real-Time Yjs Collaboration',
    detail: 'CRDT sync, remote awareness, presence cursors',
    notiq: 'Native Yjs Provider',
    tiptap: 'Paid Cloud or Setup',
    lexical: 'Separate Package',
    prosemirror: 'Separate Package',
  },
  {
    feature: 'Streaming AI Integration',
    detail: 'Contextual prompt bar, streaming diffs, LLM adapters',
    notiq: 'Native AI Copilot',
    tiptap: 'Paid Cloud Extension',
    lexical: 'Manual Setup',
    prosemirror: 'Manual Setup',
  },
  {
    feature: 'Typing Latency (10k words)',
    detail: 'Keystroke dispatch & DOM reconciliation time',
    notiq: '< 6ms (Sub-frame)',
    tiptap: '18ms - 32ms',
    lexical: '< 8ms',
    prosemirror: '16ms - 28ms',
  },
  {
    feature: 'Pricing & Licensing',
    detail: 'Open-source commercial freedom',
    notiq: '100% Free MIT',
    tiptap: 'Freemium (Paid Pro)',
    lexical: 'MIT',
    prosemirror: 'MIT',
  },
]
</script>

<template>
  <div class="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <div class="text-center max-w-3xl mx-auto mb-16">
      <h2 class="text-xs font-bold tracking-widest text-violet-400 uppercase mb-3">Enterprise-Grade Architecture</h2>
      <p class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        Engineered for next-generation text & spatial applications
      </p>
      <p class="mt-4 text-base sm:text-lg text-zinc-400">
        Everything you need to build Notion, Miro, or Linear-level document experiences in minutes.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="relative group rounded-2xl p-7 border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900/60 hover:border-violet-500/40 transition-all duration-300"
      >
        <div class="inline-flex p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-5 group-hover:scale-110 transition-transform duration-300">
          <component :is="feature.icon" class="w-6 h-6" />
        </div>
        <h3 class="text-xl font-bold text-white mb-2">{{ feature.title }}</h3>
        <p class="text-sm text-zinc-400 leading-relaxed mb-4">{{ feature.description }}</p>
        <div class="flex items-center text-xs font-semibold text-violet-400 group-hover:text-violet-300">
          <span>{{ feature.highlight }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

const CodeIcon = () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' })
])
const BlocksIcon = () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' })
])
const CanvasIcon = () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' })
])
const CollabIcon = () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' })
])
const AiIcon = () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M13 10V3L4 14h7v7l9-11h-7z' })
])
const SpeedIcon = () => h('svg', { fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
])

const features = [
  {
    title: 'Headless & Fluent API',
    description: 'Chained commands, atomic transactions, and reactive useNotiq hook. Clean separation of headless logic and your design system.',
    highlight: 'Chainable: editor.chain().focus().toggleBold().run()',
    icon: CodeIcon,
  },
  {
    title: 'Notion-Style Blocks',
    description: 'First-class block handles, 6-dot drag grip, slash commands (/), multi-column layouts, callout boxes, and collapsible toggles.',
    highlight: 'Full block hierarchy built-in',
    icon: BlocksIcon,
  },
  {
    title: 'Infinite Spatial Canvas',
    description: 'Seamlessly toggle between standard linear document view and infinite 2D spatial canvas mode with pan, zoom, and card connections.',
    highlight: 'Document + Canvas in one unified runtime',
    icon: CanvasIcon,
  },
  {
    title: 'Real-Time Yjs Collaboration',
    description: 'Sub-millisecond CRDT sync out of the box. Multi-user cursor presence, remote selection indicators, and offline-first persistence.',
    highlight: 'Zero-config WebSocket synchronization',
    icon: CollabIcon,
  },
  {
    title: 'Generative AI Copilot',
    description: 'Inline streaming completions, tone rephrasing, summarization, and contextual agent prompts with pluggable LLM adapters.',
    highlight: 'Streaming AI with token-level diff preview',
    icon: AiIcon,
  },
  {
    title: 'Lexical Runtime Speed',
    description: 'Built on Meta\'s Lexical engine. Immutable AST reconciler, sub-10ms keystroke latency, and rock-solid IME/mobile support.',
    highlight: '60% faster than ProseMirror & Slate',
    icon: SpeedIcon,
  },
]
</script>

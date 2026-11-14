<script setup lang="ts">
import { ref } from "vue";

type TabId = "editor" | "ai" | "headless";

const activeTab = ref<TabId>("editor");
const copied = ref(false);

const tabs: Array<{ id: TabId; label: string; badge: string }> = [
  { id: "editor", label: "Rich Canvas", badge: "BlocksKit" },
  { id: "ai", label: "AI + Excalidraw", badge: "Think & Research" },
  { id: "headless", label: "100% Headless", badge: "v1.2.0" },
];

async function copyInstall() {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText("npm install @collabchron/notiq");
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1800);
  }
}
</script>

<template>
  <div class="relative mx-auto w-full max-w-5xl px-4 pb-12 pt-2">
    <!-- Ambient multi-layered radial glow -->
    <div
      class="pointer-events-none absolute -top-10 left-1/2 -z-10 h-72 w-3/4 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600/25 via-fuchsia-500/20 to-cyan-500/25 blur-3xl"
    />

    <!-- Quick Install Pill -->
    <div class="mb-6 flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        @click="copyInstall"
        class="group inline-flex items-center gap-2.5 rounded-full border border-zinc-200/80 bg-white/80 px-4 py-1.5 font-mono text-xs text-zinc-700 shadow-sm backdrop-blur-md transition hover:border-violet-500/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200"
      >
        <span class="text-violet-500">$</span>
        <span>npm install @collabchron/notiq</span>
        <span
          class="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-sans font-medium text-zinc-500 transition group-hover:bg-violet-500/15 group-hover:text-violet-500 dark:bg-zinc-800 dark:text-zinc-400"
        >
          {{ copied ? "Copied!" : "Copy" }}
        </span>
      </button>

      <NuxtLink
        to="/docs/core-concepts/headless-ui"
        class="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3.5 py-1.5 text-xs font-medium text-violet-600 transition hover:bg-violet-500/20 dark:text-violet-300"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>v1.2.0 Headless Architecture</span>
      </NuxtLink>
    </div>

    <!-- Interactive Window Frame -->
    <div
      class="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/90 shadow-2xl shadow-violet-950/10 backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-950/90 dark:shadow-violet-950/40"
    >
      <!-- Top Bar -->
      <div
        class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/80 bg-zinc-50/80 px-4 py-2.5 dark:border-zinc-800/80 dark:bg-zinc-900/70"
      >
        <div class="flex items-center gap-2">
          <span class="h-3 w-3 rounded-full bg-rose-500/90" />
          <span class="h-3 w-3 rounded-full bg-amber-400/90" />
          <span class="h-3 w-3 rounded-full bg-emerald-500/90" />
          <span class="ml-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Notiq Workspace
          </span>
        </div>

        <!-- Mode Switcher Tabs -->
        <div
          class="flex items-center gap-1 rounded-xl border border-zinc-200/80 bg-white/80 p-1 dark:border-zinc-800 dark:bg-zinc-950/80"
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            @click="activeTab = tab.id"
            :class="[
              'flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition',
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/70',
            ]"
          >
            <span>{{ tab.label }}</span>
            <span
              :class="[
                'hidden sm:inline rounded px-1.5 py-0.5 text-[10px]',
                activeTab === tab.id
                  ? 'bg-white/20 text-white'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
              ]"
            >
              {{ tab.badge }}
            </span>
          </button>
        </div>

        <div class="hidden md:flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-600 dark:text-emerald-400">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live Yjs Sync
          </span>
        </div>
      </div>

      <!-- Tab 1: Rich Canvas -->
      <div v-if="activeTab === 'editor'" class="grid gap-6 p-6 md:grid-cols-12">
        <div class="md:col-span-7 space-y-4 text-left">
          <div class="flex items-start gap-2.5 group">
            <span
              class="mt-1.5 select-none rounded px-1 py-0.5 text-xs text-zinc-400 opacity-70 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800"
            >
              ⋮⋮
            </span>
            <div>
              <h3 class="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Product Architecture Spec
              </h3>
              <p class="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Sub-6ms Lexical AST updates with built-in Notion blocks, callouts, multi-column grids, and
                <span class="rounded bg-violet-500/15 px-1.5 py-0.5 font-mono text-xs text-violet-600 dark:text-violet-300">
                  Cmd+K
                </span>
                AI streaming.
              </p>
            </div>
          </div>

          <!-- Callout Block Preview -->
          <div
            class="flex items-start gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm text-zinc-800 dark:text-zinc-200"
          >
            <span class="text-base">💡</span>
            <div>
              <p class="font-semibold text-violet-700 dark:text-violet-300">
                Modular Extension Kit
              </p>
              <p class="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                Use Notiq's prebuilt Tailwind UI or pass <code class="font-mono">headless: true</code> to render your own design system.
              </p>
            </div>
          </div>

          <!-- Mini Ghost Text Line -->
          <div class="rounded-lg border border-zinc-200/70 bg-zinc-50/70 px-3.5 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
            <span class="text-zinc-800 dark:text-zinc-200">Press </span>
            <kbd class="rounded border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-800">/</kbd>
            <span class="text-zinc-800 dark:text-zinc-200"> to insert </span>
            <span class="italic text-zinc-400 dark:text-zinc-500">
              Excalidraw diagrams, tables, polls, or code blocks... [Tab]
            </span>
          </div>
        </div>

        <!-- Floating Slash Menu Preview -->
        <div class="md:col-span-5">
          <div
            class="rounded-xl border border-zinc-200/90 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div class="flex items-center justify-between border-b border-zinc-100 px-2.5 pb-2 text-[11px] font-medium text-zinc-400 dark:border-zinc-800">
              <span>/ Commands &amp; Blocks</span>
              <span class="font-mono">52 blocks</span>
            </div>
            <div class="mt-1.5 space-y-1 text-left">
              <div class="flex items-center gap-2.5 rounded-lg bg-violet-500/10 px-2.5 py-2 text-xs font-medium text-violet-700 dark:text-violet-300">
                <span>✨</span>
                <div class="flex-1">Ask AI Assistant</div>
                <kbd class="font-mono text-[10px] opacity-70">⌘K</kbd>
              </div>
              <div class="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                <span>🎨</span>
                <div class="flex-1">Excalidraw Diagram</div>
                <span class="text-[10px] text-zinc-400">Canvas</span>
              </div>
              <div class="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                <span>📊</span>
                <div class="flex-1">Interactive Table</div>
                <span class="text-[10px] text-zinc-400">Grid</span>
              </div>
              <div class="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                <span>📑</span>
                <div class="flex-1">Multi-Column Layout</div>
                <span class="text-[10px] text-zinc-400">2-4 cols</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: AI + Excalidraw -->
      <div v-else-if="activeTab === 'ai'" class="grid gap-6 p-6 md:grid-cols-12 text-left">
        <div class="md:col-span-6 space-y-3">
          <div class="rounded-xl border border-violet-500/30 bg-zinc-900 p-3.5 text-xs text-zinc-200 shadow-inner">
            <div class="flex items-center justify-between text-[11px] text-violet-300">
              <span class="font-semibold">✨ AI Command Bar</span>
              <div class="flex gap-1.5">
                <span class="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px]">Think: ON</span>
                <span class="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300">Research: ON</span>
              </div>
            </div>
            <p class="mt-2 rounded-lg bg-zinc-950/80 px-3 py-2 text-zinc-100">
              Draw an architecture diagram for headless Notiq + Yjs sync
            </p>
            <div class="mt-2.5 rounded-lg border border-zinc-800 bg-zinc-950/60 p-2.5 text-[11px] text-zinc-400">
              <div class="font-medium text-zinc-300">AI Reasoning (collapsed)</div>
              <p class="mt-1 line-clamp-2">
                Compiling nodes &amp; edges into Excalidraw scene elements and hydrating live SVG preview...
              </p>
            </div>
            <div class="mt-2.5 flex flex-wrap gap-1.5">
              <span class="rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-0.5 text-[10px] text-zinc-300">
                🔗 Wikipedia: CRDT
              </span>
              <span class="rounded-full border border-zinc-700 bg-zinc-800/80 px-2.5 py-0.5 text-[10px] text-zinc-300">
                🔗 Lexical AST Docs
              </span>
            </div>
          </div>
        </div>

        <div class="md:col-span-6 flex items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-950 p-4 dark:border-zinc-800">
          <svg viewBox="0 0 320 150" class="w-full max-w-xs" fill="none">
            <rect x="14" y="48" width="84" height="44" rx="10" stroke="#8b5cf6" stroke-width="2" fill="#1e1b4b" />
            <text x="56" y="74" text-anchor="middle" fill="#e9d5ff" font-size="11" font-family="sans-serif">Lexical Core</text>
            <path d="M98 70 H130" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 3" />
            <rect x="130" y="20" width="88" height="38" rx="10" stroke="#06b6d4" stroke-width="2" fill="#083344" />
            <text x="174" y="43" text-anchor="middle" fill="#cffafe" font-size="10" font-family="sans-serif">Yjs CRDT</text>
            <rect x="130" y="84" width="88" height="38" rx="10" stroke="#a855f7" stroke-width="2" fill="#2e1065" />
            <text x="174" y="107" text-anchor="middle" fill="#f3e8ff" font-size="10" font-family="sans-serif">AI Stream</text>
            <path d="M218 39 L246 66 M218 103 L246 74" stroke="#a855f7" stroke-width="2" />
            <rect x="246" y="48" width="60" height="44" rx="10" stroke="#10b981" stroke-width="2" fill="#022c22" />
            <text x="276" y="74" text-anchor="middle" fill="#d1fae5" font-size="10" font-family="sans-serif">Your UI</text>
          </svg>
        </div>
      </div>

      <!-- Tab 3: 100% Headless -->
      <div v-else class="p-6 text-left">
        <pre class="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-200"><code><span class="text-violet-400">const</span> editor = <span class="text-sky-400">useNotiq</span>({
  extensions: [
    StarterKit,
    BlocksKit.<span class="text-amber-300">configure</span>({
      headless: <span class="text-emerald-400">true</span>,
      slashMenu: { render: (state) =&gt; &lt;MyCommandPalette {...state} /&gt; },
      handles: { render: (state) =&gt; &lt;MyBlockHandle {...state} /&gt; },
      renderers: { hint: MyCallout, poll: MyPoll, image: MyImage },
    }),
    AICopilot.<span class="text-amber-300">configure</span>({
      headless: <span class="text-emerald-400">true</span>,
      commandBar: { headless: <span class="text-emerald-400">true</span>, render: (ai) =&gt; &lt;MyAIBar {...ai} /&gt; },
    }),
  ],
})</code></pre>
      </div>
    </div>
  </div>
</template>

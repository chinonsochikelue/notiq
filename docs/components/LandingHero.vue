<template>
  <div class="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <!-- Background glow ambient -->
    <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/30 to-fuchsia-600/20 blur-3xl pointer-events-none rounded-full" />
    
    <div class="relative z-10 text-center max-w-4xl mx-auto">
      <!-- Release badge -->
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-md mb-8">
        <span class="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
        <span class="text-xs font-medium tracking-wide uppercase text-violet-300">Notiq 1.0 Headless Engine</span>
        <span class="text-xs text-zinc-400 font-mono">v1.0.0</span>
      </div>

      <!-- Main headline -->
      <h1 class="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
        The Next-Gen <br />
        <span class="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
          Headless Rich Text & Spatial Canvas
        </span>
      </h1>

      <p class="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
        Build high-performance Notion-style editors and limitless visual workspaces. Powered by Lexical runtime, chainable transactions, Yjs collaboration, and generative AI.
      </p>

      <!-- CTA buttons -->
      <div class="flex flex-wrap items-center justify-center gap-4 mb-12">
        <a
          href="/docs/getting-started/quickstart"
          class="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl shadow-lg shadow-violet-500/25 transition-all duration-200"
        >
          Get Started
          <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </a>

        <a
          href="/docs/playground"
          class="inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-zinc-200 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl backdrop-blur-md transition-all duration-200"
        >
          Try Playground
        </a>

        <a
          href="https://github.com/chinonsochikelue/notiq"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center justify-center px-5 py-3.5 text-base font-medium text-zinc-400 hover:text-white transition-colors duration-200"
        >
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
          GitHub
        </a>
      </div>

      <!-- Quick Install Box -->
      <div class="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg bg-zinc-950/90 border border-zinc-800 text-sm font-mono text-zinc-300 shadow-inner">
        <span class="text-violet-400 select-none">$</span>
        <span>pnpm add @collabchron/notiq</span>
        <button
          @click="copied = true; copyCmd()"
          class="ml-2 text-zinc-400 hover:text-white transition-colors"
          title="Copy command"
        >
          <span v-if="copied" class="text-xs text-green-400">Copied!</span>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" stroke-width="2"/><path stroke-width="2" d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        </button>
      </div>
    </div>

    <!-- Hero Image Banner with Glowing Frame -->
    <div class="relative mt-16 max-w-6xl mx-auto">
      <div class="absolute -inset-1.5 bg-gradient-to-r from-violet-600 via-indigo-500 to-fuchsia-600 rounded-2xl blur-lg opacity-35 transition duration-1000 group-hover:opacity-100" />
      <div class="relative overflow-hidden rounded-2xl border border-zinc-700/60 bg-zinc-950/80 shadow-2xl">
        <img
          src="/hero-banner.jpg"
          alt="Notiq Spatial Canvas & Notion Blocks"
          class="w-full h-auto object-cover transform hover:scale-[1.01] transition-transform duration-700"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const copied = ref(false)

function copyCmd() {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText('pnpm add @collabchron/notiq')
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}
</script>

<template>
  <div class="w-full my-8 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl">
    <!-- Browser-like header chrome -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
        <span class="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
        <span class="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
        <span class="ml-2 text-xs font-mono text-zinc-400">Notiq Interactive Sandbox</span>
      </div>

      <div class="flex items-center gap-3">
        <a
          href="/docs/playground"
          class="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
        >
          Open Fullscreen &rarr;
        </a>
      </div>
    </div>

    <!-- Playground interactive preview or fallback -->
    <div class="relative w-full h-[620px] bg-zinc-950 flex flex-col items-center justify-center">
      <iframe
        src="http://localhost:3000"
        class="w-full h-full border-0"
        title="Notiq Live Interactive Playground"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// Interactive playground iframe container
</script>

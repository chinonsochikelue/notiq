<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    defaultTab?: 'promo' | 'walkthrough'
    title?: string
    subtitle?: string
  }>(),
  {
    defaultTab: 'promo',
    title: 'See Notiq v1.4.0 in Motion',
    subtitle: 'Real-time Yjs collaboration, Database Table ↔ Kanban, Page Links & Backlinks, ImageLightbox, and AI Diff Review.',
  }
)

const activeTab = ref<'promo' | 'walkthrough'>(props.defaultTab)

const currentVideo = computed(() =>
  activeTab.value === 'promo'
    ? {
        src: '/videos/notiq-promo.mp4',
        label: 'v1.4.0 Launch Reel (1080p · BGM + SFX)',
      }
    : {
        src: '/videos/notiq-demo.mp4',
        label: 'Live /collaboration Walkthrough (Blank Canvas → All Features)',
      }
)
</script>

<template>
  <section class="my-8 mx-auto max-w-5xl rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-950/95 p-4 sm:p-6 shadow-2xl">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div>
        <h3 class="text-lg sm:text-xl font-bold text-white tracking-tight">
          {{ title }}
        </h3>
        <p class="text-xs sm:text-sm text-slate-400 mt-0.5">
          {{ subtitle }}
        </p>
      </div>

      <div class="inline-flex rounded-xl border border-slate-800 bg-slate-900 p-1 self-start sm:self-auto shrink-0">
        <button
          type="button"
          @click="activeTab = 'promo'"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
            activeTab === 'promo'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          ]"
        >
          Launch Reel
        </button>
        <button
          type="button"
          @click="activeTab = 'walkthrough'"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer',
            activeTab === 'walkthrough'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          ]"
        >
          Live Walkthrough
        </button>
      </div>
    </div>

    <div class="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-800 bg-black">
      <video
        :key="currentVideo.src"
        :src="currentVideo.src"
        controls
        playsinline
        preload="metadata"
        class="h-full w-full object-contain"
      />
    </div>

    <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
      <span>{{ currentVideo.label }}</span>
      <a
        :href="currentVideo.src"
        download
        class="text-indigo-400 hover:text-indigo-300 font-medium"
      >
        Download MP4 →
      </a>
    </div>
  </section>
</template>

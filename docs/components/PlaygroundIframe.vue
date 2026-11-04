<template>
  <div class="w-full my-8 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl transition-all duration-300">
    <!-- Window Chrome Header -->
    <div class="flex flex-wrap items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/95 gap-3">
      <!-- Window Dots + Title -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
          <span class="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
          <span class="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
        </div>
        <span class="text-xs font-mono text-zinc-300 font-semibold tracking-wide flex items-center gap-2">
          <span>notiq-playground-editor</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Engine
          </span>
        </span>
      </div>

      <!-- Mode Switcher Tabs -->
      <div class="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs font-medium">
        <button
          @click="activeView = 'editor'"
          :class="activeView === 'editor' ? 'bg-violet-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'"
          class="px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          Playground Editor
        </button>

        <button
          @click="activeView = 'canvas'"
          :class="activeView === 'canvas' ? 'bg-violet-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'"
          class="px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
          Spatial Canvas
        </button>

        <button
          @click="activeView = 'ast'"
          :class="activeView === 'ast' ? 'bg-violet-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'"
          class="px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
          AST Inspector
        </button>
      </div>

      <!-- Action Links -->
      <div class="flex items-center gap-3">
        <a
          href="http://localhost:3000/Playground"
          target="_blank"
          rel="noopener"
          class="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 font-medium"
        >
          <span>Open Fullscreen</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
        </a>
      </div>
    </div>

    <!-- VIEW 1: Primary Playground Editor (Loaded directly from src/app/Playground/page.tsx) -->
    <div v-show="activeView === 'editor'" class="relative w-full h-[760px] bg-zinc-950">
      <!-- Loading indicator while iframe boots -->
      <div v-if="iframeLoading" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm text-zinc-400 text-xs">
        <div class="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mb-3" />
        <span>Loading Notiq Playground Editor...</span>
      </div>

      <iframe
        ref="iframeRef"
        src="http://localhost:3000/Playground"
        class="w-full h-full border-0 bg-transparent"
        title="Notiq Playground Editor"
        @load="iframeLoading = false"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>

    <!-- VIEW 2: Infinite Spatial Canvas -->
    <div v-show="activeView === 'canvas'" class="relative w-full h-[760px] bg-zinc-950 overflow-hidden select-none">
      <!-- Canvas Control HUD -->
      <div class="absolute top-4 left-4 z-20 flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2 text-xs backdrop-blur-md shadow-xl">
        <span class="font-semibold text-zinc-300">Spatial Viewport:</span>
        <button @click="canvasZoom = Math.min(2, canvasZoom + 0.1)" class="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold">+</button>
        <span class="font-mono text-violet-400">{{ Math.round(canvasZoom * 100) }}%</span>
        <button @click="canvasZoom = Math.max(0.5, canvasZoom - 0.1)" class="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold">-</button>
        <button @click="canvasZoom = 1" class="ml-2 text-[11px] text-zinc-400 hover:text-zinc-200">Reset</button>
        <button @click="addCanvasCard" class="ml-2 px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white font-medium">
          + Add Card
        </button>
      </div>

      <div class="absolute top-4 right-4 z-20 text-[11px] font-mono text-zinc-500 bg-zinc-900/70 border border-zinc-800 px-3 py-1.5 rounded-lg">
        Drag cards to rearrange • Pan & Zoom freely
      </div>

      <!-- Canvas SVG Surface -->
      <div
        class="w-full h-full cursor-crosshair"
        :style="{
          backgroundImage: 'radial-gradient(circle, #3f3f46 1px, transparent 1px)',
          backgroundSize: `${24 * canvasZoom}px ${24 * canvasZoom}px`,
        }"
      >
        <svg class="w-full h-full pointer-events-none absolute inset-0 z-0">
          <path
            v-if="canvasCards.length >= 2"
            :d="`M ${canvasCards[0].x + 120} ${canvasCards[0].y + 60} C ${canvasCards[0].x + 200} ${canvasCards[0].y + 60}, ${canvasCards[1].x - 60} ${canvasCards[1].y + 60}, ${canvasCards[1].x} ${canvasCards[1].y + 60}`"
            stroke="#8b5cf6"
            stroke-width="2.5"
            stroke-dasharray="6 3"
            fill="none"
          />
          <path
            v-if="canvasCards.length >= 3"
            :d="`M ${canvasCards[0].x + 120} ${canvasCards[0].y + 80} C ${canvasCards[0].x + 180} ${canvasCards[0].y + 160}, ${canvasCards[2].x - 60} ${canvasCards[2].y + 40}, ${canvasCards[2].x} ${canvasCards[2].y + 40}`"
            stroke="#06b6d4"
            stroke-width="2.5"
            fill="none"
          />
        </svg>

        <!-- Interactive Draggable Cards -->
        <div
          v-for="(card, idx) in canvasCards"
          :key="card.id"
          @mousedown="startDragCard($event, idx)"
          class="absolute z-10 w-64 rounded-xl border border-zinc-700 bg-zinc-900/95 shadow-2xl p-4 cursor-grab active:cursor-grabbing transform-gpu transition-shadow hover:border-violet-500"
          :style="{
            left: `${card.x}px`,
            top: `${card.y}px`,
            transform: `scale(${canvasZoom})`,
            transformOrigin: 'top left',
          }"
        >
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full" :class="card.color" />
              <span class="text-xs font-bold text-white">{{ card.title }}</span>
            </div>
            <span class="text-[10px] font-mono text-zinc-500">Node #{{ idx + 1 }}</span>
          </div>

          <div class="text-xs text-zinc-300 leading-relaxed font-sans" contenteditable="true" @mousedown.stop>
            {{ card.content }}
          </div>

          <div class="mt-3 flex items-center justify-between text-[10px] text-zinc-400">
            <span class="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono">{{ card.tag }}</span>
            <span class="text-violet-400 font-semibold cursor-pointer hover:underline">
              Connect &rarr;
            </span>
          </div>
        </div>
      </div>

      <!-- Live Chained Command Bar -->
      <div class="absolute bottom-0 inset-x-0 px-4 py-2 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between text-xs font-mono z-20">
        <div class="flex items-center gap-2 text-zinc-300">
          <span class="text-violet-400 font-bold select-none">&gt;</span>
          <span class="text-violet-300">{{ canvasCommand }}</span>
        </div>
        <div class="text-zinc-400 text-[11px]">
          Mode: <span class="text-cyan-400 font-bold">2D Infinite Spatial Grid</span>
        </div>
      </div>
    </div>

    <!-- VIEW 3: AST Inspector -->
    <div v-show="activeView === 'ast'" class="h-[760px] p-6 bg-zinc-950 overflow-y-auto font-mono text-xs text-zinc-300">
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
        <span class="text-violet-400 font-bold">Lexical AST Tree (Double-Buffered State)</span>
        <button
          @click="copyAST"
          class="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
        >
          {{ astCopied ? 'Copied!' : 'Copy JSON' }}
        </button>
      </div>
      <pre class="text-zinc-400 leading-relaxed overflow-x-auto">{{ mockAstJson }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeView = ref<'editor' | 'canvas' | 'ast'>('editor')
const iframeLoading = ref(true)
const astCopied = ref(false)

const canvasCommand = ref("editor.commands.setCanvasMode('canvas')")
const canvasZoom = ref(1.0)

const canvasCards = ref([
  { id: 1, x: 50, y: 80, title: 'Document Core AST', tag: 'Core', color: 'bg-violet-500', content: 'Double-buffered Lexical state ensures zero DOM corruption and atomic history rollback.' },
  { id: 2, x: 380, y: 70, title: 'Notion Blocks Kit', tag: 'Blocks', color: 'bg-emerald-500', content: 'Native 6-dot drag handles, slash command palette, multi-columns, and toggles.' },
  { id: 3, x: 360, y: 280, title: 'Real-time Yjs CRDT', tag: 'Multiplayer', color: 'bg-cyan-500', content: 'Sub-millisecond multi-cursor sync with awareness presence across peers.' },
])

let draggingCardIdx = -1
let dragStartX = 0
let dragStartY = 0
let cardStartX = 0
let cardStartY = 0

function startDragCard(e: MouseEvent, idx: number) {
  draggingCardIdx = idx
  dragStartX = e.clientX
  dragStartY = e.clientY
  cardStartX = canvasCards.value[idx].x
  cardStartY = canvasCards.value[idx].y

  const onMouseMove = (moveEvent: MouseEvent) => {
    if (draggingCardIdx < 0) return
    const dx = (moveEvent.clientX - dragStartX) / canvasZoom.value
    const dy = (moveEvent.clientY - dragStartY) / canvasZoom.value
    canvasCards.value[draggingCardIdx].x = Math.max(10, cardStartX + dx)
    canvasCards.value[draggingCardIdx].y = Math.max(10, cardStartY + dy)
    canvasCommand.value = `editor.chain().panNode('node-${draggingCardIdx + 1}', { x: ${Math.round(canvasCards.value[draggingCardIdx].x)}, y: ${Math.round(canvasCards.value[draggingCardIdx].y)} }).run()`
  }

  const onMouseUp = () => {
    draggingCardIdx = -1
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function addCanvasCard() {
  const newId = canvasCards.value.length + 1
  canvasCards.value.push({
    id: newId,
    x: 100 + newId * 40,
    y: 120 + newId * 30,
    title: `Spatial Note #${newId}`,
    tag: 'Idea',
    color: 'bg-pink-500',
    content: 'Click here to write notes in this connected spatial card.',
  })
  canvasCommand.value = `editor.chain().insertCanvasNode({ id: 'node-${newId}', x: ${100 + newId * 40}, y: ${120 + newId * 30} }).run()`
}

const mockAstJson = computed(() => {
  return JSON.stringify({
    root: {
      type: "root",
      format: "",
      indent: 0,
      version: 1,
      children: [
        {
          type: "heading",
          tag: "h1",
          children: [{ type: "text", text: "Introducing Notiq", format: 1 }]
        },
        {
          type: "paragraph",
          children: [
            { type: "text", text: "A powerful Notion-Like, Tiptap-Like, AI-enhanced rich text editor built with Lexical, Next.js, TypeScript, and Tailwind CSS.", format: 0 }
          ]
        },
        {
          type: "heading",
          tag: "h2",
          children: [{ type: "text", text: "🤖 AI-Powered Writing Assistant", format: 1 }]
        }
      ]
    }
  }, null, 2)
})

function copyAST() {
  if (navigator?.clipboard) {
    navigator.clipboard.writeText(mockAstJson.value)
    astCopied.value = true
    setTimeout(() => { astCopied.value = false }, 2000)
  }
}
</script>

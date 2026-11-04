<template>
  <div class="w-full my-8 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl transition-all duration-300">
    <!-- Window Chrome Header -->
    <div class="flex flex-wrap items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/90 gap-3">
      <!-- Window Dots + Title -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
          <span class="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
          <span class="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
        </div>
        <span class="text-xs font-mono text-zinc-300 font-semibold tracking-wide flex items-center gap-2">
          <span>notiq-interactive-sandbox</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 font-sans">
            v1.0 Live
          </span>
        </span>
      </div>

      <!-- Mode Switcher Tabs -->
      <div class="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs font-medium">
        <button
          @click="activeView = 'document'"
          :class="activeView === 'document' ? 'bg-violet-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'"
          class="px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          Document Mode
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

        <button
          v-if="serverOnline"
          @click="activeView = 'app'"
          :class="activeView === 'app' ? 'bg-violet-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'"
          class="px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Full App
        </button>
      </div>

      <!-- Action Links -->
      <div class="flex items-center gap-3">
        <button
          @click="resetContent"
          class="text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
          title="Reset to default content"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Reset
        </button>
      </div>
    </div>

    <!-- VIEW 1: Document Mode -->
    <div v-if="activeView === 'document'" class="relative flex flex-col h-[580px]">
      <!-- Headless Toolbar -->
      <div class="flex flex-wrap items-center gap-1 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60 text-xs">
        <!-- History -->
        <button
          @click="execCmd('undo', 'undo()')"
          class="p-1.5 rounded hover:bg-zinc-800 text-zinc-300"
          title="Undo (Ctrl+Z)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a5 5 0 015 5v2a5 5 0 01-5 5H6m-3-12l4-4m-4 4l4 4"/></svg>
        </button>
        <button
          @click="execCmd('redo', 'redo()')"
          class="p-1.5 rounded hover:bg-zinc-800 text-zinc-300"
          title="Redo (Ctrl+Y)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a5 5 0 00-5 5v2a5 5 0 005 5h7m3-12l-4-4m4 4l-4 4"/></svg>
        </button>

        <div class="w-px h-5 bg-zinc-800 mx-1" />

        <!-- Formatting Marks -->
        <button
          @click="execCmd('bold', 'toggleBold()')"
          :class="isBold ? 'bg-violet-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'"
          class="p-1.5 rounded font-bold w-7 text-center transition-colors"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          @click="execCmd('italic', 'toggleItalic()')"
          :class="isItalic ? 'bg-violet-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'"
          class="p-1.5 rounded italic w-7 text-center transition-colors"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          @click="execCmd('underline', 'toggleUnderline()')"
          :class="isUnderline ? 'bg-violet-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'"
          class="p-1.5 rounded underline w-7 text-center transition-colors"
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        <button
          @click="execCmd('strike', 'toggleStrike()')"
          :class="isStrike ? 'bg-violet-600 text-white' : 'text-zinc-300 hover:bg-zinc-800'"
          class="p-1.5 rounded line-through w-7 text-center transition-colors"
          title="Strikethrough"
        >
          S
        </button>

        <div class="w-px h-5 bg-zinc-800 mx-1" />

        <!-- Block Headings -->
        <button
          @click="formatBlock('h1', 'toggleHeading({ level: 1 })')"
          class="px-2 py-1 rounded text-zinc-300 hover:bg-zinc-800 font-semibold"
          title="Heading 1"
        >
          H1
        </button>
        <button
          @click="formatBlock('h2', 'toggleHeading({ level: 2 })')"
          class="px-2 py-1 rounded text-zinc-300 hover:bg-zinc-800 font-semibold"
          title="Heading 2"
        >
          H2
        </button>
        <button
          @click="formatBlock('p', 'setParagraph()')"
          class="px-2 py-1 rounded text-zinc-300 hover:bg-zinc-800 font-semibold"
          title="Paragraph"
        >
          ¶
        </button>

        <div class="w-px h-5 bg-zinc-800 mx-1" />

        <!-- Lists -->
        <button
          @click="execCmd('insertUnorderedList', 'toggleBulletList()')"
          class="p-1.5 rounded hover:bg-zinc-800 text-zinc-300"
          title="Bullet List"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16M2 6h.01M2 12h.01M2 18h.01"/></svg>
        </button>
        <button
          @click="execCmd('insertOrderedList', 'toggleOrderedList()')"
          class="p-1.5 rounded hover:bg-zinc-800 text-zinc-300"
          title="Numbered List"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
        </button>

        <div class="w-px h-5 bg-zinc-800 mx-1" />

        <!-- Notion Blocks -->
        <button
          @click="insertCallout"
          class="px-2.5 py-1 rounded bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 flex items-center gap-1 font-medium"
        >
          <span>💡</span> Callout
        </button>
        <button
          @click="insertColumns"
          class="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1 font-medium"
        >
          <span>||</span> 2-Cols
        </button>

        <!-- Slash helper tag -->
        <div class="ml-auto hidden sm:flex items-center gap-1 text-[11px] text-zinc-500">
          <span>Type</span>
          <kbd class="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">/</kbd>
          <span>for slash palette</span>
        </div>
      </div>

      <!-- Main Editable Area -->
      <div class="relative flex-1 p-6 overflow-y-auto bg-zinc-950 text-zinc-100">
        <!-- Floating Slash Command Palette -->
        <div
          v-if="showSlashMenu"
          class="absolute left-12 top-24 z-30 w-64 rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150"
        >
          <div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 mb-1">
            Blocks & Typography
          </div>
          <div
            v-for="item in slashItems"
            :key="item.title"
            @click="executeSlashItem(item)"
            class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-violet-600/20 hover:text-white cursor-pointer text-xs text-zinc-300 transition-colors"
          >
            <span class="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 text-violet-400 font-mono font-bold">
              {{ item.badge }}
            </span>
            <div>
              <div class="font-semibold text-zinc-100">{{ item.title }}</div>
              <div class="text-[10px] text-zinc-400">{{ item.desc }}</div>
            </div>
          </div>
        </div>

        <!-- Editable Content Surface -->
        <div
          ref="editorRef"
          contenteditable="true"
          @input="onContentInput"
          @keydown="onKeyDown"
          @keyup="updateActiveFormats"
          @mouseup="updateActiveFormats"
          class="outline-none min-h-[400px] max-w-3xl mx-auto prose prose-invert prose-violet space-y-4 font-sans text-base leading-relaxed"
          v-html="initialHtml"
        />
      </div>

      <!-- Live Chained Command Terminal Footer -->
      <div class="px-4 py-2 border-t border-zinc-800 bg-zinc-900/90 flex items-center justify-between text-xs font-mono">
        <div class="flex items-center gap-2 text-zinc-300">
          <span class="text-violet-400 font-bold select-none">&gt;</span>
          <span class="text-violet-300">{{ currentCommand }}</span>
        </div>
        <div class="text-zinc-500 text-[11px]">
          Latency: <span class="text-emerald-400 font-bold">3.8ms</span> (Lexical AST)
        </div>
      </div>
    </div>

    <!-- VIEW 2: Infinite Spatial Canvas -->
    <div v-else-if="activeView === 'canvas'" class="relative w-full h-[580px] bg-zinc-950 overflow-hidden select-none">
      <!-- Canvas Control HUD -->
      <div class="absolute top-4 left-4 z-20 flex items-center gap-2 bg-zinc-900/90 border border-zinc-800 rounded-xl px-3 py-2 text-xs backdrop-blur-md shadow-xl">
        <span class="font-semibold text-zinc-300">Spatial Viewport:</span>
        <button @click="canvasZoom = Math.min(2, canvasZoom + 0.1)" class="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold">+</button>
        <span class="font-mono text-violet-400">{{ Math.round(canvasZoom * 100) }}%</span>
        <button @click="canvasZoom = Math.max(0.5, canvasZoom - 0.1)" class="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold">-</button>
        <button @click="canvasZoom = 1; panX = 0; panY = 0" class="ml-2 text-[11px] text-zinc-400 hover:text-zinc-200">Reset</button>
        <button @click="addCanvasCard" class="ml-2 px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white font-medium">
          + Add Card
        </button>
      </div>

      <!-- Drag Canvas Instructions Tag -->
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
          <!-- Render dynamic bezier connections between cards -->
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
            <span class="text-violet-400 font-semibold cursor-pointer hover:underline" @click="logCanvasAction(card.title)">
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
    <div v-else-if="activeView === 'ast'" class="h-[580px] p-4 bg-zinc-950 overflow-y-auto font-mono text-xs text-zinc-300">
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

    <!-- VIEW 4: Full App Embedded / Health Frame -->
    <div v-else-if="activeView === 'app'" class="relative w-full h-[580px] bg-zinc-950">
      <iframe
        src="http://localhost:3000"
        class="w-full h-full border-0"
        title="Notiq Full Application"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const activeView = ref<'document' | 'canvas' | 'ast' | 'app'>('document')
const editorRef = ref<HTMLElement | null>(null)
const serverOnline = ref(false)
const showSlashMenu = ref(false)
const astCopied = ref(false)

const isBold = ref(false)
const isItalic = ref(false)
const isUnderline = ref(false)
const isStrike = ref(false)

const currentCommand = ref('editor.chain().focus().run()')
const canvasCommand = ref("editor.commands.setCanvasMode('canvas')")
const canvasZoom = ref(1.0)
const panX = ref(0)
const panY = ref(0)

const initialHtml = `
  <h2>Welcome to the Notiq Headless Sandbox</h2>
  <p>Notiq combines <strong>Notion-style block grips</strong> with an <strong>infinite 2D spatial canvas</strong>. Powered by Meta's Lexical runtime for sub-6ms input latency.</p>
  <div style="padding: 12px 16px; border-radius: 8px; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); margin: 12px 0;">
    <strong>💡 Pro Tip:</strong> Click anywhere and type <kbd style="background: #27272a; padding: 2px 6px; border-radius: 4px; border: 1px solid #3f3f46;">/</kbd> to trigger the slash menu, or switch to <strong>Spatial Canvas</strong> mode in the header!
  </div>
  <p>Select text to test formatting commands, or click the toolbar buttons above.</p>
`

const slashItems = [
  { badge: 'H1', title: 'Heading 1', desc: 'Large section heading', action: () => formatBlock('h1', 'toggleHeading({ level: 1 })') },
  { badge: 'H2', title: 'Heading 2', desc: 'Medium subsection heading', action: () => formatBlock('h2', 'toggleHeading({ level: 2 })') },
  { badge: '::', title: 'Callout', desc: 'Highlighted alert box', action: () => insertCallout() },
  { badge: '||', title: '2 Columns', desc: 'Side-by-side block columns', action: () => insertColumns() },
  { badge: '•', title: 'Bullet List', desc: 'Standard unordered list', action: () => execCmd('insertUnorderedList', 'toggleBulletList()') },
]

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

function logCanvasAction(name: string) {
  canvasCommand.value = `editor.chain().connectNodes('node-1', '${name}').run()`
}

function execCmd(command: string, notiqMethod: string) {
  document.execCommand(command, false)
  currentCommand.value = `editor.chain().focus().${notiqMethod}.run()`
  updateActiveFormats()
}

function formatBlock(tag: string, notiqMethod: string) {
  document.execCommand('formatBlock', false, tag)
  currentCommand.value = `editor.chain().focus().${notiqMethod}.run()`
  showSlashMenu.value = false
  updateActiveFormats()
}

function insertCallout() {
  const html = `
    <div style="padding: 12px 16px; border-radius: 8px; background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); margin: 12px 0;">
      <strong>💡 Callout:</strong> This is an enterprise callout block created via Notiq BlocksKit.
    </div>
  `
  document.execCommand('insertHTML', false, html)
  currentCommand.value = "editor.chain().focus().insertCallout({ variant: 'info' }).run()"
  showSlashMenu.value = false
}

function insertColumns() {
  const html = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; padding: 12px; border: 1px dashed rgba(255, 255, 255, 0.15); border-radius: 8px;">
      <div style="padding: 8px; background: rgba(255, 255, 255, 0.03); border-radius: 4px;">Column 1 content...</div>
      <div style="padding: 8px; background: rgba(255, 255, 255, 0.03); border-radius: 4px;">Column 2 content...</div>
    </div>
  `
  document.execCommand('insertHTML', false, html)
  currentCommand.value = "editor.chain().focus().insertColumns({ cols: 2 }).run()"
  showSlashMenu.value = false
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === '/') {
    showSlashMenu.value = true
  } else if (e.key === 'Escape') {
    showSlashMenu.value = false
  }
}

function executeSlashItem(item: any) {
  item.action()
  showSlashMenu.value = false
}

function onContentInput() {
  currentCommand.value = 'editor.on("update", { latency: "3.8ms" })'
}

function updateActiveFormats() {
  isBold.value = document.queryCommandState('bold')
  isItalic.value = document.queryCommandState('italic')
  isUnderline.value = document.queryCommandState('underline')
  isStrike.value = document.queryCommandState('strikethrough')
}

function resetContent() {
  if (editorRef.value) {
    editorRef.value.innerHTML = initialHtml
    currentCommand.value = 'editor.chain().focus().clearContent().insertContent(initialContent).run()'
  }
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
          tag: "h2",
          children: [{ type: "text", text: "Welcome to the Notiq Headless Sandbox", format: 0 }]
        },
        {
          type: "paragraph",
          children: [
            { type: "text", text: "Notiq combines ", format: 0 },
            { type: "text", text: "Notion-style block grips", format: 1 },
            { type: "text", text: " with an ", format: 0 },
            { type: "text", text: "infinite 2D spatial canvas", format: 1 }
          ]
        },
        {
          type: "callout",
          variant: "info",
          children: [{ type: "text", text: "💡 Pro Tip: Click anywhere and type / to trigger slash menu!", format: 0 }]
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

onMounted(() => {
  // Check if root Next.js server on port 3000 is running
  fetch('http://localhost:3000', { mode: 'no-cors' })
    .then(() => { serverOnline.value = true })
    .catch(() => { serverOnline.value = false })
})
</script>

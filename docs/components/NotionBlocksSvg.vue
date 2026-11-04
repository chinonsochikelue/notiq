<template>
  <div class="relative w-full h-80 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center p-3">
    <svg width="100%" height="100%" viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <filter id="shadow-drag" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#8b5cf6" flood-opacity="0.3" />
        </filter>
      </defs>

      <!-- Background Editor Window Mockup -->
      <rect x="20" y="15" width="500" height="250" rx="12" fill="#121214" stroke="#27272a" stroke-width="1.5" />

      <!-- Window Titlebar -->
      <circle cx="42" cy="35" r="4" fill="#ef4444" />
      <circle cx="56" cy="35" r="4" fill="#eab308" />
      <circle cx="70" cy="35" r="4" fill="#22c55e" />
      <text x="90" y="38" fill="#71717a" font-size="10" font-family="monospace">document-editor.notiq</text>

      <!-- Block 1: Regular Paragraph -->
      <g transform="translate(60, 60)">
        <!-- 6-Dot Grip Handle -->
        <g fill="#71717a" class="hover:fill-violet-400 cursor-grab">
          <circle cx="0" cy="4" r="1.5" />
          <circle cx="4" cy="4" r="1.5" />
          <circle cx="0" cy="9" r="1.5" />
          <circle cx="4" cy="9" r="1.5" />
          <circle cx="0" cy="14" r="1.5" />
          <circle cx="4" cy="14" r="1.5" />
        </g>
        <rect x="18" y="2" width="140" height="10" rx="4" fill="#e4e4e7" />
        <rect x="165" y="2" width="220" height="10" rx="4" fill="#52525b" />
      </g>

      <!-- Insertion Line Indicator for Drag & Drop -->
      <line x1="60" y1="92" x2="480" y2="92" stroke="#06b6d4" stroke-width="2.5" />
      <circle cx="60" cy="92" r="4" fill="#06b6d4" />

      <!-- Block 2: Being Dragged (Floating with Shadow) -->
      <g transform="translate(75, 105)" filter="url(#shadow-drag)">
        <rect width="400" height="42" rx="8" fill="#1e1b4b" stroke="#8b5cf6" stroke-width="1.5" />
        <!-- Drag Handle Icon -->
        <g fill="#c084fc">
          <circle cx="10" cy="16" r="1.5" />
          <circle cx="14" cy="16" r="1.5" />
          <circle cx="10" cy="21" r="1.5" />
          <circle cx="14" cy="21" r="1.5" />
          <circle cx="10" cy="26" r="1.5" />
          <circle cx="14" cy="26" r="1.5" />
        </g>
        <rect x="28" y="12" width="70" height="8" rx="4" fill="#a855f7" />
        <rect x="105" y="12" width="200" height="8" rx="4" fill="#94a3b8" />
        <rect x="28" y="24" width="240" height="6" rx="3" fill="#64748b" />
      </g>

      <!-- Floating Slash Command Palette -->
      <g transform="translate(240, 140)">
        <rect width="180" height="115" rx="8" fill="#09090b" stroke="#3f3f46" stroke-width="1.5" />
        <rect x="10" y="8" width="80" height="6" rx="3" fill="#a1a1aa" />
        
        <!-- Palette Item 1 (Selected) -->
        <rect x="6" y="20" width="168" height="24" rx="6" fill="#8b5cf6" fill-opacity="0.25" stroke="#a855f7" stroke-width="1" />
        <text x="14" y="36" fill="#c084fc" font-size="10" font-family="monospace">H1</text>
        <text x="36" y="35" fill="#f4f4f5" font-size="9" font-family="sans-serif" font-weight="bold">Heading 1</text>

        <!-- Palette Item 2 -->
        <text x="14" y="58" fill="#71717a" font-size="10" font-family="monospace">::</text>
        <text x="36" y="58" fill="#a1a1aa" font-size="9" font-family="sans-serif">Callout Box</text>

        <!-- Palette Item 3 -->
        <text x="14" y="80" fill="#71717a" font-size="10" font-family="monospace">||</text>
        <text x="36" y="80" fill="#a1a1aa" font-size="9" font-family="sans-serif">2-Columns Layout</text>

        <!-- Palette Item 4 -->
        <text x="14" y="102" fill="#71717a" font-size="10" font-family="monospace">&gt;</text>
        <text x="36" y="102" fill="#a1a1aa" font-size="9" font-family="sans-serif">Toggle List</text>
      </g>
    </svg>
  </div>
</template>

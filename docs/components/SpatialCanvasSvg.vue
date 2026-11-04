<template>
  <div class="relative w-full h-80 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center p-2">
    <!-- Grid pattern background -->
    <svg width="100%" height="100%" viewBox="0 0 600 320" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <pattern id="spatial-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="#3f3f46" />
        </pattern>
        <linearGradient id="neon-cyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#06b6d4" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
        <linearGradient id="neon-violet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#a855f7" />
          <stop offset="100%" stop-color="#ec4899" />
        </linearGradient>
      </defs>

      <!-- Background Dot Grid -->
      <rect width="100%" height="100%" fill="url(#spatial-grid)" />

      <!-- Coordinate Grid Axes -->
      <line x1="50" y1="0" x2="50" y2="320" stroke="#27272a" stroke-width="1" stroke-dasharray="2 2" />
      <line x1="0" y1="260" x2="600" y2="260" stroke="#27272a" stroke-width="1" stroke-dasharray="2 2" />
      <text x="56" y="275" fill="#52525b" font-size="10" font-family="monospace">(0, 0)</text>

      <!-- Connection Bezier Cable 1 -->
      <path
        d="M210 120 C 270 120, 290 190, 350 190"
        stroke="url(#neon-cyan)"
        stroke-width="2"
        stroke-dasharray="5 3"
        fill="none"
      />
      <!-- Connection Bezier Cable 2 -->
      <path
        d="M210 140 C 270 140, 280 70, 370 70"
        stroke="url(#neon-violet)"
        stroke-width="2"
        fill="none"
      />

      <!-- Node Card 1 (Root Document Node) -->
      <g transform="translate(60, 60)">
        <rect width="150" height="120" rx="10" fill="#18181b" stroke="#8b5cf6" stroke-width="1.5" />
        <rect x="12" y="14" width="80" height="8" rx="4" fill="#c084fc" />
        <rect x="12" y="28" width="125" height="4" rx="2" fill="#52525b" />
        <rect x="12" y="38" width="110" height="4" rx="2" fill="#3f3f46" />
        <rect x="12" y="48" width="120" height="4" rx="2" fill="#3f3f46" />
        
        <!-- Nested Mini Block -->
        <rect x="12" y="62" width="126" height="34" rx="6" fill="#09090b" stroke="#27272a" />
        <rect x="20" y="70" width="40" height="6" rx="3" fill="#a1a1aa" />
        <rect x="20" y="82" width="90" height="4" rx="2" fill="#52525b" />

        <!-- Output Port Dot -->
        <circle cx="150" cy="60" r="5" fill="#8b5cf6" stroke="#09090b" stroke-width="2" />
      </g>

      <!-- Node Card 2 (Branch Right Top) -->
      <g transform="translate(370, 30)">
        <rect width="160" height="90" rx="10" fill="#18181b" stroke="#ec4899" stroke-width="1.5" />
        <rect x="12" y="14" width="60" height="8" rx="4" fill="#f472b6" />
        <rect x="12" y="30" width="130" height="4" rx="2" fill="#52525b" />
        <rect x="12" y="40" width="100" height="4" rx="2" fill="#3f3f46" />
        <rect x="12" y="56" width="55" height="18" rx="4" fill="#be185d" fill-opacity="0.3" stroke="#ec4899" stroke-width="1" />
        <text x="18" y="68" fill="#fbcfe8" font-size="9" font-family="sans-serif" font-weight="bold">#IdeaBoard</text>
        <!-- Input Port Dot -->
        <circle cx="0" cy="40" r="5" fill="#ec4899" stroke="#09090b" stroke-width="2" />
      </g>

      <!-- Node Card 3 (Branch Right Bottom) -->
      <g transform="translate(350, 150)">
        <rect width="180" height="110" rx="10" fill="#18181b" stroke="#06b6d4" stroke-width="1.5" />
        <rect x="12" y="14" width="70" height="8" rx="4" fill="#38bdf8" />
        <rect x="12" y="30" width="150" height="4" rx="2" fill="#52525b" />
        <rect x="12" y="40" width="135" height="4" rx="2" fill="#3f3f46" />
        <!-- Code block mockup inside card -->
        <rect x="12" y="54" width="156" height="42" rx="6" fill="#09090b" stroke="#27272a" />
        <text x="20" y="70" fill="#38bdf8" font-size="8" font-family="monospace">const canvas = useCanvas()</text>
        <text x="20" y="84" fill="#a1a1aa" font-size="8" font-family="monospace">canvas.connect(nodeA, nodeB)</text>
        <!-- Input Port Dot -->
        <circle cx="0" cy="40" r="5" fill="#06b6d4" stroke="#09090b" stroke-width="2" />
      </g>

      <!-- Floating Canvas HUD Controls Overlay -->
      <g transform="translate(20, 260)">
        <rect width="130" height="34" rx="8" fill="#09090b" fill-opacity="0.9" stroke="#27272a" stroke-width="1" />
        <text x="12" y="21" fill="#a1a1aa" font-size="11" font-family="sans-serif">Zoom: 100%</text>
        <circle cx="95" cy="17" r="8" fill="#27272a" />
        <text x="91" y="21" fill="#fff" font-size="12" font-family="sans-serif">+</text>
        <circle cx="115" cy="17" r="8" fill="#27272a" />
        <text x="112" y="21" fill="#fff" font-size="12" font-family="sans-serif">-</text>
      </g>

      <!-- Minimap Radar Overlay -->
      <g transform="translate(510, 230)">
        <rect width="70" height="70" rx="8" fill="#09090b" fill-opacity="0.85" stroke="#3f3f46" stroke-width="1" />
        <rect x="5" y="5" width="20" height="15" fill="#8b5cf6" fill-opacity="0.6" rx="2" />
        <rect x="42" y="2" width="22" height="12" fill="#ec4899" fill-opacity="0.6" rx="2" />
        <rect x="38" y="25" width="25" height="18" fill="#06b6d4" fill-opacity="0.6" rx="2" />
        <!-- Viewport rect -->
        <rect x="3" y="1" width="64" height="48" rx="2" fill="none" stroke="#e4e4e7" stroke-width="1" stroke-dasharray="2 1" />
        <text x="14" y="62" fill="#71717a" font-size="7" font-family="monospace">MINIMAP</text>
      </g>
    </svg>
  </div>
</template>

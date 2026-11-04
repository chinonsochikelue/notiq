<template>
  <div class="relative w-full py-8 flex items-center justify-center overflow-hidden">
    <!-- Ambient radial glow behind the SVG -->
    <div class="absolute w-72 h-72 rounded-full bg-violet-600/20 blur-3xl -z-10 pointer-events-none" />

    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="w-full max-w-sm h-auto floating-canvas drop-shadow-2xl"
    >
      <defs>
        <linearGradient id="notiq-grad-1" x1="20" y1="20" x2="280" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#8b5cf6" />
          <stop offset="50%" stop-color="#a855f7" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>

        <linearGradient id="card-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e1b4b" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9" />
        </linearGradient>

        <linearGradient id="line-glow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#a855f7" />
          <stop offset="100%" stop-color="#06b6d4" />
        </linearGradient>

        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Isometric 3D Document Plane 1 (Base) -->
      <g class="transform-gpu transition-transform duration-500 hover:translate-y-[-4px]">
        <path
          d="M60 130 L160 180 L260 130 L160 80 Z"
          fill="url(#card-glass)"
          stroke="#4c1d95"
          stroke-width="1.5"
          stroke-dasharray="4 4"
        />
        <!-- Grid lines on base -->
        <path d="M110 105 L210 155 M85 142.5 L185 92.5 M135 167.5 L235 117.5" stroke="#312e81" stroke-width="1" />
      </g>

      <!-- Isometric Document Plane 2 (Floating Canvas Card) -->
      <g class="transform-gpu transition-transform duration-700 hover:translate-y-[-8px]">
        <rect
          x="75"
          y="40"
          width="170"
          height="110"
          rx="12"
          fill="url(#card-glass)"
          stroke="url(#notiq-grad-1)"
          stroke-width="2"
        />

        <!-- Document Card Header -->
        <circle cx="95" cy="56" r="4" fill="#ef4444" />
        <circle cx="107" cy="56" r="4" fill="#eab308" />
        <circle cx="119" cy="56" r="4" fill="#22c55e" />

        <!-- Title Block -->
        <rect x="95" y="70" width="75" height="8" rx="4" fill="#c084fc" />
        <rect x="175" y="70" width="45" height="8" rx="4" fill="#818cf8" />

        <!-- Content Lines -->
        <rect x="95" y="86" width="130" height="5" rx="2.5" fill="#64748b" />
        <rect x="95" y="97" width="115" height="5" rx="2.5" fill="#475569" />
        <rect x="95" y="108" width="90" height="5" rx="2.5" fill="#475569" />

        <!-- Glowing Block Tag -->
        <rect x="95" y="122" width="42" height="16" rx="4" fill="#7c3aed" fill-opacity="0.3" stroke="#a855f7" stroke-width="1" />
        <text x="102" y="133" font-size="8" font-family="sans-serif" font-weight="bold" fill="#e9d5ff">Notiq</text>
      </g>

      <!-- Connecting Node Line -->
      <path
        d="M230 75 C 270 75, 270 140, 210 145"
        stroke="url(#line-glow)"
        stroke-width="2.5"
        fill="none"
        stroke-linecap="round"
      />
      <!-- Glowing pulse dot on curve -->
      <circle cx="265" cy="110" r="4" fill="#38bdf8" filter="url(#glow)">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
      </circle>

      <!-- Satellite Mini Card -->
      <g>
        <rect x="200" y="130" width="60" height="42" rx="6" fill="#09090b" stroke="#06b6d4" stroke-width="1.5" />
        <circle cx="212" cy="142" r="3" fill="#06b6d4" />
        <rect x="220" y="140" width="30" height="4" rx="2" fill="#94a3b8" />
        <rect x="210" y="152" width="40" height="3" rx="1.5" fill="#475569" />
        <rect x="210" y="159" width="25" height="3" rx="1.5" fill="#334155" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.floating-canvas {
  animation: floatAnim 4s ease-in-out infinite alternate;
}

@keyframes floatAnim {
  0% {
    transform: translateY(0px);
  }
  100% {
    transform: translateY(-8px);
  }
}
</style>

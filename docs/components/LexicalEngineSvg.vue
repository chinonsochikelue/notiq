<template>
  <div class="relative w-full h-80 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center p-3">
    <svg width="100%" height="100%" viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <linearGradient id="speed-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#06b6d4" />
        </linearGradient>
      </defs>

      <!-- Outer Frame -->
      <rect x="25" y="15" width="490" height="250" rx="12" fill="#09090b" stroke="#27272a" stroke-width="1.5" />

      <!-- Top Title Bar -->
      <g transform="translate(45, 32)">
        <text x="0" y="10" fill="#e4e4e7" font-size="11" font-family="sans-serif" font-weight="bold">Lexical Double-Buffered Reconciliation Engine</text>
        <rect x="340" y="-4" width="115" height="20" rx="10" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="1" />
        <text x="350" y="10" fill="#34d399" font-size="9" font-family="monospace">&lt; 6ms Latency</text>
      </g>

      <line x1="25" y1="50" x2="515" y2="50" stroke="#27272a" stroke-width="1" />

      <!-- Tree 1: Active Immutable AST Tree -->
      <g transform="translate(50, 70)">
        <rect width="180" height="110" rx="8" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" />
        <text x="14" y="22" fill="#a1a1aa" font-size="10" font-family="monospace">Active AST State (Immutable)</text>
        
        <!-- Root node -->
        <circle cx="90" cy="42" r="10" fill="#27272a" stroke="#8b5cf6" stroke-width="2" />
        <text x="86" y="45" fill="#c084fc" font-size="8">R</text>

        <!-- Child nodes -->
        <line x1="84" y1="50" x2="55" y2="72" stroke="#3f3f46" stroke-width="1.5" />
        <line x1="96" y1="50" x2="125" y2="72" stroke="#3f3f46" stroke-width="1.5" />
        
        <circle cx="55" cy="76" r="8" fill="#27272a" stroke="#52525b" stroke-width="1.5" />
        <circle cx="125" cy="76" r="8" fill="#27272a" stroke="#52525b" stroke-width="1.5" />
        
        <circle cx="40" cy="98" r="6" fill="#18181b" stroke="#3f3f46" />
        <circle cx="70" cy="98" r="6" fill="#18181b" stroke="#3f3f46" />
      </g>

      <!-- Center Flow Arrow / Reconciliation Pipeline -->
      <g transform="translate(245, 110)">
        <path d="M0 15 L35 15 M25 7 L35 15 L25 23" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <text x="-6" y="4" fill="#a855f7" font-size="8" font-family="monospace">Dirty Diff</text>
      </g>

      <!-- Tree 2: Work-in-Progress Shadow Tree with Dirty Node -->
      <g transform="translate(295, 70)">
        <rect width="195" height="110" rx="8" fill="#18181b" stroke="#8b5cf6" stroke-width="1.5" />
        <text x="14" y="22" fill="#c084fc" font-size="10" font-family="monospace">Work-In-Progress State</text>

        <!-- Root node -->
        <circle cx="97" cy="42" r="10" fill="#27272a" stroke="#8b5cf6" stroke-width="2" />

        <line x1="91" y1="50" x2="62" y2="72" stroke="#3f3f46" stroke-width="1.5" />
        <line x1="103" y1="50" x2="132" y2="72" stroke="#10b981" stroke-width="2" />
        
        <circle cx="62" cy="76" r="8" fill="#27272a" stroke="#52525b" stroke-width="1.5" />
        <!-- Dirty Mutated Node (Glowing Green) -->
        <circle cx="132" cy="76" r="9" fill="#065f46" stroke="#10b981" stroke-width="2.5" />
        <text x="127" y="79" fill="#6ee7b7" font-size="8" font-weight="bold">+A</text>
        
        <circle cx="47" cy="98" r="6" fill="#18181b" stroke="#3f3f46" />
        <circle cx="77" cy="98" r="6" fill="#18181b" stroke="#3f3f46" />
      </g>

      <!-- Benchmark Bar Comparisons at Bottom -->
      <g transform="translate(50, 195)">
        <text x="0" y="16" fill="#a1a1aa" font-size="10" font-family="sans-serif">Typing Re-render Time (10,000 words)</text>
        
        <!-- Notiq Bar -->
        <g transform="translate(0, 24)">
          <text x="0" y="11" fill="#c084fc" font-size="9" font-family="sans-serif" font-weight="bold">Notiq (Lexical)</text>
          <rect x="100" y="2" width="60" height="12" rx="4" fill="url(#speed-gradient)" />
          <text x="168" y="11" fill="#34d399" font-size="9" font-family="monospace">5.6ms</text>
        </g>

        <!-- Tiptap Bar -->
        <g transform="translate(0, 44)">
          <text x="0" y="11" fill="#71717a" font-size="9" font-family="sans-serif">Tiptap (ProseMirror)</text>
          <rect x="100" y="2" width="240" height="12" rx="4" fill="#3f3f46" />
          <text x="348" y="11" fill="#a1a1aa" font-size="9" font-family="monospace">24.1ms</text>
        </g>
      </g>
    </svg>
  </div>
</template>

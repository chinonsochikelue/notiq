<template>
  <div class="relative w-full h-80 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center p-3">
    <svg width="100%" height="100%" viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <defs>
        <linearGradient id="ai-glow-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#8b5cf6" />
          <stop offset="50%" stop-color="#ec4899" />
          <stop offset="100%" stop-color="#06b6d4" />
        </linearGradient>

        <linearGradient id="stream-text" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#e9d5ff" />
          <stop offset="80%" stop-color="#a855f7" />
          <stop offset="100%" stop-color="#38bdf8" />
        </linearGradient>
      </defs>

      <!-- Editor Background Frame -->
      <rect x="25" y="15" width="490" height="250" rx="12" fill="#0f0f12" stroke="#27272a" stroke-width="1.5" />

      <!-- Previous Text Line -->
      <g transform="translate(50, 45)">
        <rect x="0" y="0" width="380" height="8" rx="4" fill="#71717a" />
      </g>

      <!-- Glowing AI Prompt Modal Bar -->
      <g transform="translate(50, 70)">
        <rect width="440" height="42" rx="8" fill="#18181b" stroke="url(#ai-glow-beam)" stroke-width="2" />
        <circle cx="20" cy="21" r="8" fill="#8b5cf6" fill-opacity="0.3" />
        <!-- Sparkle Icon -->
        <path d="M20 16 L21 19 L24 20 L21 21 L20 24 L19 21 L16 20 L19 19 Z" fill="#c084fc" />
        <text x="36" y="25" fill="#e4e4e7" font-size="11" font-family="sans-serif">Ask AI: "Elaborate on the advantages of double-buffered Lexical AST..."</text>
        
        <!-- Enter submit badge -->
        <rect x="385" y="12" width="42" height="18" rx="4" fill="#27272a" />
        <text x="393" y="24" fill="#a1a1aa" font-size="9" font-family="monospace">↵ Enter</text>
      </g>

      <!-- Streaming Text Block with Token Wave Animation -->
      <g transform="translate(50, 130)">
        <rect width="440" height="75" rx="8" fill="#1e1b4b" fill-opacity="0.4" stroke="#6d28d9" stroke-width="1" stroke-dasharray="4 2" />
        
        <!-- Stream Line 1 -->
        <rect x="16" y="16" width="390" height="8" rx="4" fill="url(#stream-text)" />
        <!-- Stream Line 2 -->
        <rect x="16" y="32" width="340" height="8" rx="4" fill="url(#stream-text)" />
        <!-- Stream Line 3 with Blinking Cursor -->
        <rect x="16" y="48" width="220" height="8" rx="4" fill="url(#stream-text)" />
        <rect x="242" y="46" width="3" height="12" fill="#38bdf8">
          <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite" />
        </rect>
      </g>

      <!-- AI Actions Pill Row -->
      <g transform="translate(50, 220)">
        <!-- Pill 1 -->
        <rect width="80" height="24" rx="12" fill="#27272a" stroke="#3f3f46" stroke-width="1" />
        <text x="10" y="16" fill="#a1a1aa" font-size="9" font-family="sans-serif">✨ Expand</text>

        <!-- Pill 2 -->
        <rect x="90" width="85" height="24" rx="12" fill="#27272a" stroke="#3f3f46" stroke-width="1" />
        <text x="100" y="16" fill="#a1a1aa" font-size="9" font-family="sans-serif">📝 Summarize</text>

        <!-- Pill 3 -->
        <rect x="185" width="85" height="24" rx="12" fill="#27272a" stroke="#3f3f46" stroke-width="1" />
        <text x="195" y="16" fill="#a1a1aa" font-size="9" font-family="sans-serif">⚡ Fix Grammar</text>

        <!-- Pill 4: Accept Button -->
        <rect x="330" width="70" height="24" rx="6" fill="#16a34a" />
        <text x="342" y="16" fill="#fff" font-size="9" font-family="sans-serif" font-weight="bold">Accept</text>

        <!-- Pill 5: Discard Button -->
        <rect x="408" width="70" height="24" rx="6" fill="#27272a" stroke="#52525b" stroke-width="1" />
        <text x="424" y="16" fill="#a1a1aa" font-size="9" font-family="sans-serif">Discard</text>
      </g>
    </svg>
  </div>
</template>

<template>
  <div class="relative w-full h-80 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center p-3">
    <svg width="100%" height="100%" viewBox="0 0 540 280" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      <!-- Editor Paper Sheet -->
      <rect x="25" y="15" width="490" height="250" rx="10" fill="#18181b" stroke="#27272a" stroke-width="1.5" />

      <!-- Top Toolbar with Presence Avatars -->
      <g transform="translate(45, 30)">
        <text x="0" y="12" fill="#a1a1aa" font-size="11" font-family="sans-serif" font-weight="bold">Collaborative Canvas Session</text>
        <circle cx="210" cy="8" r="4" fill="#22c55e" />
        <text x="220" y="12" fill="#22c55e" font-size="10" font-family="sans-serif">Synced (Yjs)</text>
        
        <!-- Collaborator Avatars Stack -->
        <g transform="translate(370, -2)">
          <circle cx="0" cy="10" r="12" fill="#8b5cf6" stroke="#18181b" stroke-width="2" />
          <text x="-4" y="14" fill="#fff" font-size="10" font-weight="bold">A</text>
          
          <circle cx="18" cy="10" r="12" fill="#10b981" stroke="#18181b" stroke-width="2" />
          <text x="14" y="14" fill="#fff" font-size="10" font-weight="bold">S</text>
          
          <circle cx="36" cy="10" r="12" fill="#f59e0b" stroke="#18181b" stroke-width="2" />
          <text x="32" y="14" fill="#fff" font-size="10" font-weight="bold">E</text>

          <circle cx="56" cy="10" r="10" fill="#27272a" stroke="#18181b" stroke-width="2" />
          <text x="50" y="13" fill="#a1a1aa" font-size="9">+4</text>
        </g>
      </g>

      <line x1="25" y1="55" x2="515" y2="55" stroke="#27272a" stroke-width="1" />

      <!-- Document Content Line 1 (Heading) -->
      <g transform="translate(45, 80)">
        <rect x="0" y="0" width="180" height="12" rx="4" fill="#f4f4f5" />
      </g>

      <!-- Document Content Line 2 with User A (Purple) Selection -->
      <g transform="translate(45, 110)">
        <rect x="0" y="0" width="90" height="8" rx="4" fill="#71717a" />
        <!-- Remote Selection Range -->
        <rect x="95" y="-2" width="140" height="14" rx="3" fill="#8b5cf6" fill-opacity="0.3" />
        <rect x="98" y="0" width="134" height="8" rx="4" fill="#c084fc" />
        
        <!-- Caret Line User A -->
        <line x1="235" y1="-4" x2="235" y2="16" stroke="#a855f7" stroke-width="2.5" />
        <!-- Name Tag Badge -->
        <g transform="translate(235, -20)">
          <rect width="45" height="16" rx="4" fill="#8b5cf6" />
          <text x="6" y="12" fill="#fff" font-size="9" font-family="sans-serif" font-weight="bold">Alex</text>
        </g>

        <rect x="245" y="0" width="180" height="8" rx="4" fill="#71717a" />
      </g>

      <!-- Document Content Line 3 with User B (Emerald) Cursor -->
      <g transform="translate(45, 150)">
        <rect x="0" y="0" width="220" height="8" rx="4" fill="#71717a" />
        
        <!-- Caret Line User B -->
        <line x1="225" y1="-4" x2="225" y2="16" stroke="#10b981" stroke-width="2.5" />
        <!-- Name Tag Badge -->
        <g transform="translate(225, -20)">
          <rect width="48" height="16" rx="4" fill="#10b981" />
          <text x="6" y="12" fill="#fff" font-size="9" font-family="sans-serif" font-weight="bold">Sarah</text>
        </g>

        <rect x="235" y="0" width="160" height="8" rx="4" fill="#71717a" />
      </g>

      <!-- Callout Block with User C (Amber) typing -->
      <g transform="translate(45, 190)">
        <rect width="450" height="50" rx="8" fill="#1c1917" stroke="#d97706" stroke-width="1.5" />
        <text x="16" y="30" font-size="16">⚡</text>
        <rect x="42" y="16" width="110" height="8" rx="4" fill="#fde68a" />
        <rect x="42" y="28" width="210" height="6" rx="3" fill="#a8a29e" />
        
        <!-- Caret User C -->
        <line x1="258" y1="24" x2="258" y2="38" stroke="#f59e0b" stroke-width="2" />
        <g transform="translate(258, 8)">
          <rect width="44" height="15" rx="3" fill="#f59e0b" />
          <text x="5" y="11" fill="#fff" font-size="8" font-family="sans-serif" font-weight="bold">Elena</text>
        </g>
      </g>
    </svg>
  </div>
</template>

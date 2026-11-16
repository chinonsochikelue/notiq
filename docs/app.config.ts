export default defineAppConfig({
  seo: {
    title: 'Notiq',
    titleTemplate: '%s — Notiq Docs',
    description: 'High-performance headless block editor, AI copilot, and infinite spatial canvas framework built on Lexical.',
    schema: {
      type: 'SoftwareApplication',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'Web',
      price: 0,
      priceCurrency: 'USD',
      sameAs: [
        'https://github.com/chinonsochikelue/notiq',
        'https://www.npmjs.com/package/@collabchron/notiq',
        'https://playground.collabchron.com.ng',
        'https://x.com/notiq_editor',
      ],
      organization: {
        name: 'CollabChron',
        url: 'https://www.collabchron.com.ng',
        logo: 'https://www.collabchron.com.ng/logo.png',
      },
    },
  },
  search: {
    fts: true,
  },
  header: {
    title: 'Notiq',
    showLinkIcon: true,
    fluid: true,
  },
  socials: {
    x: 'https://x.com/notiq_editor',
    discord: 'https://discord.gg/notiq',
    github: 'https://github.com/chinonsochikelue/notiq',
  },
  github: {
    url: 'https://github.com/chinonsochikelue/notiq',
    branch: 'main',
    rootDir: 'docs',
  },
  assistant: {
    floatingInput: true,
    explainWithAi: true,
    shortcuts: {
      focusInput: 'meta_i',
    },
    icons: {
      trigger: 'i-lucide-sparkles',
      explain: 'i-lucide-brain',
    },
    faqQuestions: [
      {
        category: 'Getting Started',
        items: [
          'How do I install Notiq in React / Next.js?',
          'How do I set up a basic editor with StarterKit?',
          'How is Notiq different from Tiptap and ProseMirror?',
        ],
      },
      {
        category: 'Core Architecture',
        items: [
          'How do chained commands like editor.chain().focus().toggleBold().run() work?',
          'Why does double-buffered Lexical AST state prevent DOM corruption?',
          'How do I write a custom extension with Extension.create()?',
        ],
      },
      {
        category: 'Advanced Features',
        items: [
          'How do I enable 6-dot block grips, slash command palette, and columns?',
          'How do I activate the 2D infinite spatial canvas with pan and zoom?',
          'How do I configure multiplayer real-time collaboration with Yjs?',
        ],
      },
    ],
  },
  toc: {
    title: 'On this page',
    bottom: {
      title: 'Community',
      links: [
        {
          icon: 'i-lucide-play',
          label: 'Interactive Playground',
          to: '/docs/playground',
        },
        {
          icon: 'i-lucide-git-branch',
          label: 'GitHub Repository',
          to: 'https://github.com/chinonsochikelue/notiq',
          target: '_blank',
        },
        {
          icon: 'i-lucide-scale',
          label: 'Notiq vs Tiptap',
          to: '/docs/comparisons/notiq-vs-tiptap',
        },
        {
          icon: 'i-lucide-message-square',
          label: 'Discord Community',
          to: 'https://discord.gg/notiq',
          target: '_blank',
        },
      ],
    },
  },
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'zinc',
    },
    pageHero: {
      slots: {
        title: 'font-extrabold sm:text-6xl tracking-tight',
        container: '!pb-0',
      },
    },
    pageCard: {
      slots: {
        container: 'lg:flex min-w-0',
        wrapper: 'flex-none',
      },
    },
    contentSurround: {
      slots: {
        root: 'grid grid-cols-1 sm:grid-cols-2 gap-4 my-8',
        link: 'group relative block p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/90 hover:border-emerald-500/50 transition-all duration-200 shadow-sm hover:shadow-emerald-950/20 hover:shadow-lg',
        linkLeading: 'mb-3 inline-flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition-colors',
        linkLeadingIcon: 'w-4 h-4',
        linkTitle: 'font-semibold text-zinc-100 group-hover:text-emerald-400 transition-colors text-sm',
        linkDescription: 'text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed',
      },
    },
  },
})

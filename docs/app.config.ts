export default defineAppConfig({
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
  },
})

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
    github: 'https://github.com/chinonsochikelue/notiq',
  },
  github: {
    rootDir: 'docs',
  },
  toc: {
    bottom: {
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
      primary: 'violet',
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

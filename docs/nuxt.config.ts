export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['./node_modules/docus/modules/assistant'],
  devtools: { enabled: true },
  css: ['~/app.css'],
  docus: {
    assistant: {
      enabled: true,
    },
  },
  site: {
    name: 'Notiq',
  },
  mdc: {
    highlight: {
      shikiEngine: 'javascript',
    },
  },
  compatibilityDate: '2025-07-18',
  app: {
    head: {
      title: 'Notiq — Next-Gen Headless Rich Text & Spatial Canvas Framework',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      meta: [
        { name: 'description', content: 'High-performance headless block editor and infinite spatial canvas framework built on Lexical runtime.' },
        { property: 'og:image', content: '/og-image.jpg' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: '/og-image.jpg' },
      ],
    },
  },
})

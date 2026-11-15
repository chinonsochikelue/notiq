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
    url: 'https://www.collabchron.com.ng',
    description: 'High-performance headless block editor, AI copilot, and infinite spatial canvas framework built on Lexical.',
  },
  llms: {
    domain: 'https://www.collabchron.com.ng',
  },
  routeRules: {
    '/docs': { redirect: { to: '/docs/introduction', statusCode: 301 } },
    '/docs/': { redirect: { to: '/docs/introduction', statusCode: 301 } },
    '/docs/getting-started/quickstart': { redirect: { to: '/docs/installation', statusCode: 301 } },
    '/docs/getting-started/architecture': { redirect: { to: '/docs/core-concepts/architecture', statusCode: 301 } },
    '/docs/headless-framework/core-concepts': { redirect: { to: '/docs/core-concepts/core-concepts', statusCode: 301 } },
    '/docs/headless-framework/chained-commands': { redirect: { to: '/docs/core-concepts/chained-commands', statusCode: 301 } },
    '/docs/headless-framework/extensions': { redirect: { to: '/docs/core-concepts/extensions', statusCode: 301 } },
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
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Notiq' },
        { property: 'og:url', content: 'https://www.collabchron.com.ng/' },
        { property: 'og:image', content: 'https://www.collabchron.com.ng/og-image.jpg' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: 'https://www.collabchron.com.ng/og-image.jpg' },
      ],
    },
  },
})

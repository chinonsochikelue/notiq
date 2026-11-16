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
    defaultLocale: 'en',
  },
  robots: {
    sitemap: 'https://www.collabchron.com.ng/sitemap.xml',
    groups: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
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
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icons/icon-192.png' },
        { rel: 'apple-touch-icon', sizes: '192x192', href: '/icons/icon-192.png' },
        { rel: 'manifest', href: '/manifest.json' },
      ],
      meta: [
        { name: 'theme-color', content: '#10b981' },
        { name: 'author', content: 'Chinonso Chikelue (fluantiX)' },
        {
          name: 'keywords',
          content: 'Notiq, Lexical, React rich text editor, headless editor, Notion-style editor, spatial canvas, Excalidraw, Yjs collaboration, AI copilot, TypeScript, Next.js',
        },
        { property: 'og:locale', content: 'en_US' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@notiq_editor' },
        { name: 'twitter:creator', content: '@notiq_editor' },
      ],
    },
  },
})

# Notiq Documentation (`www.collabchron.com.ng`)

Official documentation site for [**Notiq**](https://www.collabchron.com.ng) — the Next-Gen Headless Rich Text & Spatial Canvas Framework built on Meta's Lexical runtime.

- **Live Docs**: [https://www.collabchron.com.ng](https://www.collabchron.com.ng)
- **Live Playground**: [https://playground.collabchron.com.ng](https://playground.collabchron.com.ng)
- **npm Package**: [`@collabchron/notiq`](https://www.npmjs.com/package/@collabchron/notiq)

## Stack

- **Nuxt 4** + **Docus** (`docus`)
- **@nuxt/content** (Markdown / MDC documentation in `content/docs/`)
- **Shiki v4** (`shikiEngine: 'javascript'`)

## Local Development

Install dependencies from the **repository root** (`docs` is part of the `pnpm` workspace):

```bash
pnpm install
```

Start the docs dev server on port `3001`:

```bash
cd docs
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001).

## Production Build

```bash
cd docs
npm run build
```

## Deployment (Vercel)

- Set **Root Directory** to `docs` in Vercel Project Settings.
- [`docs/vercel.json`](./vercel.json) configures `"framework": "nuxtjs"` and `"buildCommand": "nuxt build"`.
- Domain & LLMs SEO configuration lives in [`docs/nuxt.config.ts`](./nuxt.config.ts) (`site.url` and `llms.domain` set to `https://www.collabchron.com.ng`).

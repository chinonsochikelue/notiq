# Notiq

A modern, extensible note-taking and document editor built with Next.js, TypeScript, Tailwind CSS, and Lexical. Features include rich text editing, image and media embeds, equations, polls, and more.

## Features

- ⚡️ Fast, responsive editor powered by Lexical
- 🖼️ Image, inline image, and media embeds (YouTube, Twitter, Figma, GIFs)
- 🧮 Equation and math support (KaTeX)
- 📊 Polls, tables, and code blocks
- 🎨 Customizable themes with Tailwind CSS
- 🗂️ Modular plugin architecture
- 🌐 Next.js app with API routes

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- pnpm (or npm/yarn)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm build
```

## Project Structure

- `src/app/` — Next.js app routes and layout
- `src/components/editor/` — Editor core, plugins, nodes, and UI
- `src/components/ui/` — Reusable UI components
- `src/lib/` — Utility libraries (EdgeStore, Pinecone, etc.)
- `public/` — Static assets

## Editor Plugins & Nodes

- **Plugins:** Toolbar, Floating Toolbar, AutoEmbed, Equations, Excalidraw, Inline Images, Polls, Tables, Code Actions, Slash Commands, etc.
- **Nodes:** ImageNode, InlineImageNode, EquationNode, ExcalidrawNode, PollNode, etc.

## Customization

- Tailwind CSS config: `tailwind.config.ts`
- ESLint config: `eslint.config.mjs`
- Editor themes: `src/components/editor/themes/`

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/foo`)
3. Commit your changes (`git commit -am 'Add feature'`)
4. Push to the branch (`git push origin feature/foo`)
5. Create a Pull Request

## License

MIT

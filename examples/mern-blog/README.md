# Chronicle — Notiq MERN Stack Blog Example

A production-ready full-stack **MERN** (MongoDB, Express, React 19, Node.js) blog application showcasing the rich-text editing power of [`@collabchron/notiq`](https://www.npmjs.com/package/@collabchron/notiq).

---

## 🌟 Highlights

- **⚡ Zero-Config MongoDB**: Connects to your local MongoDB (`mongodb://localhost:27017/notiq_blog`) if running, or **automatically falls back to an in-memory MongoDB instance** (`mongodb-memory-server`) so anyone can clone and run without installing MongoDB or Docker.
- **✍️ Powered by `@collabchron/notiq@1.1.11`**:
  - Full-featured WYSIWYG studio with floating formatting bars and slash commands (`/`).
  - Native syntax highlighting for code blocks.
  - Multi-column and multi-row tables with action menus.
  - Mathematical LaTeX equations.
  - Callout hint boxes, checklists, collapsibles, and media embeddings.
- **⚡ Fast Dual-State Storage**:
  - Saves the structured **Lexical JSON document tree** for lossless interactive re-editing and reading via `<Editor isEditable={false} />`.
  - Automatically exports static **HTML** and **Markdown** strings for fast previews, SEO, RSS, and word count calculation.
- **🎨 Modern Design**:
  - Vite + React 19 + Tailwind CSS.
  - Fluid dark mode and light mode with persistent theme preference.
  - Tag filtering, full-text search, and pagination.
  - Dedicated **Studio Editor** (`/new`, `/edit/:id`) and **Manage Dashboard** (`/manage`).
- **🌱 Instant Demo Seeding**: Single click "Seed Samples" button populates 3 rich articles demonstrating code blocks, LaTeX equations, dynamic blocks, and formatted tables.

---

## 🏗️ Project Architecture

```
examples/mern-blog/
├── package.json              # Root orchestration scripts
├── server/                   # Backend Express + Mongoose API
│   ├── src/
│   │   ├── db.ts             # MongoDB connection with auto in-memory fallback
│   │   ├── index.ts          # Express entrypoint on port 5000
│   │   ├── models/
│   │   │   └── Post.ts       # Mongoose Post model with Lexical JSON & reading time
│   │   └── routes/
│   │       └── posts.ts      # REST endpoints (CRUD + seed)
│   ├── package.json
│   └── tsconfig.json
└── client/                   # Frontend React 19 + Vite + Tailwind application
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx    # Header with navigation & dark mode toggle
    │   │   └── PostCard.tsx  # Article card preview
    │   ├── pages/
    │   │   ├── Home.tsx      # Public feed, search, and tag filters
    │   │   ├── PostDetail.tsx# Article reader powered by <Editor isEditable={false} />
    │   │   ├── EditorPage.tsx# Post studio using <NotiqEditor />
    │   │   └── ManagePosts.tsx# Admin dashboard for drafts and publishing
    │   ├── App.tsx           # Route layout
    │   ├── main.tsx          # App mount
    │   └── index.css         # Tailwind & Notiq styling
    ├── vite.config.ts        # Vite proxy for /api -> http://localhost:5000
    └── package.json
```

---

## 🚀 Quick Start

### 1. Install Dependencies

From `examples/mern-blog`:

```bash
# Install root, server, and client dependencies:
npm run install:all
```

Or individually:

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Run the Application

Start both backend and frontend concurrently:

```bash
npm run dev
```

Or run them in separate terminals:

```bash
# Terminal 1 - Backend API (Port 5000)
cd server
npm run dev

# Terminal 2 - Frontend App (Port 5173)
cd client
npm run dev
```

### 3. Open Chronicle in Your Browser

Visit [**http://localhost:5173**](http://localhost:5173).

- Click **"Seed Samples"** on the home page to immediately load demo articles showcasing Notiq features.
- Click **"Write"** in the top navigation to create a new post using the Notiq editor.
- Click **"Manage"** to toggle publication state or delete posts.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/posts` | List published posts with `search`, `tag`, `page`, `limit` |
| `GET` | `/api/posts/all` | List all posts (including drafts) for management |
| `GET` | `/api/posts/:identifier` | Fetch single post by slug or MongoDB ObjectId |
| `POST` | `/api/posts` | Create a new post |
| `PUT` | `/api/posts/:id` | Update an existing post |
| `DELETE` | `/api/posts/:id` | Delete a post |
| `POST` | `/api/posts/seed` | Seed initial demo articles |

---

## 🧩 Notiq Integration Details

### Creating and Editing Posts with `<NotiqEditor />`

```tsx
import { NotiqEditor } from "@collabchron/notiq/react";
import "@collabchron/notiq/styles.css";

export function EditorPage() {
  const [content, setContent] = useState(initialContent);

  return (
    <NotiqEditor
      content={content}
      editable={true}
      showToolbar={true}
      placeholder="Start typing your story or type '/' for commands..."
      onUpdate={({ json, html, markdown }) => {
        // Save the rich Lexical tree + HTML + Markdown
        setPostData({ content: json, html, markdown });
      }}
    />
  );
}
```

### Rendering Published Posts with `<Editor />` (Read-Only)

```tsx
import { Editor } from "@collabchron/notiq";
import "@collabchron/notiq/styles.css";

export function PostDetailPage({ post }) {
  return (
    <div className="notiq-reader">
      <Editor
        content={post.content}
        isEditable={false}
        showCollaboratorsBar={false}
      />
    </div>
  );
}
```

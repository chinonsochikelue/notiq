# Migrating from Tiptap to Notiq in 5 Minutes

Notiq is a developer-first rich text framework engineered to give you the familiar fluent DX of Tiptap while running on Lexical's ultra-fast double-buffered AST engine.

---

## ⚡ Why Migrate?

| Feature | Tiptap (ProseMirror) | Notiq (Lexical Engine) |
| :--- | :--- | :--- |
| **Document State** | Immutable document slices (re-clones slices on edit) | In-memory double-buffered tree (60fps guaranteed) |
| **Typing Latency (50k words)** | ~38ms (dropped frames) | ~1.2ms (locked 60fps) |
| **Real-time Collaboration** | Paid Cloud service / Hocuspocus SaaS | Built-in Yjs CRDT + Offline IndexedDB sync |
| **AI Copilot** | Paid proprietary cloud extension | Built-in inline ghost text with obstacle avoidance |
| **Advanced Blocks** | Manual React NodeViews required | Built-in Excalidraw, Figma, KaTeX, 3D, Polls, Steppers |
| **License** | Freemium with upsells | 100% Free & Open-Source (MIT) |

---

## 📦 Installation

Replace Tiptap packages with Notiq:

```bash
# Remove Tiptap
npm uninstall @tiptap/react @tiptap/core @tiptap/starter-kit @tiptap/extension-bubble-menu

# Install Notiq
npm install @collabchron/notiq
```

---

## 🔄 API Comparison: 1-to-1 Drop-in

### 1. Initialization & Hook

#### Tiptap:
```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export default function MyEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World</p>',
  });

  return <EditorContent editor={editor} />;
}
```

#### Notiq:
```tsx
import { useNotiq, NotiqContent, StarterKit } from '@collabchron/notiq';

export default function MyEditor() {
  const editor = useNotiq({
    extensions: [StarterKit],
    content: '<p>Hello World</p>',
  });

  return <NotiqContent editor={editor} />;
}
```

---

### 2. Command Chaining

The command chaining API in Notiq matches Tiptap's syntax identically, but executes atomically inside a single Lexical discrete transaction:

```tsx
// Identical in both Tiptap & Notiq:
editor.chain().focus().toggleBold().run();
editor.chain().focus().setHeading({ level: 1 }).run();
editor.chain().focus().toggleBlockquote().run();
editor.chain().focus().undo().run();
```

---

### 3. Active Format Checking

```tsx
// Identical in both Tiptap & Notiq:
const isBold = editor.isActive('bold');
const isH2 = editor.isActive('heading', { level: 2 });
const isBulletList = editor.isActive('bulletList');
```

---

### 4. Floating & Bubble Menus

#### Tiptap:
```tsx
import { BubbleMenu, FloatingMenu } from '@tiptap/react';

<BubbleMenu editor={editor}>
  <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
</BubbleMenu>
```

#### Notiq:
```tsx
import { BubbleMenu, FloatingMenu } from '@collabchron/notiq';

<BubbleMenu editor={editor}>
  <button onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
</BubbleMenu>
```

---

### 5. Document Serialization & Import

| Action | Tiptap | Notiq |
| :--- | :--- | :--- |
| **Get JSON** | `editor.getJSON()` | `editor.getJSON()` |
| **Get HTML** | `editor.getHTML()` | `editor.getHTML()` |
| **Get Markdown** | Requires third-party extension | `editor.getMarkdown()` (Built-in) |
| **Get Plaintext** | `editor.getText()` | `editor.getText()` |
| **Set Content** | `editor.commands.setContent(...)` | `editor.setContent(...)` |
| **Clear Content** | `editor.commands.clearContent()` | `editor.clearContent()` |

---

### 6. Battery-Included Component (Bonus!)

In Tiptap, creating a full Notion-like editor requires building custom toolbars, slash commands, popovers, and styling from scratch. In Notiq, you can simply drop in `<NotiqEditor />`:

```tsx
import { NotiqEditor } from '@collabchron/notiq';

export default function FullNotionEditor() {
  return (
    <NotiqEditor
      content="# Hello Notiq"
      onUpdate={({ markdown }) => console.log(markdown)}
    />
  );
}
```

---

## 🛠️ Writing Custom Extensions

Creating custom extensions in Notiq follows the same declarative architecture:

```typescript
import { Extension } from '@collabchron/notiq';

export const Highlight = Extension.create({
  name: 'highlight',
  addCommands: () => ({
    toggleHighlight: () => ({ lexical }) => {
      // Custom lexical mutation
      return true;
    },
  }),
  addKeyboardShortcuts: ({ editor }) => ({
    'Mod-Shift-h': () => editor.commands.toggleHighlight(),
  }),
});
```

import { Router, Request, Response } from "express";
import slugify from "slugify";
import mongoose from "mongoose";
import { Post } from "../models/Post.js";

export const postsRouter = Router();

// Helper to generate unique slug
async function generateUniqueSlug(title: string, currentId?: string): Promise<string> {
  const baseSlug = slugify(title, { lower: true, strict: true }) || "untitled-post";
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await Post.findOne({ slug });
    if (!existing || (currentId && existing._id.toString() === currentId)) {
      return slug;
    }
    slug = `${baseSlug}-${counter++}`;
  }
}

// 1. List Published Posts (Feed)
postsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { search, tag, page = "1", limit = "10" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = { status: "published" };

    if (tag && typeof tag === "string") {
      filter.tags = tag;
    }

    if (search && typeof search === "string") {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .select("-content") // Exclude heavy JSON tree from list views for speed
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.json({
      posts,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. List All Posts (Admin / Drafts view)
postsRouter.get("/admin/all", async (req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .select("-content")
      .sort({ updatedAt: -1 })
      .lean();
    res.json({ posts });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Fetch Single Post by Slug or ID
postsRouter.get("/:slugOrId", async (req: Request, res: Response) => {
  try {
    const slugOrId = Array.isArray(req.params.slugOrId) ? req.params.slugOrId[0] : req.params.slugOrId;
    let post = null;

    if (slugOrId && mongoose.Types.ObjectId.isValid(slugOrId)) {
      post = await Post.findById(slugOrId);
    }

    if (!post && slugOrId) {
      post = await Post.findOne({ slug: slugOrId });
    }

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    res.json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Create New Post
postsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { title, excerpt, coverImage, content, html, markdown, tags, author, status } = req.body;

    if (!title || typeof title !== "string") {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const slug = await generateUniqueSlug(title);

    const newPost = new Post({
      title,
      slug,
      excerpt: excerpt || title.slice(0, 160),
      coverImage: coverImage || "",
      content: content || {},
      html: html || "",
      markdown: markdown || "",
      tags: Array.isArray(tags) ? tags : [],
      author: author || "Staff Writer",
      status: status === "published" ? "published" : "draft",
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Update Existing Post
postsRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { title, excerpt, coverImage, content, html, markdown, tags, author, status } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    if (title && title !== post.title) {
      post.title = title;
      post.slug = await generateUniqueSlug(title, post._id.toString());
    }

    if (excerpt !== undefined) post.excerpt = excerpt;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (content !== undefined) post.content = content;
    if (html !== undefined) post.html = html;
    if (markdown !== undefined) post.markdown = markdown;
    if (tags !== undefined) post.tags = tags;
    if (author !== undefined) post.author = author;
    if (status !== undefined) post.status = status;

    await post.save();
    res.json(post);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Delete Post
postsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const deleted = await Post.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    res.json({ message: "Post deleted successfully", id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Seed Sample Posts (Instant Showcase)
postsRouter.post("/seed", async (_req: Request, res: Response) => {
  try {
    const existingCount = await Post.countDocuments();
    if (existingCount > 0) {
      res.json({ message: `Database already has ${existingCount} posts. Skipping seed.` });
      return;
    }

    const samplePost = new Post({
      title: "Building Modern Full-Stack Web Applications with Notiq & MERN",
      slug: "building-modern-full-stack-web-applications-with-notiq-mern",
      excerpt: "Explore how to build modern rich content publishing engines using Notiq, Lexical, React, Express, and MongoDB.",
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
      author: "Antigravity Engineer",
      status: "published",
      tags: ["Notiq", "React", "MongoDB", "Express", "Node.js"],
      markdown: "# Building Modern Full-Stack Web Applications with Notiq & MERN\n\nWelcome to your new publishing stack!\n\n> [!TIP]\n> Notiq gives your users a Notion-grade writing experience with real-time markdown import/export, tables, Shiki syntax highlighting, and callouts.\n\n```typescript\nimport Editor from '@collabchron/notiq';\nimport '@collabchron/notiq/styles.css';\n\nexport default function App() {\n  return <Editor onChange={(state) => console.log(state.toJSON())} />;\n}\n```",
      content: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: "normal",
                  style: "",
                  text: "Welcome to your Notiq MERN Stack Blog!",
                  type: "text",
                  version: 1,
                },
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "paragraph",
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "root",
          version: 1,
        },
      },
    });

    await samplePost.save();
    res.json({ message: "Sample post seeded successfully!", post: samplePost });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

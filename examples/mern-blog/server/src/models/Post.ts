import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  // Serialized Lexical editor state (JSON tree)
  content: Record<string, any>;
  // Exported HTML for fast server / static rendering
  html?: string;
  // Exported plain markdown
  markdown?: string;
  tags: string[];
  author: string;
  status: "draft" | "published";
  readingTimeMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
    },
    content: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    html: {
      type: String,
      default: "",
    },
    markdown: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    author: {
      type: String,
      default: "Anonymous",
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    readingTimeMinutes: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate reading time before saving
PostSchema.pre("save", function (next) {
  if (this.markdown) {
    const words = this.markdown.trim().split(/\s+/).length;
    this.readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  }
  next();
});

export const Post = mongoose.model<IPost>("Post", PostSchema);

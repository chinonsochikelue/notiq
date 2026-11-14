import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import { postsRouter } from "./routes/posts.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend clients
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Body parsers with generous limits for rich documents & embedded assets
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "notiq-mern-blog-api",
    timestamp: new Date().toISOString(),
  });
});

// Post routes
app.use("/api/posts", postsRouter);

// Start server after database connection
async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Server] Notiq MERN Backend running on http://localhost:${PORT}`);
      console.log(`[Server] API endpoint: http://localhost:${PORT}/api/posts`);
    });
  } catch (error: any) {
    console.error("[Server] Fatal error starting server:", error.message);
    process.exit(1);
  }
}

start();

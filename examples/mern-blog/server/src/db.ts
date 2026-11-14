import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod: MongoMemoryServer | null = null;

export async function connectDB(): Promise<string> {
  const customUri = process.env.MONGODB_URI;

  if (customUri) {
    try {
      console.log(`[DB] Connecting to configured MongoDB: ${customUri.replace(/\/\/.*@/, "//***@")}...`);
      await mongoose.connect(customUri, { serverSelectionTimeoutMS: 5000 });
      console.log("[DB] Connected to configured MongoDB successfully.");
      return customUri;
    } catch (err: any) {
      console.warn(`[DB] Could not connect to configured MongoDB (${err.message}). Falling back...`);
    }
  }

  // Attempt local default MongoDB
  const defaultLocalUri = "mongodb://localhost:27017/notiq_blog";
  try {
    console.log("[DB] Attempting local MongoDB on mongodb://localhost:27017/notiq_blog...");
    await mongoose.connect(defaultLocalUri, { serverSelectionTimeoutMS: 2000 });
    console.log("[DB] Connected to local MongoDB.");
    return defaultLocalUri;
  } catch {
    console.log("[DB] Local MongoDB daemon not detected. Starting embedded in-memory MongoDB...");
  }

  // In-memory zero-setup fallback
  try {
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: "notiq_blog",
      },
    });
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[DB] In-memory MongoDB running at: ${memoryUri}`);
    return memoryUri;
  } catch (err: any) {
    console.error("[DB] Failed to initialize in-memory database:", err.message);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}

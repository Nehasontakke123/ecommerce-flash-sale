import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!env.mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 15000
    });
    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    if (error.code === "ECONNREFUSED" && error.hostname?.includes("_mongodb._tcp")) {
      throw new Error(
        `MongoDB Atlas DNS SRV lookup failed for ${error.hostname}. Check your internet/DNS connection, Atlas network access IP allowlist, or use the non-SRV mongodb:// connection string from Atlas.`
      );
    }

    throw error;
  }
}

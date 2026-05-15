import Redis from "ioredis";
import { env } from "./env.js";

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

export const redisPub = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

export const redisSub = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (error) => console.error("Redis error", error.message));

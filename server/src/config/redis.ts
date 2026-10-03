import IORedis from "ioredis";
import { env } from "./env";

// BullMQ requires maxRetriesPerRequest: null
export const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err.message));
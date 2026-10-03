import { Router } from "express";
import mongoose from "mongoose";
import { redis } from "../config/redis";

const router = Router();

router.get("/", async (_req, res) => {
  let redisStatus = "down";
  try {
    const pong = await redis.ping();
    redisStatus = pong === "PONG" ? "up" : "down";
  } catch {
    redisStatus = "down";
  }

  const mongoStatus = mongoose.connection.readyState === 1 ? "up" : "down";
  const healthy = mongoStatus === "up" && redisStatus === "up";

  res.status(healthy ? 200 : 503).json({
    success: healthy,
    service: "outreach-pulse-api",
    mongo: mongoStatus,
    redis: redisStatus,
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
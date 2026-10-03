import { createApp } from "./app";
import { env } from "./config/env";
import { connectDB, disconnectDB } from "./config/db";
import { redis } from "./config/redis";

async function bootstrap() {
  await connectDB();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 API running on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down...`);
    server.close(async () => {
      await disconnectDB();
      redis.disconnect();
      process.exit(0);
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
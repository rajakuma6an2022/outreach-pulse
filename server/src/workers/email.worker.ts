import { Worker } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import { connectDB, disconnectDB } from "../config/db";
import { redis } from "../config/redis";
import { CadenceEmailJobData, EMAIL_QUEUE_NAME, emailQueue } from "../queues/email.queue";
import { transporter } from "../utils/mail";
import { handleFinalFailure, processCadenceEmail } from "./email.processor";

async function main() {
  await connectDB();

  transporter
    .verify()
    .then(() => console.log("✅ SMTP (Mailtrap) connection OK"))
    .catch((err) => console.error("⚠️  SMTP verify failed:", err.message));

  const worker = new Worker<CadenceEmailJobData, string>(EMAIL_QUEUE_NAME, processCadenceEmail, {
    connection: redis as unknown as ConnectionOptions,
    concurrency: 5,
  });

  worker.on("ready", () => console.log(`👷 Worker listening on queue "${EMAIL_QUEUE_NAME}"`));

  worker.on("completed", (job, result) => {
    console.log(`✅ Job ${job.id} done -> ${result}`);
  });

  worker.on("failed", async (job, err) => {
    if (!job) return;
    console.error(
      `❌ Job ${job.id} failed (attempt ${job.attemptsMade}/${job.opts.attempts ?? 1}): ${err.message}`
    );
    try {
      await handleFinalFailure(job, err);
    } catch (e) {
      console.error("Could not record final failure:", e);
    }
  });

  worker.on("error", (err) => console.error("Worker error:", err.message));

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Closing worker...`);
    await worker.close(); // current job mudiyara varaikkum wait pannum
    await emailQueue.close();
    await disconnectDB();
    redis.disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("❌ Worker failed to start:", err);
  process.exit(1);
});
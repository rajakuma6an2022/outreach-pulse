import { emailQueue } from "../queues/email.queue";

async function main() {
  const counts = await emailQueue.getJobCounts("delayed", "waiting", "active", "completed", "failed");
  console.log("Counts:", counts);

  const jobs = await emailQueue.getJobs(["delayed", "waiting"], 0, 20);
  if (jobs.length === 0) console.log("No pending jobs");

  for (const j of jobs) {
    console.log({
      id: j.id,
      name: j.name,
      data: j.data,
      delayMs: j.opts.delay,
      attempts: j.opts.attempts,
    });
  }

  await emailQueue.close();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
import { Queue } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import { redis } from "../config/redis";

export const EMAIL_QUEUE_NAME = "email-cadence";
export const SEND_CADENCE_EMAIL_JOB = "send-cadence-email";
export const MAX_CADENCE_STEPS = 3;

export interface CadenceEmailJobData {
  enrollmentId: string;
  stepIndex: number;
  workspaceId: string;
}

// bullmq-oda ioredis version vera irundha type mismatch varum, adhukku cast
export const emailQueue = new Queue<CadenceEmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redis as unknown as ConnectionOptions,
});

export function cadenceJobId(enrollmentId: string, stepIndex: number): string {
  return `${enrollmentId}-step-${stepIndex}`;
}

export async function enqueueCadenceEmail(data: CadenceEmailJobData, delayMs: number) {
  return emailQueue.add(SEND_CADENCE_EMAIL_JOB, data, {
    jobId: cadenceJobId(data.enrollmentId, data.stepIndex), // idempotent add
    delay: delayMs,
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 100,
  });
}

// Prospect delete / enrollment cancel aana pending jobs-ah remove pannum
export async function removeEnrollmentJobs(enrollmentId: string): Promise<void> {
  for (let i = 0; i < MAX_CADENCE_STEPS; i++) {
    const job = await emailQueue.getJob(cadenceJobId(enrollmentId, i));
    if (!job) continue;
    try {
      await job.remove();
    } catch {
      // job ippo worker la active-ah irundha remove aagaadhu.
      // Step 7 worker, enrollment illa na skip pannidum.
    }
  }
}
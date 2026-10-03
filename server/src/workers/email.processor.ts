import type { Job } from "bullmq";
import { Types } from "mongoose";
import { Cadence, CadenceDoc } from "../models/Cadence";
import { EmailEvent } from "../models/EmailEvent";
import { Enrollment, EnrollmentDoc } from "../models/Enrollment";
import { Prospect, ProspectDoc } from "../models/Prospect";
import { CadenceEmailJobData, enqueueCadenceEmail } from "../queues/email.queue";
import { sendEmail } from "../utils/mail";
import { renderTemplate } from "../utils/template";

type Step = CadenceDoc["steps"][number];

function isDuplicateKey(err: unknown): boolean {
  return (err as { code?: number })?.code === 11000;
}

export async function processCadenceEmail(job: Job<CadenceEmailJobData>): Promise<string> {
  const { enrollmentId, stepIndex, workspaceId } = job.data;
  const wsId = new Types.ObjectId(workspaceId); // job data la irundhu, aana ellaa query-lum workspace-scoped

  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    workspaceId: wsId,
  }).lean<EnrollmentDoc>();

  // Prospect delete aanaa enrollment poirukkum, so skip
  if (!enrollment) return "skipped:enrollment-missing";
  if (enrollment.status !== "ACTIVE") return "skipped:not-active";
  // Idha already process pannitom (duplicate / late delivery)
  if (enrollment.currentStep > stepIndex) return "skipped:already-advanced";

  const [prospect, cadence] = await Promise.all([
    Prospect.findOne({ _id: enrollment.prospectId, workspaceId: wsId }).lean<ProspectDoc>(),
    Cadence.findOne({ _id: enrollment.cadenceId, workspaceId: wsId }).lean<CadenceDoc>(),
  ]);

  if (!prospect || !cadence) {
    await markFailed(job.data, enrollment.prospectId, "Prospect or cadence no longer exists", 0);
    return "failed:missing-data";
  }

  const steps: Step[] = [...cadence.steps].sort((a, b) => a.order - b.order);
  const step = steps[stepIndex];

  if (!step) {
    await Enrollment.updateOne(
      { _id: enrollmentId, workspaceId: wsId },
      { status: "COMPLETED", nextRunAt: null }
    );
    return "completed:no-such-step";
  }

  // ---------- IDEMPOTENCY CHECK ----------
  const alreadySent = await EmailEvent.exists({
    workspaceId: wsId,
    enrollmentId,
    stepIndex,
    type: "SENT",
  });

  if (!alreadySent) {
    const vars = {
      name: prospect.name,
      firstName: prospect.name.trim().split(/\s+/)[0] ?? prospect.name,
      company: prospect.company ?? "",
      title: prospect.title ?? "",
      email: prospect.email,
    };

    const subject = renderTemplate(step.subject, vars);
    const text = renderTemplate(step.body, vars);

    // Fail aana throw aagum, BullMQ retry pannum (attempts: 3, exponential backoff)
    const { messageId } = await sendEmail({ to: prospect.email, subject, text });
    console.log(`📧 Sent step ${stepIndex + 1}/${steps.length} to ${prospect.email}`);

    try {
      await EmailEvent.create({
        enrollmentId,
        prospectId: prospect._id,
        stepIndex,
        type: "SENT",
        meta: { messageId, subject, to: prospect.email },
        workspaceId: wsId,
      });
    } catch (err) {
      // unique index block pannuchu = vera worker already SENT ezhudhiruchu. Ignore
      if (!isDuplicateKey(err)) throw err;
    }

    // Mudhal email aana NEW prospect-ah CONTACTED nu maathidu
    await Prospect.updateOne(
      { _id: prospect._id, workspaceId: wsId, status: "NEW" },
      { status: "CONTACTED" }
    );
  }

  // ---------- NEXT STEP SCHEDULE or COMPLETE ----------
  const nextIndex = stepIndex + 1;
  const next = steps[nextIndex];

  if (next) {
    const delayMs = next.delayMinutes * 60 * 1000;

    // Mudhalla enqueue (jobId deterministic, so duplicate aagaadhu), apparam DB update.
    // Idha reverse-ah pannaa, crash aana apparam retry skip aagi next job-e varaadhu.
    await enqueueCadenceEmail({ enrollmentId, stepIndex: nextIndex, workspaceId }, delayMs);

    await Enrollment.updateOne(
      { _id: enrollmentId, workspaceId: wsId, currentStep: { $lt: nextIndex } },
      { currentStep: nextIndex, nextRunAt: new Date(Date.now() + delayMs) }
    );
  } else {
    await Enrollment.updateOne(
      { _id: enrollmentId, workspaceId: wsId, currentStep: { $lt: nextIndex } },
      { currentStep: nextIndex, status: "COMPLETED", nextRunAt: null }
    );
    console.log(`🏁 Enrollment ${enrollmentId} completed`);
  }

  return alreadySent ? "advanced:already-sent" : "sent";
}

async function markFailed(
  data: CadenceEmailJobData,
  prospectId: Types.ObjectId,
  reason: string,
  attempts: number
) {
  const wsId = new Types.ObjectId(data.workspaceId);

  const updated = await Enrollment.findOneAndUpdate(
    { _id: data.enrollmentId, workspaceId: wsId, status: "ACTIVE" },
    { status: "FAILED", nextRunAt: null }
  );
  if (!updated) return; // already failed / deleted

  await EmailEvent.create({
    enrollmentId: data.enrollmentId,
    prospectId,
    stepIndex: data.stepIndex,
    type: "FAILED",
    meta: { error: reason, attempts },
    workspaceId: wsId,
  });
}

// Worker "failed" event la call aagum. Last attempt-um fail aanaa mattum FAILED mark pannum
export async function handleFinalFailure(job: Job<CadenceEmailJobData>, err: Error) {
  const maxAttempts = job.opts.attempts ?? 1;
  if (job.attemptsMade < maxAttempts) return; // innum retry irukku

  const enrollment = await Enrollment.findOne({
    _id: job.data.enrollmentId,
    workspaceId: job.data.workspaceId,
  })
    .select("prospectId")
    .lean<{ prospectId: Types.ObjectId }>();
  if (!enrollment) return;

  await markFailed(job.data, enrollment.prospectId, err.message, job.attemptsMade);
  console.error(`💥 Enrollment ${job.data.enrollmentId} marked FAILED: ${err.message}`);
}
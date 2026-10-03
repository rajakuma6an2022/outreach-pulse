import { Types } from "mongoose";
import { Cadence, CadenceDoc } from "../models/Cadence";
import { Enrollment, EnrollmentDoc } from "../models/Enrollment";
import { Prospect, ProspectDoc } from "../models/Prospect";
import { enqueueCadenceEmail, removeEnrollmentJobs } from "../queues/email.queue";
import { AuthUser } from "../types/express";
import { AppError } from "../utils/error";
import { CreateEnrollmentInput } from "../validators/enrollment.validator";

function toDTO(e: EnrollmentDoc) {
  return {
    id: e._id.toString(),
    prospectId: e.prospectId.toString(),
    cadenceId: e.cadenceId.toString(),
    currentStep: e.currentStep,
    status: e.status,
    nextRunAt: e.nextRunAt,
    createdAt: e.createdAt,
  };
}

export async function createEnrollment(user: AuthUser, input: CreateEnrollmentInput) {
  const workspaceId = user.workspaceId; // JWT la irundhu

  // Rendume current workspace kulla irukkanum. Vera workspace na 404
  const [prospect, cadence] = await Promise.all([
    Prospect.findOne({ _id: input.prospectId, workspaceId }).select("_id").lean(),
    Cadence.findOne({ _id: input.cadenceId, workspaceId }).lean<CadenceDoc>(),
  ]);
  if (!prospect) throw AppError.notFound("Prospect not found", "PROSPECT_NOT_FOUND");
  if (!cadence) throw AppError.notFound("Cadence not found", "CADENCE_NOT_FOUND");

  const firstStep = [...cadence.steps].sort((a, b) => a.order - b.order)[0];
  const delayMs = firstStep.delayMinutes * 60 * 1000;

  let enrollment;
  try {
    enrollment = await Enrollment.create({
      prospectId: input.prospectId,
      cadenceId: input.cadenceId,
      currentStep: 0,
      status: "ACTIVE",
      nextRunAt: new Date(Date.now() + delayMs),
      workspaceId,
    });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      throw AppError.conflict(
        "This prospect is already enrolled in this cadence",
        "ALREADY_ENROLLED"
      );
    }
    throw err;
  }

  try {
    await enqueueCadenceEmail(
      {
        enrollmentId: enrollment._id.toString(),
        stepIndex: 0,
        workspaceId,
      },
      delayMs
    );
  } catch {
    // Job queue aagala na enrollment-ah rollback pannidu
    await Enrollment.deleteOne({ _id: enrollment._id });
    throw new AppError(
      "Could not schedule the email job. Please try again.",
      503,
      "QUEUE_UNAVAILABLE"
    );
  }

  return toDTO(enrollment.toObject() as EnrollmentDoc);
}

export async function listEnrollments(user: AuthUser) {
  const workspaceId = user.workspaceId;

  const enrollments = await Enrollment.find({ workspaceId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean<EnrollmentDoc[]>();

  const prospectIds = [...new Set(enrollments.map((e) => e.prospectId.toString()))];
  const cadenceIds = [...new Set(enrollments.map((e) => e.cadenceId.toString()))];

  const [prospects, cadences] = await Promise.all([
    Prospect.find({ _id: { $in: prospectIds }, workspaceId })
      .select("name email")
      .lean<Pick<ProspectDoc, "_id" | "name" | "email">[]>(),
    Cadence.find({ _id: { $in: cadenceIds }, workspaceId })
      .select("name steps")
      .lean<Pick<CadenceDoc, "_id" | "name" | "steps">[]>(),
  ]);

  const prospectMap = new Map(prospects.map((p) => [p._id.toString(), p] as const));
  const cadenceMap = new Map(cadences.map((c) => [c._id.toString(), c] as const));

  return enrollments.map((e) => {
    const p = prospectMap.get(e.prospectId.toString());
    const c = cadenceMap.get(e.cadenceId.toString());
    return {
      id: e._id.toString(),
      prospect: p ? { id: p._id.toString(), name: p.name, email: p.email } : null,
      cadence: c ? { id: c._id.toString(), name: c.name, totalSteps: c.steps.length } : null,
      currentStep: e.currentStep,
      status: e.status,
      nextRunAt: e.nextRunAt,
      createdAt: e.createdAt,
    };
  });
}

// Prospect delete pannum pothu call aagum: queued jobs + enrollments clean
export async function deleteEnrollmentsForProspect(workspaceId: string, prospectId: string) {
  const enrollments = await Enrollment.find({
    workspaceId: new Types.ObjectId(workspaceId),
    prospectId: new Types.ObjectId(prospectId),
  })
    .select("_id")
    .lean<{ _id: Types.ObjectId }[]>();

  if (enrollments.length === 0) return;

  for (const e of enrollments) {
    await removeEnrollmentJobs(e._id.toString());
  }

  await Enrollment.deleteMany({
    _id: { $in: enrollments.map((e) => e._id) },
    workspaceId: new Types.ObjectId(workspaceId),
  });
}
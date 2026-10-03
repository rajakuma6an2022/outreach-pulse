import { connectDB, disconnectDB } from "../config/db";
import { EmailEvent } from "../models/EmailEvent";

async function main() {
  await connectDB();
  const events = await EmailEvent.find().sort({ createdAt: -1 }).limit(20).lean();

  if (events.length === 0) console.log("No email events yet");
  for (const e of events) {
    console.log(
      `${e.createdAt.toISOString()}  ${e.type.padEnd(6)}  step=${e.stepIndex}  enrollment=${e.enrollmentId}  ${JSON.stringify(e.meta)}`
    );
  }
  await disconnectDB();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
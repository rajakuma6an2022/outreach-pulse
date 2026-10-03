import { useState } from "react";
import { useCreateEnrollmentMutation } from "../../services/enrollmentApi";
import { useListProspectsQuery } from "../../services/prospectApi";
import { getErrorMessage } from "../../utils/errors";

interface Props {
  cadenceId: string;
}

export default function EnrollForm({ cadenceId }: Props) {
  const [prospectId, setProspectId] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // Demo ku first 50 prospects. Production la searchable select use pannuvom
  const { data, isLoading } = useListProspectsQuery({ page: 1, limit: 50 });
  const [createEnrollment, { isLoading: enrolling, error }] = useCreateEnrollmentMutation();

  const prospects = data?.items ?? [];

  async function onEnroll() {
    if (!prospectId) return;
    setMessage(null);
    try {
      await createEnrollment({ prospectId, cadenceId }).unwrap();
      setMessage("Enrolled. The first email has been queued.");
      setProspectId("");
    } catch {
      // error UI la kaattrom (already enrolled na 409 message varum)
    }
  }

  return (
    <div className="enroll-box">
      {error && <div className="alert">{getErrorMessage(error)}</div>}
      {message && <div className="alert success">{message}</div>}

      {isLoading ? (
        <span className="muted">Loading prospects...</span>
      ) : prospects.length === 0 ? (
        <span className="muted">No prospects yet. Add some on the Prospects page first.</span>
      ) : (
        <div className="enroll-row">
          <select
            value={prospectId}
            onChange={(e) => {
              setProspectId(e.target.value);
              setMessage(null);
            }}
          >
            <option value="">Select a prospect...</option>
            {prospects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.email})
              </option>
            ))}
          </select>
          <button className="btn" disabled={!prospectId || enrolling} onClick={onEnroll}>
            {enrolling ? "Enrolling..." : "Enroll"}
          </button>
        </div>
      )}
    </div>
  );
}
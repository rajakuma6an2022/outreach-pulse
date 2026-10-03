import { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { useListCadencesQuery } from "../../services/cadenceApi";
import { useListEnrollmentsQuery } from "../../services/enrollmentApi";
import type { Cadence } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import CadenceForm from "./CadenceForm";
import EnrollForm from "./EnrollForm";

function CadenceItem({ cadence }: { cadence: Cadence }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="cadence-item">
      <div className="cadence-title">
        <strong>{cadence.name}</strong>
        <span className="badge">
          {cadence.steps.length} step{cadence.steps.length > 1 ? "s" : ""}
        </span>
        <button
          className="btn ghost"
          style={{ marginLeft: "auto", padding: "5px 12px" }}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "Close" : "Enroll prospect"}
        </button>
      </div>

      <ol className="cadence-steps">
        {cadence.steps.map((s) => (
          <li key={s.order}>
            <span>{s.subject}</span>
            <span className="muted">
              {s.delayMinutes === 0 ? "sent immediately" : `after ${s.delayMinutes} min`}
            </span>
          </li>
        ))}
      </ol>

      {/* open aana pothu mattum prospects query run aagum */}
      {open && <EnrollForm cadenceId={cadence.id} />}
    </div>
  );
}

export default function CadencesPage() {
  const role = useAppSelector((s) => s.auth.user?.role);
  const { data, isLoading, error } = useListCadencesQuery();
  const { data: enrollments, isLoading: enrollmentsLoading } = useListEnrollmentsQuery(undefined, {
    pollingInterval: 5000,
  });

  return (
    <>
      <h1 className="page-title">Cadences</h1>

      {role === "ADMIN" ? (
        <CadenceForm />
      ) : (
        <div className="card" style={{ color: "var(--muted)" }}>
          Only an ADMIN can create cadences. You can view them and enroll prospects below.
        </div>
      )}

      <div className="card">
        <h2>All cadences</h2>

        {error && <div className="alert">{getErrorMessage(error)}</div>}

        {isLoading ? (
          <div className="empty">Loading cadences...</div>
        ) : !data || data.length === 0 ? (
          <div className="empty">No cadences yet.</div>
        ) : (
          data.map((c) => <CadenceItem key={c.id} cadence={c} />)
        )}
      </div>

      <div className="card">
        <h2>Recent enrollments</h2>

        {enrollmentsLoading ? (
          <div className="empty">Loading enrollments...</div>
        ) : !enrollments || enrollments.length === 0 ? (
          <div className="empty">No enrollments yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Prospect</th>
                  <th>Cadence</th>
                  <th>Sent</th>
                  <th>Status</th>
                  <th>Next run</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    <td>
                      {e.prospect ? (
                        <>
                          {e.prospect.name}
                          <div className="muted small">{e.prospect.email}</div>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{e.cadence?.name ?? "-"}</td>
                    <td>
                      {e.currentStep}/{e.cadence?.totalSteps ?? "?"}
                    </td>
                    <td>
                      <span className={`badge ${e.status}`}>{e.status}</span>
                    </td>
                    <td>{e.nextRunAt ? new Date(e.nextRunAt).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
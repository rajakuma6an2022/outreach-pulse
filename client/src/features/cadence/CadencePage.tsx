import { useAppSelector } from "../../app/hooks";
import { useListCadencesQuery } from "../../services/cadenceApi";
import { getErrorMessage } from "../../utils/errors";
import CadenceForm from "./CadenceForm";

export default function CadencesPage() {
  const role = useAppSelector((s) => s.auth.user?.role);
  const { data, isLoading, error } = useListCadencesQuery();

  return (
    <>
      <h1 className="page-title">Cadences</h1>

      {role === "ADMIN" ? (
        <CadenceForm />
      ) : (
        <div className="card" style={{ color: "var(--muted)" }}>
          Only an ADMIN can create cadences. You can view them below.
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
          data.map((c) => (
            <div className="cadence-item" key={c.id}>
              <div className="cadence-title">
                <strong>{c.name}</strong>
                <span className="badge">
                  {c.steps.length} step{c.steps.length > 1 ? "s" : ""}
                </span>
              </div>
              <ol className="cadence-steps">
                {c.steps.map((s) => (
                  <li key={s.order}>
                    <span>{s.subject}</span>
                    <span className="muted">
                      {s.delayMinutes === 0 ? "sent immediately" : `after ${s.delayMinutes} min`}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))
        )}
      </div>
    </>
  );
}
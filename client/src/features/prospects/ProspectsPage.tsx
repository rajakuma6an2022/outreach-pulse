import { useState } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { useDeleteProspectMutation, useListProspectsQuery } from "../../services/prospectApi";
import { PROSPECT_STATUSES } from "../../types";
import type { Prospect, ProspectStatus } from "../../types";
import { getErrorMessage } from "../../utils/errors";
import ProspectForm from "./ProspectsForm";

const LIMIT = 10;

export default function ProspectsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<ProspectStatus | "">("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchInput, 350);

  const { data, isLoading, isFetching, error } = useListProspectsQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    status: status || undefined,
  });

  const [deleteProspect] = useDeleteProspectMutation();

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  async function onDelete(p: Prospect) {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    setDeletingId(p.id);
    setActionError(null);
    try {
      await deleteProspect(p.id).unwrap();
      // last page la oru item delete aanaa previous page ku po
      if (items.length === 1 && page > 1) setPage(page - 1);
    } catch (e) {
      setActionError(getErrorMessage(e));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <h1 className="page-title">Prospects</h1>

      <ProspectForm />

      <div className="card">
        <h2>All prospects</h2>

        <div className="toolbar">
          <input
            placeholder="Search name, email or company..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setPage(1);
            }}
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ProspectStatus | "");
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {PROSPECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="alert">{getErrorMessage(error)}</div>}
        {actionError && <div className="alert">{actionError}</div>}

        {isLoading ? (
          <div className="empty">Loading prospects...</div>
        ) : items.length === 0 ? (
          <div className="empty">No prospects found.</div>
        ) : (
          <div className="table-wrap" style={{ opacity: isFetching ? 0.6 : 1 }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.email}</td>
                    <td>{p.company || "-"}</td>
                    <td>{p.title || "-"}</td>
                    <td>
                      <span className={`badge ${p.status}`}>{p.status}</span>
                    </td>
                    <td>
                      <button
                        className="btn danger"
                        disabled={deletingId === p.id}
                        onClick={() => onDelete(p)}
                      >
                        {deletingId === p.id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && (
          <div className="pager">
            <span>
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
            </span>
            <div className="btns">
              <button
                className="btn ghost"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </button>
              <button
                className="btn ghost"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
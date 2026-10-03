import { useAppSelector } from "../../app/hooks";

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <>
      <h1 className="page-title">Dashboard</h1>
      <div className="card">
        <h2>Hi {user?.name} 👋</h2>
        <p style={{ color: "var(--muted)", margin: 0 }}>
          Email metrics (sent, opened, failed, active enrollments) Step 8 la inga varum.
        </p>
      </div>
    </>
  );
}
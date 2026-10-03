import { NavLink, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import { useLogoutMutation } from "../services/authApi";

export default function AppLayout() {
  const user = useAppSelector((s) => s.auth.user);
  const workspace = useAppSelector((s) => s.auth.workspace);
  const [logout, { isLoading }] = useLogoutMutation();

  return (
    <>
      <header className="topbar">
        <span className="brand">OutreachPulse</span>
        <nav className="nav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
           <NavLink to="/prospects">Prospects</NavLink>
          <NavLink to="/cadences">Cadences</NavLink>
        </nav>
        <div className="userbox">
          <span>
            {user?.name} · {workspace?.name} · {user?.role}
          </span>
          <button className="btn ghost" disabled={isLoading} onClick={() => logout()}>
            Logout
          </button>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
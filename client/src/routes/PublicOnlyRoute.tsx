import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export default function PublicOnlyRoute() {
  const status = useAppSelector((s) => s.auth.status);

  if (status === "unknown") return <div className="center">Loading...</div>;
  if (status === "authenticated") return <Navigate to="/" replace />;
  return <Outlet />;
}
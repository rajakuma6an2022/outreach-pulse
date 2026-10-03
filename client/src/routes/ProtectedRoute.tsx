import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export default function ProtectedRoute() {
  const status = useAppSelector((s) => s.auth.status);

  if (status === "unknown") return <div className="center">Loading...</div>;
  if (status === "guest") return <Navigate to="/login" replace />;
  return <Outlet />;
}
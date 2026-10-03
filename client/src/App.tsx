import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import ProspectsPage from "./features/prospects/ProspectsPage";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import { baseApi } from "./services/api";
import { useGetMeQuery } from "./services/authApi";
import CadencesPage from "./features/cadence/CadencePage";

export default function App() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);

  // App open aagum pothu cookie valid-ah nu check pannum (/api/auth/me)
  useGetMeQuery();

  // Logout / session expire aana RTK Query cache clear pannidu,
  // illana next user-ku munnadi user-oda prospects konjam neram theriyum (tenant leak)
  useEffect(() => {
    if (status === "guest") dispatch(baseApi.util.resetApiState());
  }, [status, dispatch]);

  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="prospects" element={<ProspectsPage />} />
            <Route path="cadences" element={<CadencesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
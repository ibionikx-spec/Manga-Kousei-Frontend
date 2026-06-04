import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { PublicRoute } from "./components/routes/PublicRoute";
import { MainLayout } from "./components/layouts/MainLayout";
import AdminSurvival from "./pages/admin/AdminSurvival";
import MangakaDashboard from "./pages/mangaka/Dashboard";
import { DashboardRedirect } from "./pages/redirect/DashboardRedirect";
import AdminApprovalsPage from "./pages/admin/AdminApprovals";
import AdminMagazines from "./pages/admin/AdminMagazines";
import AdminContracts from "./pages/admin/AdminContracts";
import { Unauthorized } from "./pages/others/Unauthorized";
import { NotFound } from "./pages/others/NotFound";

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="approvals" element={<AdminApprovalsPage />} />
            <Route path="survival" element={<AdminSurvival />} />
            <Route path="magazines" element={<AdminMagazines />} />
            <Route path="contracts" element={<AdminContracts />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["MANGAKA"]} />}>
          <Route path="/mangaka">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MangakaDashboard />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

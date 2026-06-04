import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import AdminDashboard from "./pages/admin/Dashboard";
import { ProtectedRoute } from "./components/Routes/ProtectedRoute";
import { PublicRoute } from "./components/Routes/PublicRoute";
import { MainLayout } from "./components/layouts/MainLayout";
import AdminRating from "./pages/admin/RatingPage";
import MangakaDashboard from "./pages/mangaka/Dashboard";
import { DashboardRedirect } from "./pages/DashboardRedirect";
import AdminApprovalsPage from "./pages/admin/ApprovalsPage";

function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Route>

      <Route path="/dashboard" element={<DashboardRedirect />} />

      <Route element={<MainLayout />}>
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="rating" element={<AdminRating />} />
            <Route path="approvals" element={<AdminApprovalsPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["MANGAKA"]} />}>
          <Route path="/mangaka">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MangakaDashboard />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;

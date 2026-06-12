import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { PublicRoute } from "./components/routes/PublicRoute";
import { MainLayout } from "./components/layouts/MainLayout";
import AdminSurvival from "./pages/admin/AdminSurvival";
import TantouDashboard from "./pages/tantou/TantouDashboard";
import { DashboardRedirect } from "./pages/redirect/DashboardRedirect";
import AdminApprovalsPage from "./pages/admin/AdminApprovals";
import AdminMagazines from "./pages/admin/AdminMagazines";
import AdminContracts from "./pages/admin/AdminContracts";
import { Unauthorized } from "./pages/others/Unauthorized";
import { NotFound } from "./pages/others/NotFound";
import TantouManage from "./pages/tantou/TantouManage";
import TantouApprovals from "./pages/tantou/TantouApprovals";
import TantouSchedule from "./pages/tantou/TantouSchedule";
import TantouReports from "./pages/tantou/TantouReports";
import MangakaDashboard from "./pages/mangaka/MangakaDashboard";
import MangakaSeries from "./pages/mangaka/MangakaSeries";
import MangakaSchedule from "./pages/mangaka/MangakaSchedule";
import MangakaAssistants from "./pages/mangaka/MangakaAssistants";
import MangakaReports from "./pages/mangaka/MangakaReports";
import CreateWork from "./pages/CreateWork/CreateWork";
import ProposalReview from "./pages/tantou/ProposalReview/ProposalReview";

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
        <Route element={<ProtectedRoute allowedRoles={["TANTOU"]} />}>
          <Route path="/tantou">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TantouDashboard />} />
            <Route path="manage" element={<TantouManage />} />
            <Route path="approvals" element={<TantouApprovals />} />
            <Route path="proposal-review" element={<ProposalReview />} />
            <Route
              path="/tantou/proposal-review/:proposalId"
              element={<ProposalReview />}
            />
            <Route path="schedule" element={<TantouSchedule />} />
            <Route path="reports" element={<TantouReports />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["MANGAKA"]} />}>
          <Route path="/mangaka">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MangakaDashboard />} />
            <Route path="series" element={<MangakaSeries />} />
            <Route path="schedule" element={<MangakaSchedule />} />
            <Route path="assistants" element={<MangakaAssistants />} />
            <Route path="reports" element={<MangakaReports />} />
            <Route path="create-work" element={<CreateWork />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

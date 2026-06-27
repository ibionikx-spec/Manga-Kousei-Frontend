import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/login/LoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { PublicRoute } from "./components/routes/PublicRoute";
import { MainLayout } from "./components/layouts/MainLayout";
import TantouDashboard from "./pages/tantou/TantouDashboard";
import { DashboardRedirect } from "./pages/redirect/DashboardRedirect";
import AdminApprovalsPage from "./pages/admin/AdminApprovals";
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
import AssistantDashboard from "./pages/assistant/AssistantDashboard.tsx";
import AssistantResourceWarehouse from "./pages/assistant/AssistantResourceWarehouse.tsx";
import AssistantIncome from "./pages/assistant/AssistantIncome.tsx";
import AssistantMyJob from "./pages/assistant/AssistantMyJob.tsx";
import MangakaSeriesDetail from "./pages/mangaka/MangakaSeriesDetail.tsx";
import Profile from "./pages/profile/Profile.tsx";
import Settings from "./pages/settings/Settings.tsx";
import ActivityHistory from "./pages/activity/ActivityHistory.tsx";
import AdminProposalReview from "./pages/admin/AdminProposalReview.tsx";
import ScheduleAssignment from "./pages/admin/ScheduleAssignment/ScheduleAssignment.tsx";
import MangakaChapters from "./pages/mangaka/MangakaChapters/MangakaChapters.tsx";
import TantouSeriesChapters from "./pages/tantou/TantouSeriesChapters/TantouSeriesChapters.tsx";
import AssistantInvitations from "./pages/assistant/AssistantInvitations/AssistantInvitations.tsx";
import MangakaPageEditor from "./pages/mangaka/MangakaPageEditor/MangakaPageEditor.tsx";
import AssistantTasks from "./pages/assistant/AssistantTasks/AssistantTasks.tsx";
import AdminPersonnel from "./pages/admin/AdminPersonnel.tsx";

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
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN", "TANTOU", "MANGAKA", "ASSISTANT"]}
            />
          }
        >
          <Route path="/profile" element={<Profile />} />
          <Route path="/setting" element={<Settings />} />
          <Route path="/activity-history" element={<ActivityHistory />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route path="/admin">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="approvals" element={<AdminApprovalsPage />} />
            <Route path="contracts" element={<AdminContracts />} />
            <Route path="proposal-review" element={<AdminProposalReview />} />
            <Route
              path="/admin/proposal-review/:proposalId"
              element={<AdminProposalReview />}
            />
            <Route
              path="schedule-assignment/:proposalId"
              element={<ScheduleAssignment />}
            />
            <Route path="personnel" element={<AdminPersonnel />} />
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
            <Route
              path="series/:seriesId/chapters"
              element={<TantouSeriesChapters />}
            />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["MANGAKA"]} />}>
          <Route path="/mangaka">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MangakaDashboard />} />
            <Route path="series" element={<MangakaSeries />} />
            <Route path="series/:id" element={<MangakaSeriesDetail />} />
            <Route path="schedule" element={<MangakaSchedule />} />
            <Route path="assistants" element={<MangakaAssistants />} />
            <Route path="reports" element={<MangakaReports />} />
            <Route path="create-work" element={<CreateWork />} />
            <Route
              path="series/:seriesId/chapters"
              element={<MangakaChapters />}
            />
            <Route
              path="series/:seriesId/chapters/:chapterId/pages"
              element={<MangakaPageEditor />}
            />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["ASSISTANT"]} />}>
          <Route path="/assistant">
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AssistantDashboard />} />
            <Route
              path="recource-warehouse"
              element={<AssistantResourceWarehouse />}
            />
            <Route path="income" element={<AssistantIncome />} />
            <Route path="myjob" element={<AssistantMyJob />} />
            <Route path="invitations" element={<AssistantInvitations />} />
            <Route path="tasks" element={<AssistantTasks />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

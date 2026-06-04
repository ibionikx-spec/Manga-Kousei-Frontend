import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { roleDashboardMap } from "../../constants/rolePaths";
import { Loader2 } from "lucide-react";
import "./DashboardRedirect.scss";

export const DashboardRedirect = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="full-screen-loading">
        <Loader2 className="spinner" size={48} strokeWidth={1.5} />
        <p>Đang kiểm tra phiên đăng nhập...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const dashboardPath = roleDashboardMap[user.role];
  if (!dashboardPath) return <Navigate to="/unauthorized" replace />;

  return <Navigate to={dashboardPath} replace />;
};

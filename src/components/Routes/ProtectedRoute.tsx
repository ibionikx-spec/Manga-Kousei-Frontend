import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { FullScreenLoader } from "../common/FullScreenLoader";

interface ProtectedRouteProps {
  allowedRoles?: ("MANGAKA" | "TANTOU" | "ADMIN" | "ASSISTANT")[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <FullScreenLoader text="Đang kiểm tra quyền truy cập..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

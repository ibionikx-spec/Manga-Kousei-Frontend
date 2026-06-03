import { Navigate, Outlet } from "react-router-dom";

export const PublicRoute = () => {
  const accessToken = sessionStorage.getItem("accessToken");

  return accessToken ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Role } from "../constants/roles";
import { AuthContext } from "../contexts/AuthContext";
import type { AuthContextType } from "../types/auth";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = sessionStorage.getItem("accessToken");

      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode<CustomJwtPayload>(accessToken);
        const isExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : false;

        console.log("isExpried", decoded.exp);

        if (isExpired) {
          const response = await api.post("/auth/refresh", {});
          console.log("data day", response.data);
          const newAccessToken = response.data.data.accessToken;
          const data = jwtDecode(newAccessToken);
          console.log(data);
          sessionStorage.setItem("accessToken", newAccessToken);

          const newData = jwtDecode<CustomJwtPayload>(newAccessToken);
          setUser({
            id: newData.id,
            fullName: newData.fullName,
            email: newData.email,
            role: newData.roles.at(0) ?? "MANGAKA",
          });
        } else {
          setUser({
            id: decoded.id,
            fullName: decoded.fullName,
            email: decoded.email,
            role: decoded.roles.at(0) ?? "MANGAKA",
          });
        }
      } catch (error) {
        console.error("Invalid token:", error);
        setUser(null);
        sessionStorage.removeItem("accessToken");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);
  const login = async (loginPayload: loginPayload) => {
    try {
      const response = await api.post("/auth/login", loginPayload);
      const accessToken = response.data.data.accessToken;

      sessionStorage.setItem("accessToken", accessToken);

      const decoded = jwtDecode<CustomJwtPayload>(accessToken);
      setUser({
        id: decoded.id,
        fullName: decoded.fullName,
        email: decoded.email,
        role: decoded.roles.at(0) ?? "MANGAKA",
      });
    } catch (error) {
      console.error("Login function error in Provider:", error);
      throw error;
    }
  };

  const logout = async () => {
    sessionStorage.removeItem("accessToken");
    setUser(null);

    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("logout function error in Provider:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

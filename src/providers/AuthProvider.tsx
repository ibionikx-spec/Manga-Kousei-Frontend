import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { Role } from "../constants/roles";
import { AuthContext } from "../contexts/AuthContext";
import type { AuthContextType } from "../types/auth";
import api from "../services/api";
import axios from "axios";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
}
const publicRoutes = ["/login", "/"];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (publicRoutes.includes(location.pathname)) return;

        const response = await api.get("/auth/me");

        const { id, fullName, email, roles, avatarUrl } = response.data.data;
        setUser({
          id,
          fullName,
          email,
          role: roles.at(0) ?? "MANGAKA",
          avatarUrl,
        });
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          setUser(null);
        } else {
          console.error("checkAuth error:", error);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);
  const login = async (loginPayload: loginPayload) => {
    try {
      const response = await api.post("/auth/login", loginPayload);

      const { id, fullName, email, roles, avatarUrl } = response.data.data;
      setUser({
        id,
        fullName,
        email,
        role: roles.at(0) ?? "MANGAKA",
        avatarUrl,
      });
    } catch (error) {
      console.error("Login function error in Provider:", error);
      throw error;
    }
  };

  const logout = async () => {
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

import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "./useAuth";
import axios from "axios";

interface Tantou {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  roles: string[];
}

export const useAssignedTantous = () => {
  const { user, isAuthenticated } = useAuth();
  const [tantous, setTantous] = useState<Tantou[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.role?.includes("MANGAKA")) {
      return;
    }

    const controller = new AbortController();

    const fetchAssignedTantous = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/mangaka/assigned-tantous", {
          signal: controller.signal,
        });

        setTantous(response.data.data || []);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError("Không thể tải danh sách Tantou được gán");
        setTantous([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTantous();
    return () => controller.abort();
  }, [isAuthenticated, user?.role]);

  return { tantous, loading, error };
};

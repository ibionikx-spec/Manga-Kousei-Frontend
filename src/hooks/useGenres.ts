import { useEffect, useState } from "react";
import api from "../services/api";
export const useGenres = () => {
  const [genresList, setGenresList] = useState<{ id: number; name: string }[]>(
    [],
  );

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await api.get("/genres");
        if (response.data?.data && Array.isArray(response.data.data)) {
          setGenresList(response.data.data);
        } else {
          setGenresList([]);
        }
      } catch (error) {
        console.error("Không thể tải danh sách thể loại:", error);
      }
    };
    fetchGenres();
  }, []);

  return genresList;
};

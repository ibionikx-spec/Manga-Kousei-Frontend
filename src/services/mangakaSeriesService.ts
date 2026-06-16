import api from "./api";

interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface MangakaSeries {
  seriesId: number;
  title: string;
  description: string;
  coverImageUrl: string | null;
  seriesStatus: string | null;
  tantouName: string | null;
  tantouAvatarUrl: string | null;
  chapterCount: number;
  genres: string[];
  approvedAt: string | null;
  scheduleType: "weekly" | "monthly" | null;
  dayValue: number | null;
}

export const fetchMySeries = async (): Promise<MangakaSeries[]> => {
  return api
    .get<ApiResponse<MangakaSeries[]>>("/mangaka/series")
    .then((res) => res.data.data ?? [])
    .catch(() => []);
};

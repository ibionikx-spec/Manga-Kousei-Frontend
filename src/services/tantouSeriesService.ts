import api from "./api";

interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface TantouSeries {
  seriesId: number;
  title: string;
  coverImageUrl: string | null;
  seriesStatus: string | null;
  mangakaName: string | null;
  mangakaAvatarUrl: string | null;
  chapterCount: number;
  genres: string[];
  approvedAt: string | null;
  scheduleType: "weekly" | "monthly" | null;
  dayValue: number | null;
  totalPageDeadlines: number;
  submittedPageDeadlines: number;
}

export const fetchTantouSeries = async (): Promise<TantouSeries[]> =>
  api
    .get<ApiResponse<TantouSeries[]>>("/tantou/series")
    .then((r) => r.data.data ?? [])
    .catch(() => []);

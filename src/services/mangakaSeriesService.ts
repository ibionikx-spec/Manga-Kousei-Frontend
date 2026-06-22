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

export const fetchSeriesDetail = async (
  seriesId: number,
): Promise<MangakaSeries> =>
  api
    .get<ApiResponse<MangakaSeries>>(`/mangaka/series/${seriesId}`)
    .then((r) => r.data.data);

export const updateSeries = (
  seriesId: number,
  body: {
    title: string;
    description: string;
    coverImageUrl?: string;
    genreIds: number[];
  },
): Promise<MangakaSeries> =>
  api
    .put<ApiResponse<MangakaSeries>>(`/mangaka/series/${seriesId}`, body)
    .then((r) => r.data.data);

export interface GenreOption {
  id: number;
  name: string;
}

export const fetchGenres = (): Promise<GenreOption[]> =>
  api.get<ApiResponse<GenreOption[]>>("/genres").then((r) => r.data.data ?? []);

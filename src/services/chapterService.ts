import api from "./api";

interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface PageDeadline {
  deadlineId: number;
  pageFrom: number;
  pageTo: number;
  dueDate: string;
  status: "pending" | "submitted" | "late";
  submittedAt: string | null;
  setByName: string | null;
}

export interface ChapterRes {
  chapterId: number;
  chapterNumber: number;
  title: string | null;
  chapterStatus: string;
  deadline: string | null;
  createdAt: string;
  pageDeadlines: PageDeadline[];
  totalDeadlines: number;
  submittedDeadlines: number;
}

export const fetchChaptersBySeriesMangaka = (
  seriesId: number,
): Promise<ChapterRes[]> =>
  api
    .get<ApiResponse<ChapterRes[]>>(`/mangaka/series/${seriesId}/chapters`)
    .then((r) => r.data.data ?? []);

export const createChapter = (body: {
  seriesId: number;
  chapterNumber: number;
  title?: string;
}): Promise<ChapterRes> =>
  api
    .post<ApiResponse<ChapterRes>>("/mangaka/chapters", body)
    .then((r) => r.data.data);

export const submitPageGroup = (deadlineId: number): Promise<PageDeadline> =>
  api
    .patch<
      ApiResponse<PageDeadline>
    >(`/mangaka/page-deadlines/${deadlineId}/submit`)
    .then((r) => r.data.data);

export const fetchChaptersBySeriesTantou = (
  seriesId: number,
): Promise<ChapterRes[]> =>
  api
    .get<ApiResponse<ChapterRes[]>>(`/tantou/series/${seriesId}/chapters`)
    .then((r) => r.data.data ?? []);

export const setPageDeadline = (
  chapterId: number,
  body: { pageFrom: number; pageTo: number; dueDate: string },
): Promise<PageDeadline> =>
  api
    .post<
      ApiResponse<PageDeadline>
    >(`/tantou/chapters/${chapterId}/page-deadlines`, body)
    .then((r) => r.data.data);

export const updatePageDeadline = (
  deadlineId: number,
  body: { pageFrom: number; pageTo: number; dueDate: string },
): Promise<PageDeadline> =>
  api
    .put<
      ApiResponse<PageDeadline>
    >(`/tantou/page-deadlines/${deadlineId}`, body)
    .then((r) => r.data.data);

export const deletePageDeadline = (deadlineId: number): Promise<void> =>
  api.delete(`/tantou/page-deadlines/${deadlineId}`);

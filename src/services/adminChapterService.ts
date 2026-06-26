import api from "./api";

interface ApiResponse<T> {
  data: T;
  message: string;
}

export interface AdminPageDeadline {
  deadlineId: number;
  pageFrom: number;
  pageTo: number;
  dueDate: string;
  status: string;
  reviewNote: string | null;
}

export interface AdminChapterRes {
  chapterId: number;
  chapterNumber: number;
  title: string | null;
  chapterStatus: string;
  createdAt: string;
  pageDeadlines: AdminPageDeadline[];
  seriesId: number | null;
  seriesTitle: string | null;
  mangakaName: string | null;
  mangakaAvatarUrl: string | null;
  adminNote: string | null;
}

export interface AdminPageSimple {
  pageNumber: number;
  fileUrl: string;
}

export const fetchPendingPublishChapters = (): Promise<AdminChapterRes[]> =>
  api
    .get<ApiResponse<AdminChapterRes[]>>("/admin/chapters/pending-publish")
    .then((r) => r.data.data ?? []);

export const fetchAdminDeadlinePages = (
  deadlineId: number,
): Promise<AdminPageSimple[]> =>
  api
    .get<
      ApiResponse<{ pageNumber: number; fileUrl: string }[]>
    >(`/admin/page-deadlines/${deadlineId}/pages`)
    .then((r) => r.data.data ?? []);

export const reviewChapterAdmin = (
  chapterId: number,
  body: { decision: "approved" | "revision"; note?: string },
): Promise<AdminChapterRes> =>
  api
    .patch<
      ApiResponse<AdminChapterRes>
    >(`/admin/chapters/${chapterId}/review`, body)
    .then((r) => r.data.data);

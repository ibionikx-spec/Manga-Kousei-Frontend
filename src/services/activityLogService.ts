import api from "./api";

export type LogCategory =
  | "review"
  | "submission"
  | "progress"
  | "proposal"
  | "account"
  | "system";

export interface ActivityLogItem {
  logId: number;
  actionType: string;
  category: LogCategory;
  detail: string;
  entityType: string | null;
  entityId: number | null;
  seriesId: number | null;
  chapterId: number | null;
  userId: number;
  userFullName: string;
  userAvatarUrl: string | null;
  userRole: string;
  createdAt: string; // "dd/MM/yyyy, HH:mm"
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // current page (0-based)
  size: number;
}

/** Lịch sử cá nhân – có phân trang + filter category */
export async function fetchMyLogs(params: {
  category?: LogCategory | "all";
  page?: number;
  size?: number;
}): Promise<PagedResponse<ActivityLogItem>> {
  const { category, page = 0, size = 20 } = params;
  const res = await api.get("/activity-logs/me", {
    params: {
      ...(category && category !== "all" ? { category } : {}),
      page,
      size,
    },
  });
  return res.data.data;
}

/** Widget dashboard – 10 hoạt động gần nhất, không phân trang */
export async function fetchRecentLogs(): Promise<ActivityLogItem[]> {
  const res = await api.get("/activity-logs/me/recent");
  return res.data.data;
}

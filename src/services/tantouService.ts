import api from "./api";

export interface InboxItem {
  itemType: "manuscript" | "proposal";
  id: number;
  seriesTitle: string | null;
  content: string;
  submittedBy: string;
  submittedAt: string;
  status: string;
  statusLabel: string;
}

export interface DeadlineItem {
  id: number;
  label: string; // "QUÁ HẠN", "ĐẾN HẠN", ...
  labelType: string; // "overdue", "due", "soon"
  timeTag: string;
  title: string;
  author: string;
  series: string;
}

export interface ActivityItem {
  id: number;
  done: boolean;
  title: string;
  meta: string;
}

export interface ProgressItem {
  label: string;
  pct: number;
  color: string;
}

export const fetchInbox = () =>
  api
    .get<ApiResponse<InboxItem[]>>("/tantou/inbox")
    .then((res) => {
      const data = res.data.data;

      return Array.isArray(data) ? data : [];
    })
    .catch(() => []);

// export const fetchDeadlines = () =>
//   api.get<DeadlineItem[]>("/tantou/deadlines").then((res) => res.data);

// export const fetchActivities = () =>
//   api.get<ActivityItem[]>("/tantou/activities").then((res) => res.data);

// export const fetchProgress = () =>
//   api.get<ProgressItem[]>("/tantou/progress").then((res) => res.data);

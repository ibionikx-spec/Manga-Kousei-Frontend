import {
  LogIn,
  UserRound,
  KeyRound,
  Settings,
  CheckCircle2,
  XCircle,
  SendHorizonal,
  RefreshCw,
  CalendarClock,
  BookPlus,
  FileText,
  ClipboardCheck,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { LogCategory } from "../../services/activityLogService";

const ACTION_ICON_MAP: Record<string, LucideIcon> = {
  REVIEW_APPROVED: CheckCircle2,
  REVIEW_REVISION: XCircle,
  ADMIN_REVIEW_APPROVED: CheckCircle2,
  ADMIN_REVIEW_REVISION: XCircle,
  SUBMIT_PAGES: SendHorizonal,
  RESUBMIT_PAGES: RefreshCw,
  SUBMIT_CHAPTER_TO_ADMIN: SendHorizonal,
  SUBMIT_TASK: ClipboardCheck,
  RESUBMIT_TASK: RefreshCw,
  CREATE_PAGE_DEADLINE: CalendarClock,
  UPDATE_PAGE_DEADLINE: CalendarClock,
  CREATE_CHAPTER: BookPlus,
  CREATE_PROPOSAL: FileText,
  REVIEW_PROPOSAL: ClipboardCheck,
  APPROVE_SERIES: Star,
  LOGIN: LogIn,
  UPDATE_PROFILE: UserRound,
  CHANGE_PASSWORD: KeyRound,
  UPDATE_SETTINGS: Settings,
};

export function getActionIcon(actionType: string): LucideIcon {
  return ACTION_ICON_MAP[actionType] ?? Settings;
}

const ACTION_LABEL_MAP: Record<string, string> = {
  REVIEW_APPROVED: "Duyệt nhóm trang",
  REVIEW_REVISION: "Yêu cầu sửa",
  ADMIN_REVIEW_APPROVED: "Admin duyệt",
  ADMIN_REVIEW_REVISION: "Admin yêu cầu sửa",
  SUBMIT_PAGES: "Nộp nhóm trang",
  RESUBMIT_PAGES: "Nộp lại nhóm trang",
  SUBMIT_CHAPTER_TO_ADMIN: "Nộp chapter lên Admin",
  SUBMIT_TASK: "Nộp task",
  RESUBMIT_TASK: "Nộp lại task",
  CREATE_PAGE_DEADLINE: "Tạo deadline",
  UPDATE_PAGE_DEADLINE: "Cập nhật deadline",
  CREATE_CHAPTER: "Tạo chapter",
  CREATE_PROPOSAL: "Gửi bản name",
  REVIEW_PROPOSAL: "Phê duyệt bản name",
  APPROVE_SERIES: "Duyệt series",
  LOGIN: "Đăng nhập",
  UPDATE_PROFILE: "Cập nhật hồ sơ",
  CHANGE_PASSWORD: "Đổi mật khẩu",
  UPDATE_SETTINGS: "Cập nhật cài đặt",
};

export function getActionLabel(actionType: string): string {
  return ACTION_LABEL_MAP[actionType] ?? actionType;
}

export type ItemVariant =
  | "review"
  | "submission"
  | "progress"
  | "proposal"
  | "account"
  | "system";

export function getCategoryVariant(category: LogCategory): ItemVariant {
  return category as ItemVariant;
}

export const CATEGORY_LABELS: Record<string, string> = {
  all: "Tất cả",
  review: "Đánh giá / Duyệt",
  submission: "Nộp bài",
  progress: "Tiến độ",
  proposal: "Bản name",
  account: "Tài khoản",
  system: "Hệ thống",
};

import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Filter,
  History,
  KeyRound,
  LogIn,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import "./ActivityHistory.scss";

type ActivityType = "all" | "account" | "security" | "workflow" | "system";
type ActivityStatus = "all" | "success" | "pending" | "warning";

const roleLabels: Record<string, string> = {
  ADMIN: "Quản trị viên",
  TANTOU: "Biên tập viên",
  MANGAKA: "Tác giả",
  ASSISTANT: "Trợ lý",
};

const activities = [
  {
    id: 1,
    title: "Đăng nhập thành công",
    detail: "Tài khoản truy cập từ thiết bị Windows tại Asia/Saigon.",
    time: "Hôm nay, 21:44",
    type: "security",
    status: "success",
    icon: LogIn,
  },
  {
    id: 2,
    title: "Mở bảng điều khiển toà soạn",
    detail: "Trang tổng quan được tải với dữ liệu doanh thu và xét duyệt mới nhất.",
    time: "Hôm nay, 21:43",
    type: "workflow",
    status: "success",
    icon: History,
  },
  {
    id: 3,
    title: "Cập nhật cài đặt hệ thống",
    detail: "Thay đổi tuỳ chọn giao diện, thông báo và phiên đăng nhập.",
    time: "Hôm nay, 21:38",
    type: "system",
    status: "success",
    icon: Settings,
  },
  {
    id: 4,
    title: "Kiểm tra hồ sơ cá nhân",
    detail: "Thông tin vai trò, email và trạng thái xác minh đã được mở xem.",
    time: "Hôm qua, 16:10",
    type: "account",
    status: "success",
    icon: UserRound,
  },
  {
    id: 5,
    title: "Nhắc xét duyệt bản name",
    detail: "Một tác vụ xét duyệt đang chờ phản hồi từ ban biên tập.",
    time: "18/06/2026, 09:20",
    type: "workflow",
    status: "pending",
    icon: FileCheck2,
  },
  {
    id: 6,
    title: "Cảnh báo bảo mật",
    detail: "Xác thực hai lớp chưa được bật cho tài khoản hiện tại.",
    time: "15/06/2026, 11:45",
    type: "security",
    status: "warning",
    icon: KeyRound,
  },
  {
    id: 7,
    title: "Đồng bộ thông báo",
    detail: "Kênh thông báo email và cảnh báo trong ứng dụng đã được làm mới.",
    time: "12/06/2026, 08:12",
    type: "system",
    status: "success",
    icon: Bell,
  },
] as const;

const filterOptions: { label: string; value: ActivityType }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Tài khoản", value: "account" },
  { label: "Bảo mật", value: "security" },
  { label: "Quy trình", value: "workflow" },
  { label: "Hệ thống", value: "system" },
];

const statusOptions: { label: string; value: ActivityStatus }[] = [
  { label: "Mọi trạng thái", value: "all" },
  { label: "Thành công", value: "success" },
  { label: "Đang chờ", value: "pending" },
  { label: "Cần chú ý", value: "warning" },
];

function ActivityHistory() {
  const { user } = useAuth();
  const [activeType, setActiveType] = useState<ActivityType>("all");
  const [activeStatus, setActiveStatus] = useState<ActivityStatus>("all");
  const [search, setSearch] = useState("");

  const filteredActivities = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return activities.filter((activity) => {
      const matchType = activeType === "all" || activity.type === activeType;
      const matchStatus =
        activeStatus === "all" || activity.status === activeStatus;
      const matchKeyword =
        !keyword ||
        activity.title.toLowerCase().includes(keyword) ||
        activity.detail.toLowerCase().includes(keyword);

      return matchType && matchStatus && matchKeyword;
    });
  }, [activeStatus, activeType, search]);

  const successCount = activities.filter(
    (activity) => activity.status === "success",
  ).length;
  const attentionCount = activities.length - successCount;

  return (
    <main className="activity-page">
      <section className="activity-hero">
        <div>
          <span className="activity-kicker">Lịch sử hoạt động</span>
          <h1>Theo dõi các thao tác gần đây</h1>
          <p>
            Nhật ký thao tác của {user?.fullName || "người dùng"} trong hệ
            thống Manga Kousei, bao gồm hồ sơ, bảo mật, thông báo và quy trình
            làm việc.
          </p>
        </div>

        <div className="activity-user-card">
          <span>{roleLabels[user?.role || ""] || user?.role || "Tài khoản"}</span>
          <strong>{user?.email || "user@mangakousei.local"}</strong>
        </div>
      </section>

      <section className="activity-summary" aria-label="Tổng quan lịch sử">
        <article>
          <History size={20} />
          <div>
            <strong>{activities.length}</strong>
            <span>Tổng hoạt động</span>
          </div>
        </article>
        <article>
          <CheckCircle2 size={20} />
          <div>
            <strong>{successCount}</strong>
            <span>Thành công</span>
          </div>
        </article>
        <article>
          <ShieldCheck size={20} />
          <div>
            <strong>{attentionCount}</strong>
            <span>Cần theo dõi</span>
          </div>
        </article>
      </section>

      <section className="activity-toolbar">
        <div className="activity-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Tìm theo nội dung hoạt động..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <label className="activity-select">
          <Filter size={17} />
          <select
            value={activeStatus}
            onChange={(event) =>
              setActiveStatus(event.target.value as ActivityStatus)
            }
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="activity-layout">
        <aside className="activity-filter-panel" aria-label="Lọc hoạt động">
          <span className="activity-kicker">Nhóm hoạt động</span>
          <div className="activity-filter-list">
            {filterOptions.map((option) => (
              <button
                className={activeType === option.value ? "active" : ""}
                key={option.value}
                type="button"
                onClick={() => setActiveType(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </aside>

        <article className="activity-panel">
          <div className="activity-panel__header">
            <div>
              <span className="activity-kicker">Timeline</span>
              <h2>{filteredActivities.length} hoạt động được tìm thấy</h2>
            </div>
            <Clock3 size={19} />
          </div>

          <div className="activity-timeline">
            {filteredActivities.map((activity) => {
              const Icon = activity.icon;

              return (
                <div
                  className={`activity-item activity-item--${activity.status}`}
                  key={activity.id}
                >
                  <span className="activity-item__icon">
                    <Icon size={18} />
                  </span>
                  <div className="activity-item__body">
                    <div>
                      <strong>{activity.title}</strong>
                      <time>{activity.time}</time>
                    </div>
                    <p>{activity.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </main>
  );
}

export default ActivityHistory;

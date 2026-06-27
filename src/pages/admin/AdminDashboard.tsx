import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CalendarDays,
  Loader2,
  BookOpen,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowUp,
  Minus,
  ArrowDown,
  Star,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import RecentActivityWidget from "../../components/activityLog/RecentActivityWidget";
import api from "../../services/api";
import "./AdminDashboard.scss";

interface AdminStats {
  totalSeries: number;
  totalMangaka: number;
  totalTantou: number;
  totalAssistant: number;
  pendingAdminProposals: number;
  approvedProposals: number;
  pendingPublishChapters: number;
  publishedChapters: number;
}

interface SeriesRank {
  seriesId: number;
  title: string;
  mangakaName: string | null;
  latestChapter: number | null;
  voteCount: number;
  rating: number;
  chapterCount: number;
}

interface ApiResp<T> {
  data: T;
}

const fetchStats = (): Promise<AdminStats> =>
  api
    .get<ApiResp<AdminStats>>("/admin/dashboard/stats")
    .then((r) => r.data.data);
const fetchTopSeries = (): Promise<SeriesRank[]> =>
  api
    .get<ApiResp<SeriesRank[]>>("/admin/dashboard/top-series")
    .then((r) => r.data.data ?? []);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [ranking, setRanking] = useState<SeriesRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const month = now.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    Promise.all([fetchStats(), fetchTopSeries()])
      .then(([s, r]) => {
        setStats(s);
        setRanking(r);
      })
      .catch(() => setError("Không thể tải dữ liệu. Vui lòng thử lại."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="ad-page ad-page--center">
        <Loader2 size={22} className="ad-spin" />
        Đang tải dữ liệu...
      </div>
    );

  if (error)
    return (
      <div className="ad-page ad-page--center ad-page--error">
        <AlertTriangle size={18} />
        {error}
      </div>
    );

  const statCards = [
    {
      label: "Series đang hoạt động",
      value: stats?.totalSeries ?? 0,
      icon: BookOpen,
      tone: "blue",
      sub: `${stats?.publishedChapters ?? 0} chương đã đăng`,
    },
    {
      label: "Tổng Mangaka",
      value: stats?.totalMangaka ?? 0,
      icon: Users,
      tone: "indigo",
      sub: `${stats?.totalTantou ?? 0} Tantou · ${stats?.totalAssistant ?? 0} Assistant`,
    },
    {
      label: "Proposal chờ duyệt",
      value: stats?.pendingAdminProposals ?? 0,
      icon: Sparkles,
      tone: (stats?.pendingAdminProposals ?? 0) > 0 ? "orange" : "green",
      sub: `${stats?.approvedProposals ?? 0} đã được duyệt`,
      action: () => navigate("/admin/proposal-review"),
    },
    {
      label: "Chương chờ đăng",
      value: stats?.pendingPublishChapters ?? 0,
      icon: FileText,
      tone: (stats?.pendingPublishChapters ?? 0) > 0 ? "red" : "green",
      sub: `${stats?.publishedChapters ?? 0} đã phát hành`,
      action: () => navigate("/admin/approvals"),
    },
  ];

  return (
    <div className="ad-page">
      <div className="ad-header">
        <div className="ad-header__left">
          <h1>Tổng quan Tòa soạn</h1>
          <p>Giám sát tiến độ sản xuất và xét duyệt nội dung.</p>
        </div>
        <div className="ad-header__badge">
          <CalendarDays size={14} strokeWidth={2} />
          {month}
        </div>
      </div>

      <div className="ad-stats">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className={`ad-stat ad-stat--${c.tone} ${c.action ? "ad-stat--clickable" : ""}`}
              onClick={c.action}
            >
              <div className="ad-stat__top">
                <span className="ad-stat__label">{c.label}</span>
                <div className="ad-stat__icon">
                  <Icon size={17} strokeWidth={2} />
                </div>
              </div>
              <div className="ad-stat__value">{c.value}</div>
              <div className="ad-stat__sub">{c.sub}</div>
              {c.action && (
                <div className="ad-stat__link">
                  Xem chi tiết <ChevronRight size={12} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="ad-grid">
        <div className="ad-col ad-col--left">
          <div className="ad-card ad-pending">
            <div className="ad-pending__header">
              <AlertTriangle size={17} strokeWidth={2.5} />
              <span>Cần xử lý ngay</span>
            </div>
            <div className="ad-pending__list">
              {(stats?.pendingAdminProposals ?? 0) > 0 && (
                <button
                  className="ad-pending__item ad-pending__item--orange"
                  onClick={() => navigate("/admin/proposal-review")}
                >
                  <span className="ad-pending__item-dot" />
                  <div>
                    <strong>{stats!.pendingAdminProposals} proposal</strong>
                    <span>đang chờ Admin xét duyệt</span>
                  </div>
                  <ChevronRight size={14} />
                </button>
              )}
              {(stats?.pendingPublishChapters ?? 0) > 0 && (
                <button
                  className="ad-pending__item ad-pending__item--blue"
                  onClick={() => navigate("/admin/approvals")}
                >
                  <span className="ad-pending__item-dot" />
                  <div>
                    <strong>{stats!.pendingPublishChapters} chapter</strong>
                    <span>đang chờ Admin duyệt đăng</span>
                  </div>
                  <ChevronRight size={14} />
                </button>
              )}
              {(stats?.pendingAdminProposals ?? 0) === 0 &&
                (stats?.pendingPublishChapters ?? 0) === 0 && (
                  <div className="ad-pending__empty">
                    <CheckCircle2 size={20} />
                    <span>Không có mục nào cần xử lý!</span>
                  </div>
                )}
            </div>
          </div>

          <div className="ad-card ad-activity">
            <RecentActivityWidget />
          </div>
        </div>

        <div className="ad-col ad-col--right">
          <div className="ad-card ad-ranking">
            <div className="ad-card__head">
              <div className="ad-card__title">
                <Star size={15} strokeWidth={2} />
                Bảng xếp hạng Series (theo vote)
              </div>
            </div>
            <div className="ad-ranking__list">
              {ranking.length === 0 ? (
                <div className="ad-ranking__empty">
                  Chưa có dữ liệu xếp hạng.
                </div>
              ) : (
                ranking.map((r, idx) => (
                  <div
                    key={r.seriesId}
                    className={`ad-rank-item ${idx === 0 ? "ad-rank-item--top" : ""}`}
                  >
                    <span className="ad-rank-item__num">#{idx + 1}</span>
                    <div className="ad-rank-item__body">
                      <strong>{r.title}</strong>
                      <span>
                        {r.mangakaName ?? "—"}
                        {r.latestChapter != null
                          ? ` · Ch.${r.latestChapter}`
                          : ""}
                        {" · "}
                        {r.voteCount.toLocaleString()} vote
                        {r.rating > 0 ? ` · ⭐ ${r.rating.toFixed(1)}` : ""}
                      </span>
                    </div>
                    <div
                      className={`ad-rank-item__trend ad-rank-item__trend--${
                        idx === 0 ? "up" : idx < 2 ? "flat" : "down"
                      }`}
                    >
                      {idx === 0 ? (
                        <ArrowUp size={13} />
                      ) : idx < 2 ? (
                        <Minus size={13} />
                      ) : (
                        <ArrowDown size={13} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="ad-card ad-overview">
            <div className="ad-card__head">
              <div className="ad-card__title">
                <Clock size={15} strokeWidth={2} />
                Tóm tắt hệ thống
              </div>
            </div>
            <div className="ad-overview__list">
              {[
                {
                  label: "Tổng series",
                  value: stats?.totalSeries ?? 0,
                  color: "#1d4ed8",
                },
                {
                  label: "Chương đã đăng",
                  value: stats?.publishedChapters ?? 0,
                  color: "#16a34a",
                },
                {
                  label: "Chờ Admin duyệt",
                  value:
                    (stats?.pendingAdminProposals ?? 0) +
                    (stats?.pendingPublishChapters ?? 0),
                  color: "#f59e0b",
                },
                {
                  label: "Tổng nhân sự",
                  value:
                    (stats?.totalMangaka ?? 0) +
                    (stats?.totalTantou ?? 0) +
                    (stats?.totalAssistant ?? 0),
                  color: "#6366f1",
                },
              ].map((item) => (
                <div key={item.label} className="ad-overview__row">
                  <span>{item.label}</span>
                  <strong style={{ color: item.color }}>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

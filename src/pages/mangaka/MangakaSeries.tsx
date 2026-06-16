// src/pages/mangaka/MangakaSeries.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  fetchMySeries,
  type MangakaSeries,
} from "../../services/mangakaSeriesService";
import { getAvatarColor, getInitials } from "../../utils";
import "./MangakaSeries.scss";

const WEEKDAY_LABELS: Record<number, string> = {
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
  7: "CN",
};

function scheduleLabel(type: string | null, day: number | null): string {
  if (!type || day === null) return "Chưa có lịch";
  if (type === "weekly")
    return `${WEEKDAY_LABELS[day] ?? `Thứ ${day}`} hàng tuần`;
  return `Ngày ${day} hàng tháng`;
}

function statusMeta(status: string | null): {
  label: string;
  className: string;
} {
  switch (status) {
    case "approved":
      return { label: "Đang hoạt động", className: "ms-status--active" };
    case "hiatus":
      return { label: "Tạm dừng", className: "ms-status--hiatus" };
    case "completed":
      return { label: "Hoàn thành", className: "ms-status--done" };
    case "cancelled":
      return { label: "Đã huỷ", className: "ms-status--cancelled" };
    default:
      return { label: status ?? "—", className: "ms-status--default" };
  }
}

const COVER_PLACEHOLDER =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop";

export default function MangakaSeries() {
  const navigate = useNavigate();
  const [seriesList, setSeriesList] = useState<MangakaSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMySeries();
        setSeriesList(data);
      } catch (err) {
        console.error("Không thể tải series", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusFilters = [
    { id: "all", label: "Tất cả" },
    { id: "approved", label: "Đang hoạt động" },
    { id: "hiatus", label: "Tạm dừng" },
    { id: "completed", label: "Hoàn thành" },
  ];

  const filtered = seriesList.filter((s) => {
    const matchStatus =
      activeFilter === "all" || s.seriesStatus === activeFilter;
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="mangaka-series-page">
      <div className="series-hero">
        <div className="hero-text">
          <div className="breadcrumb">
            Tác phẩm <ChevronRight size={14} />
          </div>
          <h1>Kho Tác Phẩm</h1>
          <p>Quản lý tất cả series, tiến độ và đội ngũ sản xuất tại đây.</p>
        </div>
        <div className="hero-actions">
          <button className="btn-outline">
            <Download size={18} /> Tải báo cáo tổng
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate("/mangaka/create-work")}
          >
            <Plus size={18} /> Tạo Series Mới
          </button>
        </div>
      </div>

      <div className="series-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm series..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              className={`filter-tab ${activeFilter === f.id ? "active" : ""}`}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className="btn-icon">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {loading ? (
        <div className="ms-loading">Đang tải series...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {search
            ? "Không tìm thấy series phù hợp."
            : "Bạn chưa có series nào. Hãy tạo series mới!"}
        </div>
      ) : (
        <div className="series-grid">
          {filtered.map((s) => {
            const status = statusMeta(s.seriesStatus);
            return (
              <div
                key={s.seriesId}
                className="series-card"
                onClick={() => navigate(`/mangaka/series/${s.seriesId}`)}
              >
                {/* Cover */}
                <div className="card-cover">
                  <img
                    src={s.coverImageUrl ?? COVER_PLACEHOLDER}
                    alt={s.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = COVER_PLACEHOLDER;
                    }}
                  />
                  <span className={`status-badge ${status.className}`}>
                    {status.label}
                  </span>
                </div>

                <div className="card-body">
                  <h3 className="series-title">{s.title}</h3>

                  {s.genres.length > 0 && (
                    <div className="ms-genres">
                      {s.genres.slice(0, 3).map((g) => (
                        <span key={g} className="ms-genre-chip">
                          {g}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="card-meta">
                    <span>
                      <BookOpen size={13} /> {s.chapterCount} Chương
                    </span>
                    <span>
                      <Calendar size={13} />
                      {scheduleLabel(s.scheduleType, s.dayValue)}
                    </span>
                  </div>

                  <div className="card-footer">
                    <span className="tantou-label">Tantou</span>
                    {s.tantouName ? (
                      <div className="ms-tantou">
                        {s.tantouAvatarUrl ? (
                          <img
                            className="ms-tantou__avatar"
                            src={s.tantouAvatarUrl}
                            alt={s.tantouName}
                          />
                        ) : (
                          <div
                            className="ms-tantou__avatar ms-tantou__avatar--initials"
                            style={{ background: getAvatarColor(s.tantouName) }}
                          >
                            {getInitials(s.tantouName)}
                          </div>
                        )}
                        <span className="tantou-name">{s.tantouName}</span>
                      </div>
                    ) : (
                      <span className="tantou-name">—</span>
                    )}
                  </div>

                  {s.approvedAt && (
                    <div className="ms-approved-at">
                      <Clock size={11} /> Duyệt {s.approvedAt}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Grid3X3,
  Layers3,
  List,
  MessageSquare,
  PenLine,
  Search,
  ShieldAlert,
  Sparkles,
  Tag,
} from "lucide-react";
import {
  fetchTantouSeries,
  type TantouSeries,
} from "../../services/tantouSeriesService";
import { getAvatarColor, getInitials } from "../../utils";
import "./TantouManage.scss";

type ViewMode = "grid" | "list";
type SortMode = "newest" | "name" | "progress" | "chapters";
type StatusFilter = "all" | string;

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

function statusMeta(status: string | null) {
  switch (status) {
    case "approved":
      return { label: "Đang hoạt động", cls: "tm-status--active" };
    case "hiatus":
      return { label: "Tạm dừng", cls: "tm-status--hiatus" };
    case "completed":
      return { label: "Hoàn thành", cls: "tm-status--done" };
    case "cancelled":
      return { label: "Đã huỷ", cls: "tm-status--cancelled" };
    default:
      return { label: status ?? "—", cls: "tm-status--default" };
  }
}

function progressPct(total: number, submitted: number): number {
  if (total === 0) return 0;
  return Math.round((submitted / total) * 100);
}

const COVER_PLACEHOLDER =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop";

const PAGE_SIZE = 6;

function WorkCard({
  series,
  viewMode,
}: {
  series: TantouSeries;
  viewMode: ViewMode;
}) {
  const navigate = useNavigate();
  const st = statusMeta(series.seriesStatus);
  const pct = progressPct(
    series.totalPageDeadlines,
    series.submittedPageDeadlines,
  );

  return (
    <article className={`tm-work-card tm-work-card--${viewMode}`}>
      <div className="tm-cover">
        <img
          src={series.coverImageUrl ?? COVER_PLACEHOLDER}
          alt={series.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = COVER_PLACEHOLDER;
          }}
        />
        <div className="tm-cover__scrim" />
        <span className={`tm-cover__status ${st.cls}`}>{st.label}</span>
      </div>

      <div className="tm-work-card__body">
        <div className="tm-work-card__meta-row">
          {series.genres.slice(0, 2).map((g) => (
            <span key={g} className="tm-genre-chip">
              <Tag size={10} />
              {g}
            </span>
          ))}
        </div>

        <h2 className="tm-work-card__title">{series.title}</h2>

        <div className="tm-mangaka">
          {series.mangakaAvatarUrl ? (
            <img
              className="tm-mangaka__avatar"
              src={series.mangakaAvatarUrl}
              alt={series.mangakaName ?? ""}
            />
          ) : series.mangakaName ? (
            <div
              className="tm-mangaka__avatar tm-mangaka__avatar--initials"
              style={{ background: getAvatarColor(series.mangakaName) }}
            >
              {getInitials(series.mangakaName)}
            </div>
          ) : null}
          <div>
            <div className="tm-mangaka__role">Mangaka</div>
            <div className="tm-mangaka__name">{series.mangakaName ?? "—"}</div>
          </div>
        </div>

        <div className="tm-stats-row">
          <span className="tm-stat-item">
            <BookOpen size={13} /> {series.chapterCount} chương
          </span>
          <span className="tm-stat-item">
            <Calendar size={13} />{" "}
            {scheduleLabel(series.scheduleType, series.dayValue)}
          </span>
        </div>

        {series.totalPageDeadlines > 0 && (
          <div className="tm-progress">
            <div className="tm-progress__top">
              <span>Tiến độ trang</span>
              <strong>
                {series.submittedPageDeadlines}/{series.totalPageDeadlines}
              </strong>
            </div>
            <div className="tm-progress__track">
              <div className="tm-progress__fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="tm-work-card__footer">
          {series.approvedAt && (
            <span className="tm-approved-at">
              <Clock size={11} /> {series.approvedAt}
            </span>
          )}
          <div className="tm-actions">
            <button
              className="tm-action tm-action--chapters"
              onClick={() =>
                navigate(`/tantou/series/${series.seriesId}/chapters`)
              }
              title="Xem & set deadline chapters"
            >
              <BookOpen size={16} strokeWidth={2.2} />
            </button>
            <button className="tm-action" title="Chi tiết">
              <Eye size={16} strokeWidth={2.2} />
            </button>
            <button className="tm-action" title="Tin nhắn">
              <MessageSquare size={16} strokeWidth={2.2} />
            </button>
            <button className="tm-action" title="Ghi chú">
              <PenLine size={16} strokeWidth={2.2} />
            </button>
            <button className="tm-action" title="Cảnh báo">
              <Bell size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function TantouManage() {
  const [seriesList, setSeriesList] = useState<TantouSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);

  useEffect(() => {
    console.log("hello?");

    fetchTantouSeries()
      .then(setSeriesList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(
    () => [
      {
        label: "Tổng tác phẩm",
        value: seriesList.length,
        icon: Layers3,
        tone: "primary",
      },
      {
        label: "Đang hoạt động",
        value: seriesList.filter((s) => s.seriesStatus === "approved").length,
        icon: CheckCircle2,
        tone: "success",
      },
      {
        label: "Tạm dừng",
        value: seriesList.filter((s) => s.seriesStatus === "hiatus").length,
        icon: ShieldAlert,
        tone: "danger",
      },
      {
        label: "Tiền sản xuất",
        value: seriesList.filter((s) => s.seriesStatus === "pre-production")
          .length,
        icon: Sparkles,
        tone: "info",
      },
    ],
    [seriesList],
  );

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return seriesList
      .filter((s) => {
        const matchStatus =
          statusFilter === "all" || s.seriesStatus === statusFilter;
        const matchSearch =
          !q ||
          s.title.toLowerCase().includes(q) ||
          (s.mangakaName ?? "").toLowerCase().includes(q);
        return matchStatus && matchSearch;
      })
      .sort((a, b) => {
        if (sortMode === "name") return a.title.localeCompare(b.title, "vi");
        if (sortMode === "chapters") return b.chapterCount - a.chapterCount;
        if (sortMode === "progress") {
          return (
            progressPct(b.totalPageDeadlines, b.submittedPageDeadlines) -
            progressPct(a.totalPageDeadlines, a.submittedPageDeadlines)
          );
        }
        return (
          new Date(b.approvedAt ?? 0).getTime() -
          new Date(a.approvedAt ?? 0).getTime()
        );
      });
  }, [seriesList, searchTerm, statusFilter, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const STATUS_OPTIONS = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "approved", label: "Đang hoạt động" },
    { value: "hiatus", label: "Tạm dừng" },
    { value: "completed", label: "Hoàn thành" },
  ];

  const SORT_OPTIONS = [
    { value: "newest", label: "Mới nhất" },
    { value: "name", label: "Tên A-Z" },
    { value: "chapters", label: "Nhiều chương nhất" },
    { value: "progress", label: "Tiến độ cao nhất" },
  ];

  return (
    <main className="tm-page">
      <header className="tm-hero">
        <span className="tm-hero__kicker">PORTFOLIO</span>
        <h1>Quản lý Tác phẩm</h1>
        <p>
          Danh sách các bộ truyện manga đang trong quá trình sản xuất.
          <br />
          Theo dõi tiến độ chương, deadline và trao đổi với mangaka.
        </p>
      </header>

      <div className="tm-stats">
        {stats.map((s) => (
          <div key={s.label} className={`tm-stat tm-stat--${s.tone}`}>
            <div className="tm-stat__icon">
              <s.icon size={20} strokeWidth={2} />
            </div>
            <div>
              <div className="tm-stat__value">{s.value}</div>
              <div className="tm-stat__label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tm-toolbar">
        <div className="tm-search">
          <Search size={16} />
          <input
            placeholder="Tìm tên truyện hoặc mangaka..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="tm-select">
          <span>TRẠNG THÁI</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="tm-select">
          <span>SẮP XẾP</span>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="tm-view-switcher">
          <button
            className={`tm-view-switcher__btn ${viewMode === "grid" ? "tm-view-switcher__btn--active" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 size={15} /> Grid
          </button>
          <button
            className={`tm-view-switcher__btn ${viewMode === "list" ? "tm-view-switcher__btn--active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <List size={15} /> List
          </button>
        </div>
      </div>

      {loading ? (
        <div className="tm-empty">Đang tải danh sách tác phẩm...</div>
      ) : visible.length === 0 ? (
        <div className="tm-empty">
          <Layers3 size={32} strokeWidth={1.25} />
          <span>
            {searchTerm
              ? "Không tìm thấy tác phẩm phù hợp"
              : "Chưa có tác phẩm nào được assign"}
          </span>
        </div>
      ) : (
        <div className={`tm-work-grid tm-work-grid--${viewMode}`}>
          {visible.map((s) => (
            <WorkCard key={s.seriesId} series={s} viewMode={viewMode} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="tm-pagination">
          <button
            className="tm-page-btn"
            disabled={safePage === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={15} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={`tm-page-btn ${n === safePage ? "tm-page-btn--active" : ""}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            className="tm-page-btn"
            disabled={safePage === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </main>
  );
}

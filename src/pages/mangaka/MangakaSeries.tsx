import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Download,
  Layers3,
  Plus,
  Search,
  Sparkles,
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
    return `${WEEKDAY_LABELS[day] ?? `Thứ ${day}`} hằng tuần`;
  return `Ngày ${day} hằng tháng`;
}

function statusMeta(status: string | null) {
  switch (status) {
    case "approved":
      return { label: "Đang hoạt động", cls: "s-active" };
    case "hiatus":
      return { label: "Tạm dừng", cls: "s-hiatus" };
    case "completed":
      return { label: "Hoàn thành", cls: "s-done" };
    case "cancelled":
      return { label: "Đã huỷ", cls: "s-cancelled" };
    default:
      return { label: status ?? "Chưa rõ", cls: "s-default" };
  }
}

const COVER_PLACEHOLDER =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop";

function readableTitle(series: MangakaSeries): string {
  const title = series.title.trim();
  return !title || /^\d+$/.test(title) ? "Truyện chưa đặt tên" : title;
}

export default function MangakaSeriesPage() {
  const navigate = useNavigate();
  const [seriesList, setSeriesList] = useState<MangakaSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchMySeries()
      .then(setSeriesList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filters = [
    { id: "all", label: "Tất cả" },
    { id: "approved", label: "Đang hoạt động" },
    { id: "hiatus", label: "Tạm dừng" },
    { id: "completed", label: "Hoàn thành" },
  ];

  const filtered = useMemo(
    () =>
      seriesList.filter((s) => {
        const matchStatus =
          activeFilter === "all" || s.seriesStatus === activeFilter;
        const matchSearch = s.title
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchStatus && matchSearch;
      }),
    [activeFilter, search, seriesList],
  );

  const spotlight = filtered[0] ?? seriesList[0];
  const spotlightStatus = spotlight
    ? statusMeta(spotlight.seriesStatus)
    : undefined;
  const activeCount = seriesList.filter(
    (series) => series.seriesStatus === "approved",
  ).length;
  const totalChapters = seriesList.reduce(
    (sum, series) => sum + series.chapterCount,
    0,
  );
  const scheduledCount = seriesList.filter(
    (series) => series.scheduleType && series.dayValue !== null,
  ).length;

  return (
    <div className="mangaka-series-page">
      <section className="series-hero">
        <div className="hero-text">
          <div className="breadcrumb">
            Tác phẩm <ChevronRight size={14} />
          </div>
          <div className="hero-kicker">
            <Sparkles size={15} />
            Editorial Board
          </div>
          <h1>Quản Lý Kho Tác Phẩm</h1>
          <p>
            Theo dõi toàn bộ series, lịch phát hành, số chương và Tantou phụ
            trách trong một không gian quản lý gọn gàng, đẹp và dễ ra quyết định.
          </p>
          <div className="hero-stats" aria-label="Thống kê tác phẩm">
            <div>
              <strong>{seriesList.length}</strong>
              <span>Tổng series</span>
            </div>
            <div>
              <strong>{activeCount}</strong>
              <span>Đang hoạt động</span>
            </div>
            <div>
              <strong>{totalChapters}</strong>
              <span>Tổng chương</span>
            </div>
            <div>
              <strong>{scheduledCount}</strong>
              <span>Có lịch đăng</span>
            </div>
          </div>
          <div className="hero-actions">
            <button
              className="btn-primary"
              type="button"
              onClick={() => navigate("/mangaka/create-work")}
            >
              <Plus size={16} /> Tạo Tác Phẩm
            </button>
            <button className="btn-outline" type="button">
              <Download size={16} /> Tải báo cáo
            </button>
          </div>
        </div>

        <div className="hero-panel">
          {spotlight ? (
            <>
              <img
                src={spotlight.coverImageUrl ?? COVER_PLACEHOLDER}
                alt={readableTitle(spotlight)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = COVER_PLACEHOLDER;
                }}
              />
              <div className="hero-panel__shade" />
              <div className="hero-panel__content">
                <span className={`status-pill ${spotlightStatus?.cls}`}>
                  {spotlightStatus?.label}
                </span>
                <h2>{readableTitle(spotlight)}</h2>
                <p>{spotlight.description || "Series chưa có mô tả."}</p>
                <div className="hero-panel__meta">
                  <span>
                    <BookOpen size={14} />
                    {spotlight.chapterCount} chương
                  </span>
                  <span>
                    <Calendar size={14} />
                    {scheduleLabel(spotlight.scheduleType, spotlight.dayValue)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/mangaka/series/${spotlight.seriesId}`)
                  }
                >
                  Xem chi tiết <ArrowUpRight size={15} />
                </button>
              </div>
            </>
          ) : (
            <div className="hero-panel__empty">
              <Layers3 size={28} />
              <span>Kho quản lý đang chờ tác phẩm đầu tiên.</span>
            </div>
          )}
        </div>
      </section>

      <section className="series-toolbar" aria-label="Bộ lọc tác phẩm">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm series, Tantou, trạng thái..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filter-tab ${activeFilter === f.id ? "active" : ""}`}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="ms-empty">
          <span>Đang tải series...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ms-empty">
          <BookOpen size={32} strokeWidth={1.25} />
          <span>
            {search
              ? "Không tìm thấy series phù hợp."
              : "Kho quản lý hiện chưa có tác phẩm nào."}
          </span>
        </div>
      ) : (
        <>
          <div className="section-heading">
            <div>
              <span>Danh sách quản lý</span>
              <h2>Tất cả series trong kho tác phẩm</h2>
            </div>
            <p>{filtered.length} series đang hiển thị</p>
          </div>

        <div className="series-grid">
          {filtered.map((s) => {
            const st = statusMeta(s.seriesStatus);
            return (
              <article
                key={s.seriesId}
                className="series-card"
                onClick={() => navigate(`/mangaka/series/${s.seriesId}`)}
              >
                <div className="card-cover">
                  <img
                    src={s.coverImageUrl ?? COVER_PLACEHOLDER}
                    alt={readableTitle(s)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = COVER_PLACEHOLDER;
                    }}
                  />
                  <div className="card-cover__scrim" />
                  <span className={`status-pill card-status ${st.cls}`}>
                    {st.label}
                  </span>
                  <span className="card-open">
                    <ArrowUpRight size={16} />
                  </span>
                </div>

                <div className="card-body">
                  <div className="card-heading">
                    <h2>{readableTitle(s)}</h2>
                    <p>{s.description || "Chưa có mô tả cho series này."}</p>
                  </div>

                  {s.genres.length > 0 && (
                    <div className="card-genres">
                      {s.genres.slice(0, 3).map((g) => (
                        <span key={g} className="card-genre-chip">
                          {g}
                        </span>
                      ))}
                      {s.genres.length > 3 && (
                        <span className="card-genre-chip card-genre-chip--more">
                          +{s.genres.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="card-stats">
                    <div className="card-stat">
                      <BookOpen size={14} />
                      <span>{s.chapterCount} chương</span>
                    </div>
                    <div className="card-stat">
                      <Calendar size={14} />
                      <span>{scheduleLabel(s.scheduleType, s.dayValue)}</span>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="card-tantou">
                    {s.tantouName ? (
                      <>
                        {s.tantouAvatarUrl ? (
                          <img
                            className="tantou-avatar"
                            src={s.tantouAvatarUrl}
                            alt={s.tantouName}
                          />
                        ) : (
                          <div
                            className="tantou-avatar tantou-avatar--initials"
                            style={{
                              background: getAvatarColor(s.tantouName),
                            }}
                          >
                            {getInitials(s.tantouName)}
                          </div>
                        )}
                        <div>
                          <div className="tantou-role">Tantou</div>
                          <div className="tantou-name">{s.tantouName}</div>
                        </div>
                      </>
                    ) : (
                      <span className="tantou-role">Chưa có Tantou</span>
                    )}
                  </div>

                  {s.approvedAt && (
                    <div className="card-approved">
                      <Clock size={11} />
                      {s.approvedAt}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}

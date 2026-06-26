import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Clock3,
  Filter,
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useActivityLogs } from "../../hooks/useActivityLogs";
import {
  getActionIcon,
  getActionLabel,
  getCategoryVariant,
  CATEGORY_LABELS,
} from "../../components/activityLog/activityLogUtils";
import type { LogCategory } from "../../services/activityLogService";
import "./ActivityHistory.scss";

const roleLabels: Record<string, string> = {
  ADMIN: "Quản trị viên",
  TANTOU: "Biên tập viên",
  MANGAKA: "Tác giả",
  ASSISTANT: "Trợ lý",
};

const CATEGORIES: Array<{ label: string; value: LogCategory | "all" }> = [
  { label: CATEGORY_LABELS["all"], value: "all" },
  { label: CATEGORY_LABELS["review"], value: "review" },
  { label: CATEGORY_LABELS["submission"], value: "submission" },
  { label: CATEGORY_LABELS["progress"], value: "progress" },
  { label: CATEGORY_LABELS["proposal"], value: "proposal" },
  { label: CATEGORY_LABELS["account"], value: "account" },
  { label: CATEGORY_LABELS["system"], value: "system" },
];

const PAGE_SIZE = 20;

function ActivityHistory() {
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState<LogCategory | "all">(
    "all",
  );
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const { data, loading, error, refresh } = useActivityLogs({
    category: activeCategory,
    page,
    size: PAGE_SIZE,
  });

  const filteredItems = useMemo(() => {
    if (!data) return [];
    const kw = search.trim().toLowerCase();
    if (!kw) return data.content;
    return data.content.filter(
      (log) =>
        log.detail.toLowerCase().includes(kw) ||
        getActionLabel(log.actionType).toLowerCase().includes(kw),
    );
  }, [data, search]);

  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const reviewCount =
    data?.content.filter((l) => l.category === "review").length ?? 0;
  const submitCount =
    data?.content.filter((l) => l.category === "submission").length ?? 0;

  function handleCategoryChange(cat: LogCategory | "all") {
    setActiveCategory(cat);
    setPage(0);
    setSearch("");
  }

  return (
    <main className="activity-page">
      <section className="activity-hero">
        <div>
          <span className="activity-kicker">Lịch sử hoạt động</span>
          <h1>Theo dõi các thao tác gần đây</h1>
          <p>
            Nhật ký thao tác của{" "}
            <strong>{user?.fullName || "người dùng"}</strong> trong hệ thống
            Manga Kousei — bao gồm duyệt bài, nộp bài, tiến độ và tài khoản.
          </p>
        </div>
        <div className="activity-user-card">
          <span>
            {roleLabels[user?.role ?? ""] || user?.role || "Tài khoản"}
          </span>
          <strong>{user?.email || "—"}</strong>
        </div>
      </section>

      <section className="activity-summary" aria-label="Tổng quan">
        <article>
          <History size={20} />
          <div>
            <strong>{totalElements}</strong>
            <span>Tổng hoạt động</span>
          </div>
        </article>
        <article>
          <CheckCircle2 size={20} />
          <div>
            <strong>{reviewCount}</strong>
            <span>Đánh giá / duyệt</span>
          </div>
        </article>
        <article>
          <Clock3 size={20} />
          <div>
            <strong>{submitCount}</strong>
            <span>Nộp bài</span>
          </div>
        </article>
      </section>

      <section className="activity-toolbar">
        <label className="activity-search">
          <Search size={18} />
          <input
            type="search"
            placeholder="Tìm theo nội dung hoạt động..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <label className="activity-select">
          <Filter size={17} />
          <select
            value={activeCategory}
            onChange={(e) =>
              handleCategoryChange(e.target.value as LogCategory | "all")
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="activity-layout">
        <aside className="activity-filter-panel" aria-label="Lọc hoạt động">
          <span className="activity-kicker">Nhóm hoạt động</span>
          <div className="activity-filter-list">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                className={activeCategory === c.value ? "active" : ""}
                onClick={() => handleCategoryChange(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </aside>

        <article className="activity-panel">
          <div className="activity-panel__header">
            <div>
              <span className="activity-kicker">Timeline</span>
              <h2>
                {loading
                  ? "Đang tải…"
                  : `${filteredItems.length} hoạt động được tìm thấy`}
              </h2>
            </div>
            <button
              className="activity-refresh"
              type="button"
              onClick={refresh}
              title="Làm mới"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {error && (
            <div className="activity-error">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button type="button" onClick={refresh}>
                Thử lại
              </button>
            </div>
          )}

          {loading && !error && (
            <div className="activity-timeline">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  className="activity-item activity-item--skeleton"
                  key={i}
                  aria-hidden
                />
              ))}
            </div>
          )}

          {!loading && !error && filteredItems.length === 0 && (
            <div className="activity-empty">
              <History size={32} />
              <p>Chưa có hoạt động nào trong nhóm này.</p>
            </div>
          )}

          {!loading && !error && filteredItems.length > 0 && (
            <div className="activity-timeline">
              {filteredItems.map((log) => {
                const Icon = getActionIcon(log.actionType);
                const label = getActionLabel(log.actionType);
                const variant = getCategoryVariant(log.category);

                return (
                  <div
                    key={log.logId}
                    className={`activity-item activity-item--${variant}`}
                  >
                    <span className="activity-item__icon" aria-hidden>
                      <Icon size={18} />
                    </span>
                    <div className="activity-item__body">
                      <div>
                        <strong>{label}</strong>
                        <time dateTime={log.createdAt}>{log.createdAt}</time>
                      </div>
                      <p>{log.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="activity-pagination">
              <button
                type="button"
                className="activity-pagination__btn"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="activity-pagination__info">
                Trang {page + 1} / {totalPages}
              </span>

              <button
                type="button"
                className="activity-pagination__btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Trang sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export default ActivityHistory;

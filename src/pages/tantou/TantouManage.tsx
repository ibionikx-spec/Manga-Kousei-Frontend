import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Grid3X3,
  Layers3,
  List,
  MessageSquare,
  PenLine,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import "./TantouManage.scss";

type WorkStatus = "on-track" | "overdue" | "pre-production";
type Priority = "critical" | "high" | "medium" | "low";
type ViewMode = "grid" | "list";
type SortMode = "deadline" | "newest" | "name" | "progress";
type StatusFilter = "all" | WorkStatus;

interface MangaWork {
  id: number;
  title: string;
  mangaka: string;
  role: string;
  status: WorkStatus;
  currentChapter: number;
  deadline: string;
  progress: number;
  createdAt: string;
  genre: string;
  phase: string;
  coverTone: "indigo" | "rose" | "amber" | "emerald" | "cyan" | "slate";
}

const TODAY = new Date("2026-06-17T00:00:00");

const WORKS: MangaWork[] = [
  {
    id: 1,
    title: "Thành Phố Sau Cơn Mưa",
    mangaka: "Shinji Ikari",
    role: "Mangaka",
    status: "on-track",
    currentChapter: 45,
    deadline: "2026-06-19",
    progress: 91,
    createdAt: "2026-06-08",
    genre: "Drama",
    phase: "Genga review",
    coverTone: "indigo",
  },
  {
    id: 2,
    title: "Bản Giao Hưởng Số 7 Của Những Vì Sao",
    mangaka: "Aki Tanaka",
    role: "Lead Mangaka",
    status: "overdue",
    currentChapter: 18,
    deadline: "2026-06-14",
    progress: 58,
    createdAt: "2026-05-28",
    genre: "Sci-fi",
    phase: "Name correction",
    coverTone: "rose",
  },
  {
    id: 3,
    title: "Học Viện Bóng Đêm",
    mangaka: "Mai Kisaragi",
    role: "Mangaka",
    status: "pre-production",
    currentChapter: 1,
    deadline: "2026-06-28",
    progress: 35,
    createdAt: "2026-06-16",
    genre: "Fantasy",
    phase: "Concept",
    coverTone: "cyan",
  },
  {
    id: 4,
    title: "Người Gác Đền Mùa Hạ",
    mangaka: "Kenji Mori",
    role: "Mangaka",
    status: "on-track",
    currentChapter: 32,
    deadline: "2026-06-25",
    progress: 86,
    createdAt: "2026-06-01",
    genre: "Slice of life",
    phase: "Typeset",
    coverTone: "emerald",
  },
  {
    id: 5,
    title: "Đoàn Tàu Cuối Cùng",
    mangaka: "Sora Minami",
    role: "Storyboard Artist",
    status: "overdue",
    currentChapter: 9,
    deadline: "2026-06-16",
    progress: 48,
    createdAt: "2026-06-04",
    genre: "Mystery",
    phase: "Draft pending",
    coverTone: "amber",
  },
  {
    id: 6,
    title: "Ký Ức Của Biển Xanh",
    mangaka: "Haru Sato",
    role: "Mangaka",
    status: "pre-production",
    currentChapter: 3,
    deadline: "2026-07-02",
    progress: 64,
    createdAt: "2026-06-12",
    genre: "Adventure",
    phase: "Worldbuilding",
    coverTone: "slate",
  },
];

const STATUS_LABEL: Record<WorkStatus, string> = {
  "on-track": "Đúng tiến độ",
  overdue: "Trễ hạn",
  "pre-production": "Tiền sản xuất",
};

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "on-track", label: "Đúng tiến độ" },
  { value: "overdue", label: "Trễ hạn" },
  { value: "pre-production", label: "Tiền sản xuất" },
];

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "deadline", label: "Deadline gần nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "name", label: "Tên A-Z" },
  { value: "progress", label: "Tiến độ cao nhất" },
];

const PAGE_SIZE = 4;

function getDaysUntil(deadline: string) {
  const due = new Date(`${deadline}T00:00:00`);
  return Math.ceil((due.getTime() - TODAY.getTime()) / 86_400_000);
}

function getPriority(daysUntil: number): Priority {
  if (daysUntil < 0 || daysUntil <= 2) return "critical";
  if (daysUntil <= 5) return "high";
  if (daysUntil <= 10) return "medium";
  return "low";
}

function getDeadlineText(daysUntil: number) {
  if (daysUntil < 0) return `Trễ ${Math.abs(daysUntil)} ngày`;
  if (daysUntil === 0) return "Đến hạn hôm nay";
  return `Còn ${daysUntil} ngày`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getProgressStyle(progress: number): CSSProperties {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return {
    "--progress": `${clampedProgress}%`,
  } as CSSProperties;
}

function WorkCard({ work, viewMode }: { work: MangaWork; viewMode: ViewMode }) {
  const daysUntil = getDaysUntil(work.deadline);
  const priority = getPriority(daysUntil);
  const deadlineTone = daysUntil < 0 ? "late" : daysUntil <= 2 ? "urgent" : "safe";

  return (
    <article className={`tm-work-card tm-work-card--${viewMode}`}>
      <div className="tm-work-card__main">
        <div className="tm-work-card__meta-row">
          <span className={`tm-status tm-status--${work.status}`}>
            {STATUS_LABEL[work.status]}
          </span>
          <span className={`tm-priority tm-priority--${priority}`}>
            {priority === "critical" && "🔴 Critical"}
            {priority === "high" && "🟠 High"}
            {priority === "medium" && "🟡 Medium"}
            {priority === "low" && "🟢 Low"}
          </span>
        </div>

        <div>
          <p className="tm-work-card__eyebrow">{work.genre} / {work.phase}</p>
          <h2 className="tm-work-card__title">{work.title}</h2>
        </div>

        <div className="tm-work-card__chapter">
          <BookOpen size={18} strokeWidth={2.2} />
          <span>Chương {work.currentChapter} đang thực hiện</span>
        </div>

        <div className={`tm-deadline tm-deadline--${deadlineTone}`}>
          {daysUntil < 0 ? (
            <AlertTriangle size={16} strokeWidth={2.4} />
          ) : (
            <CalendarClock size={16} strokeWidth={2.4} />
          )}
          <span>{getDeadlineText(daysUntil)}</span>
        </div>

        <div className="tm-progress">
          <div className="tm-progress__top">
            <span>Tiến độ chương</span>
            <strong>{work.progress}%</strong>
          </div>
          <div className="tm-progress__track">
            <span
              className="tm-progress__fill"
              style={getProgressStyle(work.progress)}
            />
          </div>
        </div>

        <div className="tm-work-card__footer">
          <div className="tm-owner">
            <div className="tm-owner__avatar">{getInitials(work.mangaka)}</div>
            <div>
              <span>Người phụ trách</span>
              <strong>{work.mangaka}</strong>
              <small>{work.role}</small>
            </div>
          </div>

          <div className="tm-actions" aria-label={`Thao tác cho ${work.title}`}>
            <button type="button" className="tm-action" aria-label="Chi tiết">
              <Eye size={17} strokeWidth={2.2} />
            </button>
            <button type="button" className="tm-action" aria-label="Tin nhắn">
              <MessageSquare size={17} strokeWidth={2.2} />
            </button>
            <button type="button" className="tm-action" aria-label="Annotation">
              <PenLine size={17} strokeWidth={2.2} />
            </button>
            <button type="button" className="tm-action" aria-label="Cảnh báo">
              <Bell size={17} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>

      <div className={`tm-cover tm-cover--${work.coverTone}`} aria-label={`Bìa ${work.title}`}>
        <span>{work.title.charAt(0)}</span>
      </div>
    </article>
  );
}

export default function TantouManage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("deadline");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);

  const stats = useMemo(
    () => [
      {
        label: "Tổng tác phẩm",
        value: WORKS.length,
        icon: Layers3,
        tone: "primary",
      },
      {
        label: "Đúng tiến độ",
        value: WORKS.filter((work) => work.status === "on-track").length,
        icon: CheckCircle2,
        tone: "success",
      },
      {
        label: "Trễ hạn",
        value: WORKS.filter((work) => work.status === "overdue").length,
        icon: ShieldAlert,
        tone: "danger",
      },
      {
        label: "Tiền sản xuất",
        value: WORKS.filter((work) => work.status === "pre-production").length,
        icon: Sparkles,
        tone: "info",
      },
    ],
    [],
  );

  const filteredWorks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return WORKS.filter((work) => {
      const matchesSearch =
        !normalizedSearch ||
        work.title.toLowerCase().includes(normalizedSearch) ||
        work.mangaka.toLowerCase().includes(normalizedSearch);
      const matchesStatus = statusFilter === "all" || work.status === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortMode === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      if (sortMode === "name") {
        return a.title.localeCompare(b.title, "vi");
      }

      if (sortMode === "progress") {
        return b.progress - a.progress;
      }

      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }, [searchTerm, sortMode, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredWorks.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleWorks = filteredWorks.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const updateSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const updateStatus = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const updateSort = (value: SortMode) => {
    setSortMode(value);
    setPage(1);
  };

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

      <section className="tm-stats" aria-label="Thống kê tác phẩm">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className={`tm-stat tm-stat--${stat.tone}`} key={stat.label}>
              <div className="tm-stat__icon">
                <Icon size={20} strokeWidth={2.3} />
              </div>
              <div>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            </div>
          );
        })}
      </section>

      <section className="tm-toolbar" aria-label="Bộ lọc tác phẩm">
        <label className="tm-search">
          <Search size={18} strokeWidth={2.2} />
          <input
            type="search"
            placeholder="Tìm tác phẩm, mangaka..."
            value={searchTerm}
            onChange={(event) => updateSearch(event.target.value)}
          />
        </label>

        <div className="tm-toolbar__controls">
          <label className="tm-select">
            <span>Filter</span>
            <select
              value={statusFilter}
              onChange={(event) => updateStatus(event.target.value as StatusFilter)}
            >
              {FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="tm-select">
            <span>Sort</span>
            <select
              value={sortMode}
              onChange={(event) => updateSort(event.target.value as SortMode)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="tm-view-switcher" aria-label="Đổi kiểu hiển thị">
            <button
              type="button"
              className={viewMode === "grid" ? "tm-view-switcher__btn tm-view-switcher__btn--active" : "tm-view-switcher__btn"}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 size={16} strokeWidth={2.2} />
              Grid View
            </button>
            <button
              type="button"
              className={viewMode === "list" ? "tm-view-switcher__btn tm-view-switcher__btn--active" : "tm-view-switcher__btn"}
              onClick={() => setViewMode("list")}
            >
              <List size={16} strokeWidth={2.2} />
              List View
            </button>
          </div>
        </div>
      </section>

      {visibleWorks.length > 0 ? (
        <>
          <section className={`tm-work-grid tm-work-grid--${viewMode}`}>
            {visibleWorks.map((work) => (
              <WorkCard key={work.id} work={work} viewMode={viewMode} />
            ))}
          </section>

          <nav className="tm-pagination" aria-label="Phân trang tác phẩm">
            <button
              type="button"
              className="tm-pagination__btn"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={safePage === 1}
              aria-label="Trang trước"
            >
              <ChevronLeft size={17} strokeWidth={2.4} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
              <button
                key={item}
                type="button"
                className={safePage === item ? "tm-pagination__btn tm-pagination__btn--active" : "tm-pagination__btn"}
                onClick={() => setPage(item)}
              >
                {item}
              </button>
            ))}

            <button
              type="button"
              className="tm-pagination__btn"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={safePage === totalPages}
              aria-label="Trang sau"
            >
              <ChevronRight size={17} strokeWidth={2.4} />
            </button>
          </nav>
        </>
      ) : (
        <section className="tm-empty">
          <div className="tm-empty__icon" aria-hidden="true">📚</div>
          <strong>Chưa có tác phẩm nào</strong>
          <p>Hãy tạo hoặc phân công tác phẩm mới.</p>
        </section>
      )}
    </main>
  );
}

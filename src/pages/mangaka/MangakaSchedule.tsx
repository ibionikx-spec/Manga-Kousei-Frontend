import { useEffect, useMemo, useState } from "react";
import {
  fetchChaptersBySeriesMangaka,
  type ChapterRes,
  type PageDeadline,
} from "../../services/chapterService";
import {
  fetchMySeries,
  type MangakaSeries,
} from "../../services/mangakaSeriesService";
import "./MangakaSchedule.scss";

type CalendarTone = "blue" | "indigo" | "red";

type CalendarEvent = {
  label: string;
  tone: CalendarTone;
};

type CalendarDay = {
  date: Date;
  day: string;
  muted?: boolean;
  today?: boolean;
  danger?: boolean;
  events: CalendarEvent[];
};

type ChapterWithSeries = ChapterRes & {
  seriesId: number;
  seriesTitle: string;
};

type PriorityTask = {
  title: string;
  description: string;
  meta: string;
  tone: CalendarTone;
};

type ProductionRow = {
  chapter: string;
  stage: string;
  percent: number;
  tone: "blue" | "indigo";
  labels: string[];
};

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTH_LABEL = new Intl.DateTimeFormat("vi-VN", {
  month: "long",
  year: "numeric",
});

const STATUS_LABELS: Record<string, string> = {
  draft: "Bản nháp",
  in_progress: "Đang làm",
  pages_submitted: "Đã nộp trang",
  pending_publish: "Chờ đăng",
  published: "Đã đăng",
};

const ACTIVE_DEADLINE_STATUSES = new Set(["pending", "revision", "late"]);

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getBackendWeekday(date: Date) {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
}

function isSameDay(a: Date, b: Date) {
  return toDateKey(a) === toDateKey(b);
}

function formatShortDate(value: string) {
  return parseLocalDate(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

function buildMonthDays(monthDate: Date, today: Date): CalendarDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (getBackendWeekday(firstDay) + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index,
    );

    return {
      date,
      day: String(date.getDate()),
      muted: date.getMonth() !== month,
      today: isSameDay(date, today),
      events: [],
    };
  });
}

function isSeriesScheduledOn(series: MangakaSeries, date: Date) {
  if (!series.scheduleType || !series.dayValue) return false;

  if (series.scheduleType === "weekly") {
    return getBackendWeekday(date) === series.dayValue;
  }

  return date.getDate() === series.dayValue;
}

function makeDeadlineLabel(
  chapter: ChapterWithSeries,
  deadline: PageDeadline,
) {
  const pageRange =
    deadline.pageFrom === deadline.pageTo
      ? `${deadline.pageFrom}`
      : `${deadline.pageFrom}-${deadline.pageTo}`;

  return `Deadline: ${chapter.seriesTitle} Ch.${chapter.chapterNumber} tr.${pageRange}`;
}

function buildCalendarDays(
  monthDate: Date,
  seriesList: MangakaSeries[],
  chapters: ChapterWithSeries[],
) {
  const today = startOfDay(new Date());
  const days = buildMonthDays(monthDate, today);
  const eventsByDate = new Map<string, CalendarEvent[]>();

  const pushEvent = (date: Date, event: CalendarEvent) => {
    const key = toDateKey(date);
    eventsByDate.set(key, [...(eventsByDate.get(key) ?? []), event]);
  };

  days.forEach((day) => {
    seriesList.forEach((series) => {
      if (!day.muted && isSeriesScheduledOn(series, day.date)) {
        pushEvent(day.date, {
          label: `Xuất bản: ${series.title}`,
          tone: "blue",
        });
      }
    });
  });

  chapters.forEach((chapter) => {
    chapter.pageDeadlines.forEach((deadline) => {
      if (!deadline.dueDate || !ACTIVE_DEADLINE_STATUSES.has(deadline.status)) {
        return;
      }

      const dueDate = parseLocalDate(deadline.dueDate);
      if (dueDate.getMonth() !== monthDate.getMonth()) return;
      if (dueDate.getFullYear() !== monthDate.getFullYear()) return;

      const isOverdue = startOfDay(dueDate) < today;
      pushEvent(dueDate, {
        label: makeDeadlineLabel(chapter, deadline),
        tone: isOverdue || deadline.status === "late" ? "red" : "indigo",
      });
    });
  });

  return days.map((day) => {
    const events = eventsByDate.get(toDateKey(day.date)) ?? [];
    return {
      ...day,
      events,
      danger: events.some((event) => event.tone === "red"),
    };
  });
}

function buildPriorityTasks(chapters: ChapterWithSeries[]): PriorityTask[] {
  const today = startOfDay(new Date());

  return chapters
    .flatMap((chapter) =>
      chapter.pageDeadlines
        .filter(
          (deadline) =>
            deadline.dueDate && ACTIVE_DEADLINE_STATUSES.has(deadline.status),
        )
        .map((deadline) => {
          const dueDate = parseLocalDate(deadline.dueDate);
          const dayDiff = Math.round(
            (startOfDay(dueDate).getTime() - today.getTime()) / 86400000,
          );
          const isOverdue = dayDiff < 0 || deadline.status === "late";
          const pageRange =
            deadline.pageFrom === deadline.pageTo
              ? `${deadline.pageFrom}`
              : `${deadline.pageFrom}-${deadline.pageTo}`;

          return {
            task: {
              title: `Nộp trang ${pageRange}`,
              description: `${chapter.seriesTitle} - Chương ${chapter.chapterNumber}${
                chapter.title ? `: ${chapter.title}` : ""
              }`,
              meta: isOverdue
                ? `Quá hạn ${Math.abs(dayDiff)} ngày`
                : dayDiff === 0
                  ? "Deadline: hôm nay"
                  : `Deadline: ${formatShortDate(deadline.dueDate)}`,
              tone: isOverdue || dayDiff === 0 ? "red" : "blue",
            } satisfies PriorityTask,
            dueTime: dueDate.getTime(),
          };
        }),
    )
    .sort((a, b) => a.dueTime - b.dueTime)
    .slice(0, 5)
    .map((item) => item.task);
}

function buildProductionRows(chapters: ChapterWithSeries[]): ProductionRow[] {
  return chapters
    .slice()
    .sort((a, b) => b.chapterNumber - a.chapterNumber)
    .slice(0, 4)
    .map((chapter, index) => {
      const completed = chapter.pageDeadlines.filter((deadline) =>
        ["submitted", "approved"].includes(deadline.status),
      ).length;
      const total = chapter.totalDeadlines || chapter.pageDeadlines.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      const stage = STATUS_LABELS[chapter.chapterStatus] ?? chapter.chapterStatus;

      return {
        chapter: `${chapter.seriesTitle} - Chương ${chapter.chapterNumber}${
          chapter.title ? `: ${chapter.title}` : ""
        }`,
        stage: `Giai đoạn: ${stage}`,
        percent,
        tone: index % 2 === 0 ? "blue" : "indigo",
        labels:
          total > 0
            ? [`${completed}/${total} nhóm`, "Đang xử lý", "Chờ duyệt", "Hoàn tất"]
            : ["Chưa có deadline", "Đang chuẩn bị", "Chờ duyệt", "Hoàn tất"],
      };
    });
}

export default function MangakaSchedule() {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfDay(new Date()));
  const [seriesList, setSeriesList] = useState<MangakaSeries[]>([]);
  const [chapters, setChapters] = useState<ChapterWithSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadSchedule = async () => {
      setLoading(true);
      setError("");

      try {
        const series = await fetchMySeries();
        const chapterGroups = await Promise.all(
          series.map(async (item) => {
            try {
              const data = await fetchChaptersBySeriesMangaka(item.seriesId);
              return data.map((chapter) => ({
                ...chapter,
                seriesId: item.seriesId,
                seriesTitle: item.title,
              }));
            } catch (err) {
              console.error("Không thể tải chapters", err);
              return [];
            }
          }),
        );

        if (!mounted) return;
        setSeriesList(series);
        setChapters(chapterGroups.flat());
      } catch (err) {
        console.error("Không thể tải lịch mangaka", err);
        if (mounted) {
          setError("Không thể tải dữ liệu lịch. Vui lòng thử lại sau.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadSchedule();

    return () => {
      mounted = false;
    };
  }, []);

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth, seriesList, chapters),
    [visibleMonth, seriesList, chapters],
  );

  const priorityTasks = useMemo(() => buildPriorityTasks(chapters), [chapters]);
  const productionRows = useMemo(
    () => buildProductionRows(chapters),
    [chapters],
  );
  const releaseCount = calendarDays.reduce(
    (total, day) =>
      total +
      day.events.filter((event) => event.label.startsWith("Xuất bản:")).length,
    0,
  );
  const coverSeries = seriesList.find((series) => series.coverImageUrl);

  const moveMonth = (amount: number) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  return (
    <section className="mangaka-schedule">
      <div className="schedule-main">
        <article className="calendar-panel">
          <header className="schedule-card-header">
            <div>
              <h1>{MONTH_LABEL.format(visibleMonth)}</h1>
              <p>
                {loading
                  ? "Đang tải lịch xuất bản"
                  : `${releaseCount} lịch xuất bản trong tháng`}
              </p>
            </div>
            <div className="calendar-controls" aria-label="Điều hướng tháng">
              <button
                type="button"
                aria-label="Tháng trước"
                onClick={() => moveMonth(-1)}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Tháng sau"
                onClick={() => moveMonth(1)}
              >
                ›
              </button>
            </div>
          </header>

          {error && <div className="schedule-state is-error">{error}</div>}
          {loading && <div className="schedule-state">Đang tải dữ liệu...</div>}

          <div
            className="calendar-grid"
            aria-label={`Lịch sản xuất ${MONTH_LABEL.format(visibleMonth)}`}
          >
            {WEEKDAYS.map((day) => (
              <div className="calendar-weekday" key={day}>
                {day}
              </div>
            ))}
            {calendarDays.map((item) => (
              <div
                className={`calendar-day${item.muted ? " is-muted" : ""}${
                  item.today ? " is-today" : ""
                }${item.danger ? " is-danger" : ""}`}
                key={toDateKey(item.date)}
              >
                <span className="calendar-day__number">{item.day}</span>
                <div className="calendar-day__events">
                  {item.events.map((event) => (
                    <span
                      className={`calendar-event calendar-event--${event.tone}`}
                      key={event.label}
                      title={event.label}
                    >
                      {event.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="production-panel">
          <h2>Tiến độ sản xuất chương</h2>
          {productionRows.length === 0 ? (
            <div className="schedule-state">Chưa có chapter để theo dõi.</div>
          ) : (
            <div className="production-list">
              {productionRows.map((row) => (
                <div className="production-item" key={row.chapter}>
                  <div className="production-item__head">
                    <h3>{row.chapter}</h3>
                    <span>{row.stage}</span>
                  </div>
                  <div
                    className="production-track"
                    aria-label={`${row.chapter} ${row.percent}%`}
                  >
                    <span
                      className={`production-track__fill production-track__fill--${row.tone}`}
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                  <div className="production-labels">
                    {row.labels.map((label, labelIndex) => (
                      <span
                        className={labelIndex === 0 ? "is-active" : ""}
                        key={label}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </div>

      <aside className="schedule-sidebar" aria-label="Công việc và bìa tập">
        <article className="priority-panel">
          <h2>
            <span aria-hidden="true">!</span>
            Task ưu tiên hôm nay
          </h2>
          {priorityTasks.length === 0 ? (
            <div className="schedule-state">
              Không có deadline khẩn trong dữ liệu hiện tại.
            </div>
          ) : (
            <div className="priority-list">
              {priorityTasks.map((task) => (
                <label
                  className={`priority-task priority-task--${task.tone}`}
                  key={`${task.title}-${task.description}`}
                >
                  <input type="checkbox" />
                  <span>
                    <strong>{task.title}</strong>
                    <small>{task.description}</small>
                    <em>{task.meta}</em>
                  </span>
                </label>
              ))}
            </div>
          )}
          <button className="view-all-button" type="button">
            {priorityTasks.length > 0
              ? `Đang hiển thị ${priorityTasks.length} task`
              : "Chưa có task cần xử lý"}
          </button>
        </article>

        <article className="cover-panel">
          <h2>{coverSeries ? `Bìa ${coverSeries.title}` : "Series của bạn"}</h2>
          <p>
            {coverSeries
              ? "Ảnh bìa từ dữ liệu series"
              : `${seriesList.length} series đang được theo dõi`}
          </p>
          {coverSeries?.coverImageUrl ? (
            <img
              className="cover-image"
              src={coverSeries.coverImageUrl}
              alt={`Bìa ${coverSeries.title}`}
            />
          ) : (
            <div className="cover-art" aria-label="Minh họa bìa series">
              <div className="cover-art__figure" />
              <span className="cover-art__slash cover-art__slash--one" />
              <span className="cover-art__slash cover-art__slash--two" />
            </div>
          )}
          <button type="button">Xem chi tiết</button>
        </article>
      </aside>
    </section>
  );
}

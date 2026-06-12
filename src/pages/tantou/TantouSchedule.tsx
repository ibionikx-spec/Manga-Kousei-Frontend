import { useState, useRef, useEffect } from "react";
import {
  Filter,
  AlertTriangle,
  ChevronDown,
  Check,
  List as ListIcon,
  GanttChartSquare,
} from "lucide-react";
import "./TantouSchedule.scss";

type MilestoneType =
  | "name_review"
  | "genga_deadline"
  | "print_send"
  | "publish";
type ItemStatus = "on-track" | "behind" | "done";

interface Milestone {
  type: MilestoneType;
  pos: number;
  date: string;
  label: string;
}

interface ScheduleItem {
  id: number;
  series: string;
  chapter: string;
  author: string;
  status: ItemStatus;
  barStart: number;
  barSolidEnd: number;
  barEnd: number;
  milestones: Milestone[];
}

const MONTHS = ["Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11"];
const CURRENT_MONTH_INDEX = 2; // Tháng 10

const MILESTONE_META: Record<MilestoneType, { label: string }> = {
  name_review: { label: "Duyệt kịch bản (Name)" },
  genga_deadline: { label: "Hạn nộp Bản thảo (Genga)" },
  print_send: { label: "Ngày gửi in" },
  publish: { label: "Ngày phát hành" },
};

const SCHEDULE: ScheduleItem[] = [
  {
    id: 1,
    series: "Bóng Tối Thành Phố",
    chapter: "Tập 4",
    author: "Hùng Lê",
    status: "on-track",
    barStart: 8,
    barSolidEnd: 56,
    barEnd: 71,
    milestones: [
      {
        type: "name_review",
        pos: 31,
        date: "05/09/2023",
        label: "Duyệt kịch bản (Name)",
      },
      {
        type: "name_review",
        pos: 47,
        date: "20/09/2023",
        label: "Duyệt kịch bản (Name)",
      },
      {
        type: "genga_deadline",
        pos: 56,
        date: "25/10/2023",
        label: "Hạn nộp Bản thảo (Genga)",
      },
      { type: "publish", pos: 71, date: "05/11/2023", label: "Ngày phát hành" },
    ],
  },
  {
    id: 2,
    series: "Hoa Anh Đào Mùa Xuân",
    chapter: "Tập 12",
    author: "Mai Nguyễn",
    status: "on-track",
    barStart: 33,
    barSolidEnd: 57,
    barEnd: 83,
    milestones: [
      {
        type: "name_review",
        pos: 44,
        date: "28/09/2023",
        label: "Duyệt kịch bản (Name)",
      },
      {
        type: "genga_deadline",
        pos: 57,
        date: "12/10/2023",
        label: "Hạn nộp Bản thảo (Genga)",
      },
      { type: "print_send", pos: 83, date: "02/11/2023", label: "Ngày gửi in" },
    ],
  },
  {
    id: 3,
    series: "Chiến Binh Ánh Sáng",
    chapter: "Tập 2",
    author: "Tuấn Trần",
    status: "behind",
    barStart: 50,
    barSolidEnd: 64,
    barEnd: 83,
    milestones: [
      {
        type: "name_review",
        pos: 64,
        date: "18/10/2023",
        label: "Duyệt kịch bản (Name)",
      },
      { type: "print_send", pos: 83, date: "30/10/2023", label: "Ngày gửi in" },
    ],
  },
  {
    id: 4,
    series: "Vương Quốc Băng Giá",
    chapter: "Tập 8",
    author: "Lan Phạm",
    status: "done",
    barStart: 3,
    barSolidEnd: 27,
    barEnd: 27,
    milestones: [
      {
        type: "name_review",
        pos: 11,
        date: "08/08/2023",
        label: "Duyệt kịch bản (Name)",
      },
      {
        type: "genga_deadline",
        pos: 19,
        date: "18/08/2023",
        label: "Hạn nộp Bản thảo (Genga)",
      },
      { type: "print_send", pos: 23, date: "24/08/2023", label: "Ngày gửi in" },
      { type: "publish", pos: 27, date: "01/09/2023", label: "Ngày phát hành" },
    ],
  },
];

const UPCOMING = [
  {
    id: 1,
    series: "Bóng Tối Thành Phố",
    chapter: "Tập 4",
    label: "Ngày gửi in",
    date: "25/10/2023",
    tone: "default" as const,
  },
  {
    id: 2,
    series: "Chiến Binh Ánh Sáng",
    chapter: "Tập 2",
    label: "Hạn chốt Genga",
    extra: "Trễ tiến độ",
    date: "20/10/2023",
    tone: "danger" as const,
  },
];

const STATUS_LABEL: Record<ItemStatus, string> = {
  "on-track": "Đúng tiến độ",
  behind: "Trễ tiến độ",
  done: "Hoàn thành",
};

const FILTERS: { key: "all" | ItemStatus; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "on-track", label: "Đúng tiến độ" },
  { key: "behind", label: "Trễ tiến độ" },
  { key: "done", label: "Hoàn thành" },
];

function Marker({ type }: { type: MilestoneType }) {
  if (type === "publish") {
    return <span className="sch-marker sch-marker--publish" />;
  }
  return (
    <span
      className={`sch-marker sch-marker--${type === "name_review" ? "name" : type === "genga_deadline" ? "genga" : "print"}`}
    />
  );
}

export default function TantouSchedule() {
  const [view, setView] = useState<"gantt" | "list">("gantt");
  const [filter, setFilter] = useState<"all" | ItemStatus>("all");
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    if (showFilter) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showFilter]);

  const items = SCHEDULE.filter(
    (it) => filter === "all" || it.status === filter,
  );

  return (
    <div className="sch-page">
      <div className="sch-header">
        <div className="sch-header__left">
          <h1>Lịch trình Xuất bản</h1>
          <p>Tổng quan tiến độ xuất bản Tháng 10, 2023</p>
        </div>

        <div className="sch-header__right">
          <div className="sch-filter" ref={filterRef}>
            <button
              className={`sch-filter__btn ${filter !== "all" ? "sch-filter__btn--active" : ""}`}
              onClick={() => setShowFilter((v) => !v)}
            >
              <Filter size={15} strokeWidth={2} />
              {filter === "all" ? "Lọc" : STATUS_LABEL[filter]}
              <ChevronDown size={14} strokeWidth={2} />
            </button>

            {showFilter && (
              <div className="sch-filter__menu">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    className={`sch-filter__item ${filter === f.key ? "sch-filter__item--active" : ""}`}
                    onClick={() => {
                      setFilter(f.key);
                      setShowFilter(false);
                    }}
                  >
                    <span>{f.label}</span>
                    {filter === f.key && <Check size={14} strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="sch-toggle">
            <button
              className={`sch-toggle__btn ${view === "gantt" ? "sch-toggle__btn--active" : ""}`}
              onClick={() => setView("gantt")}
            >
              <GanttChartSquare size={15} strokeWidth={2} />
              Gantt
            </button>
            <button
              className={`sch-toggle__btn ${view === "list" ? "sch-toggle__btn--active" : ""}`}
              onClick={() => setView("list")}
            >
              <ListIcon size={15} strokeWidth={2} />
              Lịch
            </button>
          </div>
        </div>
      </div>

      <div className="sch-grid">
        <div className="sch-card sch-board">
          {view === "gantt" ? (
            <div className="sch-gantt">
              <div className="sch-gantt__head sch-gantt__cell sch-gantt__cell--label">
                Series / Tác giả
              </div>
              {MONTHS.map((m, i) => (
                <div
                  key={m}
                  className="sch-gantt__head sch-gantt__cell sch-gantt__cell--month"
                >
                  {m}
                  {i === CURRENT_MONTH_INDEX && (
                    <span className="sch-gantt__current-tag">(Hiện tại)</span>
                  )}
                </div>
              ))}

              {items.map((item) => (
                <div className="sch-gantt__row" key={item.id}>
                  <div className="sch-gantt__cell sch-gantt__cell--label">
                    <div className="sch-row-title">
                      {item.series}
                      <span className="sch-row-chapter">{item.chapter}</span>
                    </div>
                    <div className="sch-row-author">Tác giả: {item.author}</div>
                  </div>

                  <div className="sch-gantt__timeline">
                    {MONTHS.slice(1).map((_, i) => (
                      <div
                        key={i}
                        className="sch-gantt__gridline"
                        style={{ left: `${((i + 1) / MONTHS.length) * 100}%` }}
                      />
                    ))}

                    <div
                      className={`sch-bar sch-bar--track sch-bar--${item.status}`}
                      style={{
                        left: `${item.barStart}%`,
                        width: `${item.barEnd - item.barStart}%`,
                      }}
                    />
                    <div
                      className={`sch-bar sch-bar--solid sch-bar--${item.status}`}
                      style={{
                        left: `${item.barStart}%`,
                        width: `${item.barSolidEnd - item.barStart}%`,
                      }}
                    />

                    {item.milestones.map((m, i) => (
                      <div
                        key={i}
                        className="sch-marker-wrap"
                        style={{ left: `${m.pos}%` }}
                        title={`${m.label} — ${m.date}`}
                      >
                        <Marker type={m.type} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sch-list">
              <div className="sch-list__head">
                <span>Series / Chương</span>
                <span>Tác giả</span>
                <span>Trạng thái</span>
                <span>Mốc tiếp theo</span>
                <span>Ngày</span>
              </div>
              {items.map((item) => {
                const pending =
                  item.status !== "done"
                    ? (item.milestones.find((m) => m.pos >= item.barSolidEnd) ??
                      item.milestones[item.milestones.length - 1])
                    : item.milestones[item.milestones.length - 1];
                return (
                  <div className="sch-list__row" key={item.id}>
                    <div className="sch-row-title">
                      {item.series}
                      <span className="sch-row-chapter">{item.chapter}</span>
                    </div>
                    <span className="sch-list__author">{item.author}</span>
                    <span className={`sch-status sch-status--${item.status}`}>
                      {STATUS_LABEL[item.status]}
                    </span>
                    <span className="sch-list__milestone">
                      <Marker type={pending.type} />
                      {pending.label}
                    </span>
                    <span className="sch-list__date">{pending.date}</span>
                  </div>
                );
              })}
              {items.length === 0 && (
                <div className="sch-list__empty">
                  Không có dự án phù hợp với bộ lọc.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sch-side">
          <div className="sch-card sch-legend">
            <div className="sch-card__title">CHÚ GIẢI MILESTONES</div>
            <ul className="sch-legend__list">
              <li>
                <span className="sch-marker sch-marker--name" />
                {MILESTONE_META.name_review.label}
              </li>
              <li>
                <span className="sch-marker sch-marker--genga" />
                {MILESTONE_META.genga_deadline.label}
              </li>
              <li>
                <span className="sch-marker sch-marker--print" />
                {MILESTONE_META.print_send.label}
              </li>
              <li>
                <span className="sch-marker sch-marker--publish" />
                {MILESTONE_META.publish.label}
              </li>
            </ul>
          </div>

          <div className="sch-card sch-upcoming">
            <div className="sch-upcoming__head">
              <AlertTriangle size={15} strokeWidth={2.25} />
              Sắp đến hạn (7 ngày tới)
            </div>

            <div className="sch-upcoming__list">
              {UPCOMING.map((u) => (
                <div className="sch-upcoming__item" key={u.id}>
                  <div className="sch-upcoming__title">
                    {u.series}{" "}
                    <span className="sch-row-chapter">{u.chapter}</span>
                  </div>
                  <div className="sch-upcoming__label">
                    {u.label}
                    {u.extra && (
                      <strong className="sch-upcoming__extra">
                        {" "}
                        ({u.extra})
                      </strong>
                    )}
                  </div>
                  <div className={`sch-date-badge sch-date-badge--${u.tone}`}>
                    {u.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

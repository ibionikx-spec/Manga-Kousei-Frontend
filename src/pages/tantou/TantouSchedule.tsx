import { useState, useRef, useEffect } from "react";
import {
  Filter,
  AlertTriangle,
  ChevronDown,
  Check,
  List as ListIcon,
  GanttChartSquare,
  Eye,
  RefreshCw,
  Send,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useSchedule } from "../../hooks/useSchedule";
import { useScheduleFilters } from "../../hooks/useScheduleFilters";
import { useChapterDetail } from "../../hooks/useChapterDetail";
import { FullScreenLoader } from "../../components/common/FullScreenLoader";
import type { ScheduleEvent } from "../../types/schedule";
import {
  submitChapterToAdmin,
  fetchDeadlinePages,
  type PageDeadline,
  type PageSimple,
} from "../../services/chapterService";
import "./TantouSchedule.scss";

type ViewMode = "gantt" | "list";
type ItemStatus = "on-track" | "behind" | "done";

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
const mapStatus = (status: string): ItemStatus => {
  if (status === "approved" || status === "completed") return "done";
  if (status === "revision" || status === "late") return "behind";
  return "on-track";
};
type MilestoneType = "name_review" | "genga_deadline" | "print_send" | "publish";
const MILESTONE_META: Record<MilestoneType, { label: string }> = {
  name_review: { label: "Duyệt kịch bản (Name)" },
  genga_deadline: { label: "Hạn nộp Bản thảo (Genga)" },
  print_send: { label: "Ngày gửi in" },
  publish: { label: "Ngày phát hành" },
};
function Marker({ type }: { type: MilestoneType }) {
  if (type === "publish") {
    return <span className="sch-marker sch-marker--publish" />;
  }
  return (
    <span
      className={`sch-marker sch-marker--${
        type === "name_review"
          ? "name"
          : type === "genga_deadline"
          ? "genga"
          : "print"
      }`}
    />
  );
}
export default function TantouSchedule() {
  const { user } = useAuth();
  const [view, setView] = useState<ViewMode>("gantt");
  const [filter, setFilter] = useState<"all" | ItemStatus>("all");
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const { filters, updateFilter } = useScheduleFilters({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10),
    status: "",
  });
  const { events, loading, error, refetch } = useSchedule({
    tantouId: user?.id || 1,
    from: filters.from || undefined,
    to: filters.to || undefined,
    status: filters.status || undefined,
  });
  const {
    selectedChapter,
    loading: chapterLoading,
    error: chapterError,
    fetchChapterDetail,
    clearSelected,
    refreshChapter,
  } = useChapterDetail();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"chapter" | "page">("chapter");
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [deadlinePagesMap, setDeadlinePagesMap] = useState<Record<number, PageSimple[]>>({});
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    if (showFilter) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showFilter]);
  const handleEventClick = async (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
    setModalMode(event.type === "chapter" ? "chapter" : "page");
    if (event.type === "chapter") {
      await fetchChapterDetail(event.seriesId, event.chapterId);
    } else {
      if (!deadlinePagesMap[event.eventId]) {
        setPageLoading(true);
        setPageError(null);
        try {
          const pages = await fetchDeadlinePages(event.eventId);
          setDeadlinePagesMap(prev => ({
            ...prev,
            [event.eventId]: pages,
          }));
        } catch (err) {
          setPageError(err instanceof Error ? err.message : "Lỗi tải trang");
        } finally {
          setPageLoading(false);
        }
      } else {
        setPageLoading(false);
        setPageError(null);
      }
    }
  };
  const handleSubmitChapter = async () => {
    if (!selectedEvent) return;
    if (!confirm("Submit chapter này lên admin để duyệt?")) return;
    try {
      await submitChapterToAdmin(selectedEvent.chapterId);
      await refreshChapter(selectedEvent.seriesId, selectedEvent.chapterId);
      refetch();
    } catch (err) {
      alert("Lỗi submit: " + (err instanceof Error ? err.message : ""));
    }
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
    clearSelected();
    setPageError(null);
  };
  const buildScheduleItems = (items: ScheduleEvent[]) => {
    if (!items.length) return { items: [], months: [] };
    const dates = items.map((i) => new Date(i.date));
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    const range = maxDate.getTime() - minDate.getTime();
    const paddedMin = new Date(minDate.getTime() - range * 0.05);
    const paddedMax = new Date(maxDate.getTime() + range * 0.05);
    const totalMs = paddedMax.getTime() - paddedMin.getTime();
    const months: string[] = [];
    const current = new Date(paddedMin);
    current.setDate(1);
    while (current <= paddedMax) {
      months.push(`Tháng ${current.getMonth() + 1}`);
      current.setMonth(current.getMonth() + 1);
    }
    const groups: Record<string, ScheduleEvent[]> = {};
    items.forEach((item) => {
      const key = `${item.seriesTitle}-${item.chapterNumber}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    const itemsConverted = Object.keys(groups).map((key, index) => {
      const events = groups[key];
      const first = events[0];
      const sortedEvents = events.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const firstDate = new Date(sortedEvents[0].date);
      const lastDate = new Date(sortedEvents[sortedEvents.length - 1].date);
      const startPos = ((firstDate.getTime() - paddedMin.getTime()) / totalMs) * 100;
      const endPos = ((lastDate.getTime() - paddedMin.getTime()) / totalMs) * 100;
      const milestones = sortedEvents.map((ev) => {
        const pos = ((new Date(ev.date).getTime() - paddedMin.getTime()) / totalMs) * 100;
        const type: MilestoneType =
          ev.type === "chapter" ? "genga_deadline" : "print_send";
        return {
          type,
          pos: Math.min(100, Math.max(0, pos)),
          date: ev.date,
          label: ev.title,
          rawEvent: ev,
        };
      });
      const status = mapStatus(first.status);
      return {
        id: index + 1,
        series: first.seriesTitle,
        chapter: `Tập ${first.chapterNumber}`,
        author: "Tác giả",
        status,
        barStart: Math.min(100, Math.max(0, startPos)),
        barSolidEnd: Math.min(100, Math.max(0, endPos)),
        barEnd: Math.min(100, Math.max(0, endPos)),
        milestones,
        rawEvents: sortedEvents,
      };
    });
    return { items: itemsConverted, months };
  };
  const { items: scheduleItems, months } = buildScheduleItems(events);
  const filteredItems = scheduleItems.filter(
    (it) => filter === "all" || it.status === filter
  );
  const upcoming = events
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (loading) return <FullScreenLoader text="Đang tải lịch trình..." />;
  if (error)
    return (
      <div className="sch-error">
        <p>Đã xảy ra lỗi khi tải dữ liệu.</p>
        <p className="sch-error-detail">{error.message}</p>
        <button onClick={() => refetch()} className="sch-retry-btn">
          <RefreshCw size={16} /> Thử lại
        </button>
      </div>
    );
  return (
    <div className="sch-page">
      <div className="sch-header">
        <div className="sch-header__left">
          <h1>Lịch trình Xuất bản</h1>
          <p>
            {filters.from && filters.to
              ? `Từ ${filters.from} đến ${filters.to}`
              : "Tất cả sự kiện"}
          </p>
        </div>
        <div className="sch-header__right">
          <div className="sch-filter" ref={filterRef}>
            <button
              className={`sch-filter__btn ${
                filter !== "all" ? "sch-filter__btn--active" : ""
              }`}
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
                    className={`sch-filter__item ${
                      filter === f.key ? "sch-filter__item--active" : ""
                    }`}
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
          <div className="sch-date-range">
            <input
              type="date"
              value={filters.from}
              onChange={(e) => updateFilter("from", e.target.value)}
              className="sch-date-input"
            />
            <span className="sch-date-sep">→</span>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => updateFilter("to", e.target.value)}
              className="sch-date-input"
            />
          </div>
          <div className="sch-toggle">
            <button
              className={`sch-toggle__btn ${
                view === "gantt" ? "sch-toggle__btn--active" : ""
              }`}
              onClick={() => setView("gantt")}
            >
              <GanttChartSquare size={15} strokeWidth={2} />
              Gantt
            </button>
            <button
              className={`sch-toggle__btn ${
                view === "list" ? "sch-toggle__btn--active" : ""
              }`}
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
            <div
              className="sch-gantt"
              style={{
                gridTemplateColumns: `220px repeat(${Math.max(months.length, 1)}, 1fr)`,
              }}
            >
              <div className="sch-gantt__head sch-gantt__cell sch-gantt__cell--label">
                Series / Tác giả
              </div>
              {months.map((m, i) => (
                <div
                  key={m}
                  className="sch-gantt__head sch-gantt__cell sch-gantt__cell--month"
                >
                  {m}
                  {new Date().getMonth() === i && (
                    <span className="sch-gantt__current-tag">(Hiện tại)</span>
                  )}
                </div>
              ))}
              {filteredItems.length === 0 ? (
                <div className="sch-list__empty" style={{ gridColumn: "1 / -1" }}>
                  Không có dự án phù hợp với bộ lọc.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div className="sch-gantt__row" key={item.id}>
                    <div
                      className="sch-gantt__cell sch-gantt__cell--label"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (item.rawEvents.length > 0) {
                          handleEventClick(item.rawEvents[0]);
                        }
                      }}
                    >
                      <div className="sch-row-title">
                        {item.series}
                        <span className="sch-row-chapter">{item.chapter}</span>
                      </div>
                      <div className="sch-row-author">Tác giả: {item.author}</div>
                    </div>
                    <div className="sch-gantt__timeline">
                      {months.slice(1).map((_, i) => (
                        <div
                          key={i}
                          className="sch-gantt__gridline"
                          style={{
                            left: `${((i + 1) / months.length) * 100}%`,
                          }}
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
                          style={{
                            left: `${m.pos}%`,
                            cursor: "pointer",
                            zIndex: 10,
                          }}
                          title={`${m.label} — ${m.date}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (m.rawEvent) {
                              handleEventClick(m.rawEvent);
                            }
                          }}
                        >
                          <Marker type={m.type} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="sch-list">
              <div className="sch-list__head">
                <span>Series / Chương</span>
                <span>Tác giả</span>
                <span>Trạng thái</span>
                <span>Mốc tiếp theo</span>
                <span>Ngày</span>
                <span style={{ width: 40 }}></span>
              </div>
              {filteredItems.length === 0 ? (
                <div className="sch-list__empty">
                  Không có dự án phù hợp với bộ lọc.
                </div>
              ) : (
                filteredItems.map((item) => {
                  const pending =
                    item.status !== "done"
                      ? item.milestones.find((m) => m.pos >= item.barSolidEnd) ??
                        item.milestones[item.milestones.length - 1]
                      : item.milestones[item.milestones.length - 1];
                  return (
                    <div
                      className="sch-list__row"
                      key={item.id}
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (item.rawEvents.length > 0) {
                          handleEventClick(item.rawEvents[0]);
                        }
                      }}
                    >
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
                      <span className="sch-list__action">
                        <Eye size={16} strokeWidth={1.5} />
                      </span>
                    </div>
                  );
                })
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
              {upcoming.length === 0 ? (
                <div className="sch-upcoming__empty">
                  Không có sự kiện sắp đến hạn.
                </div>
              ) : (
                upcoming.map((u) => (
                  <div
                    className="sch-upcoming__item"
                    key={u.eventId}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEventClick(u)}
                  >
                    <div className="sch-upcoming__title">
                      {u.seriesTitle}{" "}
                      <span className="sch-row-chapter">
                        Chương {u.chapterNumber}
                      </span>
                    </div>
                    <div className="sch-upcoming__label">{u.title}</div>
                    <div className="sch-date-badge sch-date-badge--default">
                      {u.date}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {modalOpen && selectedEvent && (
        <div className="sch-modal-overlay" onClick={closeModal}>
          <div className="sch-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sch-modal__header">
              <h2>
                {modalMode === "chapter"
                  ? `${selectedEvent.seriesTitle} - Chương ${selectedEvent.chapterNumber}`
                  : `Chi tiết page deadline`}
              </h2>
              <button className="sch-modal__close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="sch-modal__body">
              {modalMode === "chapter" && (
                <>
                  {chapterLoading && <FullScreenLoader text="Đang tải chi tiết..." />}
                  {chapterError && (
                    <div className="sch-modal__error">{chapterError}</div>
                  )}
                  {selectedChapter && !chapterLoading && (
                    <>
                      <div className="sch-modal__info">
                        <div>
                          <strong>Trạng thái:</strong> {selectedChapter.chapterStatus}
                        </div>
                        <div>
                          <strong>Hạn nộp:</strong>{" "}
                          {selectedChapter.deadline
                            ? new Date(selectedChapter.deadline).toLocaleDateString(
                                "vi-VN"
                              )
                            : "Chưa có"}
                        </div>
                        {selectedChapter.adminNote && (
                          <div>
                            <strong>Ghi chú admin:</strong> {selectedChapter.adminNote}
                          </div>
                        )}
                      </div>
                      <div className="sch-modal__actions">
                        <button
                          className="sch-btn sch-btn--primary"
                          onClick={handleSubmitChapter}
                          disabled={selectedChapter.chapterStatus === "submitted"}
                        >
                          <Send size={16} /> Submit lên Admin
                        </button>
                      </div>
                      <div className="sch-modal__deadlines">
                        <div className="sch-modal__deadlines-header">
                          <h3>Page Deadlines</h3>
                        </div>
                        {selectedChapter.pageDeadlines.length === 0 ? (
                          <p>Chưa có deadline nào</p>
                        ) : (
                          selectedChapter.pageDeadlines.map((dl: PageDeadline) => (
                            <div key={dl.deadlineId} className="sch-modal__deadline-item">
                              <div className="sch-modal__deadline-info">
                                <div>
                                  <strong>Trang {dl.pageFrom} – {dl.pageTo}</strong>
                                </div>
                                <div>
                                  Hạn: {new Date(dl.dueDate).toLocaleDateString("vi-VN")}
                                </div>
                                <div>
                                  Trạng thái:{" "}
                                  <span
                                    className={`sch-status sch-status--${
                                      dl.status === "approved"
                                        ? "done"
                                        : dl.status === "revision"
                                        ? "behind"
                                        : "on-track"
                                    }`}
                                  >
                                    {dl.status}
                                  </span>
                                </div>
                                {dl.setByName && <div>Người tạo: {dl.setByName}</div>}
                                {dl.reviewNote && <div>Ghi chú: {dl.reviewNote}</div>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </>
              )}
              {modalMode === "page" && selectedEvent && (
                <>
                  <div className="sch-modal__info">
                    <div>
                      <strong>Series:</strong> {selectedEvent.seriesTitle}
                    </div>
                    <div>
                      <strong>Chương:</strong> {selectedEvent.chapterNumber}
                    </div>
                    <div>
                      <strong>Loại:</strong> {selectedEvent.title}
                    </div>
                    <div>
                      <strong>Ngày hạn:</strong> {selectedEvent.date}
                    </div>
                    {selectedEvent.pageFrom && selectedEvent.pageTo && (
                      <div>
                        <strong>Trang:</strong> {selectedEvent.pageFrom} –{" "}
                        {selectedEvent.pageTo}
                      </div>
                    )}
                  </div>
                  {pageLoading && <FullScreenLoader text="Đang tải danh sách trang..." />}
                  {pageError && <div className="sch-modal__error">{pageError}</div>}
                  {!pageLoading && !pageError && (
                    <div className="sch-modal__pages">
                      <div className="sch-modal__pages-header">
                        <h3>Danh sách trang</h3>
                      </div>
                      {!deadlinePagesMap[selectedEvent.eventId]?.length ? (
                        <p>Chưa có trang nào</p>
                      ) : (
                        <div className="sch-modal__pages-grid">
                          {deadlinePagesMap[selectedEvent.eventId]?.map((page, idx) => (
                            <div key={idx} className="sch-modal__page-card">
                              <div className="sch-modal__page-number">
                                Trang {page.pageNumber}
                              </div>
                              {page.fileUrl ? (
                                <img
                                  src={page.fileUrl}
                                  alt={`Trang ${page.pageNumber}`}
                                  className="sch-modal__page-image"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                    const parent = (e.target as HTMLImageElement)
                                      .parentElement;
                                    if (parent) {
                                      const placeholder = document.createElement("div");
                                      placeholder.className =
                                        "sch-modal__page-placeholder";
                                      placeholder.textContent = "Không thể tải ảnh";
                                      parent.appendChild(placeholder);
                                    }
                                  }}
                                />
                              ) : (
                                <div className="sch-modal__page-placeholder">
                                  Chưa có ảnh
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
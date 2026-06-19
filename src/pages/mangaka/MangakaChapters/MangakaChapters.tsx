import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Plus,
  X,
} from "lucide-react";
import {
  fetchChaptersBySeriesMangaka,
  createChapter,
  submitPageGroup,
  type ChapterRes,
} from "../../../services/chapterService";
import "./MangakaChapters.scss";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: "Bản nháp", cls: "cs-draft" },
  in_progress: { label: "Đang làm", cls: "cs-progress" },
  pages_submitted: { label: "Đã nộp trang", cls: "cs-submitted" },
  pending_publish: { label: "Chờ đăng", cls: "cs-pending" },
  published: { label: "Đã đăng", cls: "cs-published" },
};

const DEADLINE_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Chưa nộp", cls: "ds-pending" },
  submitted: { label: "Đã nộp", cls: "ds-submitted" },
  late: { label: "Trễ hạn", cls: "ds-late" },
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

export default function MangakaChapters() {
  const { seriesId } = useParams<{ seriesId: string }>();

  const [chapters, setChapters] = useState<ChapterRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [formNumber, setFormNumber] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!seriesId) return;
    fetchChaptersBySeriesMangaka(Number(seriesId))
      .then(setChapters)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [seriesId]);

  const handleCreate = async () => {
    if (!formNumber || !seriesId) return;
    const num = Number(formNumber);
    if (isNaN(num) || num < 1) {
      setFormError("Số chương phải là số nguyên dương");
      return;
    }
    setCreating(true);
    setFormError("");
    try {
      const chapter = await createChapter({
        seriesId: Number(seriesId),
        chapterNumber: num,
        title: formTitle.trim() || undefined,
      });
      setChapters((prev) =>
        [...prev, chapter].sort((a, b) => a.chapterNumber - b.chapterNumber),
      );
      setShowForm(false);
      setFormNumber("");
      setFormTitle("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? "Tạo chapter thất bại");
    } finally {
      setCreating(false);
    }
  };

  const handleSubmit = async (deadlineId: number, chapterId: number) => {
    setSubmitting(deadlineId);
    try {
      const updated = await submitPageGroup(deadlineId);
      setChapters((prev) =>
        prev.map((c) => {
          if (c.chapterId !== chapterId) return c;
          return {
            ...c,
            submittedDeadlines: c.submittedDeadlines + 1,
            pageDeadlines: c.pageDeadlines.map((d) =>
              d.deadlineId === deadlineId ? { ...d, ...updated } : d,
            ),
          };
        }),
      );
    } catch (err) {
      console.error("Submit thất bại", err);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="mc-page">
      <div className="mc-header">
        <div className="mc-breadcrumb">
          <Link to="/mangaka/series">Tác phẩm</Link>
          <ChevronRight size={13} />
          <Link to={`/mangaka/series/${seriesId}`}>Chi tiết</Link>
          <ChevronRight size={13} />
          <span>Chapters</span>
        </div>
        <div className="mc-header__row">
          <div>
            <h1 className="mc-header__title">Quản lý Chapters</h1>
            <p className="mc-header__sub">
              Tạo chapter mới và theo dõi deadline từng nhóm trang
            </p>
          </div>
          <button className="mc-btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={15} /> Thêm Chapter
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mc-form-card">
          <div className="mc-form-card__head">
            <span>Chapter mới</span>
            <button
              onClick={() => {
                setShowForm(false);
                setFormError("");
              }}
            >
              <X size={15} />
            </button>
          </div>
          <div className="mc-form-card__body">
            <div className="mc-field">
              <label>
                Số chương <span>*</span>
              </label>
              <input
                type="number"
                min={1}
                placeholder="Ví dụ: 1"
                value={formNumber}
                onChange={(e) => setFormNumber(e.target.value)}
              />
            </div>
            <div className="mc-field">
              <label>
                Tiêu đề <span className="mc-optional">(tuỳ chọn)</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Kẻ lạ mặt"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
          </div>
          {formError && <p className="mc-form-card__error">{formError}</p>}
          <div className="mc-form-card__footer">
            <button className="mc-btn-ghost" onClick={() => setShowForm(false)}>
              Huỷ
            </button>
            <button
              className="mc-btn-primary"
              onClick={handleCreate}
              disabled={!formNumber || creating}
            >
              {creating ? "Đang tạo..." : "Tạo Chapter"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="mc-empty">Đang tải chapters...</div>
      ) : chapters.length === 0 ? (
        <div className="mc-empty">
          <BookOpen size={32} strokeWidth={1.25} />
          <span>Chưa có chapter nào. Hãy tạo chapter đầu tiên!</span>
        </div>
      ) : (
        <div className="mc-list">
          {chapters.map((c) => {
            const st = STATUS_META[c.chapterStatus] ?? {
              label: c.chapterStatus,
              cls: "cs-draft",
            };
            const isExpanded = expanded === c.chapterId;
            const progress =
              c.totalDeadlines > 0
                ? Math.round((c.submittedDeadlines / c.totalDeadlines) * 100)
                : 0;

            return (
              <div
                key={c.chapterId}
                className={`mc-chapter ${isExpanded ? "mc-chapter--open" : ""}`}
              >
                <button
                  className="mc-chapter__head"
                  onClick={() => setExpanded(isExpanded ? null : c.chapterId)}
                >
                  <div className="mc-chapter__icon">
                    <FileText size={15} />
                  </div>
                  <div className="mc-chapter__info">
                    <div className="mc-chapter__top">
                      <span className="mc-chapter__number">
                        Chương {c.chapterNumber}
                      </span>
                      {c.title && (
                        <span className="mc-chapter__title">— {c.title}</span>
                      )}
                    </div>
                    <div className="mc-chapter__meta">
                      <span className={`mc-status ${st.cls}`}>{st.label}</span>
                      {c.deadline && (
                        <span className="mc-chapter__deadline">
                          <Clock size={11} /> Deadline Admin:{" "}
                          {formatDate(c.deadline)}
                        </span>
                      )}
                    </div>
                  </div>

                  {c.totalDeadlines > 0 && (
                    <div className="mc-chapter__progress">
                      <div className="mc-progress-bar">
                        <div
                          className="mc-progress-bar__fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="mc-progress-label">
                        {c.submittedDeadlines}/{c.totalDeadlines} nhóm
                      </span>
                    </div>
                  )}

                  <ChevronRight
                    size={15}
                    className="mc-chapter__chevron"
                    style={{ transform: isExpanded ? "rotate(90deg)" : "none" }}
                  />
                </button>

                {isExpanded && (
                  <div className="mc-deadlines">
                    {c.pageDeadlines.length === 0 ? (
                      <div className="mc-deadlines__empty">
                        Tantou chưa set deadline nào cho chapter này
                      </div>
                    ) : (
                      <>
                        <div className="mc-deadlines__head">
                          <span>Nhóm trang</span>
                          <span>Deadline</span>
                          <span>Trạng thái</span>
                          <span></span>
                        </div>
                        {c.pageDeadlines.map((d) => {
                          const ds = DEADLINE_STATUS[d.status] ?? {
                            label: d.status,
                            cls: "ds-pending",
                          };
                          return (
                            <div key={d.deadlineId} className="mc-deadline-row">
                              <span className="mc-deadline-row__pages">
                                Trang {d.pageFrom}
                                {d.pageTo !== d.pageFrom ? `–${d.pageTo}` : ""}
                              </span>
                              <span className="mc-deadline-row__date">
                                <Clock size={12} />
                                {formatDate(d.dueDate)}
                              </span>
                              <span className={`mc-deadline-badge ${ds.cls}`}>
                                {ds.label}
                              </span>
                              {d.status === "pending" && (
                                <button
                                  className="mc-submit-btn"
                                  onClick={() =>
                                    handleSubmit(d.deadlineId, c.chapterId)
                                  }
                                  disabled={submitting === d.deadlineId}
                                >
                                  <CheckCircle2 size={13} />
                                  {submitting === d.deadlineId
                                    ? "Đang nộp..."
                                    : "Đánh dấu đã nộp"}
                                </button>
                              )}
                              {d.status === "submitted" && (
                                <span className="mc-submitted-at">
                                  Đã nộp {formatDate(d.submittedAt)}
                                </span>
                              )}
                              {d.status === "late" && (
                                <span className="mc-late-label">Trễ hạn</span>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

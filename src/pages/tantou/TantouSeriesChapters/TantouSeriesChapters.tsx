import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  fetchChaptersBySeriesTantou,
  setPageDeadline,
  updatePageDeadline,
  deletePageDeadline,
  submitChapterToAdmin,
  type ChapterRes,
  type PageDeadline,
} from "../../../services/chapterService";
import "./TantouSeriesChapters.scss";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  draft: { label: "Bản nháp", cls: "tcs-draft" },
  in_progress: { label: "Đang làm", cls: "tcs-progress" },
  pages_submitted: { label: "Đã nộp trang", cls: "tcs-submitted" },
  pending_publish: { label: "Chờ đăng", cls: "tcs-pending" },
  published: { label: "Đã đăng", cls: "tcs-published" },
};

const DS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "Chưa nộp", cls: "tds-pending" },
  submitted: { label: "Đã nộp", cls: "tds-submitted" },
  approved: { label: "Đã duyệt", cls: "tds-approved" },
  revision: { label: "Yêu cầu sửa", cls: "tds-revision" },
  late: { label: "Trễ hạn", cls: "tds-late" },
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

interface DeadlineForm {
  chapterId: number;
  deadlineId?: number;
  pageFrom: string;
  pageTo: string;
  dueDate: string;
}

export default function TantouSeriesChapters() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const navigate = useNavigate();

  const [chapters, setChapters] = useState<ChapterRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const [form, setForm] = useState<DeadlineForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleting, setDeleting] = useState<number | null>(null);
  const [submittingToAdmin, setSubmittingToAdmin] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (!seriesId) return;
    fetchChaptersBySeriesTantou(Number(seriesId))
      .then(setChapters)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [seriesId]);

  const openAddForm = (chapterId: number) => {
    setForm({ chapterId, pageFrom: "", pageTo: "", dueDate: "" });
    setFormError("");
  };

  const openEditForm = (chapterId: number, d: PageDeadline) => {
    setForm({
      chapterId,
      deadlineId: d.deadlineId,
      pageFrom: String(d.pageFrom),
      pageTo: String(d.pageTo),
      dueDate: d.dueDate,
    });
    setFormError("");
  };

  const validateForm = (): boolean => {
    if (!form) return false;
    const from = Number(form.pageFrom);
    const to = Number(form.pageTo);
    if (!from || !to || !form.dueDate) {
      setFormError("Vui lòng điền đầy đủ thông tin");
      return false;
    }
    if (from > to) {
      setFormError("Trang bắt đầu không được lớn hơn trang kết thúc");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!form || !validateForm()) return;
    setSaving(true);
    setFormError("");
    try {
      const body = {
        pageFrom: Number(form.pageFrom),
        pageTo: Number(form.pageTo),
        dueDate: form.dueDate,
      };

      if (form.deadlineId) {
        const updated = await updatePageDeadline(form.deadlineId, body);
        setChapters((prev) =>
          prev.map((c) => {
            if (c.chapterId !== form.chapterId) return c;
            return {
              ...c,
              pageDeadlines: c.pageDeadlines.map((d) =>
                d.deadlineId === form.deadlineId ? { ...d, ...updated } : d,
              ),
            };
          }),
        );
      } else {
        const created = await setPageDeadline(form.chapterId, body);
        setChapters((prev) =>
          prev.map((c) => {
            if (c.chapterId !== form.chapterId) return c;
            const newTotal = c.totalDeadlines + 1;
            return {
              ...c,
              totalDeadlines: newTotal,
              chapterStatus:
                c.chapterStatus === "draft" ? "in_progress" : c.chapterStatus,
              pageDeadlines: [...c.pageDeadlines, created].sort(
                (a, b) => a.pageFrom - b.pageFrom,
              ),
            };
          }),
        );
      }
      setForm(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? "Lưu thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (deadlineId: number, chapterId: number) => {
    setDeleting(deadlineId);
    try {
      await deletePageDeadline(deadlineId);
      setChapters((prev) =>
        prev.map((c) => {
          if (c.chapterId !== chapterId) return c;
          const newDeadlines = c.pageDeadlines.filter(
            (d) => d.deadlineId !== deadlineId,
          );
          return {
            ...c,
            pageDeadlines: newDeadlines,
            totalDeadlines: c.totalDeadlines - 1,
          };
        }),
      );
    } catch (err) {
      console.error("Xoá thất bại", err);
    } finally {
      setDeleting(null);
    }
  };

  const handleSubmitToAdmin = async (chapterId: number) => {
    setSubmittingToAdmin(chapterId);
    try {
      const updated = await submitChapterToAdmin(chapterId);
      setChapters((prev) =>
        prev.map((c) =>
          c.chapterId === chapterId
            ? { ...c, chapterStatus: updated.chapterStatus }
            : c,
        ),
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Submit thất bại";
      alert(msg);
    } finally {
      setSubmittingToAdmin(null);
    }
  };

  return (
    <div className="tsc-page">
      <div className="tsc-header">
        <div className="tsc-breadcrumb">
          <Link to="/tantou/manage">Tác phẩm</Link>
          <ChevronRight size={13} />
          <span>Chapters</span>
        </div>
        <h1 className="tsc-header__title">Quản lý Chapters</h1>
        <p className="tsc-header__sub">
          Set và quản lý deadline nhóm trang cho từng chapter
        </p>
      </div>

      {loading ? (
        <div className="tsc-empty">Đang tải chapters...</div>
      ) : chapters.length === 0 ? (
        <div className="tsc-empty">
          <BookOpen size={32} strokeWidth={1.25} />
          <span>Mangaka chưa tạo chapter nào</span>
        </div>
      ) : (
        <div className="tsc-list">
          {chapters.map((c) => {
            const st = STATUS_META[c.chapterStatus] ?? {
              label: c.chapterStatus,
              cls: "tcs-draft",
            };
            const isExpanded = expanded === c.chapterId;
            const progress =
              c.totalDeadlines > 0
                ? Math.round((c.submittedDeadlines / c.totalDeadlines) * 100)
                : 0;

            const canSubmitToAdmin =
              c.chapterStatus === "pages_submitted" &&
              c.pageDeadlines.length > 0 &&
              c.pageDeadlines.every((d) => d.status === "approved");

            const hasRevision = c.pageDeadlines.some(
              (d) => d.status === "revision",
            );
            const hasUnreviewed = c.pageDeadlines.some(
              (d) => d.status === "submitted",
            );

            return (
              <div
                key={c.chapterId}
                className={`tsc-chapter ${isExpanded ? "tsc-chapter--open" : ""}`}
              >
                <button
                  className="tsc-chapter__head"
                  onClick={() => setExpanded(isExpanded ? null : c.chapterId)}
                >
                  <div className="tsc-chapter__icon">
                    <FileText size={15} />
                  </div>
                  <div className="tsc-chapter__info">
                    <div className="tsc-chapter__top">
                      <span className="tsc-chapter__number">
                        Chương {c.chapterNumber}
                      </span>
                      {c.title && (
                        <span className="tsc-chapter__title">— {c.title}</span>
                      )}
                    </div>
                    <div className="tsc-chapter__meta">
                      <span className={`tsc-status ${st.cls}`}>{st.label}</span>
                      {c.deadline && (
                        <span className="tsc-chapter__deadline">
                          <Clock size={11} /> Nộp Admin:{" "}
                          {formatDate(c.deadline)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="tsc-chapter__progress">
                    {c.totalDeadlines > 0 ? (
                      <>
                        <div className="tsc-progress-bar">
                          <div
                            className="tsc-progress-bar__fill"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="tsc-progress-label">
                          {c.submittedDeadlines}/{c.totalDeadlines} đã nộp
                        </span>
                      </>
                    ) : (
                      <span className="tsc-no-deadline">Chưa có deadline</span>
                    )}
                  </div>

                  <ChevronRight
                    size={15}
                    className="tsc-chapter__chevron"
                    style={{ transform: isExpanded ? "rotate(90deg)" : "none" }}
                  />
                </button>

                {isExpanded && (
                  <div className="tsc-deadlines">
                    {form?.chapterId === c.chapterId && (
                      <div className="tsc-form">
                        <div className="tsc-form__title">
                          {form.deadlineId
                            ? "Chỉnh sửa deadline"
                            : "Thêm deadline nhóm trang"}
                        </div>
                        <div className="tsc-form__row">
                          <div className="tsc-field">
                            <label>Trang từ</label>
                            <input
                              type="number"
                              min={1}
                              placeholder="1"
                              value={form.pageFrom}
                              onChange={(e) =>
                                setForm((f) =>
                                  f ? { ...f, pageFrom: e.target.value } : f,
                                )
                              }
                            />
                          </div>
                          <div className="tsc-field">
                            <label>Trang đến</label>
                            <input
                              type="number"
                              min={1}
                              placeholder="10"
                              value={form.pageTo}
                              onChange={(e) =>
                                setForm((f) =>
                                  f ? { ...f, pageTo: e.target.value } : f,
                                )
                              }
                            />
                          </div>
                          <div className="tsc-field tsc-field--date">
                            <label>Deadline</label>
                            <input
                              type="date"
                              value={form.dueDate}
                              onChange={(e) =>
                                setForm((f) =>
                                  f ? { ...f, dueDate: e.target.value } : f,
                                )
                              }
                            />
                          </div>
                          <div className="tsc-form__actions">
                            <button
                              className="tsc-btn-save"
                              onClick={handleSave}
                              disabled={saving}
                            >
                              {saving ? (
                                "Đang lưu..."
                              ) : (
                                <>
                                  <CheckCircle2 size={13} /> Lưu
                                </>
                              )}
                            </button>
                            <button
                              className="tsc-btn-cancel"
                              onClick={() => {
                                setForm(null);
                                setFormError("");
                              }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                        {formError && (
                          <p className="tsc-form__error">{formError}</p>
                        )}
                      </div>
                    )}

                    {c.pageDeadlines.length === 0 && !form ? (
                      <div className="tsc-deadlines__empty">
                        Chưa có deadline nào — nhấn "+ Thêm deadline" để bắt đầu
                      </div>
                    ) : c.pageDeadlines.length > 0 ? (
                      <>
                        <div className="tsc-deadlines__head">
                          <span>Nhóm trang</span>
                          <span>Deadline</span>
                          <span>Trạng thái</span>
                          <span>Mangaka nộp lúc</span>
                          <span></span>
                        </div>
                        {c.pageDeadlines.map((d) => {
                          const ds = DS_META[d.status] ?? {
                            label: d.status,
                            cls: "tds-pending",
                          };
                          const canEdit =
                            d.status !== "submitted" && d.status !== "approved";
                          return (
                            <div
                              key={d.deadlineId}
                              className="tsc-deadline-row"
                            >
                              <span className="tsc-dr__pages">
                                Trang {d.pageFrom}
                                {d.pageTo !== d.pageFrom ? `–${d.pageTo}` : ""}
                              </span>
                              <span className="tsc-dr__date">
                                <Clock size={12} /> {formatDate(d.dueDate)}
                              </span>
                              <span className={`tsc-badge ${ds.cls}`}>
                                {ds.label}
                              </span>
                              <span className="tsc-dr__submitted">
                                {d.submittedAt
                                  ? formatDate(d.submittedAt)
                                  : "—"}
                              </span>
                              <div className="tsc-dr__actions">
                                {canEdit && (
                                  <>
                                    <button
                                      className="tsc-action-btn tsc-action-btn--edit"
                                      onClick={() =>
                                        openEditForm(c.chapterId, d)
                                      }
                                      title="Chỉnh sửa"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      className="tsc-action-btn tsc-action-btn--delete"
                                      onClick={() =>
                                        handleDelete(d.deadlineId, c.chapterId)
                                      }
                                      disabled={deleting === d.deadlineId}
                                      title="Xoá"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : null}

                    {canSubmitToAdmin && (
                      <div className="tsc-submit-admin-row">
                        <span className="tsc-submit-admin-hint">
                          <CheckCircle2 size={13} />
                          Tất cả nhóm trang đã được duyệt
                        </span>
                        <button
                          className="tsc-btn-submit-admin"
                          onClick={() => handleSubmitToAdmin(c.chapterId)}
                          disabled={submittingToAdmin === c.chapterId}
                        >
                          {submittingToAdmin === c.chapterId ? (
                            <>
                              <Loader2 size={12} className="tsc-spin" /> Đang
                              submit…
                            </>
                          ) : (
                            <>
                              <Upload size={12} /> Nộp chương lên Admin
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {hasRevision && c.chapterStatus === "in_progress" && (
                      <div className="tsc-revision-warning">
                        <AlertTriangle size={13} />
                        Có nhóm trang yêu cầu sửa lại — đang chờ mangaka nộp lại
                      </div>
                    )}

                    {hasUnreviewed && c.chapterStatus === "pages_submitted" && (
                      <div className="tsc-review-hint">
                        <Eye size={13} />
                        Vào{" "}
                        <button
                          className="tsc-review-hint__link"
                          onClick={() => navigate("/tantou/approvals")}
                        >
                          Không gian Phê duyệt
                        </button>{" "}
                        để review nhóm trang
                      </div>
                    )}

                    {c.adminNote && c.chapterStatus === "pending_publish" && (
                      <div className="tsc-admin-note">
                        <div className="tsc-admin-note__head">
                          <ShieldAlert size={13} />
                          <span>
                            Góp ý từ Admin — cần chỉnh sửa trước khi đăng
                          </span>
                        </div>
                        <p className="tsc-admin-note__text">{c.adminNote}</p>
                      </div>
                    )}

                    {form?.chapterId !== c.chapterId && (
                      <button
                        className="tsc-add-btn"
                        onClick={() => openAddForm(c.chapterId)}
                      >
                        <Plus size={13} /> Thêm deadline nhóm trang
                      </button>
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

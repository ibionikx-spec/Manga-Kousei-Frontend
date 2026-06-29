import { useEffect, useRef, useState } from "react";
import {
  BookOpen, CheckCircle2, ChevronRight, Clock,
  FileImage, Loader2, Play, Search, Send, Upload,
  X, XCircle, List, Columns, AlertTriangle,
} from "lucide-react";
import { uploadImageToCloudinary } from "../../../utils/imageUpload";
import {
  fetchMyTasks, updateTaskStatus, submitWork, fetchTaskSubmissions,
  type AssistantTaskRes, type TaskSubmissionRes,
} from "../../../services/taskSubmissionService";
import { getAvatarColor, getInitials } from "../../../utils";
import "./AssistantTasks.scss";

const STATUS_META: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  todo:   { label: "Chờ làm",    cls: "at-s--todo",   icon: <Clock size={12} /> },
  doing:  { label: "Đang làm",   cls: "at-s--doing",  icon: <Play size={12} /> },
  review: { label: "Chờ duyệt",  cls: "at-s--review", icon: <Send size={12} /> },
  done:   { label: "Hoàn thành", cls: "at-s--done",   icon: <CheckCircle2 size={12} /> },
};

const SUB_STATUS: Record<string, { label: string; cls: string }> = {
  pending:  { label: "Chờ duyệt", cls: "sub-pending" },
  approved: { label: "Đã duyệt",  cls: "sub-approved" },
  rejected: { label: "Bị trả lại",cls: "sub-rejected" },
};

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("vi-VN");
}

function formatDateTime(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

type FilterStatus = "all" | "todo" | "doing" | "review" | "done";
type ViewMode = "list" | "kanban";

const KANBAN_COLS = ["todo", "doing", "review", "done"] as const;

// ─── Kanban Card ──────────────────────────────────────────────────────────────
function KanbanCard({ t, onOpen }: { t: AssistantTaskRes; onOpen: (id: number) => void }) {
  const isOverdue = t.taskStatus !== "done" && new Date(t.deadline) < new Date();
  const meta = STATUS_META[t.taskStatus] ?? STATUS_META.todo;
  return (
    <div className="at-kcard" onClick={() => onOpen(t.taskId)}>
      <div className="at-kcard__type">
        <span className={`at-status-pill ${meta.cls}`}>{meta.icon} {meta.label}</span>
        {isOverdue && <AlertTriangle size={12} style={{ color: "#dc2626", flexShrink: 0 }} />}
      </div>
      <div className="at-kcard__title">
        {t.taskTypeName}
        {t.chapterNumber != null && <span> · Ch.{t.chapterNumber} · Trang {t.pageNumber}</span>}
      </div>
      <div className="at-kcard__series">{t.seriesTitle}</div>
      {t.description && <div className="at-kcard__desc">{t.description}</div>}
      <div className="at-kcard__footer">
        <span className={`at-task__deadline ${isOverdue ? "at-task__deadline--overdue" : ""}`}>
          <Clock size={11} /> {formatDate(t.deadline)}{isOverdue && " · Trễ hạn!"}
        </span>
        {t.submissionCount > 0 && (
          <span className="at-task__subs"><FileImage size={11} /> {t.submissionCount}</span>
        )}
      </div>
      <div className="at-kcard__mangaka">
        {t.assignedByAvatarUrl ? (
          <img src={t.assignedByAvatarUrl} alt="" className="at-mini-avatar" />
        ) : t.assignedByName ? (
          <span className="at-mini-avatar at-mini-avatar--init" style={{ background: getAvatarColor(t.assignedByName) }}>
            {getInitials(t.assignedByName)}
          </span>
        ) : null}
        <span>{t.assignedByName}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AssistantTasks() {
  const [tasks, setTasks]       = useState<AssistantTaskRes[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<FilterStatus>("all");
  const [search, setSearch]     = useState("");
  const [view, setView]         = useState<ViewMode>("list");

  const [expandedId, setExpandedId]   = useState<number | null>(null);
  const [submissions, setSubmissions] = useState<TaskSubmissionRes[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitFile, setSubmitFile]         = useState<File | null>(null);
  const [submitPreview, setSubmitPreview]   = useState<string>("");
  const [submitNote, setSubmitNote]         = useState("");
  const [uploading, setUploading]           = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    fetchMyTasks().then(setTasks).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (expandedId === null) {
      const t = setTimeout(() => { setSubmissions([]); setShowSubmitForm(false); }, 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLoadingSubs(true);
      fetchTaskSubmissions(expandedId).then(setSubmissions).catch(console.error).finally(() => setLoadingSubs(false));
    }, 0);
    return () => clearTimeout(t);
  }, [expandedId]);

  const counts = {
    all:    tasks.length,
    todo:   tasks.filter(t => t.taskStatus === "todo").length,
    doing:  tasks.filter(t => t.taskStatus === "doing").length,
    review: tasks.filter(t => t.taskStatus === "review").length,
    done:   tasks.filter(t => t.taskStatus === "done").length,
  };

  const filtered = tasks.filter(t => {
    const matchStatus = filter === "all" || t.taskStatus === filter;
    const q = search.toLowerCase();
    const matchSearch = !q
      || t.seriesTitle.toLowerCase().includes(q)
      || t.taskTypeName.toLowerCase().includes(q)
      || (t.assignedByName ?? "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const handleStartWork = async (taskId: number) => {
    setUpdatingStatus(taskId);
    try {
      await updateTaskStatus(taskId, "doing");
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, taskStatus: "doing" } : t));
    } catch (err) { console.error(err); }
    finally { setUpdatingStatus(null); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubmitFile(file);
    setSubmitPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!submitFile || expandedId === null) return;
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(submitFile);
      setUploading(false); setSubmitting(true);
      const result = await submitWork({ taskId: expandedId, fileUrl: url, note: submitNote.trim() || undefined });
      setSubmissions(prev => [result, ...prev]);
      setTasks(prev => prev.map(t => t.taskId === expandedId
        ? { ...t, taskStatus: "review", submissionCount: t.submissionCount + 1, latestSubmissionStatus: "pending" }
        : t));
      setShowSubmitForm(false); setSubmitFile(null); setSubmitPreview(""); setSubmitNote("");
    } catch (err) { console.error(err); }
    finally { setUploading(false); setSubmitting(false); }
  };

  // ── Expanded panel (dùng chung cho list + kanban modal) ───────────────────
  const renderPanel = (t: AssistantTaskRes) => (
    <div className="at-task__panel">
      <div className="at-task__actions">
        {t.taskStatus === "todo" && (
          <button className="at-btn at-btn--start" onClick={() => handleStartWork(t.taskId)} disabled={updatingStatus === t.taskId}>
            <Play size={13} /> {updatingStatus === t.taskId ? "Đang cập nhật..." : "Bắt đầu làm"}
          </button>
        )}
        {(t.taskStatus === "doing" || t.taskStatus === "review") && (
          <button className="at-btn at-btn--submit" onClick={() => { setShowSubmitForm(true); setSubmitFile(null); setSubmitPreview(""); setSubmitNote(""); }}>
            <Upload size={13} /> Nộp bài
          </button>
        )}
      </div>

      {showSubmitForm && (
        <div className="at-submit-form">
          <div className="at-submit-form__head">
            <span>Nộp bài cho task</span>
            <button onClick={() => setShowSubmitForm(false)}><X size={14} /></button>
          </div>
          <div className="at-submit-form__body">
            <div className="at-upload-zone" onClick={() => fileRef.current?.click()}>
              {submitPreview
                ? <img src={submitPreview} alt="Preview" className="at-upload-zone__preview" />
                : (<><Upload size={24} strokeWidth={1.25} /><span>Click để chọn file</span><span className="at-upload-zone__hint">JPG, PNG, WebP</span></>)}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
            <div className="at-field">
              <label>Ghi chú (tuỳ chọn)</label>
              <textarea rows={2} placeholder="Ghi chú cho mangaka..." value={submitNote} onChange={e => setSubmitNote(e.target.value)} />
            </div>
          </div>
          <div className="at-submit-form__footer">
            <button className="at-btn at-btn--ghost" onClick={() => setShowSubmitForm(false)}>Huỷ</button>
            <button className="at-btn at-btn--submit" onClick={handleSubmit} disabled={!submitFile || uploading || submitting}>
              {uploading ? <><Loader2 size={13} className="at-spin" /> Upload ảnh...</>
               : submitting ? <><Loader2 size={13} className="at-spin" /> Đang nộp...</>
               : <><Send size={13} /> Gửi nộp bài</>}
            </button>
          </div>
        </div>
      )}

      <div className="at-subs">
        <div className="at-subs__head">Lịch sử nộp bài ({submissions.length})</div>
        {loadingSubs ? (
          <div className="at-subs__loading"><Loader2 size={14} className="at-spin" /> Đang tải...</div>
        ) : submissions.length === 0 ? (
          <div className="at-subs__empty">Chưa nộp lần nào</div>
        ) : (
          <div className="at-subs__list">
            {submissions.map(s => {
              const st = SUB_STATUS[s.status] ?? SUB_STATUS.pending;
              return (
                <div key={s.submissionId} className="at-sub-card">
                  <img src={s.fileUrl} alt="" className="at-sub-card__thumb" />
                  <div className="at-sub-card__info">
                    <div className="at-sub-card__row">
                      <span className={`at-sub-badge ${st.cls}`}>
                        {s.status === "approved" && <CheckCircle2 size={10} />}
                        {s.status === "rejected" && <XCircle size={10} />}
                        {s.status === "pending"  && <Clock size={10} />}
                        {st.label}
                      </span>
                      <span className="at-sub-card__date">{formatDateTime(s.submittedAt)}</span>
                    </div>
                    {s.note && <p className="at-sub-card__note">{s.note}</p>}
                    {s.reviewedByName && (
                      <span className="at-sub-card__reviewer">Review bởi {s.reviewedByName} · {formatDateTime(s.reviewedAt)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const expandedTask = tasks.find(t => t.taskId === expandedId);

  return (
    <div className="at-page">
      {/* Header */}
      <div className="at-header">
        <div>
          <h1>Task của tôi</h1>
          <p>Danh sách công việc được giao từ mangaka</p>
        </div>
        <div className="at-view-toggle">
          <button className={`at-view-btn ${view === "list" ? "at-view-btn--active" : ""}`} onClick={() => setView("list")} title="Dạng danh sách">
            <List size={16} />
          </button>
          <button className={`at-view-btn ${view === "kanban" ? "at-view-btn--active" : ""}`} onClick={() => setView("kanban")} title="Dạng Kanban">
            <Columns size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="at-stats">
        {(["todo", "doing", "review", "done"] as const).map(s => {
          const meta = STATUS_META[s];
          return (
            <div key={s} className={`at-stat-card ${filter === s ? "at-stat-card--on" : ""}`} onClick={() => setFilter(filter === s ? "all" : s)}>
              <span className={`at-stat-icon ${meta.cls}`}>{meta.icon}</span>
              <div>
                <div className="at-stat-value">{counts[s]}</div>
                <div className="at-stat-label">{meta.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="at-search">
        <Search size={15} />
        <input placeholder="Tìm theo series, loại task..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="at-empty"><Loader2 size={24} className="at-spin" /> Đang tải...</div>
      ) : view === "list" ? (
        /* ═══ LIST VIEW (giữ nguyên 100% code gốc của bạn) ═══ */
        filtered.length === 0 ? (
          <div className="at-empty">
            <BookOpen size={32} strokeWidth={1.25} />
            <span>{search ? "Không tìm thấy task phù hợp" : "Chưa có task nào được giao"}</span>
          </div>
        ) : (
          <div className="at-list">
            {filtered.map(t => {
              const meta = STATUS_META[t.taskStatus] ?? STATUS_META.todo;
              const isExpanded = expandedId === t.taskId;
              const isOverdue = t.taskStatus !== "done" && new Date(t.deadline) < new Date();
              return (
                <div key={t.taskId} className={`at-task ${isExpanded ? "at-task--open" : ""}`}>
                  <button className="at-task__head" onClick={() => setExpandedId(isExpanded ? null : t.taskId)}>
                    <div className="at-task__preview">
                      <img src={t.pageFileUrl} alt="" />
                      <div className="at-task__region-overlay" style={{ left: `${t.regionX}%`, top: `${t.regionY}%`, width: `${t.regionWidth}%`, height: `${t.regionHeight}%` }} />
                    </div>
                    <div className="at-task__info">
                      <div className="at-task__top-row">
                        <span className="at-task__type">{t.taskTypeName}</span>
                        <span className={`at-status-pill ${meta.cls}`}>{meta.icon} {meta.label}</span>
                      </div>
                      <div className="at-task__context">
                        {t.seriesTitle} · Chương {t.chapterNumber} · Trang {t.pageNumber}
                      </div>
                      {t.description && <p className="at-task__desc">{t.description}</p>}
                      <div className="at-task__meta">
                        <span className="at-task__mangaka">
                          {t.assignedByAvatarUrl ? (
                            <img src={t.assignedByAvatarUrl} alt="" className="at-mini-avatar" />
                          ) : t.assignedByName ? (
                            <span className="at-mini-avatar at-mini-avatar--init" style={{ background: getAvatarColor(t.assignedByName) }}>
                              {getInitials(t.assignedByName)}
                            </span>
                          ) : null}
                          {t.assignedByName}
                        </span>
                        <span className={`at-task__deadline ${isOverdue ? "at-task__deadline--overdue" : ""}`}>
                          <Clock size={11} /> {formatDate(t.deadline)}{isOverdue && " · Trễ hạn!"}
                        </span>
                        {t.submissionCount > 0 && (
                          <span className="at-task__subs"><FileImage size={11} /> {t.submissionCount} lần nộp</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={16} className="at-task__chevron" style={{ transform: isExpanded ? "rotate(90deg)" : "none" }} />
                  </button>
                  {isExpanded && renderPanel(t)}
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ═══ KANBAN VIEW ═══ */
        <div className="at-kanban">
          {KANBAN_COLS.map(col => {
            const meta = STATUS_META[col];
            const colTasks = filtered.filter(t => t.taskStatus === col);
            return (
              <div key={col} className="at-kanban__col">
                <div className={`at-kanban__head at-kanban__head--${col}`}>
                  <span className={`at-status-pill ${meta.cls}`}>{meta.icon} {meta.label}</span>
                  <span className="at-kanban__count">{colTasks.length}</span>
                </div>
                <div className="at-kanban__body">
                  {colTasks.length === 0
                    ? <div className="at-kanban__empty">Không có task</div>
                    : colTasks.map(t => <KanbanCard key={t.taskId} t={t} onOpen={id => { setExpandedId(id); }} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Kanban modal */}
      {view === "kanban" && expandedId !== null && expandedTask && (
        <div className="at-modal-overlay" onClick={() => { setExpandedId(null); setShowSubmitForm(false); }}>
          <div className="at-modal" onClick={e => e.stopPropagation()}>
            <div className="at-modal__head">
              <div>
                <div className="at-modal__title">
                  {expandedTask.taskTypeName}
                  {expandedTask.chapterNumber != null && ` · Ch.${expandedTask.chapterNumber} · Trang ${expandedTask.pageNumber}`}
                </div>
                <div className="at-modal__sub">{expandedTask.seriesTitle} · {expandedTask.assignedByName}</div>
              </div>
              <button onClick={() => { setExpandedId(null); setShowSubmitForm(false); }}><X size={18} /></button>
            </div>
            <div className="at-modal__body">{renderPanel(expandedTask)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
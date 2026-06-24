import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  ImageIcon,
  Loader2,
  MousePointer2,
  PenTool,
  Plus,
  Square,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { uploadImageToCloudinary } from "../../../utils/imageUpload";
import { getAvatarColor, getInitials } from "../../../utils";
import {
  fetchPages,
  createPage,
  deletePage,
  fetchRegions,
  createRegion,
  deleteRegion,
  createTask,
  deleteTask,
  fetchRegionTypes,
  fetchTaskTypes,
  type PageRes,
  type RegionRes,
  type LookupItem,
} from "../../../services/pageService";
import {
  fetchActiveAssistants,
  type AssistantAssignmentRes,
} from "../../../services/assistantAssignmentService";
import "./MangakaPageEditor.scss";
import {
  fetchSubmissionsByTask,
  reviewSubmission,
  type TaskSubmissionRes,
} from "../../../services/taskSubmissionService";

interface DrawingRect {
  startX: number;
  startY: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

type EditorMode = "select" | "draw";

export default function MangakaPageEditor() {
  const { seriesId, chapterId } = useParams<{
    seriesId: string;
    chapterId: string;
  }>();

  const [pages, setPages] = useState<PageRes[]>([]);
  const [selectedPage, setSelectedPage] = useState<PageRes | null>(null);
  const [regions, setRegions] = useState<RegionRes[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<RegionRes | null>(null);
  const [regionTypes, setRegionTypes] = useState<LookupItem[]>([]);
  const [taskTypes, setTaskTypes] = useState<LookupItem[]>([]);
  const [assistants, setAssistants] = useState<AssistantAssignmentRes[]>([]);

  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [taskSubmissions, setTaskSubmissions] = useState<TaskSubmissionRes[]>(
    [],
  );
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [reviewingSubId, setReviewingSubId] = useState<number | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [showRejectForm, setShowRejectForm] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<EditorMode>("select");
  const [drawing, setDrawing] = useState<DrawingRect | null>(null);
  const [uploading, setUploading] = useState(false);

  const [showRegionForm, setShowRegionForm] = useState(false);
  const [newRegionRect, setNewRegionRect] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const [newRegionTypeId, setNewRegionTypeId] = useState<number>(0);
  const [newRegionNote, setNewRegionNote] = useState("");
  const [savingRegion, setSavingRegion] = useState(false);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTypeId, setTaskTypeId] = useState<number>(0);
  const [taskAssignTo, setTaskAssignTo] = useState<number>(0);
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [savingTask, setSavingTask] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!chapterId) return;
    Promise.all([
      fetchPages(Number(chapterId)),
      fetchRegionTypes(),
      fetchTaskTypes(),
      fetchActiveAssistants(),
    ])
      .then(([p, rt, tt, a]) => {
        setPages(p);
        setRegionTypes(rt);
        setTaskTypes(tt);
        setAssistants(a);
        if (p.length > 0) setSelectedPage(p[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [chapterId]);

  const handleExpandTask = async (taskId: number) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
      setTaskSubmissions([]);
      return;
    }
    setExpandedTaskId(taskId);
    setLoadingSubs(true);
    try {
      const subs = await fetchSubmissionsByTask(taskId);
      setTaskSubmissions(subs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSubs(false);
    }
  };

  const handleReview = async (
    submissionId: number,
    decision: "approved" | "rejected",
    taskId: number,
  ) => {
    setReviewingSubId(submissionId);
    try {
      const updated = await reviewSubmission(submissionId, {
        decision,
        feedback: decision === "rejected" ? reviewFeedback : undefined,
      });

      setTaskSubmissions((prev) =>
        prev.map((s) =>
          s.submissionId === submissionId ? { ...s, ...updated } : s,
        ),
      );

      if (decision === "approved") {
        setRegions((prev) =>
          prev.map((r) => ({
            ...r,
            tasks: r.tasks.map((t) =>
              t.taskId === taskId ? { ...t, taskStatus: "done" } : t,
            ),
          })),
        );
        setSelectedRegion((prev) =>
          prev
            ? {
                ...prev,
                tasks: prev.tasks.map((t) =>
                  t.taskId === taskId ? { ...t, taskStatus: "done" } : t,
                ),
              }
            : prev,
        );
      }

      setShowRejectForm(null);
      setReviewFeedback("");
    } catch (err) {
      console.error(err);
    } finally {
      setReviewingSubId(null);
    }
  };

  useEffect(() => {
    if (!selectedPage) {
      const t = setTimeout(() => {
        setRegions([]);
        setSelectedRegion(null);
      }, 0);
      return () => clearTimeout(t);
    }

    fetchRegions(selectedPage.pageId)
      .then((data) => {
        setRegions(data);
        setSelectedRegion(null);
      })
      .catch(console.error);
  }, [selectedPage]);

  const handleUploadPage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chapterId) return;
    setUploading(true);
    try {
      const url = await uploadImageToCloudinary(file);
      const nextNum =
        pages.length > 0 ? Math.max(...pages.map((p) => p.pageNumber)) + 1 : 1;
      const newPage = await createPage({
        chapterId: Number(chapterId),
        pageNumber: nextNum,
        fileUrl: url,
      });
      setPages((prev) =>
        [...prev, newPage].sort((a, b) => a.pageNumber - b.pageNumber),
      );
      setSelectedPage(newPage);
    } catch (err) {
      console.error("Upload page thất bại", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeletePage = async (pageId: number) => {
    try {
      await deletePage(pageId);
      setPages((prev) => prev.filter((p) => p.pageId !== pageId));
      if (selectedPage?.pageId === pageId) {
        setSelectedPage(pages.find((p) => p.pageId !== pageId) ?? null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRelativePos = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current || !imgRef.current) return { x: 0, y: 0 };
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== "draw") return;
    const pos = getRelativePos(e.clientX, e.clientY);
    setDrawing({
      startX: pos.x,
      startY: pos.y,
      x: pos.x,
      y: pos.y,
      w: 0,
      h: 0,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!drawing) return;
    const pos = getRelativePos(e.clientX, e.clientY);
    const x = Math.min(drawing.startX, pos.x);
    const y = Math.min(drawing.startY, pos.y);
    const w = Math.abs(pos.x - drawing.startX);
    const h = Math.abs(pos.y - drawing.startY);
    setDrawing({ ...drawing, x, y, w, h });
  };

  const handleMouseUp = () => {
    if (!drawing || drawing.w < 2 || drawing.h < 2) {
      setDrawing(null);
      return;
    }
    setNewRegionRect({
      x: drawing.x,
      y: drawing.y,
      w: drawing.w,
      h: drawing.h,
    });
    setNewRegionTypeId(regionTypes[0]?.id ?? 0);
    setNewRegionNote("");
    setShowRegionForm(true);
    setDrawing(null);
    setMode("select");
  };

  const handleSaveRegion = async () => {
    if (!selectedPage || !newRegionRect || !newRegionTypeId) return;
    setSavingRegion(true);
    try {
      const created = await createRegion({
        pageId: selectedPage.pageId,
        x: newRegionRect.x,
        y: newRegionRect.y,
        width: newRegionRect.w,
        height: newRegionRect.h,
        regionTypeId: newRegionTypeId,
        note: newRegionNote || undefined,
      });
      setRegions((prev) => [...prev, created]);
      setSelectedRegion(created);
      setShowRegionForm(false);
      setNewRegionRect(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingRegion(false);
    }
  };

  const handleDeleteRegion = async (regionId: number) => {
    try {
      await deleteRegion(regionId);
      setRegions((prev) => prev.filter((r) => r.regionId !== regionId));
      if (selectedRegion?.regionId === regionId) setSelectedRegion(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveTask = async () => {
    if (!selectedRegion || !taskTypeId || !taskAssignTo || !taskDeadline)
      return;
    setSavingTask(true);
    try {
      const created = await createTask({
        regionId: selectedRegion.regionId,
        taskTypeId,
        assignedTo: taskAssignTo,
        deadline: taskDeadline,
        description: taskDesc || undefined,
      });
      setRegions((prev) =>
        prev.map((r) =>
          r.regionId === selectedRegion.regionId
            ? { ...r, tasks: [...r.tasks, created] }
            : r,
        ),
      );
      setSelectedRegion((prev) =>
        prev ? { ...prev, tasks: [...prev.tasks, created] } : prev,
      );
      setShowTaskForm(false);
      setTaskDesc("");
    } catch (err) {
      console.error(err);
    } finally {
      setSavingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      setRegions((prev) =>
        prev.map((r) => ({
          ...r,
          tasks: r.tasks.filter((t) => t.taskId !== taskId),
        })),
      );
      setSelectedRegion((prev) =>
        prev
          ? { ...prev, tasks: prev.tasks.filter((t) => t.taskId !== taskId) }
          : prev,
      );
    } catch (err) {
      console.error(err);
    }
  };

  const REGION_COLORS: Record<string, string> = {
    "Nhân vật": "#3b82f6",
    Background: "#10b981",
    "Hiệu ứng": "#f59e0b",
    Khác: "#8b5cf6",
  };

  const getRegionColor = (typeName: string | null) =>
    REGION_COLORS[typeName ?? ""] ?? "#6366f1";

  if (loading) {
    return (
      <div className="mpe-page">
        <div className="mpe-loading">
          <Loader2 size={24} className="mpe-spin" /> Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="mpe-page">
      <div className="mpe-header">
        <div className="mpe-breadcrumb">
          <Link to="/mangaka/series">Tác phẩm</Link>
          <ChevronRight size={13} />
          <Link to={`/mangaka/series/${seriesId}/chapters`}>Chapters</Link>
          <ChevronRight size={13} />
          <span>Chương {chapterId} · Trang</span>
        </div>
        <div className="mpe-header__row">
          <h1>Quản lý Trang & Giao việc</h1>
          <div className="mpe-toolbar">
            <button
              className={`mpe-tool ${mode === "select" ? "mpe-tool--on" : ""}`}
              onClick={() => setMode("select")}
              title="Chọn vùng"
            >
              <MousePointer2 size={16} />
            </button>
            <button
              className={`mpe-tool ${mode === "draw" ? "mpe-tool--on" : ""}`}
              onClick={() => setMode("draw")}
              title="Vẽ vùng mới"
            >
              <PenTool size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="mpe-layout">
        <div className="mpe-sidebar">
          <div className="mpe-sidebar__head">
            <span>Trang ({pages.length})</span>
            <label className="mpe-upload-btn">
              {uploading ? (
                <Loader2 size={14} className="mpe-spin" />
              ) : (
                <Plus size={14} />
              )}
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleUploadPage}
                disabled={uploading}
              />
            </label>
          </div>
          <div className="mpe-page-list">
            {pages.map((p) => (
              <div
                key={p.pageId}
                className={`mpe-thumb ${selectedPage?.pageId === p.pageId ? "mpe-thumb--on" : ""}`}
                onClick={() => setSelectedPage(p)}
              >
                <img src={p.fileUrl} alt={`Trang ${p.pageNumber}`} />
                <div className="mpe-thumb__info">
                  <span className="mpe-thumb__num">Tr. {p.pageNumber}</span>
                  {p.regionCount > 0 && (
                    <span className="mpe-thumb__badge">{p.taskCount} task</span>
                  )}
                </div>
                <button
                  className="mpe-thumb__delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePage(p.pageId);
                  }}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
            {pages.length === 0 && (
              <div className="mpe-sidebar__empty">
                <ImageIcon size={24} strokeWidth={1.25} />
                <span>Upload trang đầu tiên</span>
              </div>
            )}
          </div>
        </div>

        <div className="mpe-canvas-area">
          {!selectedPage ? (
            <div className="mpe-canvas-empty">
              <ImageIcon size={40} strokeWidth={1} />
              <span>Chọn hoặc upload trang để bắt đầu</span>
            </div>
          ) : (
            <div
              className={`mpe-canvas ${mode === "draw" ? "mpe-canvas--drawing" : ""}`}
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => setDrawing(null)}
            >
              <img
                ref={imgRef}
                src={selectedPage.fileUrl}
                alt={`Trang ${selectedPage.pageNumber}`}
                className="mpe-canvas__img"
                draggable={false}
              />

              {regions.map((r) => {
                const color = getRegionColor(r.regionTypeName);
                const isSelected = selectedRegion?.regionId === r.regionId;
                return (
                  <div
                    key={r.regionId}
                    className={`mpe-region ${isSelected ? "mpe-region--selected" : ""}`}
                    style={{
                      left: `${r.x}%`,
                      top: `${r.y}%`,
                      width: `${r.width}%`,
                      height: `${r.height}%`,
                      borderColor: color,
                      background: `${color}15`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (mode === "select") setSelectedRegion(r);
                    }}
                  >
                    <span
                      className="mpe-region__label"
                      style={{ background: color }}
                    >
                      {r.regionTypeName} · {r.tasks.length} task
                    </span>
                  </div>
                );
              })}

              {drawing && drawing.w > 0 && (
                <div
                  className="mpe-region mpe-region--drawing"
                  style={{
                    left: `${drawing.x}%`,
                    top: `${drawing.y}%`,
                    width: `${drawing.w}%`,
                    height: `${drawing.h}%`,
                  }}
                />
              )}

              {showRegionForm && newRegionRect && (
                <div
                  className="mpe-region mpe-region--new"
                  style={{
                    left: `${newRegionRect.x}%`,
                    top: `${newRegionRect.y}%`,
                    width: `${newRegionRect.w}%`,
                    height: `${newRegionRect.h}%`,
                  }}
                />
              )}
            </div>
          )}
        </div>

        <div className="mpe-panel">
          {showRegionForm && (
            <div className="mpe-form-card">
              <div className="mpe-form-card__head">
                <span>Tạo vùng mới</span>
                <button
                  onClick={() => {
                    setShowRegionForm(false);
                    setNewRegionRect(null);
                  }}
                >
                  <X size={14} />
                </button>
              </div>
              <div className="mpe-form-card__body">
                <div className="mpe-field">
                  <label>Loại vùng</label>
                  <select
                    value={newRegionTypeId}
                    onChange={(e) => setNewRegionTypeId(Number(e.target.value))}
                  >
                    <option value={0} disabled>
                      Chọn...
                    </option>
                    {regionTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mpe-field">
                  <label>Ghi chú</label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả vùng..."
                    value={newRegionNote}
                    onChange={(e) => setNewRegionNote(e.target.value)}
                  />
                </div>
              </div>
              <div className="mpe-form-card__footer">
                <button
                  className="mpe-btn mpe-btn--save"
                  onClick={handleSaveRegion}
                  disabled={!newRegionTypeId || savingRegion}
                >
                  {savingRegion ? "Đang lưu..." : "Lưu vùng"}
                </button>
              </div>
            </div>
          )}

          {selectedRegion && !showRegionForm && (
            <div className="mpe-region-detail">
              <div className="mpe-region-detail__head">
                <div>
                  <span
                    className="mpe-region-type-badge"
                    style={{
                      background: getRegionColor(selectedRegion.regionTypeName),
                    }}
                  >
                    {selectedRegion.regionTypeName}
                  </span>
                  {selectedRegion.note && (
                    <p className="mpe-region-detail__note">
                      {selectedRegion.note}
                    </p>
                  )}
                </div>
                <button
                  className="mpe-icon-btn mpe-icon-btn--delete"
                  onClick={() => handleDeleteRegion(selectedRegion.regionId)}
                  title="Xoá vùng"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="mpe-tasks">
                <div className="mpe-tasks__head">
                  <span>Task ({selectedRegion.tasks.length})</span>
                  <button
                    className="mpe-add-task-btn"
                    onClick={() => {
                      setShowTaskForm(true);
                      setTaskTypeId(taskTypes[0]?.id ?? 0);
                      setTaskAssignTo(assistants[0]?.assistantId ?? 0);
                      setTaskDeadline("");
                      setTaskDesc("");
                    }}
                  >
                    <Plus size={12} /> Giao việc
                  </button>
                </div>

                {showTaskForm && (
                  <div className="mpe-task-form">
                    <div className="mpe-field">
                      <label>Loại công việc</label>
                      <select
                        value={taskTypeId}
                        onChange={(e) => setTaskTypeId(Number(e.target.value))}
                      >
                        <option value={0} disabled>
                          Chọn...
                        </option>
                        {taskTypes.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mpe-field">
                      <label>Giao cho</label>
                      <select
                        value={taskAssignTo}
                        onChange={(e) =>
                          setTaskAssignTo(Number(e.target.value))
                        }
                      >
                        <option value={0} disabled>
                          Chọn assistant...
                        </option>
                        {assistants.map((a) => (
                          <option key={a.assistantId} value={a.assistantId}>
                            {a.assistantName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mpe-field">
                      <label>Deadline</label>
                      <input
                        type="datetime-local"
                        value={taskDeadline}
                        onChange={(e) => setTaskDeadline(e.target.value)}
                      />
                    </div>
                    <div className="mpe-field">
                      <label>Mô tả</label>
                      <textarea
                        rows={2}
                        placeholder="Mô tả chi tiết..."
                        value={taskDesc}
                        onChange={(e) => setTaskDesc(e.target.value)}
                      />
                    </div>
                    <div className="mpe-task-form__actions">
                      <button
                        className="mpe-btn mpe-btn--ghost"
                        onClick={() => setShowTaskForm(false)}
                      >
                        Huỷ
                      </button>
                      <button
                        className="mpe-btn mpe-btn--save"
                        onClick={handleSaveTask}
                        disabled={
                          !taskTypeId ||
                          !taskAssignTo ||
                          !taskDeadline ||
                          savingTask
                        }
                      >
                        {savingTask ? "Đang lưu..." : "Giao việc"}
                      </button>
                    </div>
                  </div>
                )}

                {selectedRegion.tasks.length === 0 && !showTaskForm && (
                  <div className="mpe-tasks__empty">Chưa có task nào</div>
                )}
                {selectedRegion.tasks.map((t) => (
                  <div key={t.taskId} className="mpe-task-card">
                    <div className="mpe-task-card__top">
                      <span className="mpe-task-card__type">
                        {t.taskTypeName}
                      </span>
                      <span
                        className={`mpe-task-status mpe-task-status--${t.taskStatus}`}
                      >
                        {t.taskStatus}
                      </span>
                    </div>

                    {t.description && (
                      <p className="mpe-task-card__desc">{t.description}</p>
                    )}

                    <div className="mpe-task-card__bottom">
                      <div className="mpe-task-card__assignee">
                        {t.assignedToAvatarUrl ? (
                          <img
                            src={t.assignedToAvatarUrl}
                            alt={t.assignedToName ?? ""}
                            className="mpe-mini-avatar"
                          />
                        ) : t.assignedToName ? (
                          <div
                            className="mpe-mini-avatar mpe-mini-avatar--init"
                            style={{
                              background: getAvatarColor(t.assignedToName),
                            }}
                          >
                            {getInitials(t.assignedToName)}
                          </div>
                        ) : null}
                        <span>{t.assignedToName ?? "—"}</span>
                      </div>
                      <div className="mpe-task-card__right">
                        {t.deadline && (
                          <span className="mpe-task-card__deadline">
                            <Clock size={10} />
                            {new Date(t.deadline).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                        {t.taskStatus === "review" && (
                          <button
                            className="mpe-view-subs-btn"
                            onClick={() => handleExpandTask(t.taskId)}
                          >
                            {expandedTaskId === t.taskId ? "Ẩn" : "Xem bài nộp"}
                          </button>
                        )}
                        <button
                          className="mpe-icon-btn mpe-icon-btn--delete-sm"
                          onClick={() => handleDeleteTask(t.taskId)}
                          title="Xoá task"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    {expandedTaskId === t.taskId && (
                      <div className="mpe-submission-panel">
                        <div className="mpe-submission-panel__head">
                          Bài nộp của assistant
                        </div>

                        {loadingSubs ? (
                          <div className="mpe-submission-panel__loading">
                            <Loader2 size={13} className="mpe-spin" /> Đang
                            tải...
                          </div>
                        ) : taskSubmissions.length === 0 ? (
                          <div className="mpe-submission-panel__empty">
                            Chưa có bài nộp nào
                          </div>
                        ) : (
                          taskSubmissions.map((s) => (
                            <div key={s.submissionId} className="mpe-sub-item">
                              <img
                                src={s.fileUrl}
                                alt="Submission"
                                className="mpe-sub-item__img"
                                onClick={() => window.open(s.fileUrl, "_blank")}
                              />

                              <div className="mpe-sub-item__info">
                                <div className="mpe-sub-item__meta">
                                  <span
                                    className={`mpe-sub-status mpe-sub-status--${s.status}`}
                                  >
                                    {s.status === "pending" && "Chờ duyệt"}
                                    {s.status === "approved" && (
                                      <>
                                        <CheckCircle2 size={10} /> Đã duyệt
                                      </>
                                    )}
                                    {s.status === "rejected" && (
                                      <>
                                        <XCircle size={10} /> Trả lại
                                      </>
                                    )}
                                  </span>
                                  <span className="mpe-sub-item__date">
                                    {new Date(s.submittedAt).toLocaleString(
                                      "vi-VN",
                                    )}
                                  </span>
                                </div>

                                {s.note && (
                                  <p className="mpe-sub-item__note">
                                    💬 {s.note}
                                  </p>
                                )}

                                {s.status === "pending" && (
                                  <div className="mpe-sub-item__actions">
                                    {showRejectForm === s.submissionId ? (
                                      <div className="mpe-reject-form">
                                        <textarea
                                          className="mpe-reject-form__input"
                                          rows={2}
                                          placeholder="Lý do trả lại..."
                                          value={reviewFeedback}
                                          onChange={(e) =>
                                            setReviewFeedback(e.target.value)
                                          }
                                          autoFocus
                                        />
                                        <div className="mpe-reject-form__actions">
                                          <button
                                            className="mpe-btn-xs mpe-btn-xs--ghost"
                                            onClick={() => {
                                              setShowRejectForm(null);
                                              setReviewFeedback("");
                                            }}
                                          >
                                            Huỷ
                                          </button>
                                          <button
                                            className="mpe-btn-xs mpe-btn-xs--reject"
                                            onClick={() =>
                                              handleReview(
                                                s.submissionId,
                                                "rejected",
                                                t.taskId,
                                              )
                                            }
                                            disabled={
                                              !reviewFeedback.trim() ||
                                              reviewingSubId === s.submissionId
                                            }
                                          >
                                            <XCircle size={11} /> Trả lại
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <button
                                          className="mpe-btn-xs mpe-btn-xs--reject"
                                          onClick={() =>
                                            setShowRejectForm(s.submissionId)
                                          }
                                          disabled={
                                            reviewingSubId === s.submissionId
                                          }
                                        >
                                          <XCircle size={11} /> Trả lại
                                        </button>
                                        <button
                                          className="mpe-btn-xs mpe-btn-xs--approve"
                                          onClick={() =>
                                            handleReview(
                                              s.submissionId,
                                              "approved",
                                              t.taskId,
                                            )
                                          }
                                          disabled={
                                            reviewingSubId === s.submissionId
                                          }
                                        >
                                          {reviewingSubId === s.submissionId ? (
                                            <Loader2
                                              size={11}
                                              className="mpe-spin"
                                            />
                                          ) : (
                                            <CheckCircle2 size={11} />
                                          )}
                                          Duyệt
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!selectedRegion && !showRegionForm && (
            <div className="mpe-panel-empty">
              <Square size={28} strokeWidth={1.25} />
              <span>
                {mode === "draw"
                  ? "Kéo-thả trên ảnh để vẽ vùng mới"
                  : "Click vào vùng trên ảnh để xem chi tiết"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

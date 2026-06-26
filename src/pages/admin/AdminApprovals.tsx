import { useState, useRef, useCallback, useEffect } from "react";
import {
  CheckCircle2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  BookOpen,
  ImageIcon,
  Send,
  FileText,
} from "lucide-react";
import {
  fetchPendingPublishChapters,
  fetchAdminDeadlinePages,
  reviewChapterAdmin,
  type AdminChapterRes,
} from "../../services/adminChapterService";
import "./AdminApprovals.scss";

interface PageGroup {
  deadlineId: number;
  label: string;
  pageFrom: number;
  pageTo: number;
  reviewNote: string | null;
}

export default function AdminApprovals() {
  const [chapters, setChapters] = useState<AdminChapterRes[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);

  const imagesRef = useRef<
    Record<number, { pageNumber: number; fileUrl: string }[]>
  >({});
  const [images, setImages] = useState<
    Record<number, { pageNumber: number; fileUrl: string }[]>
  >({});
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const [zoom, setZoom] = useState(1);

  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const loadImages = useCallback(async (deadlineId: number) => {
    if (imagesRef.current[deadlineId]) {
      setImageIndex(0);
      return;
    }
    setLoadingImages(true);
    setImageIndex(0);
    try {
      const pages = await fetchAdminDeadlinePages(deadlineId);
      imagesRef.current[deadlineId] = pages;
      setImages((prev) => ({ ...prev, [deadlineId]: pages }));
    } catch (err) {
      console.error("Load ảnh thất bại", err);
    } finally {
      setLoadingImages(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchPendingPublishChapters();
        setChapters(data);
        if (data.length > 0) {
          setActiveId(data[0].chapterId);
          const firstGroup = data[0].pageDeadlines[0];
          if (firstGroup) loadImages(firstGroup.deadlineId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loadImages]);

  const activeChapter = chapters.find((c) => c.chapterId === activeId);
  const groups: PageGroup[] = (activeChapter?.pageDeadlines ?? []).map((d) => ({
    deadlineId: d.deadlineId,
    label:
      d.pageFrom === d.pageTo
        ? String(d.pageFrom)
        : `${d.pageFrom}–${d.pageTo}`,
    pageFrom: d.pageFrom,
    pageTo: d.pageTo,
    reviewNote: d.reviewNote,
  }));
  const activeGroup = groups[activeGroupIdx] ?? null;
  const currentImages = activeGroup
    ? (images[activeGroup.deadlineId] ?? [])
    : [];
  const currentImage = currentImages[imageIndex] ?? null;

  const selectChapter = (c: AdminChapterRes) => {
    setActiveId(c.chapterId);
    setActiveGroupIdx(0);
    setImageIndex(0);
    setShowRevisionForm(false);
    setRevisionNote("");
    const firstGroup = c.pageDeadlines[0];
    if (firstGroup) loadImages(firstGroup.deadlineId);
  };

  const selectGroup = (idx: number) => {
    setActiveGroupIdx(idx);
    setImageIndex(0);
    setShowRevisionForm(false);
    const g = groups[idx];
    if (g) loadImages(g.deadlineId);
  };

  const handleApprove = async () => {
    if (!activeId || reviewing) return;
    setReviewing(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const updated = await reviewChapterAdmin(activeId, {
        decision: "approved",
      });
      setChapters((prev) => {
        const remaining = prev.filter((c) => c.chapterId !== activeId);
        if (remaining.length > 0) {
          setActiveId(remaining[0].chapterId);
          setActiveGroupIdx(0);
          setImageIndex(0);
          const firstGroup = remaining[0].pageDeadlines[0];
          if (firstGroup) loadImages(firstGroup.deadlineId);
        } else {
          setActiveId(null);
        }
        return remaining;
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Thao tác thất bại";
      alert(msg);
    } finally {
      setReviewing(false);
    }
  };

  const handleRevision = async () => {
    if (!activeId || reviewing) return;
    setReviewing(true);
    try {
      const updated = await reviewChapterAdmin(activeId, {
        decision: "revision",
        note: revisionNote.trim() || undefined,
      });
      setChapters((prev) =>
        prev.map((c) =>
          c.chapterId === activeId ? { ...c, adminNote: updated.adminNote } : c,
        ),
      );
      setShowRevisionForm(false);
      setRevisionNote("");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Thao tác thất bại";
      alert(msg);
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return (
      <div className="aa-root aa-root--empty">
        <span>Đang tải…</span>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="aa-root aa-root--empty">
        <CheckCircle2 size={40} strokeWidth={1.25} style={{ opacity: 0.25 }} />
        <p>Không có chapter nào đang chờ duyệt đăng</p>
      </div>
    );
  }

  return (
    <div className="aa-root">
      <aside className="aa-rail">
        <div className="aa-rail__head">
          <span className="aa-rail__title">Chờ duyệt đăng</span>
          <span className="aa-rail__count">{chapters.length}</span>
        </div>

        {chapters.map((c) => (
          <button
            key={c.chapterId}
            className={`aa-card ${activeId === c.chapterId ? "aa-card--active" : ""}`}
            onClick={() => selectChapter(c)}
          >
            <div className="aa-card__top">
              <span className="aa-card__series">{c.seriesTitle ?? "—"}</span>
              <span className="aa-card__chapter">Ch.{c.chapterNumber}</span>
            </div>
            <span className="aa-card__title">
              {c.title ?? `Chương ${c.chapterNumber}`}
            </span>
            <span className="aa-card__author">{c.mangakaName ?? "—"}</span>
            {c.adminNote && (
              <span className="aa-card__note-badge">Đã góp ý</span>
            )}
          </button>
        ))}
      </aside>

      {activeChapter && (
        <main className="aa-viewer">
          <div className="aa-topbar">
            <nav className="aa-breadcrumb">
              <span>{activeChapter.seriesTitle}</span>
              <ChevronRight size={13} />
              <span>Chương {activeChapter.chapterNumber}</span>
              {activeChapter.title && (
                <>
                  <ChevronRight size={13} />
                  <span>{activeChapter.title}</span>
                </>
              )}
              {activeGroup && (
                <>
                  <ChevronRight size={13} />
                  <strong>Trang {activeGroup.label}</strong>
                </>
              )}
            </nav>

            <div className="aa-toolbar">
              <button
                className="aa-tool"
                onClick={() =>
                  setZoom((z) => Math.min(2, +(z + 0.25).toFixed(2)))
                }
              >
                <ZoomIn size={16} strokeWidth={1.75} />
              </button>
              <button
                className="aa-tool"
                onClick={() =>
                  setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))
                }
              >
                <ZoomOut size={16} strokeWidth={1.75} />
              </button>
            </div>
          </div>

          <div className="aa-canvas-scroll">
            <div
              className="aa-canvas"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: "top center",
              }}
            >
              {!activeGroup ? (
                <div className="aa-placeholder">
                  <FileText size={40} strokeWidth={1} />
                  <span>Chọn nhóm trang bên phải để xem</span>
                </div>
              ) : loadingImages ? (
                <div className="aa-placeholder">Đang tải ảnh…</div>
              ) : currentImage ? (
                <img
                  src={currentImage.fileUrl}
                  alt={`Trang ${currentImage.pageNumber}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    maxWidth: 600,
                  }}
                  draggable={false}
                />
              ) : (
                <div className="aa-placeholder">
                  <ImageIcon size={36} strokeWidth={1} />
                  <span>Chưa có ảnh trang {activeGroup.label}</span>
                </div>
              )}
            </div>
          </div>

          {currentImages.length > 1 && (
            <div className="aa-page-nav">
              <button
                className="aa-nav-btn"
                onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
                disabled={imageIndex === 0}
              >
                <ChevronLeft size={14} />
              </button>
              <span>
                Trang {currentImage?.pageNumber} ({imageIndex + 1}/
                {currentImages.length})
              </span>
              <button
                className="aa-nav-btn"
                onClick={() =>
                  setImageIndex((i) =>
                    Math.min(currentImages.length - 1, i + 1),
                  )
                }
                disabled={imageIndex === currentImages.length - 1}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          <div className="aa-strip">
            <button
              className="aa-strip__nav"
              onClick={() =>
                activeGroupIdx > 0 && selectGroup(activeGroupIdx - 1)
              }
              disabled={activeGroupIdx === 0}
            >
              <ChevronLeft size={14} />
            </button>
            <div className="aa-strip__list">
              {groups.map((g, idx) => {
                const thumb = images[g.deadlineId]?.[0]?.fileUrl;
                return (
                  <button
                    key={g.deadlineId}
                    className={`aa-thumb ${activeGroupIdx === idx ? "aa-thumb--active" : ""}`}
                    onClick={() => selectGroup(idx)}
                    title={`Trang ${g.label}`}
                  >
                    <div className="aa-thumb__art">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <ImageIcon size={13} strokeWidth={1.25} />
                      )}
                    </div>
                    <span className="aa-thumb__lbl">{g.label}</span>
                  </button>
                );
              })}
            </div>
            <button
              className="aa-strip__nav"
              onClick={() =>
                activeGroupIdx < groups.length - 1 &&
                selectGroup(activeGroupIdx + 1)
              }
              disabled={activeGroupIdx >= groups.length - 1}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </main>
      )}

      {activeChapter && (
        <aside className="aa-panel">
          <div className="aa-panel__info">
            <div className="aa-panel__series">{activeChapter.seriesTitle}</div>
            <div className="aa-panel__chapter">
              Chương {activeChapter.chapterNumber}
              {activeChapter.title ? ` — ${activeChapter.title}` : ""}
            </div>
            <div className="aa-panel__author">
              <BookOpen size={12} /> {activeChapter.mangakaName}
            </div>
          </div>

          {activeChapter.adminNote && !showRevisionForm && (
            <div className="aa-prev-note">
              <span className="aa-prev-note__label">Góp ý đã gửi:</span>
              <p>{activeChapter.adminNote}</p>
            </div>
          )}

          <div className="aa-actions">
            <button
              className="aa-btn aa-btn--approve"
              onClick={handleApprove}
              disabled={reviewing}
            >
              <CheckCircle2 size={16} strokeWidth={1.75} />
              {reviewing ? "Đang xử lý…" : "Duyệt đăng"}
            </button>
            <button
              className="aa-btn aa-btn--revision"
              onClick={() => {
                setShowRevisionForm((v) => !v);
                setRevisionNote(activeChapter.adminNote ?? "");
              }}
              disabled={reviewing}
            >
              <RotateCcw size={15} strokeWidth={1.75} /> Góp ý / Yêu cầu sửa
            </button>
          </div>

          {showRevisionForm && (
            <div className="aa-revision-form">
              <label className="aa-revision-form__label">
                Góp ý cho biên tập (Tantou)
              </label>
              <textarea
                className="aa-revision-form__input"
                rows={5}
                placeholder="Mô tả cụ thể những điểm cần chỉnh sửa trước khi đăng lên tạp chí…"
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                autoFocus
              />
              <div className="aa-revision-form__actions">
                <button
                  className="aa-btn aa-btn--send"
                  onClick={handleRevision}
                  disabled={reviewing}
                >
                  <Send size={13} />
                  {reviewing ? "Đang gửi…" : "Gửi góp ý"}
                </button>
                <button
                  className="aa-btn aa-btn--ghost"
                  onClick={() => {
                    setShowRevisionForm(false);
                    setRevisionNote("");
                  }}
                >
                  Huỷ
                </button>
              </div>
            </div>
          )}

          <div className="aa-divider" />

          <div className="aa-groups-head">
            <FileText size={13} />
            <span>Nhóm trang ({groups.length})</span>
          </div>
          <div className="aa-groups-list">
            {groups.map((g, idx) => (
              <button
                key={g.deadlineId}
                className={`aa-group-row ${activeGroupIdx === idx ? "aa-group-row--active" : ""}`}
                onClick={() => selectGroup(idx)}
              >
                <span className="aa-group-row__label">Trang {g.label}</span>
                {g.reviewNote && (
                  <span
                    className="aa-group-row__tantou-note"
                    title={g.reviewNote}
                  >
                    💬 Tantou: {g.reviewNote.slice(0, 40)}
                    {g.reviewNote.length > 40 ? "…" : ""}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}

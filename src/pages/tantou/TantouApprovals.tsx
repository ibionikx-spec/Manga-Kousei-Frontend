import { useState, useRef, useCallback, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Clock,
  AlertTriangle,
  Check,
  Eye,
  ImageIcon,
  Send,
} from "lucide-react";
import {
  fetchPendingReviewChapters,
  reviewPageGroup,
  submitChapterToAdmin,
  fetchDeadlinePages,
  type ChapterRes,
  type PageDeadline,
} from "../../services/chapterService";
import "./TantouApprovals.scss";

interface MangaPage {
  id: number;
  deadlineId: number;
  label: string;
  type: "single" | "spread";
  status: "pending" | "approved" | "revision";
  reviewNote: string | null;
}

interface Submission {
  id: number;
  series: string;
  author: string;
  chapterNum: number;
  chapterTitle: string;
  submittedAt: string;
  pages: MangaPage[];
}

function mapStatus(s: PageDeadline["status"]): MangaPage["status"] {
  if (s === "approved") return "approved";
  if (s === "revision") return "revision";
  return "pending";
}

function toSubmission(c: ChapterRes): Submission {
  return {
    id: c.chapterId,
    series: c.seriesTitle ?? "—",
    author: c.mangakaName ?? "—",
    chapterNum: c.chapterNumber,
    chapterTitle: c.title ?? "",
    submittedAt: c.createdAt
      ? new Date(c.createdAt).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—",
    pages: c.pageDeadlines.map((d) => ({
      id: d.deadlineId,
      deadlineId: d.deadlineId,
      label:
        d.pageFrom === d.pageTo
          ? String(d.pageFrom)
          : `${d.pageFrom}–${d.pageTo}`,
      type: d.pageTo - d.pageFrom >= 1 ? "spread" : "single",
      status: mapStatus(d.status),
      reviewNote: d.reviewNote ?? null,
    })),
  };
}

export default function TantouApprovals() {
  const [chapters, setChapters] = useState<ChapterRes[]>([]);
  const [loading, setLoading] = useState(true);

  const deadlineImagesRef = useRef<
    Record<number, { pageNumber: number; fileUrl: string }[]>
  >({});
  const [deadlineImages, setDeadlineImages] = useState<
    Record<number, { pageNumber: number; fileUrl: string }[]>
  >({});
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const [activeId, setActiveId] = useState<number | null>(null);
  const [activePageId, setActivePageId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pageOverrides, setPageOverrides] = useState<
    Record<number, MangaPage["status"]>
  >({});
  const [noteOverrides, setNoteOverrides] = useState<
    Record<number, string | null>
  >({});

  const [revisionNote, setRevisionNote] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const loadImagesForDeadline = useCallback(async (deadlineId: number) => {
    if (deadlineImagesRef.current[deadlineId]) {
      setImageIndex(0);
      return;
    }
    setLoadingImages(true);
    setImageIndex(0);
    try {
      const pages = await fetchDeadlinePages(deadlineId);
      const mapped = pages.map((p) => ({
        pageNumber: p.pageNumber,
        fileUrl: p.fileUrl,
      }));
      deadlineImagesRef.current[deadlineId] = mapped;
      setDeadlineImages((prev) => ({ ...prev, [deadlineId]: mapped }));
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
        const data = await fetchPendingReviewChapters();
        setChapters(data);
        if (data.length > 0) {
          const first = data[0];
          setActiveId(first.chapterId);
          const firstDeadline = first.pageDeadlines[0];
          if (firstDeadline) {
            setActivePageId(firstDeadline.deadlineId);
            loadImagesForDeadline(firstDeadline.deadlineId);
          }
        }
      } catch (err) {
        console.error("Load thất bại", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loadImagesForDeadline]);

  const SUBMISSIONS: Submission[] = chapters.map(toSubmission);
  const sub = SUBMISSIONS.find((s) => s.id === activeId) ?? SUBMISSIONS[0];

  if (!loading && SUBMISSIONS.length === 0) {
    return (
      <div className="ta-root ta-root--empty">
        <CheckCircle2 size={40} strokeWidth={1.25} />
        <p>Không có chapter nào cần duyệt</p>
      </div>
    );
  }

  if (loading || !sub) {
    return (
      <div className="ta-root ta-root--empty">
        <span>Đang tải…</span>
      </div>
    );
  }

  const page = sub.pages.find((p) => p.id === activePageId) ?? sub.pages[0];
  const getStatus = (p: MangaPage) => pageOverrides[p.id] ?? p.status;
  const getNote = (p: MangaPage) =>
    p.id in noteOverrides ? noteOverrides[p.id] : p.reviewNote;

  const approved = sub.pages.filter((p) => getStatus(p) === "approved").length;
  const revisionCount = sub.pages.filter(
    (p) => getStatus(p) === "revision",
  ).length;
  const pendingCount = sub.pages.filter(
    (p) => getStatus(p) === "pending",
  ).length;
  const pct = Math.round((approved / sub.pages.length) * 100);
  const allApproved =
    sub.pages.length > 0 && sub.pages.every((p) => getStatus(p) === "approved");

  const currentImages = page ? (deadlineImages[page.deadlineId] ?? []) : [];
  const currentImage = currentImages[imageIndex] ?? null;
  const curStatus = getStatus(page);
  const curNote = getNote(page);

  const handleSelectPage = (p: MangaPage) => {
    setActivePageId(p.id);
    setImageIndex(0);
    loadImagesForDeadline(p.deadlineId);
    setShowRevisionForm(false);
    setRevisionNote("");
  };

  const handleApprove = async () => {
    if (!page || reviewingId) return;
    setReviewingId(page.deadlineId);
    try {
      await reviewPageGroup(page.deadlineId, { decision: "approved" });
      setPageOverrides((prev) => ({ ...prev, [page.id]: "approved" }));
      setNoteOverrides((prev) => ({ ...prev, [page.id]: null }));
      setChapters((prev) =>
        prev.map((c) =>
          c.chapterId !== activeId
            ? c
            : {
                ...c,
                pageDeadlines: c.pageDeadlines.map((d) =>
                  d.deadlineId === page.deadlineId
                    ? { ...d, status: "approved" as const, reviewNote: null }
                    : d,
                ),
              },
        ),
      );
      const idx = sub.pages.findIndex((p2) => p2.id === page.id);
      const next = sub.pages
        .slice(idx + 1)
        .find((p2) => getStatus(p2) === "pending");
      if (next) handleSelectPage(next);
    } catch (err) {
      console.error("Approve thất bại", err);
    } finally {
      setReviewingId(null);
    }
  };

  const handleRevision = async () => {
    if (!page || reviewingId) return;
    setReviewingId(page.deadlineId);
    try {
      await reviewPageGroup(page.deadlineId, {
        decision: "revision",
        note: revisionNote.trim() || undefined,
      });
      const note = revisionNote.trim() || null;
      setPageOverrides((prev) => ({ ...prev, [page.id]: "revision" }));
      setNoteOverrides((prev) => ({ ...prev, [page.id]: note }));
      setChapters((prev) =>
        prev.map((c) =>
          c.chapterId !== activeId
            ? c
            : {
                ...c,
                pageDeadlines: c.pageDeadlines.map((d) =>
                  d.deadlineId === page.deadlineId
                    ? {
                        ...d,
                        status: "revision" as const,
                        reviewNote: note,
                      }
                    : d,
                ),
              },
        ),
      );
      setShowRevisionForm(false);
      setRevisionNote("");
    } catch (err) {
      console.error("Revision thất bại", err);
    } finally {
      setReviewingId(null);
    }
  };

  const handleSubmitToAdmin = async () => {
    if (!activeId) return;
    setSubmitting(true);
    try {
      await submitChapterToAdmin(activeId);
      setChapters((prev) => {
        const remaining = prev.filter((c) => c.chapterId !== activeId);
        if (remaining.length > 0) {
          setActiveId(remaining[0].chapterId);
          const firstD = remaining[0].pageDeadlines[0];
          if (firstD) {
            setActivePageId(firstD.deadlineId);
            loadImagesForDeadline(firstD.deadlineId);
          }
        } else {
          setActiveId(null);
          setActivePageId(null);
        }
        return remaining;
      });
      setPageOverrides({});
      setNoteOverrides({});
      setShowRevisionForm(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Submit thất bại";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ta-root">
      <aside className="ta-rail">
        <div className="ta-rail__head">
          <span className="ta-rail__title">Hàng đợi duyệt</span>
          <span className="ta-rail__count">{SUBMISSIONS.length}</span>
        </div>
        {SUBMISSIONS.map((s) => {
          const appr = s.pages.filter(
            (p) => (pageOverrides[p.id] ?? p.status) === "approved",
          ).length;
          const pctS = Math.round((appr / s.pages.length) * 100);
          return (
            <button
              key={s.id}
              className={`ta-sub ${activeId === s.id ? "ta-sub--active" : ""}`}
              onClick={() => {
                setActiveId(s.id);
                const firstD = s.pages[0];
                if (firstD) {
                  setActivePageId(firstD.id);
                  loadImagesForDeadline(firstD.deadlineId);
                }
                setPageOverrides({});
                setNoteOverrides({});
                setShowRevisionForm(false);
                setRevisionNote("");
                setImageIndex(0);
              }}
            >
              <div className="ta-sub__row1">
                <span className="ta-sub__series">{s.series}</span>
                <span className="ta-sub__type ta-sub__type--genga">
                  Ch.{s.chapterNum}
                </span>
              </div>
              <div className="ta-sub__row2">
                <span>{s.author}</span>
                <span className="ta-sub__dot">·</span>
                <Clock size={11} />
                <span>{s.submittedAt}</span>
              </div>
              <div className="ta-sub__prog">
                <div className="ta-sub__prog-track">
                  <div
                    className="ta-sub__prog-fill"
                    style={{ width: `${pctS}%` }}
                  />
                </div>
                <span className="ta-sub__prog-label">
                  {appr}/{s.pages.length} duyệt
                </span>
              </div>
            </button>
          );
        })}
      </aside>

      <main className="ta-viewer">
        <div className="ta-topbar">
          <nav className="ta-breadcrumb">
            <span>{sub.series}</span>
            <ChevronRight size={13} />
            <span>
              Chương {sub.chapterNum}
              {sub.chapterTitle ? `: ${sub.chapterTitle}` : ""}
            </span>
            <ChevronRight size={13} />
            <strong>
              Trang {page.label}
              {currentImages.length > 1
                ? ` (${imageIndex + 1}/${currentImages.length})`
                : ""}
            </strong>
          </nav>
        </div>

        <div className="ta-viewer__header">
          <h1 className="ta-viewer__title">
            Trang {page.label}
            {page.type === "spread" ? " (Trang đôi)" : ""}
          </h1>
          <div className="ta-toolbar">
            <button
              className="ta-tool"
              onClick={() =>
                setZoom((z) => Math.min(2, +(z + 0.25).toFixed(2)))
              }
            >
              <ZoomIn size={17} strokeWidth={1.75} />
            </button>
            <button
              className="ta-tool"
              onClick={() =>
                setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))
              }
            >
              <ZoomOut size={17} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div className="ta-prog">
          <div className="ta-prog__bar">
            <div className="ta-prog__fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="ta-prog__label">
            {approved}/{sub.pages.length} nhóm trang đã duyệt
          </span>
        </div>

        <div className="ta-canvas-scroll">
          <div
            className="ta-canvas"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
          >
            <div className="ta-art">
              {loadingImages ? (
                <div className="ta-art-placeholder">Đang tải ảnh…</div>
              ) : currentImage ? (
                <img
                  src={currentImage.fileUrl}
                  alt={`Trang ${currentImage.pageNumber}`}
                  style={{ width: "100%", height: "auto", display: "block" }}
                  draggable={false}
                />
              ) : (
                <div className="ta-art-placeholder">
                  <ImageIcon size={32} strokeWidth={1} />
                  <span>Mangaka chưa upload ảnh trang {page.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {currentImages.length > 1 && (
          <div className="ta-page-nav">
            <button
              className="ta-strip__nav"
              onClick={() => setImageIndex((i) => Math.max(0, i - 1))}
              disabled={imageIndex === 0}
            >
              <ChevronLeft size={13} />
            </button>
            <span>
              Trang {currentImage?.pageNumber} ({imageIndex + 1}/
              {currentImages.length})
            </span>
            <button
              className="ta-strip__nav"
              onClick={() =>
                setImageIndex((i) => Math.min(currentImages.length - 1, i + 1))
              }
              disabled={imageIndex === currentImages.length - 1}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        )}

        <div className="ta-strip">
          <button
            className="ta-strip__nav"
            onClick={() => {
              const i = sub.pages.findIndex((p2) => p2.id === activePageId);
              if (i > 0) handleSelectPage(sub.pages[i - 1]);
            }}
          >
            <ChevronLeft size={15} />
          </button>
          <div className="ta-strip__list">
            {sub.pages.map((p2) => {
              const st = getStatus(p2);
              const thumb = deadlineImages[p2.deadlineId]?.[0]?.fileUrl;
              return (
                <button
                  key={p2.id}
                  className={`ta-thumb ${activePageId === p2.id ? "ta-thumb--active" : ""} ta-thumb--${st}`}
                  onClick={() => handleSelectPage(p2)}
                  title={`Trang ${p2.label}`}
                >
                  <div className="ta-thumb__art">
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
                      <ImageIcon size={14} strokeWidth={1.25} />
                    )}
                  </div>
                  <span className="ta-thumb__lbl">{p2.label}</span>
                  {st === "approved" && (
                    <div className="ta-thumb__dot ta-thumb__dot--ok">
                      <Check size={8} />
                    </div>
                  )}
                  {st === "revision" && (
                    <div className="ta-thumb__dot ta-thumb__dot--rev">
                      <AlertTriangle size={8} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <button
            className="ta-strip__nav"
            onClick={() => {
              const i = sub.pages.findIndex((p2) => p2.id === activePageId);
              if (i < sub.pages.length - 1) handleSelectPage(sub.pages[i + 1]);
            }}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </main>

      <aside className="ta-panel">
        <div className="ta-panel__status">
          <span className="ta-panel__status-lbl">TRẠNG THÁI</span>
          <span className={`ta-badge ta-badge--${curStatus}`}>
            {curStatus === "approved"
              ? "ĐÃ DUYỆT"
              : curStatus === "revision"
                ? "YÊU CẦU SỬA"
                : "CHỜ DUYỆT"}
          </span>
        </div>

        {curStatus === "revision" && curNote && (
          <div className="ta-review-note">
            <span className="ta-review-note__label">Ghi chú đã gửi:</span>
            <p className="ta-review-note__text">{curNote}</p>
          </div>
        )}

        <div className="ta-actions">
          <button
            className="ta-btn ta-btn--approve"
            onClick={handleApprove}
            disabled={curStatus === "approved" || !!reviewingId}
          >
            <CheckCircle2 size={17} strokeWidth={1.75} />
            {reviewingId === page?.deadlineId ? "Đang lưu…" : "Phê duyệt"}
          </button>
          <button
            className="ta-btn ta-btn--revision"
            onClick={() => {
              setShowRevisionForm((v) => !v);
              setRevisionNote(curNote ?? "");
            }}
            disabled={curStatus === "revision" || !!reviewingId}
          >
            <RotateCcw size={15} strokeWidth={1.75} /> Yêu cầu sửa
          </button>
        </div>

        {showRevisionForm && (
          <div className="ta-revision-form">
            <label className="ta-revision-form__label">
              Ghi chú cho mangaka
            </label>
            <textarea
              className="ta-revision-form__input"
              rows={4}
              placeholder="Mô tả cụ thể những gì cần chỉnh sửa…"
              value={revisionNote}
              onChange={(e) => setRevisionNote(e.target.value)}
            />
            <div className="ta-revision-form__actions">
              <button
                className="ta-btn ta-btn--revision-confirm"
                onClick={handleRevision}
                disabled={!!reviewingId}
              >
                <Send size={13} />
                {reviewingId === page?.deadlineId
                  ? "Đang gửi…"
                  : "Gửi yêu cầu sửa"}
              </button>
              <button
                className="ta-btn ta-btn--ghost"
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

        {allApproved && (
          <div className="ta-submit-admin">
            <button
              className="ta-btn ta-btn--submit-admin"
              onClick={handleSubmitToAdmin}
              disabled={submitting}
            >
              <CheckCircle2 size={17} strokeWidth={1.75} />
              {submitting ? "Đang submit…" : "Nộp chương lên Admin"}
            </button>
          </div>
        )}

        <div className="ta-footer">
          <div className="ta-chap-prog">
            <div className="ta-chap-prog__row1">
              <span className="ta-chap-prog__name">
                <BookOpen size={12} /> Ch.{sub.chapterNum}
                {sub.chapterTitle ? ` — ${sub.chapterTitle}` : ""}
              </span>
              <span className="ta-chap-prog__pct">{pct}%</span>
            </div>
            <div className="ta-chap-prog__track">
              <div
                className="ta-chap-prog__fill"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="ta-chap-prog__stats">
              <span className="ok">
                <Check size={10} /> {approved} duyệt
              </span>
              <span className="rev">
                <AlertTriangle size={10} /> {revisionCount} sửa
              </span>
              <span className="pend">
                <Eye size={10} /> {pendingCount} chờ
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronRight,
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Hand,
  CheckCircle2,
  RotateCcw,
  MessageSquare,
  Layers,
  Send,
  Pin,
  BookOpen,
  Clock,
  AlertTriangle,
  Check,
  Eye,
  ImageIcon,
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

interface Annotation {
  id: number;
  x: number;
  y: number;
  color: "blue" | "pink";
}

interface Comment {
  id: number;
  annotationId: number | null;
  author: string;
  role: string;
  avatarColor: string;
  initials: string;
  time: string;
  body: string;
  accentColor: string;
}

interface MangaPage {
  id: number;
  deadlineId: number;
  label: string;
  type: "single" | "spread";
  status: "pending" | "approved" | "revision";
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
    })),
  };
}

const DIALOGUE_LINES = [
  { speaker: "Kira", text: "Sức mạnh này… không thể là của con người!" },
  { speaker: "Akira", text: "Tao sẽ không nhường một bước." },
  { speaker: "—", text: "..." },
];

const SFX_LIST = [
  { raw: "ズバァ", translated: "ZWAAAA" },
  { raw: "バキ", translated: "BAKI" },
];

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
  const [tab, setTab] = useState<"comments" | "dialogue">("comments");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [reply, setReply] = useState("");
  const [activeAnn, setActiveAnn] = useState<number | null>(null);
  const [pinMode, setPinMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pageOverrides, setPageOverrides] = useState<
    Record<number, MangaPage["status"]>
  >({});
  const [sfxEdits, setSfxEdits] = useState<Record<number, string>>(
    Object.fromEntries(SFX_LIST.map((s, i) => [i, s.translated])),
  );
  const [submitting, setSubmitting] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

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
    const loadChapters = async () => {
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

    loadChapters();
  }, [loadImagesForDeadline]);

  const SUBMISSIONS: Submission[] = chapters.map(toSubmission);
  const sub = SUBMISSIONS.find((s) => s.id === activeId) ?? SUBMISSIONS[0];

  if (!loading && SUBMISSIONS.length === 0) {
    return (
      <div
        className="ta-root"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "#94a3b8" }}>
          <CheckCircle2 size={40} strokeWidth={1.25} style={{ opacity: 0.3 }} />
          <p style={{ marginTop: 12, fontSize: 14 }}>
            Không có chapter nào cần duyệt
          </p>
        </div>
      </div>
    );
  }

  if (loading || !sub) {
    return (
      <div
        className="ta-root"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#94a3b8", fontSize: 14 }}>Đang tải…</span>
      </div>
    );
  }

  const page = sub.pages.find((p) => p.id === activePageId) ?? sub.pages[0];
  const getStatus = (p: MangaPage) => pageOverrides[p.id] ?? p.status;

  const visComments =
    activeAnn !== null
      ? comments.filter((c) => c.annotationId === activeAnn)
      : comments;

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

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pinMode || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newId = Date.now() % 100;
    setAnnotations((prev) => [...prev, { id: newId, x, y, color: "blue" }]);
    setActiveAnn(newId);
    setPinMode(false);
  };

  const sendReply = () => {
    if (!reply.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        annotationId: activeAnn,
        author: "Bạn (Biên tập)",
        role: "Biên tập",
        avatarColor: "#1d4ed8",
        initials: "BT",
        time: "Vừa xong",
        body: reply.trim(),
        accentColor: "#1d4ed8",
      },
    ]);
    setReply("");
  };

  const handleSelectPage = (p: MangaPage) => {
    setActivePageId(p.id);
    setImageIndex(0);
    loadImagesForDeadline(p.deadlineId);
    setAnnotations([]);
    setActiveAnn(null);
  };

  const approvePage = async () => {
    if (!page) return;
    try {
      await reviewPageGroup(page.deadlineId, { decision: "approved" });
      setPageOverrides((prev) => ({ ...prev, [page.id]: "approved" }));
      setChapters((prev) =>
        prev.map((c) => {
          if (c.chapterId !== activeId) return c;
          return {
            ...c,
            pageDeadlines: c.pageDeadlines.map((d) =>
              d.deadlineId === page.deadlineId
                ? { ...d, status: "approved" as const }
                : d,
            ),
          };
        }),
      );
      const idx = sub.pages.findIndex((p2) => p2.id === page.id);
      const next = sub.pages
        .slice(idx + 1)
        .find((p2) => getStatus(p2) === "pending");
      if (next) handleSelectPage(next);
    } catch (err) {
      console.error("Approve thất bại", err);
    }
  };

  const revisionPage = async () => {
    if (!page) return;
    try {
      await reviewPageGroup(page.deadlineId, { decision: "revision" });
      setPageOverrides((prev) => ({ ...prev, [page.id]: "revision" }));
      setChapters((prev) =>
        prev.map((c) => {
          if (c.chapterId !== activeId) return c;
          return {
            ...c,
            pageDeadlines: c.pageDeadlines.map((d) =>
              d.deadlineId === page.deadlineId
                ? { ...d, status: "revision" as const }
                : d,
            ),
          };
        }),
      );
    } catch (err) {
      console.error("Revision thất bại", err);
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
      setAnnotations([]);
      setComments([]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Submit thất bại";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const curStatus = getStatus(page);

  return (
    <div className="ta-root">
      <aside className="ta-rail">
        <div className="ta-rail__head">
          <span className="ta-rail__title">Hàng đợi duyệt</span>
          <span className="ta-rail__count">{SUBMISSIONS.length}</span>
        </div>
        {SUBMISSIONS.map((s) => (
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
              setAnnotations([]);
              setComments([]);
              setActiveAnn(null);
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
          </button>
        ))}
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
              className={`ta-tool ${pinMode ? "ta-tool--on" : ""}`}
              onClick={() => setPinMode((v) => !v)}
              title="Đặt chú thích"
            >
              <Pin size={17} strokeWidth={1.75} />
            </button>
            <div className="ta-toolbar__sep" />
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
            <button className="ta-tool">
              <Hand size={17} strokeWidth={1.75} />
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
            className={`ta-canvas ${pinMode ? "ta-canvas--pin" : ""}`}
            ref={canvasRef}
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
            onClick={handleCanvasClick}
          >
            <div className="ta-art">
              {loadingImages ? (
                <div
                  style={{
                    width: 520,
                    height: 370,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#ede9e3",
                    color: "#94a3b8",
                    fontSize: 13,
                  }}
                >
                  Đang tải ảnh…
                </div>
              ) : currentImage ? (
                <img
                  src={currentImage.fileUrl}
                  alt={`Trang ${currentImage.pageNumber}`}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    maxWidth: 520,
                  }}
                  draggable={false}
                />
              ) : (
                <svg
                  viewBox="0 0 520 370"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: "100%", height: "100%" }}
                >
                  <rect width="520" height="370" fill="#ede9e3" />
                  <rect x="0" y="0" width="252" height="370" fill="#f5f2ed" />
                  <rect x="256" y="0" width="264" height="370" fill="#eae7e0" />
                  <line
                    x1="254"
                    y1="0"
                    x2="254"
                    y2="370"
                    stroke="#c0bdb7"
                    strokeWidth="3"
                  />
                  {Array.from({ length: 28 }).map((_, i) => {
                    const a = (i / 28) * Math.PI * 2;
                    return (
                      <line
                        key={i}
                        x1={126 + Math.cos(a) * 55}
                        y1={185 + Math.sin(a) * 55}
                        x2={126 + Math.cos(a) * 220}
                        y2={185 + Math.sin(a) * 220}
                        stroke="#c8c5be"
                        strokeWidth={i % 4 === 0 ? "2" : "0.9"}
                        strokeOpacity="0.55"
                      />
                    );
                  })}
                  <text
                    x="260"
                    y="200"
                    fontSize="13"
                    fill="#9c9891"
                    fontFamily="sans-serif"
                    textAnchor="middle"
                  >
                    Mangaka chưa upload ảnh trang {page.label}
                  </text>
                  <text
                    x="260"
                    y="358"
                    fontSize="8.5"
                    fill="#9c9891"
                    fontFamily="sans-serif"
                  >
                    {sub.series} Ch.{sub.chapterNum}
                  </text>
                </svg>
              )}
            </div>

            {annotations.map((ann) => (
              <button
                key={ann.id}
                className={`ta-pin ta-pin--${ann.color} ${activeAnn === ann.id ? "ta-pin--active" : ""}`}
                style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveAnn((p) => (p === ann.id ? null : ann.id));
                  setTab("comments");
                }}
              >
                {ann.id <= 99 ? ann.id : "·"}
              </button>
            ))}

            {pinMode && (
              <div className="ta-pin-hint">
                <Pin size={13} /> Nhấn vào ảnh để đặt chú thích
              </div>
            )}
          </div>
        </div>

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
              const imgs = deadlineImages[p2.deadlineId];
              const thumb = imgs?.[0]?.fileUrl;
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
                        alt={`Trang ${p2.label}`}
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

        {currentImages.length > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "4px 16px",
              background: "#fff",
              borderTop: "1px solid #e2e8f0",
              fontSize: 12,
              color: "#64748b",
            }}
          >
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

        <div className="ta-actions">
          <button
            className="ta-btn ta-btn--approve"
            onClick={approvePage}
            disabled={curStatus === "approved"}
          >
            <CheckCircle2 size={17} strokeWidth={1.75} /> Phê duyệt
          </button>
          <button
            className="ta-btn ta-btn--revision"
            onClick={revisionPage}
            disabled={curStatus === "revision"}
          >
            <RotateCcw size={15} strokeWidth={1.75} /> Yêu cầu sửa
          </button>
        </div>

        {allApproved && (
          <div style={{ padding: "0 18px 12px" }}>
            <button
              className="ta-btn ta-btn--approve"
              style={{ width: "100%", background: "#15803d" }}
              onClick={handleSubmitToAdmin}
              disabled={submitting}
            >
              <CheckCircle2 size={17} strokeWidth={1.75} />
              {submitting ? "Đang submit…" : "Nộp chương lên Admin"}
            </button>
          </div>
        )}

        <div className="ta-tabs">
          <button
            className={`ta-tab ${tab === "comments" ? "ta-tab--on" : ""}`}
            onClick={() => setTab("comments")}
          >
            <MessageSquare size={13} strokeWidth={1.75} />
            Bình luận ({comments.length})
          </button>
          <button
            className={`ta-tab ${tab === "dialogue" ? "ta-tab--on" : ""}`}
            onClick={() => setTab("dialogue")}
          >
            <Layers size={13} strokeWidth={1.75} />
            Lời thoại & SFX
          </button>
        </div>

        <div className="ta-panel__body">
          {tab === "comments" && (
            <>
              <div className="ta-ann-filter">
                <button
                  className={`ta-ann-pill ${activeAnn === null ? "ta-ann-pill--all" : ""}`}
                  onClick={() => setActiveAnn(null)}
                >
                  Tất cả
                </button>
                {annotations.map((a) => (
                  <button
                    key={a.id}
                    className={`ta-ann-pill ta-ann-pill--${a.color} ${activeAnn === a.id ? "ta-ann-pill--sel" : ""}`}
                    onClick={() =>
                      setActiveAnn((p) => (p === a.id ? null : a.id))
                    }
                  >
                    #{a.id}
                  </button>
                ))}
              </div>

              <div className="ta-comments">
                {visComments.length === 0 && (
                  <div className="ta-empty">
                    <MessageSquare size={26} strokeWidth={1} />
                    <p>Chưa có bình luận.</p>
                  </div>
                )}
                {visComments.map((c) => {
                  const ann = annotations.find((a) => a.id === c.annotationId);
                  return (
                    <div key={c.id} className="ta-comment">
                      <div
                        className="ta-comment__stripe"
                        style={{ background: c.accentColor }}
                      />
                      <div className="ta-comment__inner">
                        {ann && (
                          <span
                            className={`ta-pin ta-pin--${ann.color} ta-pin--sm`}
                          >
                            {ann.id}
                          </span>
                        )}
                        <div className="ta-comment__meta">
                          <div
                            className="ta-comment__avatar"
                            style={{ background: c.avatarColor }}
                          >
                            {c.initials}
                          </div>
                          <div className="ta-comment__who">
                            <span className="ta-comment__name">{c.author}</span>
                            <span className="ta-comment__time">
                              {" "}
                              · {c.time}
                            </span>
                          </div>
                        </div>
                        <p className="ta-comment__body">{c.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="ta-reply">
                <input
                  className="ta-reply__input"
                  placeholder="Reply..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendReply()}
                />
                <button
                  className="ta-reply__send"
                  onClick={sendReply}
                  disabled={!reply.trim()}
                >
                  <Send size={15} strokeWidth={1.75} />
                </button>
              </div>
            </>
          )}

          {tab === "dialogue" && (
            <div className="ta-dialogue">
              <p className="ta-dialogue__hint">
                Lời thoại cần typeset cho chương này.
              </p>
              {DIALOGUE_LINES.map((l, i) => (
                <div key={i} className="ta-dialogue__line">
                  <span className="ta-dialogue__speaker">{l.speaker}</span>
                  <span className="ta-dialogue__text">{l.text}</span>
                </div>
              ))}
              <div className="ta-dialogue__sfx-head">SFX</div>
              {SFX_LIST.map((s, i) => (
                <div key={i} className="ta-dialogue__sfx">
                  <span className="ta-dialogue__sfx-raw">{s.raw}</span>
                  <span className="ta-dialogue__sfx-arrow">→</span>
                  <input
                    className="ta-dialogue__sfx-input"
                    value={sfxEdits[i]}
                    onChange={(e) =>
                      setSfxEdits((p) => ({ ...p, [i]: e.target.value }))
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

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

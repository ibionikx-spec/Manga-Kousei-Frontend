import { useState, useRef } from "react";
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
  version: string;
  submissionType: "name" | "genga" | "cover";
  submittedAt: string;
  pages: MangaPage[];
}

const SUBMISSIONS: Submission[] = [
  {
    id: 1,
    series: "Neon Genesis",
    author: "Tanaka Ryo",
    chapterNum: 42,
    chapterTitle: "Sự Thức Tỉnh",
    version: "V2",
    submissionType: "name",
    submittedAt: "2 giờ trước",
    pages: [
      { id: 1, label: "1–2", type: "spread", status: "approved" },
      { id: 2, label: "3", type: "single", status: "approved" },
      { id: 3, label: "4–5", type: "spread", status: "approved" },
      { id: 4, label: "6", type: "single", status: "revision" },
      { id: 5, label: "7", type: "single", status: "approved" },
      { id: 6, label: "8", type: "single", status: "approved" },
      { id: 7, label: "9", type: "single", status: "pending" },
      { id: 8, label: "10–11", type: "spread", status: "pending" },
      { id: 9, label: "12", type: "single", status: "pending" },
      { id: 10, label: "13", type: "single", status: "pending" },
      { id: 11, label: "14–15", type: "spread", status: "pending" },
      { id: 12, label: "16", type: "single", status: "pending" },
    ],
  },
  {
    id: 2,
    series: "Thiên Hà Vỡ",
    author: "Suzuki Ken",
    chapterNum: 12,
    chapterTitle: "Cuộc Chiến",
    version: "V1",
    submissionType: "genga",
    submittedAt: "5 giờ trước",
    pages: [
      { id: 101, label: "1", type: "single", status: "pending" },
      { id: 102, label: "2–3", type: "spread", status: "pending" },
      { id: 103, label: "4", type: "single", status: "pending" },
    ],
  },
  {
    id: 3,
    series: "Học Viện Pháp Thuật",
    author: "Miki Yasha",
    chapterNum: 4,
    chapterTitle: "Bìa Vol 4",
    version: "V1",
    submissionType: "cover",
    submittedAt: "1 ngày trước",
    pages: [{ id: 201, label: "Bìa", type: "single", status: "approved" }],
  },
];

const INIT_ANNOTATIONS: Annotation[] = [
  { id: 1, x: 22, y: 40, color: "pink" },
  { id: 2, x: 62, y: 65, color: "blue" },
];

const INIT_COMMENTS: Comment[] = [
  {
    id: 1,
    annotationId: 1,
    author: "Tanaka Ryo",
    role: "Tác giả",
    avatarColor: "#f97316",
    initials: "TR",
    time: "2 giờ trước",
    body: "I tightened the framing here compared to the storyboard to emphasize the impact. Let me know if it feels too cramped.",
    accentColor: "#f97316",
  },
  {
    id: 2,
    annotationId: 2,
    author: "Bạn (Biên tập)",
    role: "Biên tập",
    avatarColor: "#1d4ed8",
    initials: "BT",
    time: "5 phút trước",
    body: "The dynamic lines look great. Ensure enough negative space for the dialogue bubble on the right.",
    accentColor: "#1d4ed8",
  },
];

const DIALOGUE_LINES = [
  { speaker: "Kira", text: "Sức mạnh này… không thể là của con người!" },
  { speaker: "Akira", text: "Tao sẽ không nhường một bước." },
  { speaker: "—", text: "..." },
];

const SFX_LIST = [
  { raw: "ズバァ", translated: "ZWAAAA" },
  { raw: "バキ", translated: "BAKI" },
];

const TYPE_LABEL: Record<Submission["submissionType"], string> = {
  name: "BẢN NAME",
  genga: "GENGA",
  cover: "BÌA",
};

export default function TantouApprovals() {
  const [activeId, setActiveId] = useState(1);
  const [activePageId, setActivePageId] = useState(11);
  const [tab, setTab] = useState<"comments" | "dialogue">("comments");
  const [annotations, setAnnotations] =
    useState<Annotation[]>(INIT_ANNOTATIONS);
  const [comments, setComments] = useState<Comment[]>(INIT_COMMENTS);
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
  const canvasRef = useRef<HTMLDivElement>(null);

  const sub = SUBMISSIONS.find((s) => s.id === activeId)!;
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

  const approvePage = () => {
    setPageOverrides((p) => ({ ...p, [activePageId]: "approved" }));
    const idx = sub.pages.findIndex((p) => p.id === activePageId);
    const next = sub.pages[idx + 1];
    if (next) setActivePageId(next.id);
  };

  const revisionPage = () =>
    setPageOverrides((p) => ({ ...p, [activePageId]: "revision" }));

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
              setActivePageId(s.pages[0].id);
            }}
          >
            <div className="ta-sub__row1">
              <span className="ta-sub__series">{s.series}</span>
              <span
                className={`ta-sub__type ta-sub__type--${s.submissionType}`}
              >
                {TYPE_LABEL[s.submissionType]}
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
              Chương {sub.chapterNum}: {sub.chapterTitle}
            </span>
            <ChevronRight size={13} />
            <strong>Bản Name ({sub.version})</strong>
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
            {approved}/{sub.pages.length} trang đã duyệt
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
                  const cx = 126,
                    cy = 185,
                    r1 = 55,
                    r2 = 220;
                  return (
                    <line
                      key={i}
                      x1={cx + Math.cos(a) * r1}
                      y1={cy + Math.sin(a) * r1}
                      x2={cx + Math.cos(a) * r2}
                      y2={cy + Math.sin(a) * r2}
                      stroke="#c8c5be"
                      strokeWidth={i % 4 === 0 ? "2" : "0.9"}
                      strokeOpacity="0.55"
                    />
                  );
                })}

                {Array.from({ length: 22 }).map((_, i) => {
                  const a = (i / 22) * Math.PI * 2;
                  const cx = 388,
                    cy = 185,
                    r1 = 38,
                    r2 = 195;
                  return (
                    <line
                      key={`r${i}`}
                      x1={cx + Math.cos(a) * r1}
                      y1={cy + Math.sin(a) * r1}
                      x2={cx + Math.cos(a) * r2}
                      y2={cy + Math.sin(a) * r2}
                      stroke="#c2bfb8"
                      strokeWidth={i % 5 === 0 ? "1.5" : "0.7"}
                      strokeOpacity="0.45"
                    />
                  );
                })}

                <polygon
                  points="170,105 200,160 165,172 194,228 128,168 160,153 138,108"
                  fill="white"
                  opacity="0.75"
                />
                <polygon
                  points="174,110 198,157 168,169 190,222 134,166 163,150 142,112"
                  fill="#dedad4"
                  opacity="0.45"
                />

                <ellipse
                  cx="102"
                  cy="225"
                  rx="30"
                  ry="55"
                  fill="#3e3c39"
                  opacity="0.6"
                />
                <ellipse
                  cx="102"
                  cy="162"
                  rx="22"
                  ry="24"
                  fill="#343230"
                  opacity="0.7"
                />
                <polygon
                  points="87,146 81,126 92,149"
                  fill="#282723"
                  opacity="0.85"
                />
                <polygon
                  points="98,139 96,116 105,143"
                  fill="#282723"
                  opacity="0.85"
                />
                <polygon
                  points="112,142 116,120 122,146"
                  fill="#282723"
                  opacity="0.85"
                />

                <ellipse
                  cx="382"
                  cy="208"
                  rx="27"
                  ry="48"
                  fill="#3e3c39"
                  opacity="0.65"
                />
                <ellipse
                  cx="382"
                  cy="153"
                  rx="20"
                  ry="21"
                  fill="#343230"
                  opacity="0.75"
                />
                <polygon
                  points="369,138 364,118 374,141"
                  fill="#282723"
                  opacity="0.85"
                />
                <polygon
                  points="380,132 378,110 388,136"
                  fill="#282723"
                  opacity="0.85"
                />
                <polygon
                  points="391,136 395,114 400,139"
                  fill="#282723"
                  opacity="0.85"
                />

                {[
                  [305, 72, 420, 152],
                  [292, 100, 414, 170],
                  [318, 240, 430, 215],
                  [296, 260, 418, 238],
                ].map(([x1, y1, x2, y2], i) => (
                  <line
                    key={`al${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#aaa8a2"
                    strokeWidth="1.2"
                    opacity="0.35"
                  />
                ))}

                <rect
                  x="1"
                  y="1"
                  width="251"
                  height="368"
                  fill="none"
                  stroke="#928f8a"
                  strokeWidth="1.5"
                />
                <rect
                  x="256"
                  y="1"
                  width="263"
                  height="368"
                  fill="none"
                  stroke="#928f8a"
                  strokeWidth="1.5"
                />

                <text
                  x="260"
                  y="358"
                  fontSize="8.5"
                  fill="#9c9891"
                  fontFamily="sans-serif"
                >
                  NEON GENESIS Ch.42 • P.14-15
                </text>
              </svg>
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
              const i = sub.pages.findIndex((p) => p.id === activePageId);
              if (i > 0) setActivePageId(sub.pages[i - 1].id);
            }}
          >
            <ChevronLeft size={15} />
          </button>
          <div className="ta-strip__list">
            {sub.pages.map((p) => {
              const st = getStatus(p);
              return (
                <button
                  key={p.id}
                  className={`ta-thumb ${activePageId === p.id ? "ta-thumb--active" : ""} ta-thumb--${st}`}
                  onClick={() => setActivePageId(p.id)}
                  title={`Trang ${p.label}`}
                >
                  <div className="ta-thumb__art">
                    <ImageIcon size={14} strokeWidth={1.25} />
                  </div>
                  <span className="ta-thumb__lbl">{p.label}</span>
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
              const i = sub.pages.findIndex((p) => p.id === activePageId);
              if (i < sub.pages.length - 1)
                setActivePageId(sub.pages[i + 1].id);
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

        <div className="ta-actions">
          <button className="ta-btn ta-btn--approve" onClick={approvePage}>
            <CheckCircle2 size={17} strokeWidth={1.75} /> Phê duyệt
          </button>
          <button className="ta-btn ta-btn--revision" onClick={revisionPage}>
            <RotateCcw size={15} strokeWidth={1.75} /> Yêu cầu sửa
          </button>
        </div>

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
                <BookOpen size={12} /> Ch.{sub.chapterNum} — {sub.chapterTitle}
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

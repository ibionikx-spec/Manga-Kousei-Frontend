import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileImage,
  Pencil,
  Tag,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  fetchSeriesDetail,
  type MangakaSeries,
} from "../../services/mangakaSeriesService";
import {
  fetchActiveAssistants,
  type AssistantAssignmentRes,
} from "../../services/assistantAssignmentService";
import {
  fetchChaptersBySeriesMangaka,
  type ChapterRes,
} from "../../services/chapterService";
import { getAvatarColor, getInitials } from "../../utils";
import EditSeriesModal from "./components/EditSeriesModal/EditSeriesModal";
import "./MangakaSeriesDetail.scss";

const WEEKDAY_LABELS: Record<number, string> = {
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
  7: "CN",
};

function scheduleLabel(type: string | null, day: number | null): string {
  if (!type || day === null) return "Chưa có lịch";
  if (type === "weekly")
    return `${WEEKDAY_LABELS[day] ?? `Thứ ${day}`} hàng tuần`;
  return `Ngày ${day} hàng tháng`;
}

function statusMeta(status: string | null) {
  switch (status) {
    case "approved":
      return {
        label: "Đang hoạt động",
        icon: <CheckCircle2 size={16} />,
        cls: "status-active",
      };
    case "hiatus":
      return {
        label: "Tạm dừng",
        icon: <AlertCircle size={16} />,
        cls: "status-hiatus",
      };
    case "completed":
      return {
        label: "Hoàn thành",
        icon: <CheckCircle2 size={16} />,
        cls: "status-done",
      };
    default:
      return {
        label: status ?? "—",
        icon: <Clock size={16} />,
        cls: "status-default",
      };
  }
}

function chapterStatusMeta(status: string) {
  switch (status) {
    case "draft":
      return { label: "Bản nháp", cls: "pill-gray" };
    case "in_progress":
      return { label: "Đang làm", cls: "pill-blue" };
    case "pages_submitted":
      return { label: "Đã nộp trang", cls: "pill-green" };
    case "pending_publish":
      return { label: "Chờ đăng", cls: "pill-navy" };
    case "published":
      return { label: "Đã đăng", cls: "pill-green" };
    default:
      return { label: status, cls: "pill-gray" };
  }
}

const COVER_PLACEHOLDER =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop";

export default function MangakaSeriesDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [series, setSeries] = useState<MangakaSeries | null>(null);
  const [assistants, setAssistants] = useState<AssistantAssignmentRes[]>([]);
  const [chapters, setChapters] = useState<ChapterRes[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"chapters" | "info">("chapters");
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (!id) return;
    const seriesId = Number(id);

    Promise.all([
      fetchSeriesDetail(seriesId),
      fetchActiveAssistants(),
      fetchChaptersBySeriesMangaka(seriesId),
    ])
      .then(([s, a, c]) => {
        setSeries(s);
        setAssistants(a);
        setChapters(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="series-detail-page">
        <div className="ssd-loading">
          <Loader2 size={28} className="ssd-loading__icon" />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="series-detail-page">
        <div className="ssd-loading">
          <AlertCircle size={28} />
          <span>Không tìm thấy series</span>
        </div>
      </div>
    );
  }

  const st = statusMeta(series.seriesStatus);
  const recentChapters = [...chapters]
    .sort((a, b) => b.chapterNumber - a.chapterNumber)
    .slice(0, 5);

  return (
    <div className="series-detail-page">
      <div className="detail-series-header">
        <div className="breadcrumb">
          <Link to="/mangaka/series">Tác phẩm</Link>
          <ChevronRight size={14} />
          <span>{series.title}</span>
        </div>

        <div className="header-row">
          <h1>{series.title}</h1>
          <div className="header-actions">
            <button
              className="btn-outline"
              onClick={() => navigate(`/mangaka/series/${id}/chapters`)}
            >
              <BookOpen size={16} /> Quản lý Chapters
            </button>
            <button className="btn-outline" onClick={() => setShowEdit(true)}>
              <Pencil size={16} /> Chỉnh sửa Series
            </button>
            <button className="btn-primary">
              <Download size={16} /> Tải xuống toàn bộ file
            </button>
          </div>
        </div>
      </div>

      <div className="detail-layout">
        <div className="left-col">
          <div className="cover-card">
            <img
              src={series.coverImageUrl ?? COVER_PLACEHOLDER}
              alt={series.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = COVER_PLACEHOLDER;
              }}
            />
          </div>

          <div className="status-card">
            <span className="card-label">TRẠNG THÁI HIỆN TẠI</span>
            <div className={`status-body ${st.cls}`}>
              <div className="status-icon">{st.icon}</div>
              <div>
                <strong>{st.label}</strong>
                <p>Duyệt {series.approvedAt ?? "—"}</p>
              </div>
            </div>
          </div>

          <div className="status-card">
            <span className="card-label">LỊCH XUẤT BẢN</span>
            <div className="status-body">
              <div className="status-icon">
                <Calendar size={16} />
              </div>
              <div>
                <strong>
                  {scheduleLabel(series.scheduleType, series.dayValue)}
                </strong>
                <p>{series.chapterCount} chương đã tạo</p>
              </div>
            </div>
          </div>

          {series.genres.length > 0 && (
            <div className="status-card">
              <span className="card-label">THỂ LOẠI</span>
              <div className="ssd-genres">
                {series.genres.map((g) => (
                  <span key={g} className="ssd-genre-chip">
                    <Tag size={11} /> {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {series.tantouName && (
            <div className="status-card">
              <span className="card-label">TANTOU PHỤ TRÁCH</span>
              <div className="ssd-tantou">
                {series.tantouAvatarUrl ? (
                  <img
                    className="ssd-tantou__avatar"
                    src={series.tantouAvatarUrl}
                    alt={series.tantouName}
                  />
                ) : (
                  <div
                    className="ssd-tantou__avatar ssd-tantou__avatar--initials"
                    style={{ background: getAvatarColor(series.tantouName) }}
                  >
                    {getInitials(series.tantouName)}
                  </div>
                )}
                <span className="ssd-tantou__name">{series.tantouName}</span>
              </div>
            </div>
          )}
        </div>

        <div className="main-col">
          <div className="detail-tabs">
            <button
              className={`tab ${activeTab === "chapters" ? "active" : ""}`}
              onClick={() => setActiveTab("chapters")}
            >
              Chapters gần đây
            </button>
            <button
              className={`tab ${activeTab === "info" ? "active" : ""}`}
              onClick={() => setActiveTab("info")}
            >
              Thông tin series
            </button>
          </div>

          {activeTab === "chapters" ? (
            <div className="panel-card">
              <div className="panel-header">
                <div>
                  <h3>Chapters gần đây</h3>
                  <p className="panel-sub">5 chương mới nhất</p>
                </div>
                <button
                  className="btn-primary-sm"
                  onClick={() => navigate(`/mangaka/series/${id}/chapters`)}
                >
                  Xem tất cả
                </button>
              </div>

              {recentChapters.length === 0 ? (
                <div className="ssd-empty">
                  <BookOpen size={28} strokeWidth={1.25} />
                  <span>Chưa có chapter nào</span>
                </div>
              ) : (
                <div className="chapter-table">
                  <div className="chapter-table__head">
                    <span>Chương</span>
                    <span>Tiến độ trang</span>
                    <span>Trạng thái</span>
                    <span></span>
                  </div>
                  {recentChapters.map((c) => {
                    const cs = chapterStatusMeta(c.chapterStatus);
                    const pct =
                      c.totalDeadlines > 0
                        ? Math.round(
                            (c.submittedDeadlines / c.totalDeadlines) * 100,
                          )
                        : 0;
                    return (
                      <div key={c.chapterId} className="chapter-table__row">
                        <div className="col-chapter">
                          <strong>Chương {c.chapterNumber}</strong>
                          {c.title && <span>{c.title}</span>}
                        </div>
                        <div className="col-progress">
                          {c.totalDeadlines > 0 ? (
                            <>
                              <div className="progress-bar">
                                <div
                                  className={`progress-bar__fill ${pct === 100 ? "is-full" : ""}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="progress-text">
                                {c.submittedDeadlines}/{c.totalDeadlines} nhóm
                              </span>
                            </>
                          ) : (
                            <span className="progress-text">
                              Chưa có deadline
                            </span>
                          )}
                        </div>
                        <div className="col-status">
                          <span className={`status-pill ${cs.cls}`}>
                            {cs.label}
                          </span>
                        </div>
                        <div className="col-actions">
                          <button className="icon-btn" title="Xem chapter">
                            <Eye size={16} />
                          </button>
                          <button className="icon-btn" title="Tải file">
                            <FileImage size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="panel-card">
              <div className="panel-header">
                <h3>Thông tin series</h3>
              </div>
              <div className="ssd-info">
                <div className="ssd-info__row">
                  <span>Tên series</span>
                  <strong>{series.title}</strong>
                </div>
                <div className="ssd-info__row">
                  <span>Mô tả</span>
                  <strong>{series.description || "—"}</strong>
                </div>
                <div className="ssd-info__row">
                  <span>Ngày duyệt</span>
                  <strong>{series.approvedAt || "—"}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="right-col">
          <div className="panel-card studio-panel">
            <div className="panel-header">
              <h3>Trạm Studio</h3>
              <span className="online-pill">{assistants.length} TRỢ LÝ</span>
            </div>
            {assistants.length === 0 ? (
              <div className="ssd-empty ssd-empty--sm">
                <Users size={22} strokeWidth={1.25} />
                <span>Chưa có trợ lý nào</span>
              </div>
            ) : (
              <div className="studio-list">
                {assistants.map((a) => (
                  <div key={a.assignmentId} className="studio-item">
                    {a.assistantAvatarUrl ? (
                      <img
                        src={a.assistantAvatarUrl}
                        alt={a.assistantName}
                        className="studio-avatar"
                      />
                    ) : (
                      <div
                        className="studio-avatar studio-avatar--initials"
                        style={{ background: getAvatarColor(a.assistantName) }}
                      >
                        {getInitials(a.assistantName)}
                      </div>
                    )}
                    <div className="studio-info">
                      <strong>{a.assistantName}</strong>
                      <span>{a.assistantEmail}</span>
                    </div>
                    <button
                      className="btn-link"
                      onClick={() => navigate("/mangaka/assistants")}
                    >
                      Quản lý
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel-card">
            <div className="panel-header">
              <h3>Tổng quan</h3>
            </div>
            <div className="ssd-stats">
              <div className="ssd-stat">
                <span>Tổng chương</span>
                <strong>{series.chapterCount}</strong>
              </div>
              <div className="ssd-stat">
                <span>Trợ lý đang cộng tác</span>
                <strong>{assistants.length}</strong>
              </div>
              <div className="ssd-stat">
                <span>Lịch xuất bản</span>
                <strong>
                  {scheduleLabel(series.scheduleType, series.dayValue)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showEdit && series && (
        <EditSeriesModal
          series={series}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => {
            setSeries(updated);
            setShowEdit(false);
          }}
        />
      )}
    </div>
  );
}

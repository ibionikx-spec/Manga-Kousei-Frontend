import { useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  Pencil,
  AlertCircle,
  Download,
  Plus,
  SlidersHorizontal,
  Eye,
  FileImage,
  UserPlus,
  CheckSquare,
  Send,
  UploadCloud,
  Archive,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MangakaSeriesDetail.scss";

const seriesData: Record<
  string,
  { title: string; currentChapter: number; stage: string; deadline: string }
> = {
  "1": {
    title: "Kiếm Sĩ Cuối Cùng (The Last Swordsman)",
    currentChapter: 42,
    stage: "Bản Name (Storyboard)",
    deadline: "2 ngày nữa",
  },
};

const chapters = [
  {
    id: 42,
    name: "Vết Sẹo Của Rồng",
    updatedAt: "Cập nhật 3 giờ trước",
    progress: 35,
    statusText: "Đang phác thảo",
    badge: "BẢN NAME",
    badgeType: "blue",
  },
  {
    id: 41,
    name: "Tiếng Vọng Đại Ngàn",
    updatedAt: "Cập nhật 2 ngày trước",
    progress: 100,
    statusText: "Hoàn thành",
    badge: "ĐÃ DUYỆT (GENGA)",
    badgeType: "green",
  },
  {
    id: 40,
    name: "Bình Minh Rực Lửa",
    updatedAt: "Đã đăng",
    progress: 100,
    statusText: "Đã đăng",
    badge: "PUBLIC",
    badgeType: "gray",
  },
];

const taskColumns = [
  {
    id: "sketch",
    label: "Phác thảo",
    progress: "3/8 Trang",
    cards: [
      {
        title: "Layout trang 1-4",
        assignee: "Mangaka",
        state: "done" as const,
      },
      {
        title: "Vẽ nét chính trang 5-8",
        assignee: "Minh Nguyễn",
        state: "doing" as const,
      },
    ],
  },
  {
    id: "ink",
    label: "Đi nét (Ink)",
    progress: "1/8 Trang",
    cards: [
      {
        title: "Line-art toàn bộ",
        assignee: "Trợ lý",
        state: "review" as const,
      },
    ],
  },
  {
    id: "tone",
    label: "Trải Tone",
    progress: "0/8 Trang",
    cards: [],
  },
];

const processSteps = [
  {
    title: "Nộp ý tưởng (Tantou)",
    desc: "Gửi concept chương mới",
    icon: <Send size={18} />,
  },
  {
    title: "Cập nhật bản Name",
    desc: "Upload storyboard hoàn thiện",
    icon: <UploadCloud size={18} />,
  },
  {
    title: "Duyệt & Gom file Genga",
    desc: "Tổng hợp bản thảo cuối",
    icon: <Archive size={18} />,
  },
];

const studioAssistants = [
  {
    name: "Nguyễn Văn An",
    role: "Chuyên gia đổ bóng & FX",
    avatar: "https://ui-avatars.com/api/?name=An&background=1e293b&color=fff",
  },
  {
    name: "Trần Thị Bình",
    role: "Background Artist",
    avatar: "https://ui-avatars.com/api/?name=Binh&background=1e293b&color=fff",
  },
];

const archiveItems = [
  {
    title: "Chương 42: Trang 1-4",
    badge: "BẢN NAME - MỚI NHẤT",
    badgeType: "blue",
    image:
      "https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Chương 41: Final",
    badge: "GENGA",
    badgeType: "dark",
    image:
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Chương 43: Sơ khảo",
    badge: "CONCEPT",
    badgeType: "gray",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop",
  },
];

export default function MangakaSeriesDetail() {
  const { id } = useParams();
  const series = seriesData[id ?? "1"] ?? seriesData["1"];

  const navigate = useNavigate();

  return (
    <div className="series-detail-page">
      <div className="detail-series-header">
        <div className="breadcrumb">
          <Link to="/mangaka/series">Tác phẩm</Link>
          <ChevronRight size={14} />
          <span>{series.title.split(" (")[0]}</span>
        </div>

        <div className="header-row">
          <h1>{series.title}</h1>
          <div className="header-actions">
            <button
              className="btn-outline"
              onClick={() => navigate(`/mangaka/series/${id}/chapters`)}
            >
              <BookOpen size={16} />
              Quản lý Chapters
            </button>

            <button className="btn-outline">
              <Pencil size={16} />
              Chỉnh sửa Series
            </button>
            <button className="btn-primary">
              <Download size={16} />
              Tải xuống toàn bộ file
            </button>
          </div>
        </div>
      </div>

      <div className="detail-layout">
        <div className="left-col">
          <div className="status-card">
            <span className="card-label">TRẠNG THÁI HIỆN TẠI</span>
            <div className="status-body">
              <div className="status-icon">
                <Pencil size={20} />
              </div>
              <div>
                <strong>Chương {series.currentChapter}</strong>
                <p>Giai đoạn: {series.stage}</p>
              </div>
            </div>
          </div>

          <div className="deadline-card">
            <span className="card-label">DEADLINE BIÊN TẬP</span>
            <div className="deadline-body">
              <AlertCircle size={18} />
              <strong>{series.deadline}</strong>
            </div>
            <p>Nộp bản thảo cuối cho Tantou lúc 18:00 Thứ Sáu.</p>
          </div>
        </div>

        <div className="main-col">
          <div className="detail-tabs">
            <button className="tab active">Quản lý Chương</button>
            <button className="tab">Lịch trình xuất bản</button>
          </div>

          <div className="panel-card chapters-panel">
            <div className="panel-header">
              <h3>Danh sách chương gần đây</h3>
              <div className="panel-actions">
                <button className="icon-btn">
                  <SlidersHorizontal size={16} />
                </button>
                <button className="btn-primary-sm">
                  <Plus size={16} />
                  Chương mới
                </button>
              </div>
            </div>

            <div className="chapters-table">
              <div className="table-row table-head">
                <span className="col-id">STT</span>
                <span className="col-name">Tên Chương</span>
                <span className="col-progress">Tiến độ</span>
                <span className="col-status">Tình trạng</span>
                <span className="col-actions">Thao tác</span>
              </div>

              {chapters.map((c) => (
                <div className="table-row" key={c.id}>
                  <span className="col-id">#{c.id}</span>
                  <div className="col-name">
                    <strong>{c.name}</strong>
                    <span className="sub">{c.updatedAt}</span>
                  </div>
                  <div className="col-progress">
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${
                          c.progress === 100 ? "is-full" : ""
                        }`}
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                    <span className="progress-text">
                      {c.progress}% - {c.statusText}
                    </span>
                  </div>
                  <div className="col-status">
                    <span className={`status-pill pill-${c.badgeType}`}>
                      {c.badge}
                    </span>
                  </div>
                  <div className="col-actions">
                    <button className="icon-btn" title="Xem">
                      <Eye size={16} />
                    </button>
                    <button className="icon-btn" title="Tải file">
                      <FileImage size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-card task-panel">
            <div className="panel-header">
              <div>
                <h3>Quản lý Task - Chương #{series.currentChapter}</h3>
                <p className="panel-sub">
                  Phân bổ khối lượng công việc sản xuất
                </p>
              </div>
              <button className="btn-primary-sm">
                <UserPlus size={16} />
                Mời Trợ lý
              </button>
            </div>

            <div className="task-columns">
              {taskColumns.map((col) => (
                <div className="task-col" key={col.id}>
                  <div className="task-col-header">
                    <span>{col.label}</span>
                    <span className="task-col-count">{col.progress}</span>
                  </div>

                  <div className="task-col-body">
                    {col.cards.map((card, idx) => (
                      <div className="task-card" key={idx}>
                        <p className="task-title">{card.title}</p>
                        <div className="task-footer">
                          <span className="task-assignee">{card.assignee}</span>
                          {card.state === "done" && (
                            <CheckSquare size={16} className="state-done" />
                          )}
                          {card.state === "doing" && (
                            <span className="state-tag tag-doing">
                              Đang làm
                            </span>
                          )}
                        </div>
                        {card.state === "review" && (
                          <button className="btn-review">
                            Xem &amp; Duyệt
                          </button>
                        )}
                      </div>
                    ))}

                    {col.cards.length === 0 && (
                      <button className="task-card task-card-empty">
                        <CheckSquare size={20} />
                        <span>Giao việc cho trợ lý</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="right-col">
          <div className="panel-card process-panel">
            <h3>Quy trình nộp bản</h3>
            <div className="process-steps">
              {processSteps.map((step, idx) => (
                <button className="process-step" key={idx}>
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-text">
                    <strong>{step.title}</strong>
                    <span>{step.desc}</span>
                  </div>
                  <ArrowRight size={16} className="step-arrow" />
                </button>
              ))}
            </div>
          </div>

          <div className="panel-card studio-panel">
            <div className="panel-header">
              <h3>Trạm Studio</h3>
              <span className="online-pill">
                {studioAssistants.length} TRỢ LÝ ONLINE
              </span>
            </div>
            <div className="studio-list">
              {studioAssistants.map((a, idx) => (
                <div className="studio-item" key={idx}>
                  <img src={a.avatar} alt={a.name} className="studio-avatar" />
                  <div className="studio-info">
                    <strong>{a.name}</strong>
                    <span>{a.role}</span>
                  </div>
                  <button className="btn-link">Giao việc</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="archive-section">
        <div className="archive-header">
          <div>
            <h2>Lưu trữ bản thảo gần đây</h2>
            <p>Xem lại các bản vẽ đã thực hiện trong series này</p>
          </div>
          <a href="#" className="archive-link">
            Tất cả bản thảo <ArrowRight size={14} />
          </a>
        </div>

        <div className="archive-grid">
          {archiveItems.map((item, idx) => (
            <div className="archive-card" key={idx}>
              <div className="archive-cover">
                <img src={item.image} alt={item.title} />
                <span className={`archive-badge badge-${item.badgeType}`}>
                  {item.badge}
                </span>
              </div>
              <p className="archive-title">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

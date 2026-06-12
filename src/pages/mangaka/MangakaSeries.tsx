import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Plus,
  Download,
  Search,
  SlidersHorizontal,
  Users,
  BookOpen,
  Clock,
} from "lucide-react";
import "./MangakaSeries.scss";

interface SeriesItem {
  id: number;
  title: string;
  image: string;
  status: "doing" | "done" | "pending";
  statusLabel: string;
  chapterInfo: string;
  tantou: string;
  chapters: number;
  assistants?: number;
  progress: number;
  updatedAt: string;
  deadline?: string;
}

const seriesList: SeriesItem[] = [
  {
    id: 1,
    title: "Kiếm Sĩ Cuối Cùng",
    image:
      "https://i.pinimg.com/736x/dd/e0/10/dde010b1a281ea43ec66f4ef5e0601a9.jpg",
    status: "doing",
    statusLabel: "ĐANG LÀM",
    chapterInfo: "Chương 42 (Bản Name)",
    tantou: "Nguyễn Văn A",
    chapters: 42,
    assistants: 3,
    progress: 35,
    updatedAt: "2 giờ trước",
    deadline: "2 ngày nữa",
  },
  {
    id: 2,
    title: "Thành Phố Bóng Đêm",
    image:
      "https://i.pinimg.com/736x/5e/32/b7/5e32b793c92d003904587bfb4376e63e.jpg",
    status: "done",
    statusLabel: "HOÀN THÀNH",
    chapterInfo: "Hoàn tất Chương 100",
    tantou: "Trần Thị Bình",
    chapters: 100,
    progress: 100,
    updatedAt: "1 tuần trước",
  },
  {
    id: 3,
    title: "Neon Ramen",
    image:
      "https://i.pinimg.com/736x/39/d0/3c/39d03c86466318c17f1c6f74c1580580.jpg",
    status: "doing",
    statusLabel: "ĐANG LÀM",
    chapterInfo: "Chương 10 (Drafting)",
    tantou: "BTV Ken",
    chapters: 10,
    assistants: 2,
    progress: 30,
    updatedAt: "1 giờ trước",
    deadline: "5 ngày nữa",
  },
  {
    id: 4,
    title: "Ngôi Làng Cổ Tích",
    image:
      "https://i.pinimg.com/1200x/46/41/8b/46418b26f40c88f8a1fd01fda61b0873.jpg",
    status: "doing",
    statusLabel: "ĐANG LÀM",
    chapterInfo: "Chương 8 (Bản Name)",
    tantou: "Nguyễn Văn A",
    chapters: 8,
    assistants: 1,
    progress: 60,
    updatedAt: "5 giờ trước",
    deadline: "1 tuần nữa",
  },
  {
    id: 5,
    title: "Học Viện Pháp Sư",
    image:
      "https://i.pinimg.com/736x/52/2c/33/522c337ed924a278e1175f81dfd194f6.jpg",
    status: "done",
    statusLabel: "HOÀN THÀNH",
    chapterInfo: "Hoàn tất Chương 56",
    tantou: "Trần Thị Bình",
    chapters: 56,
    progress: 100,
    updatedAt: "3 tuần trước",
  },
  {
    id: 6,
    title: "Dự án S24 (TBD)",
    image:
      "https://i.pinimg.com/736x/0e/45/4a/0e454afd4b7ba8e1d2ab564fd9ebaa68.jpg",
    status: "pending",
    statusLabel: "CHỜ DUYỆT CẤP CAO",
    chapterInfo: "Chương 1 (Concept)",
    tantou: "Lê Văn B",
    chapters: 1,
    progress: 10,
    updatedAt: "5 ngày trước",
  },
];

const statusFilters = [
  { id: "all", label: "Tất cả" },
  { id: "doing", label: "Đang làm" },
  { id: "done", label: "Hoàn thành" },
  { id: "pending", label: "Chờ duyệt" },
];

export default function MangakaSeries() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = seriesList.filter((s) => {
    const matchStatus = activeFilter === "all" || s.status === activeFilter;
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="mangaka-series-page">
      <div className="series-hero">
        <div className="hero-text">
          <div className="breadcrumb">
            Tác phẩm <ChevronRight size={14} />
          </div>
          <h1>Kho Tác Phẩm Production Studio</h1>
          <p>Quản lý tất cả series, tiến độ và đội ngũ sản xuất tại đây.</p>
        </div>

        <div className="hero-actions">
          <button className="btn-outline">
            <Download size={18} />
            Tải báo cáo tổng
          </button>
          <button className="btn-primary">
            <Plus size={18} />
            Tạo Series Mới
          </button>
        </div>
      </div>

      <div className="series-toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm series, Tantou..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              className={`filter-tab ${activeFilter === f.id ? "active" : ""}`}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button className="btn-icon">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      <div className="series-grid">
        {filtered.map((work) => (
          <div
            className="series-card"
            key={work.id}
            onClick={() => navigate(`/mangaka/series/${work.id}`)}
          >
            <div className="card-cover">
              <img src={work.image} alt={work.title} />
              <span className={`status-badge status-${work.status}`}>
                {work.statusLabel}
              </span>
              {work.deadline && (
                <span className="deadline-badge">
                  <Clock size={12} />
                  {work.deadline}
                </span>
              )}
            </div>

            <div className="card-body">
              <h3 className="series-title">{work.title}</h3>
              <p className="chapter-info">{work.chapterInfo}</p>

              <div className="progress-row">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${work.progress}%` }}
                  />
                </div>
                <span className="progress-value">{work.progress}%</span>
              </div>

              <div className="card-meta">
                <span>
                  <BookOpen size={14} />
                  {work.chapters} Chương
                </span>
                {work.assistants && (
                  <span>
                    <Users size={14} />
                    {work.assistants} Trợ lý
                  </span>
                )}
                <span className="meta-time">Cập nhật {work.updatedAt}</span>
              </div>

              <div className="card-footer">
                <span className="tantou-label">Tantou</span>
                <span className="tantou-name">{work.tantou}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          Không tìm thấy series phù hợp với bộ lọc hiện tại.
        </div>
      )}

      <div className="pagination">
        <button className="page-btn">‹</button>
        <button className="page-btn active">1</button>
        <button className="page-btn">2</button>
        <button className="page-btn">3</button>
        <button className="page-btn">›</button>
      </div>
    </div>
  );
}

import {
  Timer,
  FileEdit,
  Users,
  ArrowRight,
  MoreHorizontal,
  TrendingUp,
  Minus,
  MessageSquare,
  Banknote,
  Filter,
} from "lucide-react";
import "./MangakaDashboard.scss";

export default function MangakaDashboard() {
  const activities = [
    {
      id: 1,
      user: "Trợ lý Minh Long",
      action: "đã nộp",
      target: "Background",
      time: "10 phút trước",
      avatar:
        "https://ui-avatars.com/api/?name=Long&background=1e293b&color=fff",
      icon: null,
    },
    {
      id: 2,
      user: "BTV Ken",
      action: "đã comment bản Name",
      target: "Neon Ramen - Ch. 10",
      quote: '"Cần xem lại nhịp độ đoạn rượt đuổi..."',
      time: "1 giờ trước",
      icon: <MessageSquare size={16} />,
    },
    {
      id: 3,
      system: true,
      action: "Hệ thống đã xử lý thanh toán thù lao tháng trước cho Studio.",
      time: "Hôm qua",
      icon: <Banknote size={16} />,
    },
  ];

  return (
    <div className="mangaka-dashboard">
      <div className="main-content">
        <div className="alert-cards-grid">
          <div className="alert-card danger-card">
            <div className="card-header">
              <div className="icon-wrapper">
                <Timer size={20} />
              </div>
              <span className="badge-urgent">KHẨN CẤP</span>
            </div>
            <p className="alert-text">
              <strong>Deadline đỏ</strong>
              <br />
              Genga "Kiếm Sĩ" cần nộp trong 24h.
            </p>
            <button className="btn-outline-danger">Xử lý ngay</button>
          </div>

          <div className="alert-card warning-card">
            <div className="card-header">
              <div className="icon-wrapper">
                <FileEdit size={20} />
              </div>
              <span className="time-text">Hôm nay</span>
            </div>
            <p className="alert-text">
              <strong>Bản Name bị từ chối</strong>
              <br />
              BTV Ken yêu cầu sửa lại nhịp độ trang 12-15 "Neon Ramen".
            </p>
            <a href="#" className="link-action">
              Xem comment <ArrowRight size={16} />
            </a>
          </div>

          <div className="alert-card info-card">
            <div className="card-header">
              <div className="icon-wrapper">
                <Users size={20} />
              </div>
              <div className="mini-avatars">
                <img
                  src="https://ui-avatars.com/api/?name=L&background=random"
                  alt="L"
                />
                <img
                  src="https://ui-avatars.com/api/?name=Y&background=random"
                  alt="Y"
                />
              </div>
            </div>
            <p className="alert-text">
              <strong>Bottlenecks</strong>
              <br />3 Background từ Trợ lý đang chờ duyệt.
            </p>
            <button className="btn-primary">Duyệt file ngay</button>
          </div>
        </div>

        <div className="bottom-grid">
          <div className="progress-card panel-card">
            <div className="panel-header">
              <h3>TIẾN ĐỘ CÁC SERIES</h3>
              <MoreHorizontal className="icon-more" size={20} />
            </div>

            <div className="progress-list">
              <div className="progress-item">
                <div className="item-info">
                  <span className="series-name">
                    Kiếm Sĩ Cuối Cùng - Chương 43
                  </span>
                  <span className="status-text">Chờ duyệt (Name)</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="fill light-blue"
                    style={{ width: "20%" }}
                  ></div>
                </div>
              </div>

              <div className="progress-item">
                <div className="item-info">
                  <span className="series-name">
                    Kiếm Sĩ Cuối Cùng - Chương 42
                  </span>
                  <span className="status-text highlight">80% (Tone/SFX)</span>
                </div>
                <div className="progress-bar">
                  <div className="fill blue" style={{ width: "80%" }}></div>
                </div>
              </div>

              <div className="progress-item">
                <div className="item-info">
                  <span className="series-name">Neon Ramen - Chương 10</span>
                  <span className="status-text">30% (Drafting)</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="fill light-blue"
                    style={{ width: "30%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="right-subgrid">
            <div className="assistant-card panel-card">
              <div className="panel-header line-gray">
                <h3>TRỢ LÝ ĐANG ONLINE</h3>
              </div>
              <div className="assistant-list">
                <div className="assistant-item">
                  <div className="avatar-container online">
                    <img
                      src="https://ui-avatars.com/api/?name=ML&background=random"
                      alt="ML"
                    />
                  </div>
                  <span>M. Long</span>
                </div>
                <div className="assistant-item">
                  <div className="avatar-container online">
                    <img
                      src="https://ui-avatars.com/api/?name=HY&background=random"
                      alt="HY"
                    />
                  </div>
                  <span>H. Yến</span>
                </div>
                <div className="assistant-item">
                  <div className="avatar-container offline">
                    <img
                      src="https://ui-avatars.com/api/?name=T&background=e2e8f0&color=94a3b8"
                      alt="T"
                    />
                  </div>
                  <span className="offline-text">Tuấn</span>
                </div>
              </div>
            </div>

            <div className="ranking-card panel-card">
              <div className="panel-header bg-blue">
                <h3>BẢNG XẾP HẠNG NỀN TẢNG</h3>
              </div>
              <div className="ranking-list">
                <div className="ranking-item top-1">
                  <span className="rank-num">1</span>
                  <span className="rank-name">Kiếm Sĩ Cuối Cùng</span>
                  <TrendingUp
                    className="trend-up"
                    size={16}
                    strokeWidth={2.5}
                  />
                </div>
                <div className="ranking-item">
                  <span className="rank-num">12</span>
                  <span className="rank-name">Neon Ramen</span>
                  <Minus className="trend-flat" size={16} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="activity-feed">
        <div className="feed-header">
          <div className="title-group">
            <div className="dot-green"></div>
            <h3>Luồng Hoạt Động</h3>
          </div>
          <Filter className="icon-filter" size={18} />
        </div>

        <div className="timeline">
          {activities.map((act) => (
            <div className="timeline-item" key={act.id}>
              <div className="timeline-icon">
                {act.avatar ? (
                  <img src={act.avatar} alt="Avatar" className="user-avatar" />
                ) : (
                  <div className="sys-icon">{act.icon}</div>
                )}
              </div>
              <div className="timeline-content">
                <p className="action-text">
                  {act.system ? (
                    <span>{act.action}</span>
                  ) : (
                    <>
                      <strong>{act.user}</strong> {act.action}{" "}
                      <span className="target-link">{act.target}</span>
                    </>
                  )}
                </p>
                {act.quote && <div className="quote-box">{act.quote}</div>}
                <span className="time">{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

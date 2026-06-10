import { Bell, TrendingUp } from "lucide-react";
import "./AdminSurvival.scss";
import type { CSSProperties } from "react";

type MangaRank = {
  title: string;
  author: string;
  rank: string;
  rankTone: "up" | "steady" | "danger";
  inventory: number;
  inventoryNote: string;
  views: string;
  status: "boom" | "potential" | "danger";
  primaryAction: string;
  secondaryAction?: string;
  coverTone: "blue" | "gold" | "dark";
};

const chartBars = [
  { label: "Tuần 1", value: 62 },
  { label: "Tuần 2", value: 78 },
  { label: "Tuần 3", value: 47 },
  { label: "Tuần 4", value: 92 },
  { label: "Dự báo T11", value: 81 },
];

const mangaRows: MangaRank[] = [
  {
    title: "Blue Lock: Neo Saga",
    author: "Yusuke Nomura",
    rank: "#1",
    rankTone: "up",
    inventory: 12,
    inventoryNote: "Sắp hết",
    views: "840.2K",
    status: "boom",
    primaryAction: "Lên trang bìa",
    secondaryAction: "Tankoubon",
    coverTone: "blue",
  },
  {
    title: "Chân Trời Cũ",
    author: "K. Matsui",
    rank: "#14",
    rankTone: "steady",
    inventory: 45,
    inventoryNote: "Ổn định",
    views: "112.5K",
    status: "potential",
    primaryAction: "Theo dõi thêm",
    secondaryAction: "Tankoubon",
    coverTone: "gold",
  },
  {
    title: "Diệt Vong Ký",
    author: "T. Sato",
    rank: "#42",
    rankTone: "danger",
    inventory: 88,
    inventoryNote: "Tồn kho cao",
    views: "12.1K",
    status: "danger",
    primaryAction: "Khai tử (Axe)",
    coverTone: "dark",
  },
];

const statusLabels = {
  boom: "ĐANG BÙNG NỔ",
  potential: "TIỀM NĂNG",
  danger: "NGUY CẤP",
};

export default function AdminSurvival() {
  return (
    <main className="admin-survival__content">
      <header className="top-header">
        <div className="top-header__copy">
          <h1>THÁNG 10/2023: XẾP HẠNG & ĐÀO THẢI</h1>
          <p>
            <span aria-hidden="true">▣</span>
            Kỳ tổng duyệt Quý 4 - Phân tích hiệu suất sinh tồn manga
          </p>
        </div>

        <div className="top-header__actions">
          <div className="countdown-card">
            <span>HẠN CHÓT AXE KỲ</span>
            <strong>48:12:03</strong>
          </div>
          <button
            className="notification-button"
            aria-label="Thông báo"
            type="button"
          >
            <Bell size={20} className="notification-icon" />
          </button>
          <div className="user-avatar" aria-label="Biên tập viên Ryo">
            <span>亮</span>
          </div>
        </div>
      </header>

      <section className="dashboard-grid" aria-label="Tổng quan sinh tồn manga">
        <article className="analytics-card chart-card">
          <div className="chart-card__head">
            <div>
              <h2>Dự báo lưu hành Quý tới</h2>
              <p>
                Dữ liệu phân tích dựa trên lượt xem Digital & Tiền đặt trước
              </p>
            </div>
            <div className="chart-card__toggles">
              <span className="is-active">TANKOUBON</span>
              <span>DIGITAL</span>
            </div>
          </div>

          <div className="chart-card__plot">
            {chartBars.map((bar, index) => (
              <div className="chart-card__bar-group" key={bar.label}>
                <span
                  className={`chart-card__bar ${
                    index === chartBars.length - 1 ? "is-forecast" : ""
                  }`}
                  style={{ "--bar-height": `${bar.value}%` } as CSSProperties}
                >
                  {index === chartBars.length - 1 && <em>Dự kiến bùng nổ</em>}
                </span>
                <strong>{bar.label}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="analytics-card stats-card">
          <div className="card-kicker">
            <TrendingUp size={22} className="icon-trend" />
          </div>
          <strong>2.4M</strong>
          <span>TỔNG LƯỢT XEM TRỰC TUYẾN</span>
          <em>+12.5%</em>
        </article>

        <article className="analytics-card danger-card">
          <div className="danger-card__icon">△</div>
          <div>
            <h2>Cấp độ Đỏ</h2>
            <p>ĐANG TRONG VÙNG NGUY CẤP</p>
          </div>
          <span>3 DỰ ÁN</span>
        </article>
      </section>

      <section className="table-panel">
        <div className="table-panel__header">
          <h2>BẢNG TỔNG HỢP XẾP HẠNG MANGA (THÁNG 10)</h2>
          <div className="table-panel__tools">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input placeholder="Tìm kiếm tựa truyện..." type="search" />
            </label>
            <button className="filter-button" type="button">
              <span aria-hidden="true">≡</span>
              Lọc
            </button>
          </div>
        </div>

        <div
          className="ranking-table"
          role="table"
          aria-label="Bảng xếp hạng manga"
        >
          <div className="ranking-table__head" role="row">
            <span>TÊN TRUYỆN</span>
            <span>XẾP HẠNG KHẢO SÁT</span>
            <span>TỶ LỆ TỒN KHO</span>
            <span>LƯỢT XEM DIGITAL</span>
            <span>TRẠNG THÁI</span>
            <span>HÀNH ĐỘNG VĨ MÔ</span>
          </div>

          {mangaRows.map((manga) => (
            <article className="manga-row" key={manga.title} role="row">
              <div className="manga-row__title">
                <span
                  className={`manga-cover manga-cover--${manga.coverTone}`}
                />
                <div>
                  <h3>{manga.title}</h3>
                  <p>Tác giả: {manga.author}</p>
                </div>
              </div>

              <div
                className={`manga-row__rank manga-row__rank--${manga.rankTone}`}
              >
                {manga.rank}
                <span>
                  {manga.rankTone === "up"
                    ? "↗"
                    : manga.rankTone === "danger"
                      ? "⌁"
                      : "—"}
                </span>
              </div>

              <div className="manga-row__inventory">
                <span>
                  <i style={{ width: `${manga.inventory}%` }} />
                </span>
                <strong>{manga.inventory}%</strong>
                <small>({manga.inventoryNote})</small>
              </div>

              <strong className="manga-row__views">{manga.views}</strong>

              <span className={`status-badge status-badge--${manga.status}`}>
                {statusLabels[manga.status]}
              </span>

              <div className="manga-row__actions">
                <button
                  className={`action-button ${
                    manga.status === "danger" ? "action-button--danger" : ""
                  }`}
                  type="button"
                >
                  {manga.primaryAction}
                </button>
                {manga.secondaryAction && (
                  <button
                    className="action-button action-button--outline"
                    type="button"
                  >
                    {manga.secondaryAction}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        <footer className="table-panel__footer">
          <p>Hiển thị 3 trên tổng số 48 dự án đang lưu hành.</p>
          <nav className="pagination" aria-label="Phân trang">
            <button type="button">‹</button>
            <button className="is-active" type="button">
              1
            </button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">›</button>
          </nav>
        </footer>
      </section>
    </main>
  );
}

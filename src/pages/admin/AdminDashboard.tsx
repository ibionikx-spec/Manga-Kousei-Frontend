import "./AdminDashboard.scss";

type TopSeries = {
  rank: string;
  title: string;
  genre: string;
  revenue: string;
  growth: string;
  cover: "aqua" | "sunset" | "noir";
};

type DangerItem = {
  title: string;
  issue: string;
  action: string;
  tone: "critical" | "warning" | "soft";
};

const cashFlow = [
  { quarter: "Q1 2023", income: "high", expense: "mid" },
  { quarter: "Q2 2023", income: "mid", expense: "soft" },
  { quarter: "Q3 2023", income: "peak", expense: "low" },
  { quarter: "Q4 (EST)", income: "est", expense: "est-low" },
];

const decisions = [
  {
    date: "15 OCT, 2023",
    text: "Phê duyệt chuyển thể Anime cho series Hành Trình Vô Tận - Ngân sách: 12 Tỷ ¥.",
  },
  {
    date: "12 OCT, 2023",
    text: "Ngừng phát hành (Axed) series Bóng Ma Trường Học do lượt đọc giảm 40% trong 4 tuần.",
  },
  {
    date: "10 OCT, 2023",
    text: "Ký kết tác giả mới Golden Rookie - Hợp đồng độc quyền 3 năm.",
  },
];

const topSeries: TopSeries[] = [
  {
    rank: "01",
    title: "HÀNH TRÌNH VÔ TẬN",
    genre: "FANTASY",
    revenue: "12.5 Tỷ ¥",
    growth: "+25%",
    cover: "aqua",
  },
  {
    rank: "02",
    title: "GIAI ĐIỆU MÙA HẠ",
    genre: "ROMANCE",
    revenue: "8.9 Tỷ ¥",
    growth: "+18%",
    cover: "sunset",
  },
  {
    rank: "03",
    title: "THÀNH PHỐ TỘI LỖI",
    genre: "DETECTIVE",
    revenue: "7.4 Tỷ ¥",
    growth: "+5%",
    cover: "noir",
  },
];

const dangerItems: DangerItem[] = [
  {
    title: "CHIẾN BINH RỒNG",
    issue: "Lượt đọc: -45% trong 3 tháng qua",
    action: "XÉT DUYỆT AXE",
    tone: "critical",
  },
  {
    title: "BÍ ẨN KIM TỰ THÁP",
    issue: "Trễ deadline nộp bản thảo 12 ngày",
    action: "CẢNH CÁO TÁC GIẢ",
    tone: "warning",
  },
  {
    title: "SIÊU NĂNG LỰC",
    issue: "Rating trung bình: 1.5/5 (N=2,400)",
    action: "ĐỔI CHIẾN LƯỢC",
    tone: "soft",
  },
];

export default function AdminDashboard() {
  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard__content">
          <div className="dashboard-header">
            <div>
              <h1>TỔNG QUAN TÒA SOẠN</h1>
              <p>Giám sát hiệu suất kinh doanh và quản trị nội dung tòa soạn.</p>
            </div>
            <div className="dashboard-header__actions">
              <button className="action-button action-button--primary" type="button">
                XUẤT BÁO CÁO
              </button>
              <button className="action-button action-button--outline" type="button">
                QUẢN LÝ DÒNG TIỀN
              </button>
            </div>
          </div>

          <section className="stats-grid" aria-label="Chỉ số tòa soạn">
            <article className="stat-card stat-card--revenue">
              <div className="stat-card__badge">+12.4%</div>
              <h2>TỔNG DOANH THU (LŨY KẾ NĂM)</h2>
              <strong>84.49</strong>
              <p>Tỷ ¥ • Kết thúc Tháng 10/2023</p>
              <div className="revenue-lines">
                <span>SÁCH IN</span>
                <span>DIGITAL</span>
                <span>BẢN QUYỀN</span>
              </div>
            </article>

            <article className="stat-card stat-card--market">
              <h2>THỊ PHẦN & VỊ THẾ</h2>
              <div className="market-value">
                <strong>#2</strong>
                <span>TOP 5 NXB</span>
              </div>
              <p>
                "Vượt mục tiêu quý 5.2%. Hiện đang thu hẹp khoảng cách với
                Shueisha VN."
              </p>
            </article>

            <article className="stat-card stat-card--budget">
              <h2>NGÂN SÁCH DỰ PHÒNG (Q4)</h2>
              <div className="progress-ring">
                <strong>70%</strong>
                <span>CÒN LẠI</span>
              </div>
              <strong className="budget-value">21.5 Tỷ ¥</strong>
              <p>SẮP GIẢI NGÂN TIỀN BẢN QUYỀN THÁNG 11</p>
            </article>
          </section>

          <section className="middle-grid">
            <article className="chart-card finance-chart">
              <div className="chart-card__header">
                <h2>DÒNG TIỀN THU/CHI (THEO QUÝ)</h2>
                <div className="finance-chart__legend">
                  <span className="is-income">THU</span>
                  <span className="is-expense">CHI</span>
                </div>
              </div>
              <div className="finance-chart__plot">
                {cashFlow.map((item) => (
                  <div className="finance-chart__group" key={item.quarter}>
                    <div className="finance-chart__bars">
                      <span className={`finance-chart__bar income is-${item.income}`} />
                      <span className={`finance-chart__bar expense is-${item.expense}`} />
                    </div>
                    <strong>{item.quarter}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="decision-log">
              <h2>NHẬT KÝ QUYẾT ĐỊNH</h2>
              <div className="decision-log__items">
                {decisions.map((decision) => (
                  <div className="decision-log__item" key={decision.date}>
                    <span>{decision.date}</span>
                    <p>{decision.text}</p>
                  </div>
                ))}
              </div>
              <button type="button">XEM TOÀN BỘ NHẬT KÝ</button>
            </article>
          </section>

          <section className="bottom-grid">
            <article className="ranking-board">
              <h2>♙ BẢNG PHONG THẦN (TOP 3)</h2>
              <div className="ranking-board__list">
                {topSeries.map((series) => (
                  <div className="ranking-board__row" key={series.rank}>
                    <strong>{series.rank}</strong>
                    <span className={`series-cover series-cover--${series.cover}`} />
                    <div>
                      <h3>{series.title}</h3>
                      <p>
                        {series.genre} • {series.revenue}
                      </p>
                    </div>
                    <em>{series.growth}</em>
                  </div>
                ))}
              </div>
            </article>

            <article className="danger-board">
              <h2>ⓘ BÁO ĐỘNG ĐỎ (NGUY KỊCH)</h2>
              <div className="danger-board__list">
                {dangerItems.map((item) => (
                  <div className={`danger-board__row danger-board__row--${item.tone}`} key={item.title}>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.issue}</p>
                    </div>
                    <button type="button">{item.action}</button>
                  </div>
                ))}
              </div>
            </article>
          </section>
      </section>
    </main>
  );
}

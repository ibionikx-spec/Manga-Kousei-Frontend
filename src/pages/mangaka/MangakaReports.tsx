import "./MangakaReports.scss";

type SeriesMetric = {
  title: string;
  views: string;
  likes: string;
  comments: string;
  tone: "night" | "neon" | "eye";
  faded?: boolean;
};

const productionBars = [
  { day: "T2", sketch: 30, ink: 16 },
  { day: "T3", sketch: 40, ink: 21 },
  { day: "T4", sketch: 20, ink: 11 },
  { day: "T5", sketch: 50, ink: 26 },
  { day: "T6", sketch: 60, ink: 31 },
  { day: "T7", sketch: 28, ink: 13 },
  { day: "CN", sketch: 13, ink: 7 },
];

const seriesMetrics: SeriesMetric[] = [
  {
    title: "Vương quốc bóng tối",
    views: "1.2M",
    likes: "45K",
    comments: "2.4K",
    tone: "night",
  },
  {
    title: "Neon Ramen",
    views: "890K",
    likes: "112K",
    comments: "8.1K",
    tone: "neon",
  },
  {
    title: "Linh hồn mạch điện",
    views: "450K",
    likes: "22K",
    comments: "1.5K",
    tone: "eye",
    faded: true,
  },
];

const incomeRows = [
  {
    series: "Vương quốc bóng tối",
    chapters: "Chương 42 - 45",
    base: "$3,200",
    bonus: "$450",
    ads: "$1,200",
    total: "$4,850",
  },
  {
    series: "Neon Ramen",
    chapters: "Chương 12 - 14",
    base: "$2,400",
    bonus: "$800",
    ads: "$400",
    total: "$3,600",
  },
];

export default function MangakaReports() {
  return (
    <section className="mangaka-reports">
      <header className="reports-header">
        <div>
          <h1>Báo cáo hiệu suất</h1>
          <p>Phân tích dữ liệu sản xuất và tương tác độc giả tháng 10/2023</p>
        </div>
        <div className="reports-actions">
          <button className="period-button" type="button">
            <span aria-hidden="true">▦</span>
            Tháng này
          </button>
          <button className="export-button" type="button">
            <span aria-hidden="true">↓</span>
            Xuất báo cáo
          </button>
        </div>
      </header>

      <div className="reports-top-grid">
        <article className="metric-card pages-card">
          <span>TỔNG SỐ TRANG</span>
          <strong>342</strong>
          <em>↗ +12% vs tháng trước</em>
          <dl>
            <div>
              <dt>Bản thảo thô</dt>
              <dd>180</dd>
            </div>
            <div>
              <dt>Lên line & Đổ bóng</dt>
              <dd>162</dd>
            </div>
          </dl>
        </article>

        <article className="metric-card revenue-card">
          <span>NHUẬN BÚT DỰ KIẾN</span>
          <strong>$8,450</strong>
          <p>Cập nhật lúc 14:00 hôm nay</p>
          <div className="completion-row">
            <span>Tỉ lệ hoàn thành</span>
            <strong>88%</strong>
          </div>
          <div className="completion-track">
            <i />
          </div>
        </article>

        <article className="quarter-goal-card">
          <div className="goal-copy">
            <h2>Mục tiêu sản xuất Quý IV</h2>
            <p>
              Bạn đang dẫn đầu tiến độ so với kế hoạch đề ra cho series "Vương quốc bóng tối".
              Duy trì phong độ để nhận thưởng cuối năm!
            </p>
            <div className="goal-stats">
              <div>
                <strong>14/20</strong>
                <span>CHƯƠNG HOÀN TẤT</span>
              </div>
              <div>
                <strong>42</strong>
                <span>NGÀY CÒN LẠI</span>
              </div>
            </div>
          </div>
          <div className="goal-graphic" aria-hidden="true" />
        </article>
      </div>

      <div className="reports-middle-grid">
        <article className="daily-production-card">
          <div className="chart-head">
            <h2>Tiến độ sản xuất theo ngày</h2>
            <div className="chart-legend">
              <span>
                <i className="legend-blue" />
                Trang vẽ thô
              </span>
              <span>
                <i className="legend-gray" />
                Hoàn thiện (Inking)
              </span>
            </div>
          </div>

          <div className="bar-chart" aria-label="Tiến độ sản xuất theo ngày">
            {productionBars.map((bar) => (
              <div className="bar-column" key={bar.day}>
                <div className="bar-stack">
                  <span className="bar-ink" style={{ height: `${bar.ink * 4}px` }} />
                  <span className="bar-sketch" style={{ height: `${bar.sketch * 4}px` }} />
                </div>
                <strong>{bar.day}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="series-interaction-card">
          <h2>Tương tác Series</h2>
          <div className="series-list">
            {seriesMetrics.map((series) => (
              <div className={`series-row${series.faded ? " is-faded" : ""}`} key={series.title}>
                <span className={`series-cover series-cover--${series.tone}`} />
                <div>
                  <h3>{series.title}</h3>
                  <p>
                    <span>◉ {series.views}</span>
                    <span>♡ {series.likes}</span>
                    <span>□ {series.comments}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button type="button">Xem tất cả series</button>
        </article>
      </div>

      <article className="income-table-card">
        <header>
          <h2>Thống kê thu nhập tháng</h2>
          <span>Đơn vị: USD ($)</span>
        </header>
        <div className="income-table" role="table" aria-label="Thống kê thu nhập tháng">
          <div className="income-table__head" role="row">
            <span>SERIES</span>
            <span>CHƯƠNG</span>
            <span>NHUẬN BÚT CƠ BẢN</span>
            <span>THƯỞNG TƯƠNG TÁC</span>
            <span>BẢN QUYỀN (ADS)</span>
            <span>TỔNG CỘNG</span>
          </div>
          {incomeRows.map((row) => (
            <div className="income-table__row" role="row" key={row.series}>
              <span>{row.series}</span>
              <span>{row.chapters}</span>
              <span>{row.base}</span>
              <span>{row.bonus}</span>
              <span>{row.ads}</span>
              <strong>{row.total}</strong>
            </div>
          ))}
          <footer>
            <strong>TỔNG THU NHẬP THÁNG 10</strong>
            <b>$8,450</b>
          </footer>
        </div>
      </article>
    </section>
  );
}

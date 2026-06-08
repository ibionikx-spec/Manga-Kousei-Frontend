import "./AdminMagazines.scss";

type SeriesStatus = "HOÀN TẤT FILE" | "ĐANG CHỈNH SỬA" | "CHƯA NỘP FILE";

type SeriesItem = {
  order: string;
  title: string;
  chapter: string;
  quote: string;
  pages: number;
  printType: string;
  status: SeriesStatus;
};

const seriesList: SeriesItem[] = [
  {
    order: "01",
    title: "Kaisen No Shiro",
    chapter: "Chương 142",
    quote: "The Broken Vow",
    pages: 24,
    printType: "LEAD COLOR PAGE",
    status: "HOÀN TẤT FILE",
  },
  {
    order: "02",
    title: "Neon Samurai",
    chapter: "Chương 89",
    quote: "Circuit Overload",
    pages: 19,
    printType: "Regular B&W",
    status: "ĐANG CHỈNH SỬA",
  },
  {
    order: "03",
    title: "Void Walker",
    chapter: "Chương 22",
    quote: "Echoes of Reality",
    pages: 20,
    printType: "Regular B&W",
    status: "HOÀN TẤT FILE",
  },
  {
    order: "04",
    title: "Digital Soul",
    chapter: "Chương 12",
    quote: "The First Login",
    pages: 32,
    printType: "One Shot / New Series",
    status: "CHƯA NỘP FILE",
  },
  {
    order: "05",
    title: "Akari Protocol",
    chapter: "Chương 31",
    quote: "Signal Under Snow",
    pages: 18,
    printType: "Regular B&W",
    status: "HOÀN TẤT FILE",
  },
  {
    order: "06",
    title: "Tokyo Mirage Lab",
    chapter: "Chương 07",
    quote: "Night Shift Draft",
    pages: 22,
    printType: "Special Insert",
    status: "ĐANG CHỈNH SỬA",
  },
];

export default function AdminMagazines() {
  return (
    <main className="main-content">
      <section className="content-area">
        <div className="page-heading">
          <div>
            <span className="eyebrow">QUẢN LÝ SỐ TẠP CHÍ SỐ 45/2023</span>
            <h1>Line-up Số Tạp chí #45/2023</h1>
            <div className="status-badges">
              <span>PHÂN BỔ TRANG: 315/420</span>
              <span>HẠN CHÓT: 25/10/2023</span>
            </div>
          </div>

          <div className="heading-actions">
            <button
              className="action-button action-button--ghost"
              type="button"
            >
              XEM TRƯỚC LINE-UP
            </button>
            <button
              className="action-button action-button--primary"
              type="button"
            >
              CHỐT SỐ LƯỢNG & GỬI IN
            </button>
          </div>
        </div>

        <div className="series-toolbar">
          <strong>SẮP XẾP THỨ TỰ SERIES (KÉO THẢ)</strong>
          <span>20 SERIES TỔNG CỘNG</span>
        </div>

        <div className="series-list">
          {seriesList.map((series) => (
            <article className="series-card" key={series.order}>
              <span className="drag-handle" aria-hidden="true">
                ::
              </span>
              <span className="series-order">{series.order}</span>

              <div className="series-title">
                <h2>{series.title}</h2>
                <p>{series.chapter}</p>
                <blockquote>"{series.quote}"</blockquote>
              </div>

              <div className="series-pages">
                <strong>{series.pages} Trang</strong>
                <span>{series.printType}</span>
              </div>

              <div className={`series-status ${statusClass(series.status)}`}>
                <span />
                {series.status}
              </div>

              <button
                className="more-button"
                type="button"
                aria-label="Series actions"
              >
                ⋮
              </button>
            </article>
          ))}
        </div>
      </section>

      <aside className="right-panel">
        <section className="info-card info-card--print">
          <h3>THÔNG TIN IN ẤN</h3>
          <div className="print-box">
            <span>SỐ LƯỢNG BẢN IN DỰ KIẾN</span>
            <strong>
              1.200.000<small>bản</small>
            </strong>
          </div>
          <div className="print-box">
            <span>NHÀ MÁY ĐỐI TÁC</span>
            <strong>Dai Nippon Printing Co., Ltd.</strong>
          </div>
          <div className="print-box">
            <span>FINAL DEADLINE</span>
            <strong>25/10/2023 - 18:00 JST</strong>
          </div>
        </section>

        <section className="info-card">
          <h3>TRẠNG THÁI TỔNG THỂ</h3>
          <div className="progress-bar">
            <span style={{ width: "75%" }} />
          </div>
          <div className="progress-meta">
            <strong>75% hoàn tất</strong>
            <span>315/420 trang</span>
          </div>
        </section>

        <section className="info-card">
          <h3>KIỂM TRA HẬU CẦN</h3>
          <ul className="checklist">
            <li className="is-done">Thiết kế bìa đã phê duyệt</li>
            <li className="is-done">Quảng cáo nhà tài trợ</li>
            <li className="is-alert">Quà tặng kèm đang chờ mẫu</li>
          </ul>
        </section>

        <section className="info-card info-card--notice">
          <h3>THÔNG BÁO EDITORIAL BOARD</h3>
          <p>
            Gửi thông báo nhắc nhở cho tất cả Editor có Series chưa nộp file?
          </p>
          <button className="action-button action-button--notice" type="button">
            GỬI NHẮC NHỞ KHẨN CẤP
          </button>
        </section>
      </aside>
    </main>
  );
}

function statusClass(status: SeriesStatus) {
  if (status === "HOÀN TẤT FILE") return "series-status--done";
  if (status === "ĐANG CHỈNH SỬA") return "series-status--editing";
  return "series-status--missing";
}
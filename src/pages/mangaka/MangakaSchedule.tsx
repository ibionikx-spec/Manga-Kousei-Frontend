import "./MangakaSchedule.scss";

type CalendarEvent = {
  label: string;
  tone: "blue" | "indigo" | "red";
};

type CalendarDay = {
  day: string;
  muted?: boolean;
  today?: boolean;
  danger?: boolean;
  events?: CalendarEvent[];
};

const calendarDays: CalendarDay[] = [
  { day: "25", muted: true },
  { day: "26", muted: true },
  { day: "27", muted: true },
  { day: "28", muted: true },
  { day: "29", muted: true },
  { day: "30", muted: true },
  { day: "1" },
  {
    day: "2",
    today: true,
    events: [
      { label: "Nộp bản Name", tone: "blue" },
      { label: "Check Genga", tone: "indigo" },
    ],
  },
  { day: "3" },
  {
    day: "4",
    danger: true,
    events: [{ label: "DEADLINE Genga #140", tone: "red" }],
  },
  { day: "5" },
  { day: "6" },
  { day: "7" },
  { day: "8", muted: true },
  { day: "9" },
  {
    day: "10",
    today: true,
    events: [{ label: "Xuất bản Tập 12", tone: "blue" }],
  },
  { day: "11" },
  { day: "12" },
  { day: "13" },
  { day: "14" },
  { day: "15" },
  { day: "16" },
  { day: "17" },
  { day: "18" },
  { day: "19" },
  { day: "20" },
  { day: "21" },
  { day: "22" },
  { day: "23" },
  { day: "24" },
  { day: "25" },
  { day: "26" },
  { day: "27" },
  { day: "28" },
  { day: "29" },
  { day: "30" },
  { day: "31" },
  { day: "11" },
  { day: "12" },
  { day: "13" },
  { day: "14" },
  { day: "15" },
  { day: "16" },
  { day: "17" },
  { day: "18" },
  { day: "19" },
  { day: "20" },
  { day: "21" },
  { day: "22" },
  { day: "23" },
  { day: "24" },
  { day: "25" },
  { day: "26" },
  { day: "27" },
  { day: "28" },
  { day: "29" },
  { day: "30" },
  { day: "31" },
];

const priorityTasks = [
  {
    title: "Sửa lại Name trang 15-20",
    description: 'Phản hồi từ biên tập viên Tanaka: "Bố cục quá dày".',
    meta: "Deadline: 14:00 hôm nay",
    tone: "red",
  },
  {
    title: "Gửi bản thảo Genga chương 140",
    description: "Bao gồm 32 trang và bìa màu lót.",
    meta: "Tiến độ: 95%",
    tone: "blue",
  },
  {
    title: "Họp kịch bản arc mới",
    description: "Với đội ngũ thiết kế nhân vật và biên kịch.",
    meta: "Google Meet: 16:30",
    tone: "indigo",
  },
];

const productionRows = [
  {
    chapter: "Chương 142: Ánh sáng cuối đường",
    stage: "Giai đoạn: Phác thảo (Name)",
    percent: 35,
    tone: "blue",
    labels: ["Phác thảo", "Genga", "Hoàn thiện", "Hậu kỳ"],
  },
  {
    chapter: "Chương 141: Cuộc gặp gỡ",
    stage: "Giai đoạn: Genga (Bản thảo chính)",
    percent: 75,
    tone: "indigo",
    labels: ["✓ Phác thảo", "Đang vẽ...", "Hoàn thiện", "Hậu kỳ"],
  },
];

export default function MangakaSchedule() {
  return (
    <section className="mangaka-schedule">
      <div className="schedule-main">
        <article className="calendar-panel">
          <header className="schedule-card-header">
            <div>
              <h1>Tháng 10, 2023</h1>
              <p>Dự kiến 4 chương phát hành</p>
            </div>
            <div className="calendar-controls" aria-label="Điều hướng tháng">
              <button type="button" aria-label="Tháng trước">
                ‹
              </button>
              <button type="button" aria-label="Tháng sau">
                ›
              </button>
            </div>
          </header>

          <div className="calendar-grid" aria-label="Lịch sản xuất tháng 10">
            {calendarDays.map((item, index) => (
              <div
                className={`calendar-day${item.muted ? " is-muted" : ""}${
                  item.today ? " is-today" : ""
                }${item.danger ? " is-danger" : ""}`}
                key={`${item.day}-${index}`}
              >
                <span className="calendar-day__number">{item.day}</span>
                <div className="calendar-day__events">
                  {item.events?.map((event) => (
                    <span className={`calendar-event calendar-event--${event.tone}`} key={event.label}>
                      {event.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="production-panel">
          <h2>Tiến độ sản xuất chương</h2>
          <div className="production-list">
            {productionRows.map((row) => (
              <div className="production-item" key={row.chapter}>
                <div className="production-item__head">
                  <h3>{row.chapter}</h3>
                  <span>{row.stage}</span>
                </div>
                <div className="production-track" aria-label={`${row.chapter} ${row.percent}%`}>
                  <span
                    className={`production-track__fill production-track__fill--${row.tone}`}
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
                <div className="production-labels">
                  {row.labels.map((label, labelIndex) => (
                    <span className={labelIndex < 2 ? "is-active" : ""} key={label}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <aside className="schedule-sidebar" aria-label="Công việc và bìa tập">
        <article className="priority-panel">
          <h2>
            <span aria-hidden="true">!</span>
            Task ưu tiên hôm nay
          </h2>
          <div className="priority-list">
            {priorityTasks.map((task) => (
              <label className={`priority-task priority-task--${task.tone}`} key={task.title}>
                <input type="checkbox" />
                <span>
                  <strong>{task.title}</strong>
                  <small>{task.description}</small>
                  <em>{task.meta}</em>
                </span>
              </label>
            ))}
          </div>
          <button className="view-all-button" type="button">
            Xem tất cả 12 task
          </button>
        </article>

        <article className="cover-panel">
          <h2>Bìa Tập 12 (Dự thảo)</h2>
          <p>Trạng thái: Đang chờ duyệt màu</p>
          <div className="cover-art" aria-label="Bản nháp bìa tập 12">
            <div className="cover-art__figure" />
            <span className="cover-art__slash cover-art__slash--one" />
            <span className="cover-art__slash cover-art__slash--two" />
          </div>
          <button type="button">Xem chi tiết</button>
        </article>
      </aside>
    </section>
  );
}

import "./MangakaAssistants.scss";

type Assistant = {
  name: string;
  role: string;
  workload: number;
  status: string;
  online: boolean;
  avatarTone: "mono" | "paper" | "ink";
};

const assistants: Assistant[] = [
  {
    name: "Takahashi Ryu",
    role: "VẼ NỀN (BACKGROUND)",
    workload: 85,
    status: "Đang thực hiện: Chap 14 - Phố cổ Hà Nội thế kỷ 19",
    online: true,
    avatarTone: "mono",
  },
  {
    name: "Sato Mei",
    role: "HIỆU ỨNG (SFX)",
    workload: 20,
    status: "Trạng thái: Sẵn sàng nhận Job mới",
    online: false,
    avatarTone: "paper",
  },
  {
    name: "Nguyen Minh",
    role: "ĐỔ BÓNG (SHADING)",
    workload: 60,
    status: "Đang thực hiện: Chap 14 - Đổ bóng nhân vật chính",
    online: true,
    avatarTone: "ink",
  },
];

const progressCards = [
  { label: "BACKGROUND", done: 12, total: 15, active: true },
  { label: "INK/SHADING", done: 8, total: 15, active: true },
  { label: "SFX/EFFECTS", done: 0, total: 15, active: false },
];

export default function MangakaAssistants() {
  return (
    <section className="mangaka-assistants">
      <header className="assistants-hero">
        <div>
          <h1>Quản lý Nhân sự</h1>
          <p>Điều phối 12 trợ lý đang thực hiện Series: "Hào Khí Thăng Long"</p>
        </div>
        <button className="invite-button" type="button">
          <span aria-hidden="true">+</span>
          Mời cộng tác viên mới
        </button>
      </header>

      <div className="assistants-layout">
        <main className="assistants-main">
          <section className="assistant-list-panel">
            <div className="assistant-list-header">
              <h2>DANH SÁCH TRỢ LÝ</h2>
              <div className="assistant-status-summary">
                <strong>● 8 Online</strong>
                <span>● 4 Offline</span>
              </div>
            </div>

            <div className="assistant-grid">
              {assistants.map((assistant) => (
                <article className="assistant-card" key={assistant.name}>
                  <div className="assistant-card__top">
                    <div className={`assistant-avatar assistant-avatar--${assistant.avatarTone}`}>
                      <span className={assistant.online ? "is-online" : "is-offline"} />
                    </div>
                    <div>
                      <h3>{assistant.name}</h3>
                      <strong>{assistant.role}</strong>
                    </div>
                    <button aria-label={`Tùy chọn ${assistant.name}`} type="button">
                      ⋮
                    </button>
                  </div>

                  <div className="workload-row">
                    <span>Khối lượng công việc</span>
                    <strong className={assistant.workload < 30 ? "is-low" : ""}>{assistant.workload}%</strong>
                  </div>
                  <div className="workload-track" aria-label={`${assistant.workload}%`}>
                    <span style={{ width: `${assistant.workload}%` }} />
                  </div>
                  <p>{assistant.status}</p>
                </article>
              ))}

              <button className="quick-add-card" type="button">
                <span aria-hidden="true">+</span>
                <strong>Thêm nhân sự nhanh</strong>
              </button>
            </div>
          </section>

          <section className="bottom-dashboard">
            <article className="team-performance">
              <h2>Hiệu suất 98%</h2>
              <p>Team đang hoàn thành các task Shading nhanh hơn dự kiến 2 ngày.</p>
              <div className="mini-team">
                <span />
                <span />
                <span />
                <strong>+9</strong>
              </div>
            </article>

            <article className="chapter-progress">
              <div className="chapter-progress__head">
                <h2>Tiến độ Chapter 14</h2>
                <span>Deadline: 25/10</span>
              </div>
              <div className="chapter-progress__grid">
                {progressCards.map((card) => (
                  <div className={card.active ? "is-active" : ""} key={card.label}>
                    <strong>{card.label}</strong>
                    <p>
                      <b>{card.done}/{card.total}</b>
                      <span>Trang</span>
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </main>

        <aside className="assistants-sidebar">
          <article className="payroll-panel">
            <h2>
              <span aria-hidden="true">▣</span>
              Quản lý Tiền công
            </h2>
            <div className="payroll-total">
              <span>TỔNG CHI TRẢ THÁNG 10</span>
              <strong>45,200,000đ</strong>
            </div>
            <dl>
              <div>
                <dt>Lương cơ bản</dt>
                <dd>32,000,000đ</dd>
              </div>
              <div>
                <dt>Thưởng Deadline</dt>
                <dd className="is-bonus">+8,500,000đ</dd>
              </div>
              <div>
                <dt>Thuế/Phí</dt>
                <dd className="is-tax">-4,700,000đ</dd>
              </div>
            </dl>
            <button type="button">CHI TIẾT BẢNG LƯƠNG</button>
          </article>

          <article className="legal-panel">
            <h2>
              <span aria-hidden="true">§</span>
              Hợp đồng & Pháp lý
            </h2>
            <div className="legal-item">
              <span aria-hidden="true">□</span>
              <div>
                <strong>Hợp đồng Bảo mật (NDA)</strong>
                <small>Cập nhật: 02/10/2023</small>
              </div>
            </div>
            <div className="legal-item">
              <span aria-hidden="true">©</span>
              <div>
                <strong>Điều khoản Bản quyền</strong>
                <small>Tất cả trợ lý đã ký</small>
              </div>
            </div>
            <button type="button">
              <span aria-hidden="true">⇧</span>
              Tải lên hợp đồng mới
            </button>
          </article>
        </aside>
      </div>
    </section>
  );
}

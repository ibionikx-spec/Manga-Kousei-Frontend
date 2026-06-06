import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  PenLine,
  Pencil,
  X,
} from "lucide-react";

const chapters = [
  { code: "C01", title: "Khởi đầu của bóng tối" },
  { code: "C02", title: "Lưỡi kiếm rỉ sét" },
  { code: "C03", title: "Hồi ức Shinjuku" },
];

export default function ProjectDetail() {
  return (
    <section className="project-detail">
      <div className="detail-header">
        <div>
          <Eye size={20} />
          <h2>Dự án ID #SHJ-042 đang xem xét</h2>
        </div>
        <div className="detail-header__actions">
          <button type="button">Biên tập</button>
          <button type="button">Tiếp thị</button>
        </div>
      </div>

      <div className="detail-grid">
        <article className="review-panel summary-panel">
          <header>
            <FileText size={22} />
            <h3>Tóm tắt kịch bản</h3>
          </header>
          <p>
            Bối cảnh Tokyo tương lai năm 2045, nơi các Samurai cơ khí hóa đấu
            tranh giành quyền kiểm soát nguồn năng lượng vô tận tại Shinjuku.
            Nhân vật chính là một cựu binh mất trí nhớ, sở hữu thanh kiếm cổ đại
            có khả năng cắt đứt cả không gian. Cốt truyện tập trung vào sự phản
            bội, danh dự và bản chất của con người trong kỷ nguyên máy móc.
          </p>
        </article>

        <article className="review-panel character-panel">
          <header>
            <PenLine size={22} />
            <h3>Phác thảo nhân vật</h3>
          </header>
          <div className="character-art" aria-label="Phác thảo samurai cơ khí">
            <div className="halo" />
            <div className="hair hair-a" />
            <div className="hair hair-b" />
            <div className="hair hair-c" />
            <div className="face">
              <span className="eye left" />
              <span className="eye right" />
              <span className="mouth" />
            </div>
            <div className="collar collar-left" />
            <div className="collar collar-right" />
            <div className="body" />
            <div className="coat coat-left" />
            <div className="coat coat-right" />
            <div className="tech-line line-one" />
            <div className="tech-line line-two" />
          </div>
        </article>
      </div>

      <article className="review-panel chapters-panel">
        <header>
          <div>
            <BookOpen size={23} />
            <h3>3 chương name đầu tiên (bản thảo)</h3>
          </div>
          <div className="chapter-arrows">
            <button aria-label="Chương trước" type="button">
              <ChevronLeft size={21} />
            </button>
            <button aria-label="Chương sau" type="button">
              <ChevronRight size={21} />
            </button>
          </div>
        </header>
        <div className="chapter-placeholders">
          {chapters.map((chapter) => (
            <div className="chapter-placeholder" key={chapter.code}>
              <strong>{chapter.code}</strong>
              <span>{chapter.title}</span>
            </div>
          ))}
        </div>
      </article>

      <div className="decision-bar">
        <button className="reject" type="button">
          <X size={23} />
          <span>Từ chối</span>
        </button>
        <button className="revise" type="button">
          <Pencil size={22} />
          <span>Cần sửa đổi</span>
        </button>
        <button className="approve" type="button">
          <CheckCircle2 size={22} />
          <span>Bỏ phiếu Đồng ý</span>
        </button>
      </div>
    </section>
  );
}

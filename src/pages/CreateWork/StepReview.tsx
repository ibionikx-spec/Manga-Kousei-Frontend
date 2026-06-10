import {
  BookOpen,
  Users,
  FileText,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import type { Character } from "../../types/createWork";

interface StepReviewProps {
  title: string;
  genreIds: number[];
  genresList: { id: number; name: string }[];
  targetAudience: string;
  synopsis: string;
  characters: Character[];
  nameSummary: string;
  sketchPreview: string;
}

export const StepReview = ({
  title,
  genreIds,
  genresList,
  targetAudience,
  synopsis,
  characters,
  nameSummary,
  sketchPreview,
}: StepReviewProps) => {
  return (
    <div className="cw-section">
      <h2 className="cw-section__title">Xem lại & Trình nộp</h2>
      <div className="cw-review">
        <div className="cw-review__block">
          <h3>
            <BookOpen size={16} /> Thông tin Series
          </h3>
          <div className="cw-review__grid">
            <span className="label">Tên Series</span>
            <span className="value">{title || "—"}</span>
            <span className="label">Đối tượng</span>
            <span className="value">{targetAudience || "—"}</span>
            <span className="label">Thể loại</span>
            <span className="value">
              {genreIds.length ? (
                <div className="cw-tag-row">
                  {genreIds.map((id) => {
                    const genre = genresList.find((g) => g.id === id);
                    return (
                      <span key={id} className="cw-tag">
                        {genre?.name || "Unknown"}
                      </span>
                    );
                  })}
                </div>
              ) : (
                "—"
              )}
            </span>
            <span className="label">Tóm tắt</span>
            <span className="value synopsis">{synopsis || "—"}</span>
          </div>
        </div>
        <div className="cw-review__block">
          <h3>
            <Users size={16} /> Nhân vật ({characters.length})
          </h3>
          <div className="cw-review__chars">
            {characters.map((c) => (
              <div key={c.id} className="cw-review__char">
                <strong>{c.name || "—"}</strong>
                <span>{c.role || "—"}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="cw-review__block">
          <h3>
            <FileText size={16} /> Bản Name
          </h3>
          <div className="cw-review__grid">
            <span className="label">Tóm tắt nội dung</span>
            <span className="value synopsis">{nameSummary || "—"}</span>
          </div>
        </div>
        {sketchPreview && (
          <div className="cw-review__block">
            <h3>
              <ImageIcon size={16} /> Phác thảo bản Name
            </h3>
            <div className="cw-review__image">
              <img src={sketchPreview} alt="phác thảo" />
            </div>
          </div>
        )}
      </div>
      <div className="cw-notice">
        <AlertCircle size={16} />
        <p>
          Sau khi nộp, bản Name sẽ được chuyển đến hàng đợi xét duyệt của Ban
          Biên tập. Bạn có thể theo dõi tiến trình tại trang{" "}
          <strong>Tác phẩm</strong>.
        </p>
      </div>
    </div>
  );
};

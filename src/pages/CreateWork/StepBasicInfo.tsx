import { AUDIENCES } from "../../constants/createWork.constants";
import type { CreateWorkFormData } from "../../types/createWork";

interface StepBasicInfoProps {
  title: string;
  targetAudience: string;
  genreIds: number[];
  genresList: { id: number; name: string }[];
  synopsis: string;
  onUpdate: <K extends keyof CreateWorkFormData>(
    key: K,
    value: CreateWorkFormData[K],
  ) => void;
}

export const StepBasicInfo = ({
  title,
  targetAudience,
  genreIds,
  genresList,
  synopsis,
  onUpdate,
}: StepBasicInfoProps) => {
  const toggleGenre = (id: number) => {
    const newIds = genreIds.includes(id)
      ? genreIds.filter((gid) => gid !== id)
      : [...genreIds, id];
    onUpdate("genreIds", newIds);
  };

  return (
    <div className="cw-section">
      <h2 className="cw-section__title">Thông tin cơ bản</h2>
      <div className="cw-field">
        <label>
          Tên Series <span className="req">*</span>
        </label>
        <input
          type="text"
          placeholder="VD: Kiếm Sĩ Cuối Cùng"
          value={title}
          onChange={(e) => onUpdate("title", e.target.value)}
        />
      </div>
      <div className="cw-row">
        <div className="cw-field">
          <label>
            Đối tượng độc giả <span className="req">*</span>
          </label>
          <div className="cw-pill-group">
            {AUDIENCES.map((a) => (
              <button
                key={a}
                type="button"
                className={`cw-pill ${targetAudience === a ? "cw-pill--active" : ""}`}
                onClick={() => onUpdate("targetAudience", a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="cw-field">
        <label>
          Thể loại <span className="req">*</span>{" "}
          <span className="hint">(Chọn tối đa 5)</span>
        </label>
        <div className="cw-pill-group">
          {genresList.map((genre) => (
            <button
              key={genre.id}
              type="button"
              className={`cw-pill ${genreIds.includes(genre.id) ? "cw-pill--active" : ""}`}
              onClick={() => toggleGenre(genre.id)}
              disabled={!genreIds.includes(genre.id) && genreIds.length >= 5}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
      <div className="cw-field">
        <label>
          Tóm tắt cốt truyện <span className="req">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="Mô tả bối cảnh, xung đột chính, và nhân vật trung tâm của series..."
          value={synopsis}
          onChange={(e) => onUpdate("synopsis", e.target.value)}
        />
        <span className="char-count">{synopsis.length} ký tự</span>
      </div>
    </div>
  );
};

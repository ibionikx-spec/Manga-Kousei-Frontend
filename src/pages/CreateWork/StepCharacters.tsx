import { Plus, X } from "lucide-react";
import type { Character } from "../../types/createWork";

interface StepCharactersProps {
  characters: Character[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, key: keyof Character, value: string) => void;
}

export const StepCharacters = ({
  characters,
  onAdd,
  onRemove,
  onUpdate,
}: StepCharactersProps) => {
  return (
    <div className="cw-section">
      <div className="cw-section__head">
        <h2 className="cw-section__title">Nhân vật chính</h2>
        <button type="button" className="cw-btn cw-btn--ghost" onClick={onAdd}>
          <Plus size={16} /> Thêm nhân vật
        </button>
      </div>
      <div className="cw-characters">
        {characters.map((char, idx) => (
          <div key={char.id} className="cw-char-card">
            <div className="cw-char-card__header">
              <span className="cw-char-card__num">NV {idx + 1}</span>
              {characters.length > 1 && (
                <button
                  type="button"
                  className="cw-icon-btn cw-icon-btn--danger"
                  onClick={() => onRemove(char.id)}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="cw-row">
              <div className="cw-field">
                <label>
                  Tên nhân vật <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Takeru Yamada"
                  value={char.name}
                  onChange={(e) => onUpdate(char.id, "name", e.target.value)}
                />
              </div>
              <div className="cw-field">
                <label>
                  Vai trò <span className="req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Nhân vật chính, Đối thủ, Người thầy..."
                  value={char.role}
                  onChange={(e) => onUpdate(char.id, "role", e.target.value)}
                />
              </div>
            </div>
            <div className="cw-field">
              <label>Mô tả ngắn</label>
              <textarea
                rows={2}
                placeholder="Tính cách, năng lực, động lực của nhân vật..."
                value={char.description}
                onChange={(e) =>
                  onUpdate(char.id, "description", e.target.value)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { UserCheck, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAssignedTantous } from "../../hooks/useAssignedTantous";

interface StepSelectTantouProps {
  selectedTantouId: number | null;
  onSelect: (id: number) => void;
}

export const StepSelectTantou = ({
  selectedTantouId,
  onSelect,
}: StepSelectTantouProps) => {
  const { tantous, loading, error } = useAssignedTantous();

  return (
    <div className="cw-section">
      <h2 className="cw-section__title">Chọn Tantou phụ trách</h2>
      <p
        className="cw-section__sub"
        style={{ marginTop: -20, marginBottom: 24 }}
      >
        Chọn biên tập viên (Tantou) sẽ tiếp nhận và xét duyệt bản Name của bạn.
      </p>

      {loading && (
        <div className="cw-tantou-state">
          <Loader2 size={24} className="cw-tantou-state__spin" />
          <span>Đang tải danh sách Tantou...</span>
        </div>
      )}

      {error && !loading && (
        <div className="cw-notice">
          <AlertCircle size={16} />
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && tantous.length === 0 && (
        <div className="cw-tantou-state cw-tantou-state--empty">
          <UserCheck size={32} />
          <span>Bạn chưa được ghép cặp với Tantou nào.</span>
          <small>Vui lòng liên hệ Ban Biên tập để được phân công.</small>
        </div>
      )}

      {!loading && !error && tantous.length > 0 && (
        <div className="cw-tantou-list">
          {tantous.map((t) => {
            const isSelected = selectedTantouId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={`cw-tantou-card ${isSelected ? "cw-tantou-card--selected" : ""}`}
                onClick={() => onSelect(t.id)}
              >
                <div className="cw-tantou-card__avatar">
                  {t.avatarUrl ? (
                    <img src={t.avatarUrl} alt={t.fullName} />
                  ) : (
                    <span>{t.fullName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="cw-tantou-card__info">
                  <strong>{t.fullName}</strong>
                  <span>{t.email}</span>
                </div>
                {isSelected && (
                  <div className="cw-tantou-card__check">
                    <CheckCircle2 size={20} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

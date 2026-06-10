import { ChevronLeft, ChevronRight, Send } from "lucide-react";

interface NavigationButtonsProps {
  step: number;
  canProceed: boolean;
  isSubmitting: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const NavigationButtons = ({
  step,
  canProceed,
  isSubmitting,
  onPrev,
  onNext,
  onSubmit,
}: NavigationButtonsProps) => {
  return (
    <div className="cw-nav">
      <button
        type="button"
        className="cw-btn cw-btn--outline"
        onClick={onPrev}
        disabled={step === 1}
      >
        <ChevronLeft size={18} /> Quay lại
      </button>
      <div className="cw-nav__right">
        <span className="cw-nav__hint">Bước {step} / 4</span>
        {step < 4 ? (
          <button
            type="button"
            className="cw-btn cw-btn--primary"
            onClick={onNext}
            disabled={!canProceed}
          >
            Tiếp theo <ChevronRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            className="cw-btn cw-btn--submit"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Đang gửi..."
            ) : (
              <>
                <Send size={17} /> Nộp Bản Name
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

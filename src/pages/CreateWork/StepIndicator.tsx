import { STEPS } from "../../constants/createWork.constants";
import { CheckCircle2 } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  return (
    <div className="cw-steps">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const state =
          s.id < currentStep
            ? "done"
            : s.id === currentStep
              ? "active"
              : "upcoming";
        return (
          <div key={s.id} className="cw-steps__item">
            <div className={`cw-steps__dot cw-steps__dot--${state}`}>
              {state === "done" ? (
                <CheckCircle2 size={16} strokeWidth={2.5} />
              ) : (
                <Icon size={16} strokeWidth={1.75} />
              )}
            </div>
            <span className={`cw-steps__label cw-steps__label--${state}`}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`cw-steps__line cw-steps__line--${s.id < currentStep ? "done" : "upcoming"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

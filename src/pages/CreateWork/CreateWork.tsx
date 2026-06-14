import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import "./CreateWork.scss";
import { useCreateWorkForm } from "../../hooks/useCreateWorkForm";
import { StepIndicator } from "./StepIndicator";
import { NavigationButtons } from "./NavigationButtons";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepCharacters } from "./StepCharacters";
import { StepNameSummary } from "./StepNameSummary";
import { StepSelectTantou } from "./StepSelectTantou";
import { StepReview } from "./StepReview";

const TOTAL_STEPS = 5;

export default function CreateWork() {
  const {
    form,
    step,
    submitted,
    isSubmitting,
    updateField,
    addCharacter,
    removeCharacter,
    updateCharacter,
    submitProposal,
    resetForm,
    setStep,
    canProceed,
    genresList,
  } = useCreateWorkForm();

  const [selectedTantouId, setSelectedTantouId] = useState<number | null>(null);

  const canProceedStep4 = step !== 4 || selectedTantouId !== null;
  const effectiveCanProceed = canProceed && canProceedStep4;

  useEffect(() => {
    return () => {
      if (form.sketchPreview) URL.revokeObjectURL(form.sketchPreview);
    };
  }, [form.sketchPreview]);

  if (submitted) {
    return (
      <div className="cw-page">
        <div className="cw-success">
          <div className="cw-success__icon">
            <CheckCircle2 size={56} strokeWidth={1.5} />
          </div>
          <h2>Bản Name đã được nộp!</h2>
          <p>
            Series <strong>"{form.title}"</strong> đã được gửi đến Ban Biên tập
            để xét duyệt. Bạn sẽ nhận được phản hồi trong vòng 3–5 ngày làm
            việc.
          </p>
          <div className="cw-success__meta">
            <span>
              Trạng thái: <strong className="pending">Chờ duyệt</strong>
            </span>
          </div>
          <button className="cw-btn cw-btn--primary" onClick={resetForm}>
            Tạo bản Name mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cw-page">
      <div className="cw-header">
        <div className="cw-header__copy">
          <span className="cw-eyebrow">TẠO TÁC PHẨM MỚI</span>
          <h1>Nộp Bản Name</h1>
          <p>Phác thảo ý tưởng series để trình lên Ban Biên tập xét duyệt</p>
        </div>
      </div>

      <StepIndicator currentStep={step} />

      <div className="cw-body">
        {step === 1 && (
          <StepBasicInfo
            title={form.title}
            targetAudience={form.targetAudience}
            genreIds={form.genreIds}
            genresList={genresList}
            synopsis={form.synopsis}
            onUpdate={updateField}
          />
        )}
        {step === 2 && (
          <StepCharacters
            characters={form.characters}
            onAdd={addCharacter}
            onRemove={removeCharacter}
            onUpdate={updateCharacter}
          />
        )}
        {step === 3 && (
          <StepNameSummary
            nameSummary={form.nameSummary}
            sketchPreview={form.sketchPreview}
            onUpdate={updateField}
          />
        )}
        {step === 4 && (
          <StepSelectTantou
            selectedTantouId={selectedTantouId}
            onSelect={setSelectedTantouId}
          />
        )}
        {step === 5 && (
          <StepReview
            title={form.title}
            genreIds={form.genreIds}
            genresList={genresList}
            targetAudience={form.targetAudience}
            synopsis={form.synopsis}
            characters={form.characters}
            nameSummary={form.nameSummary}
            sketchPreview={form.sketchPreview}
          />
        )}

        <NavigationButtons
          step={step}
          totalSteps={TOTAL_STEPS}
          canProceed={effectiveCanProceed}
          isSubmitting={isSubmitting}
          onPrev={() => setStep("dec")}
          onNext={() => setStep("inc")}
          onSubmit={() => submitProposal(selectedTantouId)}
        />
      </div>
    </div>
  );
}

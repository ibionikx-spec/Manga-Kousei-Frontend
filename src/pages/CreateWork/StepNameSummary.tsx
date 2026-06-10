import { useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { validateImageFile } from "../../utils/validators";
import type { CreateWorkFormData } from "../../types/createWork";

interface StepNameSummaryProps {
  nameSummary: string;
  sketchPreview: string;
  onUpdate: <K extends keyof CreateWorkFormData>(
    key: K,
    value: CreateWorkFormData[K],
  ) => void;
}

export const StepNameSummary = ({
  nameSummary,
  sketchPreview,
  onUpdate,
}: StepNameSummaryProps) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleImageUpload = (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      alert(error);
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    onUpdate("sketchImage", file);
    onUpdate("sketchPreview", previewUrl);
  };

  const removeImage = () => {
    if (sketchPreview) URL.revokeObjectURL(sketchPreview);
    onUpdate("sketchImage", null);
    onUpdate("sketchPreview", "");
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  return (
    <div className="cw-section">
      <h2 className="cw-section__title">Bản Name – Phác thảo ý tưởng</h2>
      <p
        className="cw-section__sub"
        style={{ marginTop: -20, marginBottom: 24 }}
      >
        Cung cấp thông tin về bản Name. Ban Biên tập sẽ đánh giá dựa trên các
        thông tin này.
      </p>
      <div className="cw-field">
        <label>Phác thảo bản Name (hình minh hoạ)</label>
        <div className="cw-image-upload">
          {sketchPreview ? (
            <div className="cw-image-preview">
              <img src={sketchPreview} alt="Phác thảo bản Name" />
              <button
                type="button"
                className="cw-icon-btn cw-icon-btn--danger"
                onClick={removeImage}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              className={`cw-dropzone ${isDragActive ? "cw-dropzone--active" : ""}`}
              onClick={() => document.getElementById("sketch-upload")?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() => setIsDragActive(false)}
              onDrop={onDrop}
            >
              <UploadCloud size={24} />
              <span>
                {isDragActive
                  ? "Thả ảnh vào đây"
                  : "Chọn hoặc kéo thả ảnh phác thảo"}
              </span>
              <input
                id="sketch-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                }}
                hidden
              />
            </div>
          )}
          <p className="cw-upload-hint">Hỗ trợ JPG, PNG, WebP. Tối đa 5MB.</p>
        </div>
      </div>
      <div className="cw-field">
        <label>Tóm tắt nội dung bản Name</label>
        <textarea
          rows={4}
          placeholder="Mô tả sơ lược nội dung chính của bản Name (không bắt buộc)..."
          value={nameSummary}
          onChange={(e) => onUpdate("nameSummary", e.target.value)}
        />
        <span className="char-count">{nameSummary.length} ký tự</span>
      </div>
    </div>
  );
};

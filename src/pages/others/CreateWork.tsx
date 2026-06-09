import { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  BookOpen,
  FileText,
  Users,
  Send,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  UploadCloud,
  Image,
} from "lucide-react";
import "./CreateWork.scss";

interface Character {
  id: number;
  name: string;
  role: string;
  description: string;
}

interface FormData {
  title: string;
  genre: string[];
  targetAudience: string;
  synopsis: string;

  characters: Character[];

  nameSummary: string;
  sketchImage: File | null;
  sketchPreview: string;
}

const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
  "Isekai",
  "Mecha",
  "Psychological",
  "Historical",
  "School",
  "Harem",
  "Reverse Harem",
  "Ecchi",
  "Martial Arts",
  "Gourmet",
  "Cyberpunk",
  "Tragedy",
  "Boys Love",
  "Girls Love",
];

const AUDIENCES = ["Shounen", "Shoujo", "Seinen", "Josei", "All Ages"];

const STEPS = [
  { id: 1, label: "Thông tin Series", icon: BookOpen },
  { id: 2, label: "Nhân vật chính", icon: Users },
  { id: 3, label: "Bản Name", icon: FileText },
  { id: 4, label: "Trình nộp", icon: Send },
];

export default function CreateWork() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [form, setForm] = useState<FormData>({
    title: "",
    genre: [],
    targetAudience: "",
    synopsis: "",
    characters: [{ id: 1, name: "", role: "", description: "" }],
    nameSummary: "",
    sketchImage: null,
    sketchPreview: "",
  });

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleGenre = (g: string) => {
    const cur = form.genre;
    updateField(
      "genre",
      cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g],
    );
  };

  const addCharacter = () =>
    updateField("characters", [
      ...form.characters,
      { id: Date.now(), name: "", role: "", description: "" },
    ]);
  const removeCharacter = (id: number) =>
    updateField(
      "characters",
      form.characters.filter((c) => c.id !== id),
    );
  const updateCharacter = (id: number, key: keyof Character, value: string) =>
    updateField(
      "characters",
      form.characters.map((c) => (c.id === id ? { ...c, [key]: value } : c)),
    );

  const isStep1Valid =
    form.title.trim().length > 0 &&
    form.genre.length > 0 &&
    form.targetAudience !== "" &&
    form.synopsis.trim().length > 0;

  const isStep2Valid = form.characters.every(
    (c) => c.name.trim() && c.role.trim(),
  );

  const isStep3Valid = true;

  const canProceed =
    (step === 1 && isStep1Valid) ||
    (step === 2 && isStep2Valid) ||
    (step === 3 && isStep3Valid) ||
    step === 4;

  const handleSubmit = () => setSubmitted(true);

  const handleImageUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh (jpg, png, webp...)");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    updateField("sketchImage", file);
    updateField("sketchPreview", previewUrl);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const removeImage = () => {
    if (form.sketchPreview) URL.revokeObjectURL(form.sketchPreview);
    updateField("sketchImage", null);
    updateField("sketchPreview", "");
  };

  const resetForm = () => {
    if (form.sketchPreview) URL.revokeObjectURL(form.sketchPreview);
    setSubmitted(false);
    setStep(1);
    setForm({
      title: "",
      genre: [],
      targetAudience: "",
      synopsis: "",
      characters: [{ id: 1, name: "", role: "", description: "" }],
      nameSummary: "",
      sketchImage: null,
      sketchPreview: "",
    });
  };

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
              ID tạm thời: <strong>#DFT-{Math.floor(1 * 9000) + 1000}</strong>
            </span>
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

      <div className="cw-steps">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const state =
            s.id < step ? "done" : s.id === step ? "active" : "upcoming";
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
                  className={`cw-steps__line cw-steps__line--${s.id < step ? "done" : "upcoming"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="cw-body">
        {step === 1 && (
          <div className="cw-section">
            <h2 className="cw-section__title">Thông tin cơ bản</h2>

            <div className="cw-field">
              <label>
                Tên Series <span className="req">*</span>
              </label>
              <input
                type="text"
                placeholder="VD: Kiếm Sĩ Cuối Cùng"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
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
                      className={`cw-pill ${form.targetAudience === a ? "cw-pill--active" : ""}`}
                      onClick={() => updateField("targetAudience", a)}
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
                {GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`cw-pill ${form.genre.includes(g) ? "cw-pill--active" : ""}`}
                    onClick={() => {
                      if (!form.genre.includes(g) && form.genre.length >= 5)
                        return;
                      toggleGenre(g);
                    }}
                    disabled={!form.genre.includes(g) && form.genre.length >= 5}
                  >
                    {g}
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
                value={form.synopsis}
                onChange={(e) => updateField("synopsis", e.target.value)}
              />
              <span className="char-count">{form.synopsis.length} ký tự</span>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="cw-section">
            <div className="cw-section__head">
              <h2 className="cw-section__title">Nhân vật chính</h2>
              <button
                type="button"
                className="cw-btn cw-btn--ghost"
                onClick={addCharacter}
              >
                <Plus size={16} /> Thêm nhân vật
              </button>
            </div>

            <div className="cw-characters">
              {form.characters.map((char, idx) => (
                <div key={char.id} className="cw-char-card">
                  <div className="cw-char-card__header">
                    <span className="cw-char-card__num">NV {idx + 1}</span>
                    {form.characters.length > 1 && (
                      <button
                        type="button"
                        className="cw-icon-btn cw-icon-btn--danger"
                        onClick={() => removeCharacter(char.id)}
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
                        onChange={(e) =>
                          updateCharacter(char.id, "name", e.target.value)
                        }
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
                        onChange={(e) =>
                          updateCharacter(char.id, "role", e.target.value)
                        }
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
                        updateCharacter(char.id, "description", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="cw-section">
            <h2 className="cw-section__title">Bản Name – Phác thảo ý tưởng</h2>
            <p
              className="cw-section__sub"
              style={{ marginTop: -20, marginBottom: 24 }}
            >
              Cung cấp thông tin về bản Name. Ban Biên tập sẽ đánh giá dựa trên
              các thông tin này.
            </p>

            <div className="cw-field">
              <label>Phác thảo bản Name (hình minh hoạ)</label>
              <div className="cw-image-upload">
                {form.sketchPreview ? (
                  <div className="cw-image-preview">
                    <img src={form.sketchPreview} alt="Phác thảo bản Name" />
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
                    onClick={() =>
                      document.getElementById("sketch-upload")?.click()
                    }
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
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
                      onChange={onFileInputChange}
                      hidden
                    />
                  </div>
                )}
                <p className="cw-upload-hint">
                  Hỗ trợ JPG, PNG, WebP. Tối đa 5MB.
                </p>
              </div>
            </div>
            <div className="cw-field">
              <label>Tóm tắt nội dung bản Name</label>
              <textarea
                rows={4}
                placeholder="Mô tả sơ lược nội dung chính của bản Name (không bắt buộc)..."
                value={form.nameSummary}
                onChange={(e) => updateField("nameSummary", e.target.value)}
              />
              <span className="char-count">
                {form.nameSummary.length} ký tự
              </span>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="cw-section">
            <h2 className="cw-section__title">Xem lại & Trình nộp</h2>

            <div className="cw-review">
              <div className="cw-review__block">
                <h3>
                  <BookOpen size={16} /> Thông tin Series
                </h3>
                <div className="cw-review__grid">
                  <span className="label">Tên Series</span>
                  <span className="value">{form.title || "—"}</span>
                  <span className="label">Đối tượng</span>
                  <span className="value">{form.targetAudience || "—"}</span>
                  <span className="label">Thể loại</span>
                  <span className="value">
                    {form.genre.length ? (
                      <div className="cw-tag-row">
                        {form.genre.map((g) => (
                          <span key={g} className="cw-tag">
                            {g}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </span>
                  <span className="label">Tóm tắt</span>
                  <span className="value synopsis">{form.synopsis || "—"}</span>
                </div>
              </div>

              <div className="cw-review__block">
                <h3>
                  <Users size={16} /> Nhân vật ({form.characters.length})
                </h3>
                <div className="cw-review__chars">
                  {form.characters.map((c) => (
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
                  <span className="value synopsis">
                    {form.nameSummary || "—"}
                  </span>
                </div>
              </div>

              {form.sketchPreview && (
                <div className="cw-review__block">
                  <h3>
                    <Image size={16} /> Phác thảo bản Name
                  </h3>
                  <div className="cw-review__image">
                    <img src={form.sketchPreview} alt="phác thảo" />
                  </div>
                </div>
              )}
            </div>

            <div className="cw-notice">
              <AlertCircle size={16} />
              <p>
                Sau khi nộp, bản Name sẽ được chuyển đến hàng đợi xét duyệt của
                Ban Biên tập. Bạn có thể theo dõi tiến trình tại trang{" "}
                <strong>Tác phẩm</strong>.
              </p>
            </div>
          </div>
        )}

        <div className="cw-nav">
          <button
            type="button"
            className="cw-btn cw-btn--outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
          >
            <ChevronLeft size={18} /> Quay lại
          </button>

          <div className="cw-nav__right">
            <span className="cw-nav__hint">
              Bước {step} / {STEPS.length}
            </span>
            {step < 4 ? (
              <button
                type="button"
                className="cw-btn cw-btn--primary"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed}
              >
                Tiếp theo <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="cw-btn cw-btn--submit"
                onClick={handleSubmit}
              >
                <Send size={17} /> Nộp Bản Name
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Check, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { uploadImageToCloudinary } from "../../../../utils/imageUpload";
import {
  fetchGenres,
  updateSeries,
  type GenreOption,
  type MangakaSeries,
} from "../../../../services/mangakaSeriesService";
import "./EditSeriesModal.scss";

interface Props {
  series: MangakaSeries;
  onClose: () => void;
  onSaved: (updated: MangakaSeries) => void;
}

export default function EditSeriesModal({ series, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(series.title);
  const [description, setDescription] = useState(series.description ?? "");
  const [coverPreview, setCoverPreview] = useState<string>(
    series.coverImageUrl ?? "",
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);

  const [genres, setGenres] = useState<GenreOption[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGenres()
      .then((data) => {
        setGenres(data);
        const currentIds = data
          .filter((g) => series.genres.includes(g.name))
          .map((g) => g.id);
        setSelectedGenres(currentIds);
      })
      .catch(console.error);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const toggleGenre = (id: number) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Tên series không được để trống");
      return;
    }
    if (!description.trim()) {
      setError("Mô tả không được để trống");
      return;
    }
    if (selectedGenres.length === 0) {
      setError("Chọn ít nhất 1 thể loại");
      return;
    }

    setError("");
    setSaving(true);

    try {
      let coverImageUrl = series.coverImageUrl ?? undefined;

      if (coverFile) {
        setUploading(true);
        coverImageUrl = await uploadImageToCloudinary(coverFile);
        setUploading(false);
      }

      const updated = await updateSeries(series.seriesId, {
        title: title.trim(),
        description: description.trim(),
        coverImageUrl,
        genreIds: selectedGenres,
      });

      onSaved(updated);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Lưu thất bại, thử lại sau");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  return (
    <div
      className="esm-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="esm-modal">
        <div className="esm-header">
          <h2>Chỉnh sửa Series</h2>
          <button className="esm-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="esm-body">
          <div className="esm-field">
            <label className="esm-label">Ảnh bìa</label>
            <div className="esm-cover-upload">
              <div
                className="esm-cover-preview"
                onClick={() => fileInputRef.current?.click()}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" />
                ) : (
                  <div className="esm-cover-empty">
                    <ImageIcon size={28} strokeWidth={1.25} />
                    <span>Nhấn để chọn ảnh</span>
                  </div>
                )}
                <div className="esm-cover-overlay">
                  <Upload size={20} />
                  <span>Thay ảnh</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <p className="esm-hint">
                Tỉ lệ khuyến nghị 3:4 · JPG, PNG, WebP · Tối đa 5MB
              </p>
            </div>
          </div>

          <div className="esm-field">
            <label className="esm-label">
              Tên series <span className="esm-required">*</span>
            </label>
            <input
              className="esm-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tên series..."
              maxLength={255}
            />
          </div>

          <div className="esm-field">
            <label className="esm-label">
              Mô tả <span className="esm-required">*</span>
            </label>
            <textarea
              className="esm-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn về series..."
              rows={4}
            />
          </div>

          <div className="esm-field">
            <label className="esm-label">
              Thể loại <span className="esm-required">*</span>
              <span className="esm-hint-inline">
                ({selectedGenres.length} đã chọn)
              </span>
            </label>
            {genres.length === 0 ? (
              <div className="esm-genres-loading">
                <Loader2 size={14} className="esm-spin" /> Đang tải...
              </div>
            ) : (
              <div className="esm-genre-grid">
                {genres.map((g) => {
                  const active = selectedGenres.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      className={`esm-genre-chip ${active ? "esm-genre-chip--on" : ""}`}
                      onClick={() => toggleGenre(g.id)}
                    >
                      {active && <Check size={11} />}
                      {g.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && <p className="esm-error">{error}</p>}
        </div>

        <div className="esm-footer">
          <button
            className="esm-btn esm-btn--ghost"
            onClick={onClose}
            disabled={saving}
          >
            Huỷ
          </button>
          <button
            className="esm-btn esm-btn--save"
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="esm-spin" /> Đang upload ảnh...
              </>
            ) : saving ? (
              <>
                <Loader2 size={14} className="esm-spin" /> Đang lưu...
              </>
            ) : (
              <>
                <Check size={14} /> Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

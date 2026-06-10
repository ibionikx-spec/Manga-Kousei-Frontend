export const validateImageFile = (file: File): string | null => {
  if (!file.type.startsWith("image/")) {
    return "Vui lòng chọn file ảnh (jpg, png, webp...)";
  }
  if (file.size > 5 * 1024 * 1024) {
    return "Ảnh không được vượt quá 5MB";
  }
  return null;
};

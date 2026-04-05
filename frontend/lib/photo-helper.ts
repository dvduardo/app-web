export interface Photo {
  id?: string;
  data?: string;
  mimeType?: string;
  file?: File;
}

export function getPhotoSrc(photo: Photo | null | undefined): string {
  if (!photo) return "";

  if (photo.file) {
    return URL.createObjectURL(photo.file);
  }

  if (photo.data) {
    const mimeType = photo.mimeType?.trim() || "image/jpeg";
    return `data:${mimeType};base64,${photo.data}`;
  }

  return "";
}

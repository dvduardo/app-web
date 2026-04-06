export const MAX_ITEM_PHOTO_COUNT = 2;
// Keep below Vercel's function payload ceiling so multipart uploads don't 413 in production.
export const MAX_ITEM_PHOTO_BYTES = 4 * 1024 * 1024;
export const ALLOWED_ITEM_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedItemPhotoType = (typeof ALLOWED_ITEM_PHOTO_TYPES)[number];

export interface UploadablePhoto {
  id?: string;
  data?: string;
  mimeType?: string;
  file?: File;
}

export function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_ITEM_PHOTO_TYPES.includes(file.type as AllowedItemPhotoType)) {
    return "Formato inválido. Use JPEG, PNG, WEBP ou GIF.";
  }

  if (file.size > MAX_ITEM_PHOTO_BYTES) {
    return `Arquivo muito grande. O máximo é ${Math.floor(MAX_ITEM_PHOTO_BYTES / (1024 * 1024))}MB.`;
  }

  return null;
}

export async function optimizeImageFile(file: File): Promise<File> {
  if (typeof window === "undefined") {
    return file;
  }

  if (file.type === "image/gif") {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const maxDimension = 1600;
  const scale = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height)
  );
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const outputType =
    file.type === "image/png" ? "image/png" : "image/jpeg";

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, 0.82);
  });

  if (!blob || blob.size >= file.size) {
    return file;
  }

  const extension = outputType === "image/png" ? "png" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "");

  return new File([blob], `${baseName}.${extension}`, {
    type: outputType,
    lastModified: file.lastModified,
  });
}

export async function buildPhotoPreview(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Falha ao gerar preview da foto"));
    reader.readAsDataURL(file);
  });
}

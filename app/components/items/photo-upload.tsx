"use client";

import Image from "next/image";
import { getPhotoSrc } from "@/lib/photo-helper";
import {
  MAX_ITEM_PHOTO_COUNT,
  UploadablePhoto,
  optimizeImageFile,
  validatePhotoFile,
} from "@/lib/photo-upload";

interface PhotoUploadProps {
  photos: UploadablePhoto[];
  disabled?: boolean;
  onChange: (photos: UploadablePhoto[]) => void;
  onRemove: (photo: UploadablePhoto, index: number) => Promise<void> | void;
  onError: (message: string) => void;
  onPreview?: (index: number) => void;
}

export function PhotoUpload({
  photos,
  disabled = false,
  onChange,
  onRemove,
  onError,
  onPreview,
}: PhotoUploadProps) {
  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const availableSlots = MAX_ITEM_PHOTO_COUNT - photos.length;
    if (availableSlots <= 0) {
      onError(`Máximo ${MAX_ITEM_PHOTO_COUNT} fotos permitidas`);
      return;
    }

    const selectedFiles = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      onError(`Máximo ${MAX_ITEM_PHOTO_COUNT} fotos permitidas`);
    }

    const nextPhotos: UploadablePhoto[] = [];

    for (const file of selectedFiles) {
      const validationError = validatePhotoFile(file);
      if (validationError) {
        onError(validationError);
        continue;
      }

      const optimizedFile = await optimizeImageFile(file);
      nextPhotos.push({
        file: optimizedFile,
        mimeType: optimizedFile.type,
      });
    }

    if (nextPhotos.length > 0) {
      onChange([...photos, ...nextPhotos]);
    }
  };

  return (
    <section className="rounded-[1.75rem] border border-slate-200/70 bg-white/80 p-4 shadow-[0_16px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-800">
            Fotos
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Adicione ate {MAX_ITEM_PHOTO_COUNT} imagens para o item.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {photos.length}/{MAX_ITEM_PHOTO_COUNT}
        </span>
      </div>

      <div className="space-y-4">
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id ?? `photo-${index}`}
                className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
              >
                <button
                  type="button"
                  className="block w-full text-left"
                  onClick={() => onPreview?.(index)}
                  disabled={!onPreview}
                >
                  <Image
                    src={getPhotoSrc(photo)}
                    alt={`Preview ${index + 1}`}
                    width={400}
                    height={240}
                    unoptimized
                    className="h-28 w-full object-cover transition-opacity group-hover:opacity-85 sm:h-36"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => void onRemove(photo, index)}
                  className="absolute right-2 top-2 rounded-full bg-rose-600 px-2 py-1 text-xs font-semibold text-white shadow hover:bg-rose-700"
                  title="Remover foto"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < MAX_ITEM_PHOTO_COUNT && (
          <div className="rounded-[1.5rem] border-2 border-dashed border-slate-300 bg-slate-50/80 p-6">
            <input
              type="file"
              id="photos"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => void handlePhotoChange(event)}
              disabled={disabled}
              className="hidden"
            />
            <label htmlFor="photos" className="block cursor-pointer text-center">
              <div className="text-slate-600">
                <p className="text-sm font-medium">Toque para adicionar imagens</p>
                <p className="mt-1 text-xs text-slate-500">
                  {photos.length}/{MAX_ITEM_PHOTO_COUNT} fotos selecionadas
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  JPEG, PNG, WEBP ou GIF de até 5MB
                </p>
              </div>
            </label>
          </div>
        )}
      </div>
    </section>
  );
}

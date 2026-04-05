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
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Fotos (até {MAX_ITEM_PHOTO_COUNT})
      </label>
      <div className="space-y-4">
        {photos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id ?? `photo-${index}`}
                className="relative group"
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
                    className="w-full h-32 sm:h-40 object-cover rounded-md group-hover:opacity-85 transition-opacity"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => void onRemove(photo, index)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  title="Remover foto"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < MAX_ITEM_PHOTO_COUNT && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              id="photos"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => void handlePhotoChange(event)}
              disabled={disabled}
              className="hidden"
            />
            <label htmlFor="photos" className="block text-center cursor-pointer">
              <div className="text-gray-600">
                <p className="text-sm">Clique para adicionar imagens</p>
                <p className="text-xs text-gray-500 mt-1">
                  {photos.length}/{MAX_ITEM_PHOTO_COUNT} fotos selecionadas
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPEG, PNG, WEBP ou GIF de até 5MB
                </p>
              </div>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

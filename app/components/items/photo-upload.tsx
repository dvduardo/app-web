"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { getPhotoSrc } from "@/lib/photo-helper";
import {
  MAX_ITEM_PHOTO_COUNT,
  MAX_ITEM_PHOTO_BYTES,
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
  const maxPhotoSizeInMb = Math.floor(MAX_ITEM_PHOTO_BYTES / (1024 * 1024));
  const galleryInputId = useId();
  const cameraInputId = useId();
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const processSelectedFiles = async (files: File[]) => {
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

    setIsProcessingFiles(true);

    try {
      for (const file of selectedFiles) {
        const validationError = validatePhotoFile(file);
        if (validationError) {
          onError(validationError);
          continue;
        }

        let optimizedFile = file;
        try {
          optimizedFile = await optimizeImageFile(file);
        } catch {
          onError("Nao foi possivel otimizar a imagem. Vamos usar a original.");
        }

        nextPhotos.push({
          file: optimizedFile,
          mimeType: optimizedFile.type,
        });
      }
    } finally {
      setIsProcessingFiles(false);
    }

    if (nextPhotos.length > 0) {
      onChange([...photos, ...nextPhotos]);
    }
  };

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    await processSelectedFiles(files);
  };

  const isBusy = disabled || isProcessingFiles;
  const isAtLimit = photos.length >= MAX_ITEM_PHOTO_COUNT;
  const disablePickers = isBusy || isAtLimit;

  return (
    <section className="vault-app-panel rounded-[1.75rem] p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-100">
            Fotos
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Adicione ate {MAX_ITEM_PHOTO_COUNT} imagens para o item, com no maximo {maxPhotoSizeInMb}MB por foto.
          </p>
        </div>
        <span className="rounded-full bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-400">
          {photos.length}/{MAX_ITEM_PHOTO_COUNT}
        </span>
      </div>

      <div className="space-y-4">
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id ?? `photo-${index}`}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-[#0a0a14]"
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
                  className="absolute right-2 top-2 rounded-full bg-rose-500/90 px-2 py-1 text-xs font-semibold text-white shadow hover:bg-rose-500"
                  title="Remover foto"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < MAX_ITEM_PHOTO_COUNT && (
          <div className="rounded-[1.5rem] border-2 border-dashed border-indigo-400/18 bg-white/[0.03] p-6">
            <input
              ref={galleryInputRef}
              type="file"
              id={galleryInputId}
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => void handlePhotoChange(event)}
              disabled={disablePickers}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              id={cameraInputId}
              accept="image/*"
              capture="environment"
              onChange={(event) => void handlePhotoChange(event)}
              disabled={disablePickers}
              className="hidden"
            />

            <div className="space-y-4">
              <div className="text-center text-slate-300">
                <p className="text-sm font-medium sm:text-base">
                  Adicione fotos da galeria ou capture uma imagem na hora
                </p>
                <p className="mt-2 text-xs leading-6 text-slate-500 sm:text-sm">
                  No computador, selecione arquivos do dispositivo. No celular, voce pode usar a camera ou escolher imagens ja salvas. Assim que voce confirmar a foto, ela entra direto no card.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    if (galleryInputRef.current) {
                      galleryInputRef.current.value = "";
                      galleryInputRef.current.click();
                    }
                  }}
                  disabled={disablePickers}
                  className="flex min-h-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a14] px-4 text-sm font-semibold text-slate-100 transition hover:border-indigo-300/30 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Escolher fotos
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (cameraInputRef.current) {
                      cameraInputRef.current.value = "";
                      cameraInputRef.current.click();
                    }
                  }}
                  disabled={disablePickers}
                  className="vault-button-primary flex min-h-14 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Tirar foto agora
                </button>
              </div>

              <div className="grid gap-3 text-left sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-white/8 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-slate-100">Galeria ou PC</p>
                  <p className="mt-1 text-xs leading-6 text-slate-500">
                    Envie varias imagens de uma vez e aproveite a compressao automatica antes do upload.
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-white/8 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-slate-100">Captura rapida</p>
                  <p className="mt-1 text-xs leading-6 text-slate-500">
                    Ideal no celular para fotografar o item na hora e seguir preenchendo o cadastro.
                  </p>
                </div>
              </div>

              <div className="text-center text-xs text-slate-500">
                {isProcessingFiles
                  ? "Processando imagem..."
                  : `${photos.length}/${MAX_ITEM_PHOTO_COUNT} fotos selecionadas. JPEG, PNG, WEBP ou GIF de ate ${maxPhotoSizeInMb}MB por foto.`}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

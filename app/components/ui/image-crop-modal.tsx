"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Crop, Move, RotateCcw, Search } from "lucide-react";
import type { ImageCropConfig } from "@/lib/photo-upload";

const DEFAULT_CROP_CONFIG: ImageCropConfig = {
  aspectRatio: 4 / 3,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

interface ImageCropModalProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: (config: ImageCropConfig) => void;
  onSkip: () => void;
}

export function ImageCropModal({
  file,
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  onSkip,
}: ImageCropModalProps) {
  const [cropConfig, setCropConfig] =
    useState<ImageCropConfig>(DEFAULT_CROP_CONFIG);
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !file || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-4 sm:py-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Editar enquadramento da imagem"
    >
      <div className="vault-app-panel flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] text-white shadow-2xl">
        <div className="overflow-y-auto px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-300/18 bg-indigo-400/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-100">
                <Crop className="h-3.5 w-3.5" />
                Ajuste antes de salvar
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold tracking-[-0.04em] text-white">
                Recorte a foto do jeito que ficar melhor no card
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Ajuste zoom e enquadramento. Se preferir, voce tambem pode manter a imagem original.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/8 bg-[#060811] p-4">
              <div className="mx-auto aspect-[4/3] max-w-2xl overflow-hidden rounded-[1.5rem] border border-white/8 bg-black">
                <div className="relative h-full w-full">
                  <Image
                    src={previewUrl}
                    alt="Preview da imagem para recorte"
                    fill
                    unoptimized
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{
                      transform: `scale(${cropConfig.zoom}) translate(${cropConfig.offsetX * 24}%, ${cropConfig.offsetY * 24}%)`,
                      transformOrigin: "center",
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 border-[10px] border-black/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Search className="h-4 w-4" />
                Zoom
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={cropConfig.zoom}
                onChange={(event) =>
                  setCropConfig((currentValue) => ({
                    ...currentValue,
                    zoom: Number(event.target.value),
                  }))
                }
                className="w-full accent-indigo-400"
              />
              <p className="mt-2 text-xs text-slate-500">
                Aproximacao atual: {cropConfig.zoom.toFixed(2)}x
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Move className="h-4 w-4" />
                Enquadramento
              </div>

              <label className="block text-xs font-medium text-slate-400">
                Horizontal
              </label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={cropConfig.offsetX}
                onChange={(event) =>
                  setCropConfig((currentValue) => ({
                    ...currentValue,
                    offsetX: Number(event.target.value),
                  }))
                }
                className="mt-2 w-full accent-indigo-400"
              />

              <label className="mt-4 block text-xs font-medium text-slate-400">
                Vertical
              </label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={cropConfig.offsetY}
                onChange={(event) =>
                  setCropConfig((currentValue) => ({
                    ...currentValue,
                    offsetY: Number(event.target.value),
                  }))
                }
                className="mt-2 w-full accent-indigo-400"
              />
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
              <button
                type="button"
                onClick={() => setCropConfig(DEFAULT_CROP_CONFIG)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0a0a14] px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-indigo-300/30 hover:bg-white/[0.05]"
              >
                <RotateCcw className="h-4 w-4" />
                Resetar ajuste
              </button>
            </div>
          </div>
        </div>
        </div>

        <div className="sticky bottom-0 border-t border-white/8 bg-[#090b15]/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button
              type="button"
              onClick={onSkip}
              className="rounded-2xl border border-white/10 bg-[#0a0a14] px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-indigo-300/30 hover:bg-white/[0.05]"
            >
              Usar imagem original
            </button>
            <button
              type="button"
              onClick={() => onConfirm(cropConfig)}
              className="vault-button-primary rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]"
            >
              Aplicar recorte
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-2xl border border-rose-400/15 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/15 sm:col-span-2 lg:col-span-1"
            >
              Cancelar foto
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

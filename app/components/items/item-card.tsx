"use client";

import Image from "next/image";
import Link from "next/link";
import { Edit, Trash2, Images } from "lucide-react";
import { useState } from "react";
import { getPhotoSrc } from "@/lib/photo-helper";
import { ImageGalleryModal } from "@/app/components/ui/image-gallery-modal";
import { getCategoryTheme } from "@/lib/category-theme";

interface Item {
  id: string;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  title: string;
  description: string | null;
  customData: string;
  photos: Array<{
    id: string;
    data: string;
    mimeType: string;
  }>;
  createdAt: string;
}

export function ItemCard({
  item,
  onDelete,
  viewMode = "grid",
}: {
  item: Item;
  onDelete: (id: string) => void;
  viewMode?: "grid" | "list";
}) {
  const firstPhoto = item.photos?.[0];
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const isListView = viewMode === "list";
  const categoryName = item.category?.name ?? "Sem categoria";
  const categoryTheme = getCategoryTheme(item.category?.name);
  const formattedDate = new Date(item.createdAt).toLocaleDateString("pt-BR");

  return (
    <div
      className={`group overflow-hidden border border-white/70 bg-white/90 transition duration-300 hover:-translate-y-1 ${
        isListView
          ? "flex flex-row items-stretch rounded-[1.5rem] shadow-[0_18px_45px_-34px_rgba(15,23,42,0.55)]"
          : "flex flex-col rounded-[1.75rem] shadow-[0_22px_55px_-35px_rgba(15,23,42,0.45)] hover:shadow-[0_28px_70px_-35px_rgba(15,23,42,0.55)]"
      }`}
    >
      {!isListView && (
        <div
          className="relative h-44 overflow-hidden bg-slate-200 sm:h-52"
          onClick={(e) => {
            e.stopPropagation();
            if (item.photos && item.photos.length > 0) {
              setIsGalleryOpen(true);
            }
          }}
        >
          {firstPhoto ? (
            <>
              <Image
                src={getPhotoSrc(firstPhoto)}
                alt={item.title}
                width={600}
                height={400}
                unoptimized
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                loading="lazy"
              />
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-slate-300" />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/65 to-transparent" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#e2e8f0_0%,#cbd5e1_100%)] text-slate-500">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          <div className="absolute left-3 top-3">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${categoryTheme.badge}`}
            >
              {categoryName}
            </span>
          </div>

          {item.photos && item.photos.length > 0 && (
            <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
              <Images className="h-3.5 w-3.5" />
              {item.photos.length}
            </div>
          )}
        </div>
      )}

      <div
        className={`flex flex-1 ${
          isListView ? "min-w-0 flex-col" : "flex-col"
        }`}
      >
        <div className={`flex flex-1 flex-col ${isListView ? "min-w-0 p-3.5" : "p-4 sm:p-5"}`}>
          {isListView && (
            <div className="mb-2 flex items-center justify-between gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold shadow-sm ${categoryTheme.badge}`}
              >
                {categoryName}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                <Images className="h-3 w-3" />
                {item.photos.length}
              </span>
            </div>
          )}

          <h3 className={`font-semibold text-slate-900 ${isListView ? "line-clamp-1 text-base" : "line-clamp-2 text-lg sm:text-xl"}`}>
            {item.title}
          </h3>
          {item.description && (
            <p className={`text-slate-600 ${isListView ? "mt-1.5 line-clamp-2 text-xs leading-5" : "mt-2 line-clamp-2 text-sm leading-6"}`}>
              {item.description}
            </p>
          )}

          <div className={`flex items-center justify-between text-slate-500 ${isListView ? "mt-2.5 text-[11px]" : "mt-4 text-xs"}`}>
            <span>{formattedDate}</span>
            <span>{item.photos.length} foto(s)</span>
          </div>
        </div>

        <div
          className={`bg-slate-50/90 ${
            isListView
              ? "border-t border-slate-200 px-3 py-2"
              : "border-t border-slate-200"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`flex gap-2 ${isListView ? "" : ""}`}>
            <Link
              href={`/dashboard/item/${item.id}`}
              aria-label={`Editar item ${item.title}`}
              title={`Editar item ${item.title}`}
              className={`flex items-center justify-center gap-2 rounded-2xl bg-slate-900 font-medium text-white transition-colors hover:bg-slate-800 ${isListView ? "flex-1 px-3 py-2 text-xs" : "flex-1 px-3 py-3 text-sm"}`}
            >
              <Edit className="h-4 w-4" />
              <span>{isListView ? "Abrir" : "Editar"}</span>
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              aria-label={`Deletar item ${item.title}`}
              title={`Deletar item ${item.title}`}
              className={`flex items-center justify-center gap-2 rounded-2xl bg-rose-50 font-medium text-rose-700 transition-colors hover:bg-rose-100 ${isListView ? "px-3 py-2 text-xs" : "px-3 py-3 text-sm"}`}
            >
              <Trash2 className="h-4 w-4" />
              <span>{isListView ? "Excluir" : "Deletar"}</span>
            </button>
          </div>
        </div>
      </div>

      <ImageGalleryModal
        isOpen={isGalleryOpen}
        photos={item.photos || []}
        initialIndex={0}
        onClose={() => setIsGalleryOpen(false)}
      />
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { Edit, Trash2, Images, Heart, Star } from "lucide-react";
import { useState } from "react";
import { getPhotoSrc } from "@/lib/photo-helper";
import { ImageGalleryModal } from "@/app/components/ui/image-gallery-modal";
import { getCategoryTheme } from "@/lib/category-theme";
import { getItemStatusMeta } from "@/lib/item-status";
import { useOnline } from "@/hooks/use-online";

interface Item {
  id: string;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  title: string;
  description: string | null;
  status: string;
  isFavorite: boolean;
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
  onToggleFavorite,
  viewMode = "grid",
}: {
  item: Item;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, nextValue: boolean) => void;
  viewMode?: "grid" | "list";
}) {
  const firstPhoto = item.photos?.[0];
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const isListView = viewMode === "list";
  const isOnline = useOnline();
  const categoryName = item.category?.name ?? "Sem categoria";
  const categoryTheme = getCategoryTheme(item.category?.name);
  const statusMeta = getItemStatusMeta(item.status);
  const formattedDate = new Date(item.createdAt).toLocaleDateString("pt-BR");

  return (
    <div
      className={`group overflow-hidden border border-indigo-400/12 bg-[#13131f] transition duration-300 hover:-translate-y-1 ${
        isListView
          ? "flex flex-row items-stretch rounded-[1.5rem] shadow-[0_18px_45px_-34px_rgba(2,6,23,0.8)]"
          : "flex flex-col rounded-[1.75rem] shadow-[0_22px_55px_-35px_rgba(2,6,23,0.75)] hover:shadow-[0_28px_70px_-35px_rgba(2,6,23,0.9)]"
      }`}
    >
      {!isListView && (
        <div
          className="relative h-44 overflow-hidden bg-[#0a0a14] sm:h-52"
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
                <div className="absolute inset-0 animate-pulse bg-slate-800" />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/65 to-transparent" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#1e1b4b_0%,#0f172a_100%)] text-slate-500">
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

          <div className="absolute left-3 top-3 flex max-w-[70%] flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${categoryTheme.badge}`}
            >
              {categoryName}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-sm backdrop-blur ${statusMeta.badgeClassName}`}
            >
              {statusMeta.shortLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(item.id, !item.isFavorite);
            }}
            aria-label={item.isFavorite ? `Remover ${item.title} dos favoritos` : `Favoritar ${item.title}`}
            title={item.isFavorite ? "Remover dos favoritos" : "Favoritar"}
            className={`absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur transition ${
              item.isFavorite
                ? "border-rose-400/30 bg-[#18131e] text-rose-400"
                : "border-white/10 bg-slate-950/45 text-white hover:bg-slate-950/60"
            }`}
          >
            <Heart
              className={`h-4 w-4 transition ${
                item.isFavorite
                  ? "fill-rose-500 text-rose-500"
                  : "text-current"
              }`}
            />
          </button>

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
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold shadow-sm ${categoryTheme.badge}`}
                >
                  {categoryName}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold shadow-sm ${statusMeta.badgeClassName}`}
                >
                  {statusMeta.shortLabel}
                </span>
                {item.isFavorite && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/25 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold text-rose-300 shadow-sm">
                    <Star className="h-3 w-3 fill-current" />
                    Favorito
                  </span>
                )}
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-slate-400">
                <Images className="h-3 w-3" />
                {item.photos.length}
              </span>
            </div>
          )}

          <h3 className={`font-semibold text-slate-100 ${isListView ? "line-clamp-1 text-base" : "line-clamp-2 text-lg sm:text-xl"}`}>
            {item.title}
          </h3>
          {!isListView && item.isFavorite && (
            <div className="mt-2 inline-flex items-center gap-1 self-start rounded-full border border-rose-400/25 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
              <Star className="h-3.5 w-3.5 fill-current" />
              Favorito
            </div>
          )}
          {item.description && (
            <p className={`text-slate-400 ${isListView ? "mt-1.5 line-clamp-2 text-xs leading-5" : "mt-2 line-clamp-2 text-sm leading-6"}`}>
              {item.description}
            </p>
          )}

          <div className={`flex items-center justify-between text-slate-500 ${isListView ? "mt-2.5 text-[11px]" : "mt-4 text-xs"}`}>
            <span>{formattedDate}</span>
            <span>{item.photos.length} foto(s)</span>
          </div>
        </div>

        <div
          className={`bg-[#0d101b] ${
            isListView
              ? "border-t border-white/8 px-3 py-2"
              : "border-t border-white/8"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-2">
            <Link
              href={`/dashboard/item/${item.id}`}
              aria-label={`Editar item ${item.title}`}
              title={`Editar item ${item.title}`}
              className={`flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-700 to-violet-600 font-medium text-white transition-colors hover:from-indigo-600 hover:to-violet-500 ${isListView ? "flex-1 px-3 py-2 text-xs" : "flex-1 px-3 py-3 text-sm"}`}
            >
              <Edit className="h-4 w-4" />
              <span>{isListView ? "Abrir" : "Editar"}</span>
            </Link>
            {isListView && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item.id, !item.isFavorite);
                }}
                aria-label={item.isFavorite ? `Remover ${item.title} dos favoritos` : `Favoritar ${item.title}`}
                title={item.isFavorite ? "Remover dos favoritos" : "Favoritar"}
                className={`flex items-center justify-center rounded-2xl border px-3 py-2 text-xs transition ${
                  item.isFavorite
                    ? "border-rose-400/30 bg-[#18131e] text-rose-400"
                    : "border-white/8 bg-white/3 text-slate-400 hover:bg-white/6"
                }`}
              >
                <Heart
                  className={`h-4 w-4 transition ${item.isFavorite ? "fill-rose-500 text-rose-500" : "text-current"}`}
                />
              </button>
            )}
            {isOnline && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                aria-label={`Deletar item ${item.title}`}
                title={`Deletar item ${item.title}`}
                className={`flex items-center justify-center gap-2 rounded-2xl bg-rose-500/10 font-medium text-rose-300 transition-colors hover:bg-rose-500/15 ${isListView ? "px-3 py-2 text-xs" : "px-3 py-3 text-sm"}`}
              >
                <Trash2 className="h-4 w-4" />
                <span>{isListView ? "Excluir" : "Deletar"}</span>
              </button>
            )}
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

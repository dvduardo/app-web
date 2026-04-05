"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { getPhotoSrc } from "@/frontend/lib/photo-helper";
import { ImageGalleryModal } from "./image-gallery-modal";

interface Item {
  id: string;
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
}: {
  item: Item;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const firstPhoto = item.photos?.[0];
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  return (
    <div 
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden cursor-pointer h-full flex flex-col"
      onClick={() => router.push(`/dashboard/item/${item.id}`)}
    >
      {/* Photo */}
      <div className="h-32 sm:h-40 md:h-48 bg-gray-200 relative overflow-hidden cursor-pointer" onClick={(e) => {
        e.stopPropagation();
        if (item.photos && item.photos.length > 0) {
          setIsGalleryOpen(true);
        }
      }}>
        {firstPhoto ? (
          <>
            <Image
              src={getPhotoSrc(firstPhoto)}
              alt={item.title}
              width={600}
              height={400}
              unoptimized
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-300 animate-pulse" />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
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
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-2">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Foto counter */}
        {item.photos && item.photos.length > 0 && (
          <div className="text-xs text-gray-500 mt-2">
            {item.photos.length} foto(s)
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        className="px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200 flex gap-2 bg-gray-50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => router.push(`/dashboard/item/${item.id}`)}
          aria-label={`Editar item ${item.title}`}
          title={`Editar item ${item.title}`}
          className="flex-1 px-3 py-3 sm:py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center flex items-center justify-center gap-2 transition-colors"
        >
          <Edit className="w-4 h-4" /> <span className="hidden sm:inline">Editar</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          aria-label={`Deletar item ${item.title}`}
          title={`Deletar item ${item.title}`}
          className="px-3 py-3 sm:py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center gap-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Deletar</span>
        </button>
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={isGalleryOpen}
        photos={item.photos || []}
        initialIndex={0}
        onClose={() => setIsGalleryOpen(false)}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getPhotoSrc } from "@/app/lib/photo-helper";

interface Photo {
  id?: string;
  data?: string;
  mimeType?: string;
  file?: File;
}

interface ImageGalleryModalProps {
  isOpen: boolean;
  photos: Photo[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImageGalleryModal({
  isOpen,
  photos,
  initialIndex = 0,
  onClose,
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Update currentIndex when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Handle keyboard navigation and ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, onClose]);

  // Handle touch/swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStart - touchEnd > 75) {
      // Swiped left → next image
      handleNext();
    }
    if (touchEnd - touchStart > 75) {
      // Swiped right → previous image
      handlePrev();
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || photos.length === 0) {
    return null;
  }

  const currentPhoto = photos[currentIndex];
  const photoSrc = getPhotoSrc(currentPhoto);

  return (
    <div
      className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-label="Image gallery"
      aria-modal="true"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Close gallery"
        title="Close (ESC)"
      >
        <X size={32} />
      </button>

      {/* Image container */}
      <div className="flex items-center justify-center w-full h-full px-4">
        <img
          src={photoSrc}
          alt={`Image ${currentIndex + 1} of ${photos.length}`}
          className="max-h-screen max-w-full object-contain"
        />
      </div>

      {/* Navigation arrows */}
      {photos.length > 1 && (
        <>
          {/* Previous button */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 p-2 rounded-full hover:bg-black/30"
            aria-label="Previous image"
            title="Previous (←)"
          >
            <ChevronLeft size={32} />
          </button>

          {/* Next button */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 p-2 rounded-full hover:bg-black/30"
            aria-label="Next image"
            title="Next (→)"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Image counter */}
      {photos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
          {currentIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}

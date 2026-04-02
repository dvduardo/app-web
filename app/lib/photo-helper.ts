/**
 * Helper functions for photo handling and display
 */

export interface Photo {
  id?: string;
  data?: string;
  mimeType?: string;
  file?: File;
}

/**
 * Generates a displayable image src for a photo object
 * Handles both stored photos (from API) and new file uploads
 */
export function getPhotoSrc(photo: Photo | null | undefined): string {
  if (!photo) return "";

  // Priority 1: Try file object (for newly uploaded photos)
  if (photo.file) {
    return URL.createObjectURL(photo.file);
  }

  // Priority 2: Try base64 data with mime type
  if (photo.data) {
    // Ensure mimeType has a value, fallback to image/jpeg
    const mimeType = photo.mimeType?.trim() || "image/jpeg";
    
    // DEBUG: Log if mimeType is empty
    if (!photo.mimeType) {
      console.warn(
        "[getPhotoSrc] Missing mimeType for photo, using fallback 'image/jpeg'",
        { photo }
      );
    }

    // Construct data URL properly
    return `data:${mimeType};base64,${photo.data}`;
  }

  // No data available
  return "";
}

// Rules for uploaded photos. Shared by every feature that takes a photo (events, artists).
export const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // Vercel rejects requests over 4.5 MB

export function checkImage(file: { type: string; size: number }): string | null {
  if (!IMAGE_TYPES[file.type]) return "The photo must be a JPG, PNG, or WebP.";
  if (file.size > MAX_IMAGE_BYTES) return "The photo must be under 4 MB. Try a smaller or more compressed copy.";
  return null;
}

/** Look at the file's first bytes to learn what it really is, instead of trusting the label the browser sent. */
export function sniffImage(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  const at = (i: number, ...b: number[]) => b.every((v, k) => bytes[i + k] === v);
  if (at(0, 0xff, 0xd8, 0xff)) return "image/jpeg";
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return "image/webp";
  return null;
}

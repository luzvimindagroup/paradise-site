"use client";

export type ResizeResult = { file: File; width: number; height: number };

/**
 * Shrink a photo in the browser before it is uploaded: longest side at most `maxEdge` pixels,
 * re-saved as a JPEG. A 10 MB phone photo typically becomes 0.5-1.5 MB, so it fits the upload limit.
 * Honors the phone's rotation so portrait shots don't end up sideways. Throws if the browser can't read the file.
 */
export async function resizeImage(file: File, opts: { maxEdge?: number; quality?: number } = {}): Promise<ResizeResult> {
  const maxEdge = opts.maxEdge ?? 2000;
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.fillStyle = "#000000"; // transparent PNG areas become black (the site is dark)
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", opts.quality ?? 0.85));
  if (!blob) throw new Error("couldn't encode");
  const name = file.name.replace(/\.[^.]+$/, "") || "photo";
  return { file: new File([blob], `${name}.jpg`, { type: "image/jpeg" }), width, height };
}

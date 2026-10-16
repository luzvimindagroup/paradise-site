import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { IMAGE_TYPES, checkImage, sniffImage } from "./validate";

/** Check a chosen photo and store it. Returns the stored file name, or a message to show the person. */
export async function uploadImage(
  db: SupabaseClient,
  bucket: string,
  file: File,
): Promise<{ ok: true; path: string } | { ok: false; message: string }> {
  const problem = checkImage(file);
  if (problem) return { ok: false, message: problem };
  const bytes = await file.arrayBuffer();
  const realType = sniffImage(new Uint8Array(bytes)); // trust the bytes, not the label the browser sent
  if (!realType) return { ok: false, message: "That file isn't a real JPG, PNG, or WebP image." };
  const path = `${crypto.randomUUID()}.${IMAGE_TYPES[realType]}`;
  const { error } = await db.storage.from(bucket).upload(path, bytes, { contentType: realType });
  if (error) return { ok: false, message: "The photo couldn't be uploaded. Please try again." };
  return { ok: true, path };
}

"use client";

import { useState } from "react";
import { resizeImage } from "@/lib/generic/images/resize";

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);

/**
 * File picker that shrinks the chosen photo right away (see resizeImage), so any phone or camera
 * photo works. The shrunken copy replaces the chosen file inside the form.
 */
export function PhotoPicker({ name = "image" }: { name?: string }) {
  const [note, setNote] = useState<{ text: string; bad?: boolean } | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) { setNote(null); return; }
    input.setCustomValidity("Still preparing your photo. Wait a moment, then save."); // blocks Save until done
    setNote({ text: "Preparing your photo…" });
    try {
      const out = await resizeImage(file);
      const dt = new DataTransfer();
      dt.items.add(out.file);
      input.files = dt.files;
      setNote({ text: `Ready: ${out.width}×${out.height}, ${mb(out.file.size)} MB (was ${mb(file.size)} MB).` });
    } catch {
      input.value = "";
      setNote({ text: "Couldn't read that photo. Try a JPG, PNG, or WebP.", bad: true });
    } finally {
      input.setCustomValidity("");
    }
  }

  return (
    <div className="grid gap-2">
      <input
        aria-label="Photo file" type="file" name={name} accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
        className="block w-full text-sm file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-sm file:border-[3px] file:border-ink file:bg-primary file:px-4 file:font-bold file:text-on-primary"
      />
      <p role="status" aria-live="polite" className={`text-sm font-semibold ${note?.bad ? "text-chili" : "text-ink-soft"}`}>
        {note?.text}
      </p>
    </div>
  );
}

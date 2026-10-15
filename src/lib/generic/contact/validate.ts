const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const str = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

export type ContactInput = { category: string; name: string; email: string; message: string; pageUrl: string | null };
export type ContactField = "category" | "name" | "email" | "message";

export function parseContact(
  fd: FormData,
  categories: readonly string[],
): { ok: true; value: ContactInput } | { ok: false; field: ContactField; message: string } {
  const category = str(fd.get("category"), 80);
  const name = str(fd.get("name"), 100);
  const email = str(fd.get("email"), 254);
  const message = str(fd.get("message"), 3000);
  if (!categories.includes(category)) return { ok: false, field: "category", message: "Pick what this is about." };
  if (!name) return { ok: false, field: "name", message: "Add your name." };
  if (!EMAIL.test(email)) return { ok: false, field: "email", message: "Enter a valid email, like you@email.com." };
  if (message.length < 10) return { ok: false, field: "message", message: "Tell us a little more (a sentence or two)." };
  return { ok: true, value: { category, name, email, message, pageUrl: str(fd.get("landing_page"), 200) || null } };
}

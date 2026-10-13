"use server";

export type JoinState =
  | { status: "idle" }
  | { status: "error"; message: string; field?: "email" | "zip" | "consent" }
  | { status: "not_connected"; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ZIP = /^\d{5}$/;

export async function joinList(
  _prev: JoinState,
  formData: FormData,
): Promise<JoinState> {
  const email = String(formData.get("email") ?? "").trim();
  const zip = String(formData.get("zip") ?? "").trim();
  const consent = formData.get("consent") === "on";

  if (!EMAIL.test(email)) {
    return { status: "error", field: "email", message: "Enter a valid email, like you@email.com." };
  }
  if (!ZIP.test(zip)) {
    return { status: "error", field: "zip", message: "Enter your 5-digit ZIP code." };
  }
  if (!consent) {
    return { status: "error", field: "consent", message: "Check the box so we can email you." };
  }

  // TODO(next feature): write to Klaviyo AND the Supabase `subscribers` table,
  // storing consent timestamp, page URL, and UTMs. Nothing is saved yet.
  return {
    status: "not_connected",
    message: "The list isn't open yet, so we haven't saved your email. Please check back soon.",
  };
}

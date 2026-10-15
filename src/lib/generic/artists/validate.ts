import { slugify } from "../slug";
import { parseLinks, type ArtistLink } from "./links";

const str = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

export type ArtistInput = {
  slug: string;
  name: string;
  discipline: string;
  neighborhood: string | null;
  tagline: string | null;
  published: boolean;
  permissionOnFile: boolean;
  permissionDate: string | null;
  imageAlt: string | null;
  removeImage: boolean;
  links: ArtistLink[];
};

/** `today` is YYYY-MM-DD (passed in so the check is testable). */
export function parseArtist(
  fd: FormData,
  opts: { disciplines: readonly string[]; today: string },
): { ok: true; value: ArtistInput } | { ok: false; message: string } {
  const name = str(fd.get("name"), 100);
  if (!name) return { ok: false, message: "Add the artist's name." };
  const slug = slugify(str(fd.get("slug"), 80) || name);
  if (!slug) return { ok: false, message: "The web address needs letters or numbers." };

  const discipline = str(fd.get("discipline"), 40);
  if (!opts.disciplines.includes(discipline)) return { ok: false, message: "Choose a discipline." };

  const permissionOnFile = fd.get("permission_on_file") === "on";
  const dateText = str(fd.get("permission_date"), 10);
  let permissionDate: string | null = null;
  if (permissionOnFile) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText) || Number.isNaN(Date.parse(dateText)) || new Date(dateText).toISOString().slice(0, 10) !== dateText) {
      return { ok: false, message: "Add the date the written permission was given." };
    }
    if (dateText > opts.today) return { ok: false, message: "The permission date can't be in the future." };
    permissionDate = dateText;
  }

  const links = parseLinks((n) => str(fd.get(n), 300));
  if (!links.ok) return { ok: false, message: links.message };

  return {
    ok: true,
    value: {
      slug, name, discipline,
      neighborhood: str(fd.get("neighborhood"), 80) || null,
      tagline: str(fd.get("tagline"), 160) || null,
      published: fd.get("published") === "on",
      permissionOnFile, permissionDate,
      imageAlt: str(fd.get("image_alt"), 200) || null,
      removeImage: fd.get("remove_image") === "on",
      links: links.links,
    },
  };
}

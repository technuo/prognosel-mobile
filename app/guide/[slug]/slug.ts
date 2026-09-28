/**
 * Heading slugifier shared by the heading `id` attributes and the table of
 * contents links in `page.tsx`.
 *
 * Both call sites derive the anchor from the same text through this one
 * function, so a TOC entry can never point at an id that does not exist.
 *
 * Swedish characters are transliterated (å→a, ä→a, ö→o) instead of dropped.
 * The previous inline regex only allowed `[a-z0-9\s-]`, which silently deleted
 * å/ä/ö and produced ids like `hur-stts-spotpriset` while the hand-written toc
 * ids in articles.ts said `hur-satts-spotpriset` — 23 of 28 links were dead.
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 60);
}

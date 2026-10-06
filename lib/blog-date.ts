// lib/blog-date.ts
//
// One place for everything related to the blog "display date".
// The admin picks a date (YYYY-MM-DD) in the form, it's stored in
// Blog.publishedAt as NOON UTC, and every screen shows
// `publishedAt ?? createdAt` formatted in UTC.
//
// Why noon UTC? A bare "2026-10-05" becomes midnight UTC, which shows as
// Oct 4 for visitors west of UTC. Noon UTC is the same calendar day in
// every timezone from UTC-12 to UTC+11, and formatting with timeZone "UTC"
// removes the remaining edge cases.

type DateLike = string | Date | null | undefined;

const DATE_INPUT_RE = /^\d{4}-\d{2}-\d{2}$/;

/** The date readers should see: the chosen publish date, else creation date. */
export function getDisplayDate(blog: {
  publishedAt?: DateLike;
  createdAt: DateLike;
}): DateLike {
  return blog.publishedAt || blog.createdAt;
}

/** "Oct 5, 2026" — always formatted in UTC so the day never shifts. */
export function formatBlogDate(value: DateLike, locale = "en-US"): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Stored date → "YYYY-MM-DD" for <input type="date">. */
export function toDateInputValue(value: DateLike): string {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/** Today in the admin's own timezone, as "YYYY-MM-DD". */
export function todayDateInputValue(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "YYYY-MM-DD" → ISO string at noon UTC (what we send to the API). */
export function dateInputToISO(value: string): string | null {
  if (!DATE_INPUT_RE.test(value)) return null;
  return `${value}T12:00:00.000Z`;
}

/**
 * Server side: decide what to save in publishedAt.
 * - A valid date from the form wins.
 * - Otherwise keep whatever the blog already had (edit mode).
 * - Otherwise, if it's being published now, use "now".
 */
export function resolvePublishedAt(
  input: unknown,
  status: string,
  existing?: Date | null,
): Date | null {
  if (typeof input === "string" && input) {
    const d = new Date(DATE_INPUT_RE.test(input) ? `${input}T12:00:00.000Z` : input);
    if (!isNaN(d.getTime())) return d;
  }
  if (existing) return existing;
  return status === "PUBLISHED" ? new Date() : null;
}
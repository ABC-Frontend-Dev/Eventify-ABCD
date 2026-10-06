// lib/constants.ts

export const PRODUCTION_URL = "https://eventifyentertainment.com";

/**
 * Returns the base URL of the site depending on the environment.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL — works on server AND client (inlined at build time)
 * 2. NEXTAUTH_URL         — server-side only (not exposed to the browser)
 * 3. VERCEL_URL           — auto-set by Vercel deployments
 * 4. localhost:3000       — fallback for local dev
 *
 * Safety net: in a production build, a localhost / raw-IP / placeholder value
 * is never published (sitemap, OG tags, email links) — it falls back
 * to the real domain instead. In `next dev` the configured value is used as-is.
 *
 * NOTE: NEXT_PUBLIC_ values are baked in at build time, so changing one
 * requires a rebuild (npm run build), not just a restart.
 */
export function getSiteUrl(): string {
    const configured =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXTAUTH_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
        "http://localhost:3000";

    // Remove trailing slash if present
    const url = configured.replace(/\/$/, "");

    const isLocalOrIp = /^https?:\/\/(localhost|127\.0\.0\.1|\d{1,3}(\.\d{1,3}){3})(:\d+)?$/i.test(url);
    const isPlaceholder = url.includes("yourdomain.com") || url.includes("yoursite.com");

    if (process.env.NODE_ENV === "production" && (isLocalOrIp || isPlaceholder)) {
        return PRODUCTION_URL;
    }

    return url;
}

export const SITE_CONFIG = {
    get baseUrl() {
        return getSiteUrl();
    },
    name: "Eventify",
    description: "Your event management solution",
    social: {
        instagram: "https://instagram.com/eventify",
    },
} as const;

export function getAbsoluteUrl(path: string = ""): string {
    // Guarantees exactly one slash between the base URL and the path
    const normalized = path && !path.startsWith("/") ? `/${path}` : path;
    return `${getSiteUrl()}${normalized}`;
}

/**
 * Canonical URL for a page — ALWAYS the live domain, in every environment.
 *
 * Use this for canonical tags, and for the canonical value the dashboard saves
 * into the database. Content created while running locally (localhost) must
 * still be saved with the real public URL, otherwise the live page would
 * tell Google its canonical address is localhost.
 */
export function getCanonicalUrl(path: string = ""): string {
    const normalized = path && !path.startsWith("/") ? `/${path}` : path;
    return `${PRODUCTION_URL}${normalized}`;
}
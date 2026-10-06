/**
 * Returns the base URL of the site depending on the environment.
 *
 * Priority:
 * 1. NEXT_PUBLIC_SITE_URL — works on server AND client (inlined at build time)
 * 2. NEXTAUTH_URL         — server-side only (not exposed to the browser)
 * 3. VERCEL_URL           — auto-set by Vercel deployments
 * 4. localhost:3000       — fallback for local dev
 *
 * Local dev:   put NEXT_PUBLIC_SITE_URL=http://localhost:3000 in .env.local
 * AWS test:    NEXT_PUBLIC_SITE_URL=http://43.205.120.67:3000
 * Production:  NEXT_PUBLIC_SITE_URL=https://eventifyentertainment.com
 *
 * NOTE: NEXT_PUBLIC_ values are baked in at build time, so changing one
 * requires a rebuild (npm run build), not just a restart.
 */
export function getSiteUrl(): string {
    const url = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") || "http://localhost:3000";

    // Remove trailing slash if present
    return url.replace(/\/$/, "");
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
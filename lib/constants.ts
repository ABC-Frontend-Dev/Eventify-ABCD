/**
 * Returns the base URL of the site depending on the environment.
 *
 * Priority:
 * 1. NEXTAUTH_URL  — set explicitly in .env for every environment
 * 2. NEXT_PUBLIC_BASE_URL — optional explicit override
 * 3. VERCEL_URL   — auto-set by Vercel deployments
 * 4. localhost:3000 — fallback for local dev
 *
 * NEXTAUTH_URL is already required by next-auth so it's always set.
 * On localhost   → NEXTAUTH_URL=http://localhost:3000
 * On AWS         → NEXTAUTH_URL=http://43.205.120.67:3000
 * On production  → NEXTAUTH_URL=https://eventifyentertainment.com
 */
export function getSiteUrl(): string {
    if (process.env.NEXTAUTH_URL) {
        // Remove trailing slash if present
        return process.env.NEXTAUTH_URL.replace(/\/$/, "");
    }
    if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return "http://localhost:3000";
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
    return `${getSiteUrl()}${path}`;
}

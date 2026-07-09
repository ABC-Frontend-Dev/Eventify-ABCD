// lib/constants.ts

export const SITE_CONFIG = {
    // Automatically detect environment
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",

    name: "Eventify",
    description: "Your event management solution",

    // Social links (optional)
    social: {
        instagram: "https://instagram.com/eventify",
        // Add other social links
    },
} as const;

// Helper function to get absolute URL
export function getAbsoluteUrl(path: string = "") {
    return `${SITE_CONFIG.baseUrl}${path}`;
}

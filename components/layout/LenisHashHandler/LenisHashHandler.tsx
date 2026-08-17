"use client";

import { useLenis } from "lenis/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// Window globals (__lenis, __pendingHash) are declared in /types/global.d.ts.

const HASH_OFFSET = 80;
const HASH_STASH_KEY = "pendingHash";

const stashHash = (hash: string) => {
    if (typeof window === "undefined" || !hash) return;
    window.__pendingHash = hash;
    try {
        sessionStorage.setItem(HASH_STASH_KEY, hash);
    } catch {
        /* private mode / SSR — ignore */
    }
};

const clearStash = () => {
    if (typeof window === "undefined") return;
    window.__pendingHash = undefined;
    try {
        sessionStorage.removeItem(HASH_STASH_KEY);
    } catch {
        /* ignore */
    }
};

const consumeHash = (hash: string) => {
    if (typeof window === "undefined") return;
    if (window.__pendingHash === hash) window.__pendingHash = undefined;
    try {
        sessionStorage.removeItem(HASH_STASH_KEY);
    } catch {
        /* ignore */
    }
    // Deliberately do NOT strip the #hash from the URL here — keep it
    // visible, shareable, and refreshable.
};

/**
 * The ONLY safe way to write a hash into the address bar. Always rebuilds
 * from pathname + search (never window.location.href), so it can never
 * produce a malformed "#a#b".
 */
const setUrlHash = (hash: string) => {
    if (typeof window === "undefined") return;
    history.replaceState(null, "", window.location.pathname + window.location.search + `#${hash}`);
};

export function LenisHashHandler() {
    const lenis = useLenis();
    const pathname = usePathname();
    const router = useRouter();

    /* ── Seed __pendingHash on mount + every route change, and self-heal ──
       a malformed "#a#b" fragment by keeping only the LAST segment. ─────── */
    useEffect(() => {
        const segments = (window.location.hash || "").split("#").filter(Boolean);
        const urlHash = segments[segments.length - 1] || "";

        if (urlHash) {
            if (segments.length > 1) setUrlHash(urlHash); // repair "#blogs#teams" -> "#teams"
            window.__pendingHash = urlHash;
            try {
                sessionStorage.setItem(HASH_STASH_KEY, urlHash);
            } catch {
                /* ignore */
            }
        } else {
            clearStash();
        }
    }, [pathname]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest("a");
            if (!anchor) return;

            const href = anchor.getAttribute("href");
            if (!href) return;

            // First hash segment only — defends against a href that already
            // carries "#a#b".
            const hash = href.includes("#") ? href.split("#")[1] : "";

            if (!hash) {
                clearStash();
                return;
            }

            stashHash(hash);

            const isSamePageHash = href.startsWith("#") || href.startsWith(`${pathname}#`) || (pathname === "/" && href.startsWith("/#"));

            if (isSamePageHash) {
                e.preventDefault();

                const element = document.getElementById(hash);
                if (element && lenis) {
                    lenis.scrollTo(element, {
                        offset: -HASH_OFFSET,
                        duration: 1.2,
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    });
                    setUrlHash(hash); // keep the URL in sync (no appending)
                    consumeHash(hash);
                } else if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                    setTimeout(() => window.scrollBy({ top: -HASH_OFFSET, behavior: "smooth" }), 250);
                    setUrlHash(hash);
                    consumeHash(hash);
                } else {
                    // Same-page intent, but the section lives on "/".
                    router.push(`/#${hash}`);
                }
            }
            // Cross-page branch: do NOT preventDefault. Next.js navigates and
            // the hash lands in the URL naturally.
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [lenis, pathname, router]);

    return null;
}

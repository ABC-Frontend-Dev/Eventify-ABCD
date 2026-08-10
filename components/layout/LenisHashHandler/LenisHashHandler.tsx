"use client";

import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
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

const consumeHash = (hash: string) => {
    if (typeof window === "undefined") return;
    if (window.__pendingHash === hash) window.__pendingHash = undefined;
    try {
        sessionStorage.removeItem(HASH_STASH_KEY);
    } catch {
        /* ignore */
    }
    if (window.location.hash === `#${hash}`) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
    }
};

export function LenisHashHandler() {
    const lenis = useLenis();
    const pathname = usePathname();

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest("a");
            if (!anchor) return;

            const href = anchor.getAttribute("href");
            if (!href || (!href.startsWith("#") && !href.includes("/#"))) return;

            const hash = href.includes("#") ? href.split("#")[1] : "";
            if (!hash) return;

            // Always stash into every source — length matters less than survival.
            stashHash(hash);

            // Treat "current page" extra-leniently so `/` plus `/#…`, `/blog/x`
            // plus `/#…`, and similar all resolve as in-app jumps when the
            // destination id actually lives on `/`.
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
                    consumeHash(hash);
                } else if (element) {
                    // Fallback when lenis hasn't subscribed yet
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                    setTimeout(() => window.scrollBy({ top: -HASH_OFFSET, behavior: "smooth" }), 250);
                    consumeHash(hash);
                }
                // else: hash is stashed; HeroPageLoader (or a manual observer
                // below) will pick it up once both lenis and the element exist.
            }
            // Cross-page branch: do NOT preventDefault. Let Next.js navigate.
            // The hash is already stashed, and `window.location.hash` will
            // naturally contain `#<hash>` on the destination page.
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [lenis, pathname]);

    return null;
}

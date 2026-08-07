"use client";

import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
    interface Window {
        __pendingHash?: string;
    }
}

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

            const isSamePageHash = href.startsWith("#") || href.startsWith(`${pathname}#`) || (pathname === "/" && href.startsWith("/#")) || href.startsWith(`/${hash}`);

            // Cross-page hash (e.g. /blogs/xxx → /#our-services).
            // Don't preventDefault; let Next.js navigate. Stash the hash so
            // HeroPageLoader can pick it up on the destination page.
            if (!isSamePageHash) {
                window.__pendingHash = hash;
                return;
            }

            // Same-page hash: take over and smooth-scroll
            e.preventDefault();

            const element = document.getElementById(hash);

            if (element && lenis) {
                lenis.scrollTo(element, {
                    offset: -80,
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                });
            } else if (element) {
                // Fallback when lenis isn't ready yet
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [lenis, pathname]);

    return null;
}

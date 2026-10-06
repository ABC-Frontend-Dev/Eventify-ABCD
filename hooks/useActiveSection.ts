// hooks/useActiveSection.ts
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Returns the id of the section the visitor is currently reading, or null
 * when they're at the top of the page (the "Home" state).
 *
 * How it decides: a "reading line" sits 35% of the way down the viewport.
 * The active section is the one whose top edge is closest ABOVE that line.
 * This depends only on where things are right now, so it gives the same
 * answer scrolling up or down, for tall and short sections alike, and it
 * doesn't matter what order the ids are listed in.
 *
 * It re-checks on scroll, on resize, and whenever the page height changes —
 * which is what happens when sections like Projects or Clients finish
 * loading their data and push everything below them down.
 */
const READING_LINE = 0.35;

export function useActiveSection(sectionIds: string[]) {
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const pathname = usePathname(); // re-run when navigating back to the home page

    useEffect(() => {
        if (typeof window === "undefined") return;

        let frame = 0;

        const compute = () => {
            frame = 0;
            const line = window.innerHeight * READING_LINE;

            let current: string | null = null;
            let closestTop = -Infinity;

            for (const id of sectionIds) {
                const el = document.getElementById(id);
                if (!el) continue; // section not on this page / not rendered yet

                const top = el.getBoundingClientRect().top;
                if (top <= line && top > closestTop) {
                    closestTop = top;
                    current = id;
                }
            }

            setActiveSection(current); // React ignores it if the value didn't change
        };

        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(compute);
        };

        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);

        // Fires immediately on observe, and again whenever the page grows/shrinks
        // (e.g. a section finishes loading its data).
        const resizeObserver = new ResizeObserver(schedule);
        resizeObserver.observe(document.body);

        schedule();

        return () => {
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            resizeObserver.disconnect();
            if (frame) cancelAnimationFrame(frame);
        };
    }, [sectionIds, pathname]);

    return activeSection;
}
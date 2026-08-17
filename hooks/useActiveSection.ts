"use client";

import { useEffect, useState } from "react";

/**
 * Watches section elements and returns the ID of the section currently
 * most visible near the top of the viewport. Returns null when the hero
 * (top of the page) is in view — i.e. the "Home" state.
 */
export function useActiveSection(sectionIds: string[]) {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        let observer: IntersectionObserver | null = null;
        const observedIds = new Set<string>();

        const setup = () => {
            const sections = sectionIds.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);

            // Skip if we're already observing exactly this set of sections.
            const ids = sections.map((s) => s.id);
            const unchanged = ids.length === observedIds.size && ids.every((id) => observedIds.has(id));
            if (unchanged) return;

            observedIds.clear();
            ids.forEach((id) => observedIds.add(id));

            observer?.disconnect();
            observer = null;

            if (!sections.length) return;

            observer = new IntersectionObserver(
                (entries) => {
                    const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                    if (visible.length > 0) {
                        setActiveSection(visible[0].target.id);
                        return;
                    }

                    // Nothing in the detection band: if every section sits below
                    // it, we're at the hero → Home.
                    const allBelow = sections.every((el) => el.getBoundingClientRect().top > window.innerHeight * 0.3);
                    if (allBelow) setActiveSection(null);
                },
                {
                    threshold: [0, 0.25, 0.5, 0.75, 1],
                    // Bias detection toward the top portion of the viewport.
                    rootMargin: "-20% 0px -60% 0px",
                },
            );

            sections.forEach((section) => observer!.observe(section));
        };

        setup();

        // Sections that fetch data (e.g. `projects`) only render their
        // <section id="…"> AFTER the fetch resolves — after this effect first
        // ran. Watch the DOM and re-observe when a missing section appears.
        const mutationObserver = new MutationObserver(() => {
            const missing = sectionIds.some((id) => !document.getElementById(id));
            if (missing) setup();
        });
        mutationObserver.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer?.disconnect();
            mutationObserver.disconnect();
        };
    }, [sectionIds]);

    return activeSection;
}

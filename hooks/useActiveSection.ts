"use client";

import { useEffect, useState } from "react";

/**
 * Watches section elements and returns the ID of the section
 * currently most visible near the top of the viewport.
 */
export function useActiveSection(sectionIds: string[]) {
    const [activeSection, setActiveSection] = useState<string | null>(null);

    useEffect(() => {
        // Find all section elements
        const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

        if (!sections.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                // Find the entry that's most visible
                const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible.length > 0) {
                    setActiveSection(visible[0].target.id);
                }
            },
            {
                // Trigger when section crosses these viewport thresholds
                threshold: [0, 0.25, 0.5, 0.75, 1],
                // Bias detection toward the top portion of the viewport
                rootMargin: "-20% 0px -60% 0px",
            },
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, [sectionIds]);

    return activeSection;
}

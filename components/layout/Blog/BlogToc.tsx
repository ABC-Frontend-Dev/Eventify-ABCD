// components/layout/Blog/BlogToc.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import clsx from "clsx";

interface Heading {
    id: string;
    text: string;
    level: string;
}

export default function BlogToc() {
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeId, setActiveId] = useState("");
    const tocRef = useRef<HTMLDivElement>(null);
    const hoverIndicatorRef = useRef<HTMLDivElement>(null);
    const activeIndicatorRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<Map<string, HTMLLIElement | null>>(new Map<string, HTMLLIElement | null>());

    useEffect(() => {
        // Only select h2 elements
        const elements = Array.from(document.querySelectorAll(".blog-page-wrapper h2")) as HTMLHeadingElement[];

        const items = elements.map((el, index) => {
            // Generate ID if it doesn't exist
            if (!el.id) {
                const text = el.innerText || "";
                const slug = text
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^\w-]+/g, "");
                el.id = slug || `heading-${index}`;
            }

            return {
                id: el.id,
                text: el.innerText,
                level: el.tagName.toLowerCase(),
            };
        });

        setHeadings(items);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-20% 0px -70% 0px",
            },
        );

        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    // Update active indicator position
    useEffect(() => {
        if (!activeIndicatorRef.current || !tocRef.current || !activeId) return;

        const activeItem = itemsRef.current.get(activeId);
        if (!activeItem) return;

        const tocRect = tocRef.current.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        const position = itemRect.top - tocRect.top;
        const height = itemRect.height;

        activeIndicatorRef.current.style.transform = `translateY(${position}px)`;
        activeIndicatorRef.current.style.height = `${height}px`;
    }, [activeId, headings]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!tocRef.current || !hoverIndicatorRef.current) return;

        const tocRect = tocRef.current.getBoundingClientRect();
        const mouseY = e.clientY - tocRect.top;

        // Find which item is being hovered
        let hoveredItem: HTMLLIElement | null = null;
        for (const item of Array.from(itemsRef.current.values())) {
            if (!item) continue;

            const itemRect = item.getBoundingClientRect();
            const itemTop = itemRect.top - tocRect.top;
            const itemBottom = itemTop + itemRect.height;

            if (mouseY >= itemTop && mouseY <= itemBottom) {
                hoveredItem = item;
                break;
            }
        }

        if (!hoveredItem) return;

        const itemRect = hoveredItem.getBoundingClientRect();
        const position = itemRect.top - tocRect.top;
        const height = itemRect.height;

        hoverIndicatorRef.current.style.opacity = "1";
        hoverIndicatorRef.current.style.transform = `translateY(${position}px)`;
        hoverIndicatorRef.current.style.height = `${height}px`;
    };

    const handleMouseLeave = () => {
        if (hoverIndicatorRef.current) {
            hoverIndicatorRef.current.style.opacity = "0";
        }
    };

    return (
        <div className="">
            <div ref={tocRef} className="relative pl-4" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
                {/* Background scroll indicator */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#D9D9D9] rounded-2xl overflow-hidden" />

                {/* Active indicator (black) */}
                <div
                    ref={activeIndicatorRef}
                    className="absolute left-0 w-[3px] bg-black rounded-2xl transition-all duration-300 ease-out"
                    style={{
                        transform: "translateY(0)",
                        height: "0px",
                    }}
                />

                {/* Hover indicator (light black) */}
                <div
                    ref={hoverIndicatorRef}
                    className="absolute left-0 w-[3px] bg-black/30 rounded-2xl transition-all duration-200 ease-out pointer-events-none"
                    style={{
                        transform: "translateY(0)",
                        height: "0px",
                        opacity: "0",
                    }}
                />

                <ul className="space-y-0">
                    {headings.map((heading) => (
                        <li
                            key={heading.id}
                            ref={(el) => {
                                if (el) {
                                    itemsRef.current.set(heading.id, el);
                                } else {
                                    itemsRef.current.delete(heading.id);
                                }
                            }}
                            className=""
                        >
                            <a
                                href={`#${heading.id}`}
                                className={clsx("transition-all duration-200 block text-footer-bg", activeId === heading.id ? "text-xl font-product-sans-medium" : "text-lg font-product-sans-light")}
                            >
                                {heading.text}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

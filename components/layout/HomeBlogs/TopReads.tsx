// components/blogs/TopReads.tsx
"use client";

import { useRef, useCallback, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";

interface BlogItem {
    id: number;
    href: string;
    image: string;
    alt: string;
    title: string;
    description: string;
}

const BLOGS: BlogItem[] = [
    {
        id: 1,
        href: "/blogs/plan-a-successful-product-launch-event",
        image: "/images/blogs/Blog 1.png",
        alt: "Blog 1",
        title: "Event drive Prepares the Event Managers of Tomorrow",
        description: "The dark cloud is gradually dissipating and we can see the future of our events taking shape. After mor...",
    },
    {
        id: 2,
        href: "/blogs//plan-a-successful-product-launch-event",
        image: "/images/blogs/Rectangle 283.png",
        alt: "Blog 2",
        title: "Event drive Prepares the Event Managers of Tomorrow",
        description: "The dark cloud is gradually dissipating and we can see the future of our events taking shape. After mor...",
    },
    {
        id: 3,
        href: "/blogs/plan-a-successful-product-launch-event",
        image: "/images/blogs/Blog 3.png",
        alt: "Blog 3",
        title: "Event drive Prepares the Event Managers of Tomorrow",
        description: "The dark cloud is gradually dissipating and we can see the future of our events taking shape. After mor...",
    },
    {
        id: 4,
        href: "/blogs/plan-a-successful-product-launch-event",
        image: "/images/blogs/Blog 4.png",
        alt: "Blog 4",
        title: "Event drive Prepares the Event Managers of Tomorrow",
        description: "The dark cloud is gradually dissipating and we can see the future of our events taking shape. After mor...",
    },
];

export default function TopReads() {
    const listRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const handleCardHover = useCallback((index: number, e: React.MouseEvent<HTMLDivElement>) => {
        setHoveredIndex(index);

        const overlay = overlayRef.current;
        const card = e.currentTarget;
        const list = listRef.current;
        if (!overlay || !list) return;

        const listRect = list.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();

        const x = cardRect.left - listRect.left;
        const y = cardRect.top - listRect.top;
        const w = cardRect.width;
        const h = cardRect.height;

        gsap.to(overlay, {
            x,
            y,
            width: w,
            height: h,
            opacity: 1,
            duration: 0.4,
            ease: "power3.out",
        });
    }, []);

    const handleListLeave = useCallback(() => {
        setHoveredIndex(null);
        const overlay = overlayRef.current;
        if (!overlay) return;

        gsap.to(overlay, {
            opacity: 0,
            duration: 0.25,
            ease: "power2.in",
        });
    }, []);

    return (
        <div className="max-w-122.5 w-full relative">
            <h2 className="text-4xl leading-8 font-helvetica-medium tracking-tight text-footer-bg absolute -top-16">Top reads</h2>

            <div ref={listRef} className="relative space-y-1.5" onMouseLeave={handleListLeave}>
                {/* Single floating overlay */}
                <div ref={overlayRef} className="absolute top-0 left-0 z-20 pointer-events-none opacity-0" style={{ willChange: "transform, width, height" }}>
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

                    {hoveredIndex !== null && (
                        <div className="relative w-full h-full flex flex-col items-center justify-center px-5 lg:px-12.75 py-5 lg:py-7.5">
                            <p className="text-center text-base lg:text-xl leading-5.5 lg:leading-6 tracking-wide font-helvetica-medium text-white">{BLOGS[hoveredIndex].title}</p>
                            <p className="mt-5 text-center text-xs lg:text-sm leading-4 lg:leading-4.5 tracking-wider font-helvetica text-white">{BLOGS[hoveredIndex].description}</p>
                        </div>
                    )}
                </div>

                {/* Cards (no individual hover overlays) */}
                {BLOGS.map((blog, index) => (
                    <div key={blog.id} className="blog-card w-full h-41 overflow-hidden relative cursor-pointer" onMouseEnter={(e) => handleCardHover(index, e)}>
                        <Link href={blog.href}>
                            <figure className="w-full h-full">
                                <Image src={blog.image} width={1000} height={1000} alt={blog.alt} className="w-full h-41 object-cover object-center" />
                            </figure>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

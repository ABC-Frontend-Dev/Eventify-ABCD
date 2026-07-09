// components/blogs/TopReads.tsx
"use client";

import { useRef, useCallback, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { GoesOutComesInUnderline } from "@/components/ui/underline-animation";

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
    // const listRef = useRef<HTMLDivElement>(null);
    // const overlayRef = useRef<HTMLDivElement>(null);
    // const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    // const handleCardHover = useCallback((index: number, e: React.MouseEvent<HTMLDivElement>) => {
    //     setHoveredIndex(index);

    //     const overlay = overlayRef.current;
    //     const card = e.currentTarget;
    //     const list = listRef.current;
    //     if (!overlay || !list) return;

    //     const listRect = list.getBoundingClientRect();
    //     const cardRect = card.getBoundingClientRect();

    //     const x = cardRect.left - listRect.left;
    //     const y = cardRect.top - listRect.top;
    //     const w = cardRect.width;
    //     const h = cardRect.height;

    //     gsap.to(overlay, {
    //         x,
    //         y,
    //         width: w,
    //         height: h,
    //         opacity: 1,
    //         duration: 0.4,
    //         ease: "power3.out",
    //     });
    // }, []);

    // const handleListLeave = useCallback(() => {
    //     setHoveredIndex(null);
    //     const overlay = overlayRef.current;
    //     if (!overlay) return;

    //     gsap.to(overlay, {
    //         opacity: 0,
    //         duration: 0.25,
    //         ease: "power2.in",
    //     });
    // }, []);

    return (
        <div className="max-w-122.5 w-full relative">
            <div className="absolute -top-16 w-full flex items-end justify-between">
                <h2 className="shrink-0 text-4xl leading-8 font-helvetica-medium tracking-tight text-footer-bg">Top reads</h2>
                <Link href="/blogs" className="shrink-0 text-base font-helvetica text-primary text-center overflow-hidden max-w-max w-fit block">
                    <GoesOutComesInUnderline label="View All" direction="right" className="" />
                </Link>
            </div>

            <div className="relative space-y-1.5">
                {/* Single floating overlay */}

                {/* Cards (no individual hover overlays) */}
                {BLOGS.map((blog, index) => (
                    <div key={blog.id} className="blog-card group relative w-full h-41 overflow-hidden cursor-pointer">
                        <Link href={blog.href}>
                            <figure className="w-full h-full">
                                <Image
                                    src={blog.image}
                                    width={1000}
                                    height={1000}
                                    alt={blog.alt}
                                    className="w-full h-41 object-cover object-center transition-transform duration-500 group-hover:scale-101"
                                />
                            </figure>

                            <div
                                className="absolute inset-0 z-20 translate-y-full opacity-100 transition-transform duration-500 ease-in-out group-hover:translate-y-0"
                                style={{ willChange: "transform" }}
                            >
                                <div className="relative flex h-full w-full flex-col items-center justify-center bg-black/60 px-5 py-5 lg:px-12.75 lg:py-7.5">
                                    <p className="text-center text-base lg:text-xl leading-5.5 lg:leading-6 tracking-wide font-helvetica-medium text-white">{blog.title}</p>

                                    <p className="mt-5 text-center text-xs lg:text-sm leading-4 lg:leading-4.5 tracking-wider font-helvetica text-white">{blog.description}</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

// components/blogs/FeaturedBlogsCard.tsx
"use client";

import { useRef, useCallback, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { GoesOutComesInUnderline } from "@/components/ui/underline-animation";

export default function FeaturedBlogsCard() {
    const cardRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleEnter = useCallback(() => {
        setIsHovered(true);
        const overlay = overlayRef.current;
        if (!overlay) return;

        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
    }, []);

    const handleLeave = useCallback(() => {
        setIsHovered(false);
        const overlay = overlayRef.current;
        if (!overlay) return;

        gsap.to(overlay, {
            opacity: 0,
            duration: 0.25,
            ease: "power2.in",
        });
    }, []);

    return (
        <div ref={cardRef} className="max-w-3xl max-full lg:min-h-168.5 h-full lg:h-168.5 w-full relative mb-20 lg:mb-0" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            <Link href="blog/the-right-event-management-compnay-in-dubai" className="block">
                <figure className="w-full h-full">
                    <Image src="/images/blogs/Blog image.png" width={1000} height={1000} alt="Blogs Card" className="w-full h-full object-cover object-center" />
                </figure>
            </Link>

            {/* Floating overlay (GSAP animated) */}
            <div ref={overlayRef} className="absolute inset-0 z-10 opacity-0 pointer-events-none" style={{ willChange: "opacity" }}>
                <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
                <div className="relative w-full h-full flex flex-col items-center justify-center px-5 lg:px-7.5 py-5 lg:py-7.5">
                    <p className="text-center text-base lg:text-xl leading-5.5 lg:leading-6 tracking-wide font-helvetica-medium text-white">Event drive Prepares the Event Managers of Tomorrow</p>
                    <p className="absolute px-7.5 w-full bottom-5 left-1/2 -translate-x-1/2 text-center text-xs lg:text-sm leading-4 lg:leading-5 tracking-wider font-helvetica text-white">
                        The dark cloud is gradually dissipating and we can see the future of our events taking shape. After more than a year{" "}
                        <span className="hidden lg:inline-flex">of organizing virtual events you were able to develop ne</span> ...{" "}
                        <span className="">
                            <GoesOutComesInUnderline label="Read More" direction="right" />
                        </span>
                    </p>
                </div>
            </div>

            {/* Make overlay clickable when visible */}
            {isHovered && <Link href="blog/the-right-event-management-compnay-in-dubai" className="absolute inset-0 z-20" />}
        </div>
    );
}

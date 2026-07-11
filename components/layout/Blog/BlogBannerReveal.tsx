"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface BlogBannerRevealProps {
    desktopSrc: string | null;
    mobileSrc: string;
    alt: string;
}

export default function BlogBannerReveal({ desktopSrc, mobileSrc, alt }: BlogBannerRevealProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const desktopWrapRef = useRef<HTMLDivElement>(null);
    const mobileWrapRef = useRef<HTMLDivElement>(null);

    // Resolve: if desktopSrc is null fall back to mobileSrc
    const resolvedDesktopSrc = desktopSrc ?? mobileSrc;

    useEffect(() => {
        const timer = setTimeout(() => {
            const container = containerRef.current;
            const desktopWrap = desktopWrapRef.current;
            const mobileWrap = mobileWrapRef.current;

            if (!container) return;

            const desktopImg = desktopWrap?.querySelector("img");
            const mobileImg = mobileWrap?.querySelector("img");

            const ctx = gsap.context(() => {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: container,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    },
                });

                tl.set(container, { autoAlpha: 1 });

                tl.from(container, {
                    xPercent: -100,
                    duration: 1.5,
                    ease: "power2.out",
                });

                if (desktopImg) {
                    tl.from(
                        desktopImg,
                        {
                            xPercent: 100,
                            scale: 1.3,
                            duration: 1.5,
                            ease: "power2.out",
                        },
                        "<",
                    );
                }

                if (mobileImg) {
                    tl.from(
                        mobileImg,
                        {
                            xPercent: 100,
                            scale: 1.3,
                            duration: 1.5,
                            ease: "power2.out",
                        },
                        "<",
                    );
                }
            }, container);

            return () => ctx.revert();
        }, 150);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="max-w-max w-full h-68.5 lg:h-143.75">
            <figure ref={containerRef} className="invisible h-68.5 lg:h-142.25 w-full overflow-hidden relative">
                {/* Desktop — uses resolvedDesktopSrc (falls back to thumbnail if banner_image is null) */}
                <div ref={desktopWrapRef} className="hidden lg:block w-full h-full overflow-hidden">
                    <Image
                        src={resolvedDesktopSrc}
                        alt={alt}
                        width={1000}
                        height={1000}
                        priority
                        className="h-full w-full object-cover will-change-transform"
                        style={{ transformOrigin: "left center" }}
                    />
                </div>

                {/* Mobile — always uses thumbnail */}
                <div ref={mobileWrapRef} className="block lg:hidden w-full h-full overflow-hidden">
                    <Image src={mobileSrc} alt={alt} width={1000} height={1000} priority className="h-full w-full object-cover will-change-transform" style={{ transformOrigin: "left center" }} />
                </div>
            </figure>
        </div>
    );
}

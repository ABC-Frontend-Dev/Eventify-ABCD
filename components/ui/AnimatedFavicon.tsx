// components/ui/AnimatedFavicon.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ROTATIONS = [-24, 10.5, 0];

/**
 * Detects iOS/iPadOS/macOS — WebKit's text/element baseline rendering differs
 * slightly from Chromium/Windows, which is what causes this element to sit
 * ~3-4px lower than intended on real Apple devices. iPadOS 13+ reports as
 * "MacIntel" in the UA string, so we also check maxTouchPoints to catch that.
 */
function isApplePlatform(): boolean {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isMac = /Macintosh/.test(ua) && !isIOS;
    return isIOS || isMac;
}

export default function AnimatedFavicon() {
    const containerRef = useRef<HTMLUListElement>(null);
    // Default false so SSR/first paint matches non-Apple layout — corrected
    // right after mount once we can read navigator (client-only check).
    const [isApple, setIsApple] = useState(false);

    useEffect(() => {
        setIsApple(isApplePlatform());
    }, []);

    useEffect(() => {
        const bars = containerRef.current?.querySelectorAll("li");
        if (!bars || bars.length === 0) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 60%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse",
                },
            });

            bars.forEach((bar, index) => {
                tl.fromTo(
                    bar,
                    { rotation: 0, transformOrigin: "center center" },
                    {
                        rotation: ROTATIONS[index],
                        duration: 0.6,
                        ease: "power2.out",
                    },
                    index * 0.1, // timeline position (offset), not tween delay
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Same relative offsets as before at every breakpoint, just shifted up an
    // extra ~4px (one Tailwind spacing step) across the board on Apple
    // platforms to compensate for the lower rendering baseline.
    const alignmentClasses = isApple ? "-translate-y-1 md:-translate-y-1 2xl:-translate-y-1" : "translate-y-0 md:-translate-y-0.5 2xl:-translate-y-0.75";

    return (
        <ul ref={containerRef} className={`flex flex-col items-center w-4.25 lg:w-6.25 ${alignmentClasses}`}>
            <li className="block w-full h-0.75 md:h-0.75 lg:h-1.25 mb-1.75 md:mb-2.25 bg-primary"></li>
            <li className="block w-full h-0.75 md:h-0.75 lg:h-1.25 mb-1 bg-primary"></li>
            <li className="block w-full h-0.75 md:h-0.75 lg:h-1.25 mb-0.5 md:mb-0 bg-primary"></li>
        </ul>
    );
}
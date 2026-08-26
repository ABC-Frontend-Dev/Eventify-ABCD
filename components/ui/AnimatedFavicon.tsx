// components/ui/
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ROTATIONS = [-24, 10.5, 0];

export default function AnimatedFavicon() {
    const containerRef = useRef<HTMLUListElement>(null);

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

    return (
        // justify-between  h-4.5 lg:h-7
        <ul ref={containerRef} className="flex flex-col items-center w-4.25 lg:w-6.25 transalte-y-0 md:-translate-y-0.75">
            <li className="block w-full h-0.5 md:h-0.75 lg:h-1.25 mb-1.75 md:mb-2.25 bg-primary"></li>
            <li className="block w-full h-0.5 md:h-0.75 lg:h-1.25 mb-1 bg-primary"></li>
            <li className="block w-full h-0.5 md:h-0.75 lg:h-1.25 mb-0.5 md:mb-0 bg-primary"></li>
        </ul>
    );
}

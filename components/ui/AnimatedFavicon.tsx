// components/ui/
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ROTATIONS = [-8, 10.5, 0];

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
        <ul ref={containerRef} className="flex flex-col items-center justify-between w-6.25 h-6.5">
            <li className="block w-full h-1.25 bg-primary"></li>
            <li className="block w-full h-1.25 bg-primary"></li>
            <li className="block w-full h-1.25 bg-primary"></li>
        </ul>
    );
}

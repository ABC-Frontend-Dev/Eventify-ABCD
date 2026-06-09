"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedFavicon() {
    const containerRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        const bars = containerRef.current?.querySelectorAll("li");

        if (!bars) return;

        gsap.fromTo(
            bars,
            {
                rotation: 0,
                transformOrigin: "center center",
            },
            {
                rotation: (index) => {
                    if (index === 0) return -8;
                    if (index === 1) return 10.5;
                    return 0;
                },
                duration: 0.6,
                ease: "power2.out",
                stagger: 0.1,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse",
                },
            },
        );
    }, []);

    return (
        <ul ref={containerRef} className="flex flex-col items-center justify-between w-6.25 h-6.5">
            <li className="block w-full h-1.25 bg-primary"></li>
            <li className="block w-full h-1.25 bg-primary"></li>
            <li className="block w-full h-1.25 bg-primary"></li>
        </ul>
    );
}

"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface SubHeadingProps {
    title: string;
}

export default function SubHeading({ title }: SubHeadingProps) {
    const textRef = useRef(null);

    useEffect(() => {
        if (!textRef.current) return;

        const split = new SplitText(textRef.current, { type: "chars" });

        // Set initial state with blur and opacity
        gsap.set(split.chars, {
            opacity: 0,
            y: 20,
            filter: "blur(10px)",
        });

        const ctx = gsap.context(() => {
            gsap.to(split.chars, {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.6,
                stagger: 0.03,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: textRef.current,
                    start: "top 80%",
                    end: "top 50%",
                    toggleActions: "play none none reverse",
                },
            });
        }, textRef);

        return () => {
            ctx.revert();
            split.revert();
        };
    }, [title]);

    return (
        <h3
            ref={textRef}
            className="text-xl md:text-2xl lg:text-4xl leading-6 md:leading-7 lg:leading-10 font-helvetica-medium tracking-wider font-bold capitalize text-primary"
            style={{ willChange: "filter" }} // Optimize performance
        >
            {title}
        </h3>
    );
}

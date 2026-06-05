// components/Animations/ScrollReveal.js
"use client";
import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ScrollReveal = ({
    children,
    scrollContainerRef,
    enableBlur = true,
    baseOpacity = 0.1,
    baseRotation = 3,
    blurStrength = 4,
    containerClassName = "",
    textClassName = "",
    rotationEnd = "bottom bottom",
    wordAnimationEnd = "bottom bottom",
}) => {
    const containerRef = useRef(null);

    const splitText = useMemo(() => {
        const text = typeof children === "string" ? children : "";
        return text.split(/(\s+)/).map((word, index) => {
            if (word.match(/^\s+$/)) return word;
            return (
                <span className="inline-block word" key={index}>
                    {word}
                </span>
            );
        });
    }, [children]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const scroller = scrollContainerRef && scrollContainerRef.current ? scrollContainerRef.current : window;
        const wordElements = el.querySelectorAll(".word");

        const ctx = gsap.context(() => {
            gsap.fromTo(
                el,
                { transformOrigin: "0% 50%", rotate: baseRotation },
                {
                    ease: "none",
                    rotate: 0,
                    scrollTrigger: {
                        trigger: el,
                        scroller,
                        start: "top bottom",
                        end: rotationEnd,
                        scrub: 2.8,
                    },
                },
            );

            gsap.fromTo(
                wordElements,
                { opacity: baseOpacity, willChange: "opacity" },
                {
                    ease: "none",
                    opacity: 1,
                    stagger: 0.05,
                    scrollTrigger: {
                        trigger: el,
                        scroller,
                        start: "top bottom-=20%",
                        end: wordAnimationEnd,
                        scrub: 2.8,
                    },
                },
            );

            if (enableBlur) {
                gsap.fromTo(
                    wordElements,
                    { filter: `blur(${blurStrength}px)` },
                    {
                        ease: "none",
                        filter: "blur(0px)",
                        stagger: 0.05,
                        scrollTrigger: {
                            trigger: el,
                            scroller,
                            start: "top bottom-=20%",
                            end: wordAnimationEnd,
                            scrub: 2.8,
                        },
                    },
                );
            }
        }, el);

        return () => {
            return () => ctx.revert();
        };
    }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

    return (
        <span ref={containerRef} className={`my-5 ${containerClassName}`}>
            <span className={` ${textClassName}`}>{splitText}</span>
        </span>
    );
};

export default ScrollReveal;

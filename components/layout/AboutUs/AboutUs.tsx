// components/layout/AboutUs/AboutUs.tsx
"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeadingWithoutLogo from "@/components/common/HeadingWithoutLogo";
import ScrollReveal from "@/components/Animations/ScrollReveal";
import Image from "next/image";
import CardFlip from "@/components/ui/flip-card";

import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

interface SubHeadingProps {
    title: string;
}

interface HeaderDescriptionProps {
    description: string;
    scrollContainerRef: any;
}

// Register GSAP plugins
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

export default function AboutUs() {
    const sectionRef = useRef<HTMLElement>(null);
    const revealContainerRef = useRef<HTMLDivElement>(null);
    const revealImageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        // Small delay to ensure DOM + images are ready
        const timer = setTimeout(() => {
            const ctx = gsap.context(() => {
                // ── Header fade-up ──────────────────────────────────
                const header = sectionRef.current?.querySelector("header");
                if (header) {
                    gsap.fromTo(
                        header,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 1,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: header,
                                start: "top 85%",
                                toggleActions: "play none none none",
                            },
                        },
                    );
                }

                // ── Cards stagger in ────────────────────────────────
                const cards = sectionRef.current?.querySelectorAll(".about-card");
                if (cards?.length) {
                    gsap.fromTo(
                        cards,
                        { opacity: 0, x: -70, scale: 0.92 },
                        {
                            opacity: 1,
                            x: 0,
                            scale: 1,
                            stagger: 0.2,
                            duration: 0.85,
                            ease: "power3.out",
                            scrollTrigger: {
                                trigger: cards[0],
                                start: "top 80%",
                                toggleActions: "play none none reverse",
                            },
                        },
                    );
                }

                const revealContainer = revealContainerRef.current;
                const revealImage = revealImageRef.current;

                if (revealContainer && revealImage) {
                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: revealContainer,
                            toggleActions: "play none none none",
                        },
                    });

                    tl.set(revealContainer, { autoAlpha: 1 });

                    tl.from(revealContainer, {
                        xPercent: -100,
                        duration: 1.5,
                        ease: "power2.out",
                    });

                    // Image slides in from right + starts zoomed, simultaneously
                    tl.from(
                        revealImage,
                        {
                            xPercent: 100,
                            scale: 1.3,
                            duration: 1.5,
                            ease: "power2.out",
                        },
                        "<",
                    );
                }
            }, sectionRef);

            return () => ctx.revert();
        }, 150);

        return () => clearTimeout(timer);
    }, []);

    return (
        <section ref={sectionRef} id="about-us" className="max-w-360 w-full mx-auto px-5 lg:px-20 pt-9 lg:py-9 scroll-mt-14">
            <header className="grid lg:grid-cols-[460px_1fr] gap-10 items-start">
                <SubHeading title="The team behind every celebration" />
                <HeaderDescription
                    description="Eventify is a Dubai-born events company redefining how people experience culture, entertainment, and live moments. Built by industry leaders and creatives who have helped shape the region’s event scene for over two decades, Eventify thrives at the intersection of ideas, energy, and execution."
                    scrollContainerRef={undefined}
                />
            </header>

            {/* ── Content grid ───────────────────────────────────── */}
            <div className="flex items-center justify-center flex-col-reverse lg:flex-row w-full mt-5 lg:mt-9 gap-2.5">
                {/* Left – Cards */}
                <div className="w-full">
                    <div className="space-y-2.5">
                        <CardFlip
                            className="w-full lg:w-[288px] h-51.25 "
                            title="What makes Eventify different is simple, people come back."
                            description="Over the years, Eventify has built lasting relationships with clients who return not just for execution, but for trust, creativity, and a team that genuinely cares about bringing ideas to life. Every project is approached as a partnership, not just an event."
                        />
                        <CardFlip
                            className="w-full lg:w-[288px] h-51.25 "
                            title="Eventify doesn’t believe in one type of experience."
                            description="Whether it’s a high-energy festival, a cultural moment, a corporate experience, or a brand activation, Eventify thrives on variety, constantly evolving and shaping each event around its audience and purpose."
                        />
                        <CardFlip
                            className="w-full lg:w-[288px] h-51.25 "
                            title="Being award-winning is part of the story, but not the goal."
                            description="The real achievement lies in creating moments people remember, conversations that continue long after the lights go down, and experiences that leave a mark on the UAE’s evolving cultural scene."
                        />
                    </div>
                </div>

                {/* Right – Image with wipe-reveal animation */}
                <div className="w-full lg:w-245.5 shrink-0">
                    {/* Outer: clips the reveal. Invisible until GSAP activates it */}
                    <div ref={revealContainerRef} className="invisible relative w-full h-full lg:h-158.75 overflow-hidden">
                        <Image
                            ref={revealImageRef}
                            src="https://res.cloudinary.com/afdhm38k/image/upload/v1784529009/about-us-bg_mfyiiy.png"
                            alt="about us"
                            loading="eager"
                            width={1000}
                            height={1000}
                            className="w-full h-full object-cover will-change-transform"
                            style={{ transformOrigin: "left" }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

export function SubHeading({ title }: SubHeadingProps) {
    const textRef = useRef(null);

    useEffect(() => {
        if (!textRef.current) return;

        // 1. Change type to "words,chars" so words don't break mid-way
        const split = new SplitText(textRef.current, { type: "words,chars" });

        // Set initial state with blur and opacity on the individual characters
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
        /* 2. Added 'break-words' to safely handle container limits if needed */
        <h3 ref={textRef} className="text-2xl lg:text-4xl leading-7 lg:leading-10 font-product-sans-bold font-bold uppercase text-primary break-words pr-16" style={{ willChange: "filter" }}>
            {title}
        </h3>
    );
}

export function HeaderDescription(params: HeaderDescriptionProps) {
    return (
        <p className="mt-2 text-sm lg:text-base font-product-sans-regular leading-5 tracking-wider text-slate-800">
            <ScrollReveal scrollContainerRef={params.scrollContainerRef} baseOpacity={0.1} enableBlur baseRotation={3} blurStrength={4}>
                {params.description}
            </ScrollReveal>
        </p>
    );
}

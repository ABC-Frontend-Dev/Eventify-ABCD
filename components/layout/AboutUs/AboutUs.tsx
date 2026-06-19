// components/layout/AboutUs/AboutUs.tsx
"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeaderDescription from "@/components/common/HeaderDescription";
import HeadingWithoutLogo from "@/components/common/HeadingWithoutLogo";
import Image from "next/image";
import SubHeading from "@/components/common/SubHeading";
import CardFlip from "@/components/ui/flip-card";

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
        <section ref={sectionRef} id="about-us" className="max-w-360 w-full mx-auto px-5 lg:px-20 pt-9 lg:py-9">
            <header>
                <HeadingWithoutLogo title="About Us" />
                <SubHeading title="The team behind every celebration" />
                <HeaderDescription
                    description="Eventify is a Dubai-born events company redefining how people experience culture, entertainment, and live moments. Built by industry leaders and creatives who have helped shape the region's event scene for over two decades, Eventify thrives at the intersection of ideas, energy, and execution."
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
                            title="Being award-winning is part of the story, but not the goal."
                            description="Whether It's A High-Energy Festival, A Cultural Moment, A Corporate Experience, Or A Brand Activation, Eventify Thrives On Variety, Constantly Evolving And Shaping Each Event Around
Its Audience And Purpose."
                        />
                        <CardFlip
                            className="w-full lg:w-[288px] h-51.25 "
                            title="Being award-winning is part of the story, but not the goal."
                            description="Whether It's A High-Energy Festival, A Cultural Moment, A Corporate Experience, Or A Brand Activation, Eventify Thrives On Variety, Constantly Evolving And Shaping Each Event Around
Its Audience And Purpose."
                        />
                        <CardFlip
                            className="w-full lg:w-[288px] h-51.25 "
                            title="Being award-winning is part of the story, but not the goal."
                            description="Whether It's A High-Energy Festival, A Cultural Moment, A Corporate Experience, Or A Brand Activation, Eventify Thrives On Variety, Constantly Evolving And Shaping Each Event Around
Its Audience And Purpose."
                        />
                    </div>
                </div>

                {/* Right – Image with wipe-reveal animation */}
                <div className="w-full lg:w-245.5 shrink-0">
                    {/* Outer: clips the reveal. Invisible until GSAP activates it */}
                    <div ref={revealContainerRef} className="invisible relative w-full h-full lg:h-158.75 overflow-hidden">
                        <Image
                            ref={revealImageRef}
                            src="/images/about-bg.png"
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

"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import ScrollReveal from "@/components/Animations/ScrollReveal";
import Image from "next/image";
import CardFlip from "@/components/ui/flip-card";
import { Loader2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger, SplitText);

// ─── Types ────────────────────────────────────────────────────────────────────

interface AboutUsCard {
    id: number;
    frontFace: string;
    backFace: string;
    sortOrder: number;
}

interface AboutUsData {
    id: number;
    titlePartOne: string;
    titlePartTwo: string | null;
    description: string;
    image: string;
    imageAlt: string | null;
    cards: AboutUsCard[];
}

// ─── SubHeading with GSAP blur animation ─────────────────────────────────────

interface SubHeadingProps {
    part1: string;
    part2?: string | null;
}

function SubHeading({ part1, part2 }: SubHeadingProps) {
    const textRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (!textRef.current || (!part1 && !part2)) return;

        const split = new SplitText(textRef.current, { type: "words,chars" });

        gsap.set(split.chars, { opacity: 0, y: 20, filter: "blur(10px)" });

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
    }, [part1, part2]);

    return (
        //  pr-0 lg:pr-16
        // {/* <br /> */}
        <h3
            ref={textRef}
            className="text-2xl lg:text-5xl xl:text-[56.5px] leading-7 lg:leading-10 xl:leading-11.25 font-helvetica-neue-roman font-normal normal-case text-center text-footer-bg wrap-break-word"
            style={{ willChange: "filter" }}
        >
            {part1}{" "}
            {part2 && (
                <>
                    <span className="text-primary font-abc-laica-a-italic-variable-trial font-semibold normal-case italic">{part2}</span>
                </>
            )}
        </h3>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AboutUs() {
    const sectionRef = useRef<HTMLElement>(null);
    const revealContainerRef = useRef<HTMLDivElement>(null);
    const revealImageRef = useRef<HTMLImageElement>(null);

    const [data, setData] = useState<AboutUsData | null>(null);
    const [loading, setLoading] = useState(true);

    // ── Fetch ─────────────────────────────────────────────────────────────────

    useEffect(() => {
        fetch("/api/about-us")
            .then((r) => r.json())
            .then((res) => {
                if (res.success) setData(res.data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // ── GSAP animations ───────────────────────────────────────────────────────

    useEffect(() => {
        if (!data) return;

        let ctx: gsap.Context | undefined;

        const timer = setTimeout(() => {
            ctx = gsap.context(() => {
                // Header fade-up
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

                // Cards stagger
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

                // Image wipe reveal
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
                    tl.from(revealContainer, { xPercent: -100, duration: 1.5, ease: "power2.out" });
                    tl.from(revealImage, { xPercent: 100, scale: 1.3, duration: 1.5, ease: "power2.out" }, "<");
                }
            }, sectionRef);
        }, 150);

        return () => {
            clearTimeout(timer);
            // Kills the ScrollTriggers whether or not the timeout already fired.
            ctx?.revert();
        };
    }, [data]);
    // ── Loading ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <section id="about-us" className="max-w-360 w-full mx-auto px-3.5 lg:px-20 pt-9 lg:py-9 scroll-mt-1 flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            </section>
        );
    }

    if (!data) return null;

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <section ref={sectionRef} id="about-us" className="max-w-360 w-full mx-auto px-3.5 lg:px-20 pt-9 lg:py-9 scroll-mt-1">
            {/* grid lg:grid-cols-[380px_1fr] gap-y-1 gap-x-10 items-start */}
            <header className="flex items-start gap-16">
                <div className="max-w-36">
                    <Image
                        src={"https://res.cloudinary.com/afdhm38k/image/upload/v1787231866/spotlight_website_left-side_rau405.png"}
                        width={1000}
                        height={1000}
                        className="w-full h-full"
                        alt={"spotlight_website_left-side"}
                    />
                </div>
                <div className="">
                    <h1 className="hidden">Eventify Entertainment</h1>
                    <SubHeading part1={data.titlePartOne} part2={data.titlePartTwo} />
                    <p className="mt-8 text-sm lg:text-base font-helvetica-neue-roman leading-5 tracking-wider text-justify text-slate-800">
                        <ScrollReveal scrollContainerRef={undefined} baseOpacity={0.1} enableBlur baseRotation={3} blurStrength={4}>
                            {data.description}
                        </ScrollReveal>
                    </p>
                </div>
                <div className="max-w-36">
                    <Image
                        src={"https://res.cloudinary.com/afdhm38k/image/upload/v1787231866/spotlight_website_right-side_qqcqsq.png"}
                        width={1000}
                        height={1000}
                        className="w-full h-full"
                        alt={"spotlight_website_left-side"}
                    />
                </div>
            </header>

            {/* ── Content grid ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-center flex-col-reverse lg:flex-row w-full mt-5 lg:mt-5 gap-2.5">
                {/* Left — Flip cards */}
                <div className="w-full">
                    <div className="space-y-2.5 space-x-2.5 flex flex-col md:flex-row lg:flex-col">
                        {data.cards.map((card) => (
                            <CardFlip key={card.id} className="about-card w-full lg:w-[288px] h-48 lg:h-51.25 " title={card.frontFace} description={card.backFace} />
                        ))}
                    </div>
                </div>

                {/* Right — Image with wipe-reveal */}
                <div className="w-full lg:w-200 xl:w-245.5 md:h-100 lg:h-158.75 shrink-0">
                    <div ref={revealContainerRef} className="invisible relative w-full h-full lg:h-158.75 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            ref={revealImageRef}
                            src={data.image}
                            alt={data.imageAlt || "About Us"}
                            loading="eager"
                            className="w-full h-full object-cover will-change-transform"
                            style={{ transformOrigin: "left" }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}

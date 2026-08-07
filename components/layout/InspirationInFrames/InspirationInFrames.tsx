"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SubHeading from "@/components/common/SubHeading";
import Image from "next/image";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

const ITEMS = [
    { id: 1, src: "/images/inspiration-in-frames/Card UI - 1.png" },
    { id: 2, src: "/images/inspiration-in-frames/Card UI - 2.png" },
    { id: 3, src: "/images/inspiration-in-frames/Card UI - 3.png" },
    { id: 4, src: "/images/inspiration-in-frames/Card UI - 4.png" },
    { id: 5, src: "/images/inspiration-in-frames/Card UI - 5.png" },
];

const AUTOPLAY_DELAY = 2500;

// ─── Shared FrameItem ─────────────────────────────────────────────────────────

interface FrameItemProps {
    index: number;
    src: string;
    tall?: boolean;
    onMouseEnter?: (index: number, e: React.MouseEvent<HTMLLIElement>) => void;
}

function FrameItem({ index, src, tall = false, onMouseEnter }: FrameItemProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <li
            className={["frame-item group w-full flex items-center justify-center relative overflow-hidden cursor-pointer", "lg:h-87.5", tall ? "h-48 sm:h-56 md:h-66" : "h-32 sm:h-40 md:h-52"].join(
                " ",
            )}
            onMouseEnter={(e) => {
                setHovered(true);
                onMouseEnter?.(index, e);
            }}
            onMouseLeave={() => setHovered(false)}
        >
            <Image src={src} alt={`Inspiration frame ${index + 1}`} width={1000} height={1000} className="frame-image w-full h-full object-cover will-change-transform" />

            {/* Overlay slides up from bottom */}
            <div
                className="absolute inset-0 z-10 pointer-events-none bg-black/25"
                style={{
                    transform: hovered ? "translateY(0%)" : "translateY(100%)",
                    transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s",
                }}
            />

            {/* Instagram icon */}
            <div
                className="absolute top-1/2 left-1/2 z-30 pointer-events-none"
                style={{
                    transform: hovered ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.5)",
                    opacity: hovered ? 1 : 0,
                    transition: hovered ? "transform 0.45s cubic-bezier(0.22,1,0.36,1) 0.3s, opacity 0.35s ease 0.3s" : "transform 0.25s ease 0s, opacity 0.2s ease 0s",
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 lg:w-10.5 h-7 lg:h-10.5" width="42" height="42" viewBox="0 0 24 24">
                    <path
                        fill="#fff"
                        d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"
                    />
                </svg>
            </div>
        </li>
    );
}

// ─── Tablet Carousel ──────────────────────────────────────────────────────────

function TabletCarousel() {
    const autoplayPlugin = useRef(
        Autoplay({
            delay: AUTOPLAY_DELAY,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            stopOnFocusIn: false,
            playOnInit: true,
        }),
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: "center",
            dragFree: false,
            skipSnaps: false,
            containScroll: false,
        },
        [autoplayPlugin.current],
    );

    const [prevDisabled, setPrevDisabled] = useState(false);
    const [nextDisabled, setNextDisabled] = useState(false);

    const scrollPrev = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollPrev();
        autoplayPlugin.current.reset();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollNext();
        autoplayPlugin.current.reset();
    }, [emblaApi]);

    // Reset autoplay after drag
    useEffect(() => {
        if (!emblaApi) return;
        const onPointerUp = () => {
            setTimeout(() => autoplayPlugin.current.reset(), 50);
        };
        emblaApi.on("pointerUp", onPointerUp);
        return () => {
            emblaApi.off("pointerUp", onPointerUp);
        };
    }, [emblaApi]);

    // Sync button disabled states
    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevDisabled(!emblaApi.canScrollPrev());
        setNextDisabled(!emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    return (
        <div className="relative w-full">
            {/* Embla viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <ul className="flex">
                    {ITEMS.map((item, index) => (
                        <li
                            key={item.id}
                            // 3 slides visible at a time
                            className="flex-[0_0_33.333%] min-w-0 px-0.75"
                        >
                            {/*
                             * We re-use FrameItem but wrap it in a plain <li>
                             * shell so Embla controls the slide width.
                             * FrameItem itself is rendered as a nested <li>
                             * which is fine visually — we override its height.
                             */}
                            <div className="h-84 relative overflow-hidden cursor-pointer group">
                                <FrameItemInner src={item.src} index={index} />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Prev / Next */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-3.25 w-[103%] h-fit flex items-center justify-between pointer-events-none">
                <button
                    onClick={scrollPrev}
                    disabled={prevDisabled}
                    className="pointer-events-auto w-10 h-10 rounded-full bg-white shadow-md cursor-pointer hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group/btn hover:bg-primary disabled:hover:bg-white"
                    aria-label="Previous"
                >
                    <ChevronLeft className="w-5 h-5 text-primary group-hover/btn:text-white transition-colors duration-200" />
                </button>
                <button
                    onClick={scrollNext}
                    disabled={nextDisabled}
                    className="pointer-events-auto w-10 h-10 rounded-full bg-white shadow-md cursor-pointer hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group/btn hover:bg-primary disabled:hover:bg-white"
                    aria-label="Next"
                >
                    <ChevronRight className="w-5 h-5 text-primary group-hover/btn:text-white transition-colors duration-200" />
                </button>
            </div>
        </div>
    );
}

// ─── FrameItemInner (used inside Embla slide div) ─────────────────────────────
// Same hover logic as FrameItem but without the <li> wrapper
// so Embla's slide <li> controls dimensions.

function FrameItemInner({ src, index }: { src: string; index: number }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div className="w-full h-full relative overflow-hidden" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <Image src={src} alt={`Inspiration frame ${index + 1}`} width={1000} height={1000} className="w-full h-full object-cover will-change-transform" />

            {/* Overlay */}
            <div
                className="absolute inset-0 z-10 pointer-events-none bg-black/25"
                style={{
                    transform: hovered ? "translateY(0%)" : "translateY(100%)",
                    transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s",
                }}
            />

            {/* Instagram icon */}
            <div
                className="absolute top-1/2 left-1/2 z-30 pointer-events-none"
                style={{
                    transform: hovered ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.5)",
                    opacity: hovered ? 1 : 0,
                    transition: hovered ? "transform 0.45s cubic-bezier(0.22,1,0.36,1) 0.3s, opacity 0.35s ease 0.3s" : "transform 0.25s ease 0s, opacity 0.2s ease 0s",
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" width="42" height="42" viewBox="0 0 24 24">
                    <path
                        fill="#fff"
                        d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"
                    />
                </svg>
            </div>
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function InspirationInFrames() {
    const sectionRef = useRef<HTMLElement>(null);
    const desktopGridRef = useRef<HTMLUListElement>(null);
    const mobileRow1Ref = useRef<HTMLUListElement>(null);
    const mobileRow2Ref = useRef<HTMLUListElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    const handleCardHover = useCallback((index: number, e: React.MouseEvent<HTMLLIElement>) => {
        const overlay = overlayRef.current;
        const card = e.currentTarget;
        const grid = desktopGridRef.current;
        if (!overlay || !grid) return;

        const gridRect = grid.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();

        gsap.to(overlay, {
            x: cardRect.left - gridRect.left,
            y: cardRect.top - gridRect.top,
            width: cardRect.width,
            height: cardRect.height,
            opacity: 1,
            duration: 0.45,
            ease: "power3.out",
        });
    }, []);

    // ── GSAP scroll reveal (desktop only) ─────────────────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            const ctx = gsap.context(() => {
                // Header
                const header = sectionRef.current?.querySelector("header");
                if (header) {
                    gsap.from(header, {
                        opacity: 0,
                        y: 30,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: header,
                            start: "top 88%",
                            toggleActions: "play none none none",
                        },
                    });
                }

                // Grid reveal helper
                const animateGrid = (grid: HTMLUListElement | null) => {
                    if (!grid) return;
                    const cards = grid.querySelectorAll(".frame-item");
                    if (!cards.length) return;

                    cards.forEach((card, i) => {
                        const img = card.querySelector(".frame-image");
                        if (!img) return;

                        gsap.set(card, { opacity: 0, y: 60 });
                        gsap.set(img, { scale: 1.35 });

                        const tl = gsap.timeline({
                            scrollTrigger: {
                                trigger: grid,
                                start: "top 85%",
                                toggleActions: "play none none none",
                            },
                            onComplete: () => {
                                gsap.set(card, { clearProps: "all" });
                                gsap.set(img, { clearProps: "all" });
                            },
                        });

                        tl.to(card, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, i * 0.1);
                        tl.to(img, { scale: 1, duration: 1.2, ease: "power2.out" }, i * 0.1 + 0.05);
                    });
                };

                animateGrid(desktopGridRef.current);
                animateGrid(mobileRow1Ref.current);
                animateGrid(mobileRow2Ref.current);
            }, sectionRef);

            return () => ctx.revert();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <section ref={sectionRef} className="max-w-360 w-full mx-auto px-5 lg:px-20 pb-9 lg:py-9 scroll-mt-14">
            <header>
                <SubHeading sectionType="SYL" showDescription />
            </header>

            <div className="mt-4 sm:mt-5">
                {/* ── Desktop: 5-col grid (lg+) ── untouched ─────────────── */}
                <ul ref={desktopGridRef} className="hidden lg:grid lg:grid-cols-5 gap-1.5 relative">
                    {ITEMS.map((item, index) => (
                        <FrameItem key={item.id} index={index} src={item.src} onMouseEnter={handleCardHover} />
                    ))}
                </ul>

                {/* ── Tablet: Embla carousel (sm → lg / 640px → 1024px) ── */}
                <div className="hidden sm:block lg:hidden relative">
                    <TabletCarousel />
                </div>

                {/* ── Mobile: bento grid (below sm / below 640px) ── untouched */}
                <div className="flex flex-col gap-1.5 sm:hidden">
                    <ul ref={mobileRow1Ref} className="grid grid-cols-2 gap-1.5">
                        {ITEMS.slice(0, 2).map((item, index) => (
                            <FrameItem key={item.id} index={index} src={item.src} tall />
                        ))}
                    </ul>
                    <ul ref={mobileRow2Ref} className="grid grid-cols-3 gap-1.5">
                        {ITEMS.slice(2).map((item, index) => (
                            <FrameItem key={item.id} index={index + 2} src={item.src} />
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

// components/InspirationInFrames.tsx
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeaderDescription from "@/components/common/HeaderDescription";
import Image from "next/image";
import SubHeading from "@/components/common/SubHeading";

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

export default function InspirationInFrames() {
    const sectionRef = useRef<HTMLElement>(null);
    const desktopGridRef = useRef<HTMLUListElement>(null);
    const mobileRow1Ref = useRef<HTMLUListElement>(null);
    const mobileRow2Ref = useRef<HTMLUListElement>(null);

    // ── Hover overlay state (desktop only) ───────────────
    const overlayRef = useRef<HTMLDivElement>(null);

    const handleCardHover = useCallback((index: number, e: React.MouseEvent<HTMLLIElement>) => {
        const overlay = overlayRef.current;
        const card = e.currentTarget;
        const grid = desktopGridRef.current;
        if (!overlay || !grid) return;

        const gridRect = grid.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();

        // Position overlay relative to the grid
        const x = cardRect.left - gridRect.left;
        const y = cardRect.top - gridRect.top;
        const w = cardRect.width;
        const h = cardRect.height;

        gsap.to(overlay, {
            x,
            y,
            width: w,
            height: h,
            opacity: 1,
            duration: 0.45,
            ease: "power3.out",
        });
    }, []);

    // const handleGridLeave = useCallback(() => {
    //     setHoveredIndex(null);
    //     const overlay = overlayRef.current;
    //     if (!overlay) return;

    //     gsap.to(overlay, {
    //         opacity: 0,
    //         duration: 0.3,
    //         ease: "power2.in",
    //     });
    // }, []);

    // ── Scroll reveal animation ──────────────────────────
    useEffect(() => {
        const timer = setTimeout(() => {
            const ctx = gsap.context(() => {
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

                        tl.to(
                            card,
                            {
                                opacity: 1,
                                y: 0,
                                duration: 0.7,
                                ease: "power3.out",
                            },
                            i * 0.1,
                        );

                        tl.to(
                            img,
                            {
                                scale: 1,
                                duration: 1.2,
                                ease: "power2.out",
                            },
                            i * 0.1 + 0.05,
                        );
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
                <SubHeading title="Inspiration in Frames" />
                <HeaderDescription description="A curated glimpse into our visual world" scrollContainerRef={undefined} />
            </header>

            <div className="mt-5 sm:mt-7.5">
                <ul ref={desktopGridRef} className="hidden lg:grid lg:grid-cols-5 gap-1.5 relative">
                    {/* <div ref={overlayRef} className="absolute top-0 left-0 z-20 pointer-events-none overflow-hidden opacity-0" style={{ willChange: "transform, width, height" }}>
                        <div className="absolute inset-0 bg-black/30 z-30" />

                        {hoveredIndex !== null && (
                            <Image src={ITEMS[hoveredIndex].src} alt={`Inspiration frame ${hoveredIndex + 1}`} width={1000} height={1000} className="w-full h-full object-cover" />
                        )}

                        {hoveredIndex !== null && (
                            <div className="absolute left-2.5 bottom-2.5 z-100 bg-white">
                                <Image src="/images/icons/instagram.png" alt="Instagram" width={1000} height={1000} className="w-10 h-10 object-contain" />
                            </div>
                        )}
                    </div> */}

                    {ITEMS.map((item, index) => (
                        <FrameItem key={item.id} index={index} src={item.src} onMouseEnter={handleCardHover} />
                    ))}
                </ul>

                <div className="flex flex-col gap-1.5 lg:hidden">
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

interface FrameItemProps {
    index: number;
    src: string;
    tall?: boolean;
    onMouseEnter?: (index: number, e: React.MouseEvent<HTMLLIElement>) => void;
}

// Add at top: import { motion, AnimatePresence } from "framer-motion";

function FrameItem({ index, src, tall = false, onMouseEnter }: FrameItemProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <li
            className={["frame-item group w-full flex items-center justify-center relative overflow-hidden cursor-pointer", "lg:h-87.5", tall ? "h-48 sm:h-56" : "h-32 sm:h-40"].join(" ")}
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

            {/* Instagram icon — scales + fades in from center */}
            <div
                className="absolute top-1/2 left-1/2 z-30 pointer-events-none bg-white"
                style={{
                    transform: hovered ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.5)",
                    opacity: hovered ? 1 : 0,
                    transition: hovered ? "transform 0.45s cubic-bezier(0.22,1,0.36,1) 0.3s, opacity 0.35s ease 0.3s" : "transform 0.25s ease 0s, opacity 0.2s ease 0s",
                }}
            >
                <Image src="/images/icons/instagram.png" alt="Instagram" width={1000} height={1000} className="w-6 sm:w-7 md:w-8 lg:w-10 h-6 sm:h-7 md:h-8 lg:h-10 object-contain drop-shadow-lg" />
            </div>

            {/* Lines with stagger */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                {/* Top horizontal */}
                <div
                    className="absolute h-[1.25px] bg-white top-3.5"
                    style={{
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: hovered ? "89%" : "0%",
                        transition: "width 0.65s cubic-bezier(0.22,1,0.36,1) 0.25s",
                    }}
                />
                {/* Bottom horizontal */}
                <div
                    className="absolute h-[1.25px] bg-white bottom-3.5"
                    style={{
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: hovered ? "89%" : "0%",
                        transition: "width 0.65s cubic-bezier(0.22,1,0.36,1) 0.25s",
                    }}
                />
                {/* Left vertical */}
                <div
                    className="absolute w-[1.25px] bg-white left-3.5"
                    style={{
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: hovered ? "91%" : "0%",
                        transition: "height 0.45s cubic-bezier(0.22,1,0.36,1) 0.25s",
                    }}
                />
                {/* Right vertical */}
                <div
                    className="absolute w-[1.25px] bg-white right-3.5"
                    style={{
                        top: "50%",
                        transform: "translateY(-50%)",
                        height: hovered ? "91%" : "0%",
                        transition: "height 0.45s cubic-bezier(0.22,1,0.36,1) 0.25s",
                    }}
                />
            </div>
        </li>
    );
}

"use client";

import { AwardsTabs, AwardsTabsList, TabsTrigger, TabsContent } from "@/components/ui/awards-bottom-tabs";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface AwardImage {
    id: number;
    url: string;
    imageAlt: string;
    title: string;
    description: string;
}

interface AwardCategory {
    id: number;
    name: string;
    icon: string;
    iconAlt: string;
    images: AwardImage[];
}

interface AwardsYearTabContentProps {
    categories: AwardCategory[];
}

const AUTOPLAY_DELAY = 3600; // ms the image stays fully visible before the roll starts
const STRIP_COUNT = 3; // number of vertical strips the roll is split into
const STRIP_ROLL_DURATION = 700; // ms each individual strip takes to roll away
const STRIP_STAGGER = 160; // ms delay added per strip, right strip starts first, left strip starts last
const TOTAL_ROLL_DURATION = STRIP_ROLL_DURATION + STRIP_STAGGER * (STRIP_COUNT - 1);

// ─── Single panel per category ────────────────────────────────────────────────

function AwardYearPanel({ images }: { images: AwardImage[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRolling, setIsRolling] = useState(false);
    const rollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const nextIndex = images.length ? (currentIndex + 1) % images.length : 0;
    const current = images[currentIndex];
    const next = images[nextIndex];

    const advance = useCallback(() => {
        if (images.length < 2) return;
        setIsRolling(true);
        rollTimeoutRef.current = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
            setIsRolling(false);
        }, TOTAL_ROLL_DURATION);
    }, [images.length]);

    useEffect(() => {
        if (images.length < 2) return;
        autoplayRef.current = setInterval(advance, AUTOPLAY_DELAY + TOTAL_ROLL_DURATION);
        return () => {
            if (autoplayRef.current) clearInterval(autoplayRef.current);
        };
    }, [advance, images.length]);

    useEffect(() => {
        return () => {
            if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
        };
    }, []);

    if (!images.length) return null;

    // Strip order left→right = index 0,1,2. Roll starts at the RIGHT strip (index 2)
    // and finishes at the LEFT strip (index 0), so delay decreases as index increases.
    const delayForStrip = (stripIndex: number) => (STRIP_COUNT - 1 - stripIndex) * STRIP_STAGGER;

    return (
        <div className="relative h-full">
            {/* ── Roll carousel ── */}
            <div className="relative w-full h-175 overflow-hidden" style={{ perspective: "1600px" }}>
                {/* Next image sits underneath — revealed as each strip of the current image rolls away */}
                <Image key={`next-${next.id}`} src={next.url} alt={next.imageAlt || next.title} width={1920} height={1080} className="absolute inset-0 w-full h-175 object-cover" />

                {/* Current image, split into vertical strips that roll away right → left */}
                <div key={`current-${current.id}`} className="absolute inset-0 w-full h-175 flex" style={{ transformStyle: "preserve-3d" }}>
                    {Array.from({ length: STRIP_COUNT }).map((_, stripIndex) => (
                        <div
                            key={stripIndex}
                            className={`roll-strip ${isRolling ? "roll-strip-active" : ""}`}
                            style={{
                                width: `${100 / STRIP_COUNT}%`,
                                animationDuration: `${STRIP_ROLL_DURATION}ms`,
                                animationDelay: isRolling ? `${delayForStrip(stripIndex)}ms` : "0ms",
                            }}
                        >
                            <div
                                className="roll-strip-image"
                                style={{
                                    width: `${STRIP_COUNT * 100}%`,
                                    left: `-${stripIndex * 100}%`,
                                }}
                            >
                                <Image src={current.url} alt={current.imageAlt || current.title} width={1920} height={1080} className="w-full h-175 object-cover" priority />
                            </div>
                            {/* shading to sell the cylindrical curve while rolling */}
                            <div className="roll-strip-shade" />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Gradient overlay ── */}
            <div
                className="absolute right-0 bottom-0 w-full h-1/2 z-10 pointer-events-none"
                style={{
                    background: "linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)",
                }}
            />

            {/* ── Title + Description (synced with current slide) ── */}
            {current && (current.title || current.description) && (
                <div className="absolute right-5 bottom-5 z-20 w-51.25">
                    <div key={current.id} className="p-3 bg-white/10 backdrop-blur-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-all duration-500">
                        {current.title && <h3 className="font-helvetica-neue-roman text-base leading-6 text-white">{current.title}</h3>}
                        {current.description && <p className="mt-0.75 font-helvetica text-[13px] leading-4 text-white tracking-wide">{current.description}</p>}
                    </div>
                </div>
            )}

            {/* ── Dot indicators (optional but helpful for UX) ── */}
            {/* {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                    {images.map((_, i) => (
                        <div key={i} className={`rounded-full transition-all duration-300 ${i === currentIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"}`} />
                    ))}
                </div>
            )} */}

            <style jsx global>{`
                .roll-strip {
                    position: relative;
                    height: 100%;
                    overflow: hidden;
                    transform-origin: right center;
                    transform: rotateY(0deg) scaleX(1);
                    backface-visibility: hidden;
                }
                .roll-strip-active {
                    animation-name: roll-away;
                    animation-timing-function: cubic-bezier(0.55, 0, 0.35, 1);
                    animation-fill-mode: forwards;
                }
                .roll-strip-image {
                    position: absolute;
                    top: 0;
                    height: 100%;
                }
                .roll-strip-shade {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to left, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%);
                    opacity: 0;
                    pointer-events: none;
                }
                .roll-strip-active .roll-strip-shade {
                    animation-name: roll-shade;
                    animation-timing-function: cubic-bezier(0.55, 0, 0.35, 1);
                    animation-fill-mode: forwards;
                    animation-duration: inherit;
                    animation-delay: inherit;
                }
                @keyframes roll-away {
                    0% {
                        transform: rotateY(0deg) scaleX(1);
                    }
                    45% {
                        /* fully edge-on, squeezed thin like a tube seen from the side */
                        transform: rotateY(-90deg) scaleX(0.3);
                    }
                    100% {
                        transform: rotateY(-170deg) scaleX(0.9);
                    }
                }
                @keyframes roll-shade {
                    0% {
                        opacity: 0;
                    }
                    45% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0.25;
                    }
                }
            `}</style>
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AwardsYearTabContent({ categories }: AwardsYearTabContentProps) {
    const defaultValue = categories[0]?.id.toString() || "";

    return (
        <AwardsTabs defaultValue={defaultValue}>
            <div className="absolute left-1.25 bottom-1.25 z-100">
                <AwardsTabsList variant="underline">
                    {categories.map((category) => (
                        <TabsTrigger key={category.id} value={category.id.toString()}>
                            <Image src={category.icon} alt={category.iconAlt} width={1000} height={1000} className="h-8 w-auto object-contain" />
                        </TabsTrigger>
                    ))}
                </AwardsTabsList>
            </div>

            {categories.map((category) => (
                <TabsContent key={category.id} value={category.id.toString()}>
                    <AwardYearPanel images={category.images} />
                </TabsContent>
            ))}
        </AwardsTabs>
    );
}

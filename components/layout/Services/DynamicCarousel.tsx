"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
    ReactCompareSlider,
    ReactCompareSliderHandle,
    ReactCompareSliderImage,
    useReactCompareSliderContext,
} from "react-compare-slider";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ComparisonItem {
    id: number;
    title: string;
    beforeImage: string;
    afterImage: string;
    beforeAlt?: string;
    afterAlt?: string;
}

interface DynamicComparisonCarouselProps {
    items: ComparisonItem[];
}

// ─── Nudge handle (identical to your static Carousel.tsx) ─────────────────────

function ComparisonNudgeHandle({ nudgeKey }: { nudgeKey: number }) {
    const { setPosition, isDragging, position } = useReactCompareSliderContext();

    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const proxyRef = useRef<{ value: number }>({ value: 50 });
    const userTookOverRef = useRef(false);

    useEffect(() => {
        proxyRef.current.value = position.current ?? 50;
        userTookOverRef.current = false;

        const tl = gsap
            .timeline({
                onUpdate: () => {
                    if (userTookOverRef.current) return;
                    setPosition(proxyRef.current.value);
                },
            })
            .to(proxyRef.current, { value: 45, duration: 0.45, ease: "sine.inOut" })
            .to(proxyRef.current, { value: 55, duration: 0.45, ease: "sine.inOut" })
            .to(proxyRef.current, { value: 50, duration: 0.4, ease: "sine.out" });

        tlRef.current = tl;
        return () => {
            tl.kill();
            tlRef.current = null;
        };
    }, [nudgeKey, setPosition, position]);

    useEffect(() => {
        if (isDragging && tlRef.current) {
            userTookOverRef.current = true;
            tlRef.current.kill();
            tlRef.current = null;
        }
    }, [isDragging]);

    return <ReactCompareSliderHandle />;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isMobileOrTabletViewport = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1023.98px)").matches;
};

const isCompareSliderTarget = (target: EventTarget | null) => {
    return (
        target instanceof HTMLElement &&
        !!target.closest("[data-compare-slider]")
    );
};

// ─── Carousel ─────────────────────────────────────────────────────────────────

export function DynamicComparisonCarousel({ items }: DynamicComparisonCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: "start",
        containScroll: "trimSnaps",
        dragFree: false,
        watchDrag: (_, evt) => {
            if (
                isMobileOrTabletViewport() &&
                isCompareSliderTarget(evt.target)
            ) {
                return false;
            }
            return true;
        },
    });

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [nudgeKeys, setNudgeKeys] = useState<Record<number, number>>({});

    const containerRef = useRef<HTMLDivElement | null>(null);
    const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
    const hasEnteredRef = useRef(false);

    // ── Embla ─────────────────────────────────────────────────────────────────

    const scrollTo = useCallback(
        (index: number) => {
            if (emblaApi) emblaApi.scrollTo(index);
        },
        [emblaApi],
    );

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
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

    // ── GSAP reveal + nudge ───────────────────────────────────────────────────

    useEffect(() => {
        if (!containerRef.current || items.length === 0) return;

        slidesRef.current = new Array(items.length).fill(null);

        const ctx = gsap.context(() => {
            const validSlides = slidesRef.current.filter(
                Boolean,
            ) as HTMLDivElement[];
            const revealDurations = [1.6, 1.4, 1.8];

            validSlides.forEach((slide, index) => {
                const inner = slide.querySelector(".slide-reveal-inner");
                if (!inner) return;

                gsap.set(inner, {
                    clipPath: "inset(0 0 100% 0)",
                    transformOrigin: "center center",
                });

                gsap.to(inner, {
                    clipPath: "inset(0 0 0% 0)",
                    duration: revealDurations[index] ?? 1.6,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                });
            });

            const fireNudge = () => {
                setNudgeKeys((prev) => {
                    const next = { ...prev };
                    items.forEach((_, i) => {
                        next[i] = (next[i] ?? 0) + 1;
                    });
                    return next;
                });
            };

            ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top bottom",
                end: "bottom top",
                onUpdate: (self) => {
                    const progress = self.progress;
                    const inEnterZone =
                        progress >= 0.15 && progress <= 0.85;
                    const wellOutside =
                        progress < 0.05 || progress > 0.95;

                    if (!hasEnteredRef.current && inEnterZone) {
                        hasEnteredRef.current = true;
                        fireNudge();
                    } else if (hasEnteredRef.current && wellOutside) {
                        hasEnteredRef.current = false;
                    }
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, [items]);

    // ── Empty state ───────────────────────────────────────────────────────────

    if (items.length === 0) {
        return (
            <div className="h-96 sm:h-[500px] lg:h-[600px] bg-slate-100 rounded-xl flex items-center justify-center">
                <p className="text-slate-500">No comparisons available</p>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="relative w-full" ref={containerRef}>
            <div
                className="overflow-hidden border border-slate-200"
                ref={emblaRef}
            >
                <div className="flex">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            ref={(el) => {
                                slidesRef.current[index] = el;
                            }}
                            className="flex-[0_0_100%] first:ml-0 ml-2.5 min-w-0 group lg:flex-[0_0_100%]"
                        >
                            <div className="slide-reveal-inner relative overflow-hidden h-full will-change-[clip-path,transform]">
                                <div className="h-full sm:h-full lg:h-[496.7px] 1-xl:h-[563.83px] relative">
                                    {/* Before label */}
                                    <span className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 px-1.25 sm:px-3.5 py-0.75 sm:py-1.5 bg-black/60 backdrop-blur-sm text-white text-[8px] sm:text-xs font-helvetica sm:font-helvetica-medium tracking-[1.5px] uppercase rounded-full pointer-events-none select-none">
                                        Before
                                    </span>

                                    {/* After label */}
                                    <span className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 px-1.25 sm:px-3.5 py-0.75 sm:py-1.5 bg-black/60 backdrop-blur-sm text-white text-[8px] sm:text-xs font-helvetica sm:font-helvetica-medium tracking-[1.5px] uppercase rounded-full pointer-events-none select-none">
                                        After
                                    </span>

                                    {/* Compare slider */}
                                    <div
                                        data-compare-slider
                                        className="h-full"
                                        style={{ touchAction: "pan-y" }}
                                        onPointerDown={(e) => {
                                            if (isMobileOrTabletViewport())
                                                e.stopPropagation();
                                        }}
                                        onTouchStart={(e) => {
                                            if (isMobileOrTabletViewport())
                                                e.stopPropagation();
                                        }}
                                        onMouseDown={(e) => {
                                            if (isMobileOrTabletViewport())
                                                e.stopPropagation();
                                        }}
                                    >
                                        <ReactCompareSlider
                                            itemOne={
                                                <ReactCompareSliderImage
                                                    src={item.beforeImage}
                                                    alt={
                                                        item.beforeAlt ||
                                                        `${item.title} — Before`
                                                    }
                                                />
                                            }
                                            itemTwo={
                                                <ReactCompareSliderImage
                                                    src={item.afterImage}
                                                    alt={
                                                        item.afterAlt ||
                                                        `${item.title} — After`
                                                    }
                                                />
                                            }
                                            handle={
                                                <ComparisonNudgeHandle
                                                    nudgeKey={
                                                        nudgeKeys[index] ?? 0
                                                    }
                                                />
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tab buttons */}
            {items.length > 1 && (
                <div className="mt-3 relative z-0 flex lg:justify-start backdrop-blur-sm">
                    <div className="flex justify-center w-full gap-1 lg:w-full">
                        {items.map((item, index) => (
                            <button
                                key={`dot-${index}`}
                                onClick={() => scrollTo(index)}
                                className={`relative pointer-events-auto transition-colors duration-300 leading-0 h-8.5 border w-8.5 overflow-hidden rounded-full ${
                                    index === selectedIndex
                                        ? "bg-primary border-primary"
                                        : "bg-white border-slate-300"
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            >
                                <span
                                    className={`absolute inset-0 flex items-center justify-center font-helvetica text-footer-bg transition-opacity duration-300 ${
                                        index === selectedIndex
                                            ? "opacity-0"
                                            : "opacity-100"
                                    }`}
                                >
                                    {item.title}
                                </span>
                                <span
                                    className={`absolute inset-0 flex items-center justify-center font-helvetica-neue-roman text-white transition-opacity duration-300 ${
                                        index === selectedIndex
                                            ? "opacity-100"
                                            : "opacity-0"
                                    }`}
                                >
                                    {item.title}
                                </span>
                                <span className="invisible font-helvetica">
                                    {item.title}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ReactCompareSlider, ReactCompareSliderHandle, ReactCompareSliderImage, useReactCompareSliderContext } from "react-compare-slider";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface ComparisonItem {
    id: number;
    title: string;
    beforeImage: string;
    afterImage: string;
}

/**
 * Custom handle that runs the GSAP "drag me" nudge animation.
 * It must be a child of `<ReactCompareSlider>` so it can read the slider's context —
 * passing it via the `handle` prop is the supported way to do that.
 */
function ComparisonNudgeHandle({ nudgeKey }: { nudgeKey: number }) {
    const { setPosition, isDragging, position } = useReactCompareSliderContext();

    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const proxyRef = useRef<{ value: number }>({ value: 50 });
    const userTookOverRef = useRef(false);

    // (Re-)create the nudge timeline whenever the parent bumps `nudgeKey`
    useEffect(() => {
        // Begin from wherever the slider was left — feels less jarring than always snapping to 50
        proxyRef.current.value = position.current ?? 50;
        userTookOverRef.current = false;

        const tl = gsap
            .timeline({
                onUpdate: () => {
                    if (userTookOverRef.current) return;
                    setPosition(proxyRef.current.value);
                },
            })
            // Two full left→right cycles from center, 25% amplitude (within 20–30% spec)
            .to(proxyRef.current, { value: 45, duration: 0.45, ease: "sine.inOut" })
            .to(proxyRef.current, { value: 55, duration: 0.45, ease: "sine.inOut" })
            .to(proxyRef.current, { value: 50, duration: 0.4, ease: "sine.out" });
        // .to(proxyRef.current, { value: 25, duration: 0.45, ease: "sine.inOut" })
        // .to(proxyRef.current, { value: 75, duration: 0.45, ease: "sine.inOut" })
        // .to(proxyRef.current, { value: 50, duration: 0.4, ease: "sine.out" });

        tlRef.current = tl;

        return () => {
            tl.kill();
            tlRef.current = null;
        };
    }, [nudgeKey, setPosition, position]);

    // If the user grabs the handle mid-tween, kill the animation so they drive cleanly
    useEffect(() => {
        if (isDragging && tlRef.current) {
            userTookOverRef.current = true;
            tlRef.current.kill();
            tlRef.current = null;
        }
    }, [isDragging]);

    return <ReactCompareSliderHandle />;
}

export function ComparisonCarousel() {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: "start",
        containScroll: "trimSnaps",
        dragFree: false,
    });

    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [items, setItems] = useState<ComparisonItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [nudgeKeys, setNudgeKeys] = useState<Record<number, number>>({});

    const containerRef = useRef<HTMLDivElement | null>(null);
    const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
    // Tracks whether the section is currently considered "entered" for nudge purposes.
    // Paired with the hysteresis gap in the ScrollTrigger below so a few px of scroll
    // jitter right at the boundary can't flip this back and forth.
    const hasEnteredRef = useRef(false);

    // Fetch comparisons from API
    useEffect(() => {
        const fetchComparisons = async () => {
            try {
                const response = await fetch("/api/comparisons");
                const data = await response.json();
                if (data.success) {
                    setItems(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch comparisons:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchComparisons();
    }, []);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const scrollTo = useCallback(
        (index: number) => {
            if (emblaApi) emblaApi.scrollTo(index);
        },
        [emblaApi],
    );

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setPrevBtnDisabled(!emblaApi.canScrollPrev());
        setNextBtnDisabled(!emblaApi.canScrollNext());
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

    // Scroll-in reveal + nudge replay on re-entry
    useEffect(() => {
        if (!containerRef.current || items.length === 0) return;

        slidesRef.current = new Array(items.length).fill(null) as (HTMLDivElement | null)[];

        const ctx = gsap.context(() => {
            const validSlides = slidesRef.current.filter(Boolean) as HTMLDivElement[];
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

            // Progress-based trigger with hysteresis: the "enter" zone (0.15–0.85)
            // and the "reset" zone (<0.05 or >0.95) are kept well apart so a small
            // 10–20px wheel jitter near one boundary can never also cross the other.
            // Without this gap, onEnter/onLeaveBack would ping-pong on tiny scrolls
            // and replay the nudge every time the user nudged the wheel at all —
            // now it only fires once when genuinely entering from top or bottom,
            // and re-arms only once the section has scrolled well clear of the viewport.
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top bottom", // progress 0 → container top hits viewport bottom
                end: "bottom top", // progress 1 → container bottom hits viewport top
                onUpdate: (self) => {
                    const progress = self.progress;
                    const ENTER_LOW = 0.15; // roughly matches old "top 85%"
                    const ENTER_HIGH = 0.85; // roughly matches old "bottom 15%"
                    const RESET_LOW = 0.05; // must scroll well clear before re-arming
                    const RESET_HIGH = 0.95;

                    const inEnterZone = progress >= ENTER_LOW && progress <= ENTER_HIGH;
                    const wellOutside = progress < RESET_LOW || progress > RESET_HIGH;

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

    if (loading) {
        return <div className="h-96 sm:h-[500px] lg:h-[600px] bg-slate-200 rounded-xl animate-pulse" />;
    }

    if (items.length === 0) {
        return (
            <div className="h-96 sm:h-[500px] lg:h-[600px] bg-slate-100 rounded-xl flex items-center justify-center">
                <p className="text-slate-500">No comparisons available</p>
            </div>
        );
    }

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="overflow-hidden border border-slate-200" ref={emblaRef}>
                <div className="flex">
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            ref={(el) => {
                                slidesRef.current[index] = el;
                            }}
                            className="flex-[0_0_100%] first:ml-0 ml-2.5 min-w-0 group sm:flex-[0_0_50%] lg:flex-[0_0_100%]"
                        >
                            <div className="slide-reveal-inner relative overflow-hidden h-full will-change-[clip-path,transform]">
                                <div className="h-full sm:h-[500px] lg:h-[600px] relative">
                                    <span
                                        className="
                                           absolute top-2 sm:top-4 left-2 sm:left-4 z-20
                                            px-1.25 sm:px-3.5 py-0.75 sm:py-1.5
                                            bg-black/60 backdrop-blur-sm
                                            text-white
                                            text-[8px] sm:text-xs font-helvetica sm:font-helvetica-medium
                                            tracking-[1.5px] uppercase
                                            rounded-full
                                            pointer-events-none select-none
                                        "
                                    >
                                        Before
                                    </span>
                                    <span
                                        className="
                                            absolute top-2 sm:top-4 right-2 sm:right-4 z-20
                                            px-1.25 sm:px-3.5 py-0.75 sm:py-1.5
                                            bg-black/60 backdrop-blur-sm
                                            text-white
                                            text-[8px] sm:text-xs font-helvetica sm:font-helvetica-medium
                                            tracking-[1.5px] uppercase
                                            rounded-full
                                            pointer-events-none select-none
                                        "
                                    >
                                        After
                                    </span>

                                    <ReactCompareSlider
                                        itemOne={<ReactCompareSliderImage src={item.beforeImage} alt={`${item.title} - Before`} />}
                                        itemTwo={<ReactCompareSliderImage src={item.afterImage} alt={`${item.title} - After`} />}
                                        handle={<ComparisonNudgeHandle nudgeKey={nudgeKeys[index] ?? 0} />}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {items.length > 1 && (
                <div className="mt-3  relative z-0 flex  lg:justify-end backdrop-blur-sm">
                    <div className="flex justify-center gap-2 p-1.25 rounded-none bg-slate-100 w-full lg:w-1/3">
                        {items.map((item, index) => (
                            <button
                                key={`dot-${index}`}
                                onClick={() => scrollTo(index)}
                                className={`pointer-events-auto transition-all duration-300 ${
                                    index === selectedIndex
                                        ? "bg-primary text-white font-helvetica w-full h-12 px-3.5"
                                        : "bg-slate-300 text-footer-bg font-helvetica w-full h-12 px-3.5 hover:bg-slate-400"
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            >
                                {item.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

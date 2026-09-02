// components/layout/BeforeAndAfterComparision/Carousel.tsx
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ReactCompareSlider, ReactCompareSliderHandle, ReactCompareSliderImage, useReactCompareSliderContext } from "react-compare-slider";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Static data — edit this object to add/remove comparisons ─────────────────
// Add as many items as you need. Fields:
//   id          : unique number
//   title       : label shown in the tab buttons below the carousel
//   beforeImage : path or URL to the "before" image
//   afterImage  : path or URL to the "after" image

interface ComparisonItem {
    id: number;
    title: string;
    beforeImage: string;
    afterImage: string;
}

const COMPARISON_ITEMS: ComparisonItem[] = [
    {
        id: 1,
        title: "1",
        beforeImage: "https://res.cloudinary.com/afdhm38k/image/upload/v1784282917/eventify/images/ggb9nwql1hqph2mhaomw.webp",
        afterImage: "https://res.cloudinary.com/afdhm38k/image/upload/v1784282933/eventify/images/dyptyr1det7dl61njtba.webp",
    },
    {
        id: 2,
        title: "2",
        beforeImage: "https://res.cloudinary.com/afdhm38k/image/upload/v1785231894/eventify/images/usqme81byoqunjaagmjr.webp",
        afterImage: "https://res.cloudinary.com/afdhm38k/image/upload/v1785231859/eventify/images/zpre1illignqcswkultv.webp",
    },
    // {
    //     id: 3,
    //     title: "Venue Decor",
    //     beforeImage: "/images/comparisons/venue-decor-before.jpg",
    //     afterImage: "/images/comparisons/venue-decor-after.jpg",
    // },
    // ── Add more items here ──────────────────────────────────────────────────
    // {
    //     id: 4,
    //     title: "Lighting Rig",
    //     beforeImage: "/images/comparisons/lighting-before.jpg",
    //     afterImage:  "/images/comparisons/lighting-after.jpg",
    // },
];

// ─── Nudge handle ─────────────────────────────────────────────────────────────

function ComparisonNudgeHandle({ nudgeKey }: { nudgeKey: number }) {
    const { setPosition, isDragging, position } = useReactCompareSliderContext();

    const tlRef = useRef<gsap.core.Timeline | null>(null);
    const proxyRef = useRef<{ value: number }>({ value: 50 });
    const userTookOverRef = useRef(false);

    // (Re-)create the nudge timeline whenever the parent bumps `nudgeKey`
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
            .to(proxyRef.current, {
                value: 45,
                duration: 0.45,
                ease: "sine.inOut",
            })
            .to(proxyRef.current, {
                value: 55,
                duration: 0.45,
                ease: "sine.inOut",
            })
            .to(proxyRef.current, {
                value: 50,
                duration: 0.4,
                ease: "sine.out",
            });

        tlRef.current = tl;

        return () => {
            tl.kill();
            tlRef.current = null;
        };
    }, [nudgeKey, setPosition, position]);

    // If user grabs mid-tween, kill the animation
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
    return target instanceof HTMLElement && !!target.closest("[data-compare-slider]");
};

// ─── Carousel ─────────────────────────────────────────────────────────────────

export function ComparisonCarousel() {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: "start",
        containScroll: "trimSnaps",
        dragFree: false,
        watchDrag: (_, evt) => {
            if (isMobileOrTabletViewport() && isCompareSliderTarget(evt.target)) {
                return false;
            }
            return true;
        },
    });

    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [nudgeKeys, setNudgeKeys] = useState<Record<number, number>>({});

    const containerRef = useRef<HTMLDivElement | null>(null);
    const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
    const hasEnteredRef = useRef(false);

    // Use the static data directly — no fetch, no loading state
    const items = COMPARISON_ITEMS;

    // ── Embla callbacks ───────────────────────────────────────────────────────

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

    // ── GSAP reveal + nudge on scroll ─────────────────────────────────────────

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

            ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top bottom",
                end: "bottom top",
                onUpdate: (self) => {
                    const progress = self.progress;
                    const ENTER_LOW = 0.15;
                    const ENTER_HIGH = 0.85;
                    const RESET_LOW = 0.05;
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
            <div className="overflow-hidden border border-slate-200" ref={emblaRef}>
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

                                    {/* After label */}
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

                                    {/* Compare slider */}
                                    <div
    data-compare-slider
    className="h-full"
    style={{ touchAction: "pan-y" }}
    onPointerDown={(e) => {
        if (isMobileOrTabletViewport()) e.stopPropagation();
    }}
    onTouchStart={(e) => {
        if (isMobileOrTabletViewport()) e.stopPropagation();
    }}
    onMouseDown={(e) => {
        if (isMobileOrTabletViewport()) e.stopPropagation();
    }}
>
    <ReactCompareSlider
        itemOne={<ReactCompareSliderImage src={item.beforeImage} alt={`${item.title} — Before`} />}
        itemTwo={<ReactCompareSliderImage src={item.afterImage} alt={`${item.title} — After`} />}
        handle={<ComparisonNudgeHandle nudgeKey={nudgeKeys[index] ?? 0} />}
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
                    {/* p-1.25 rounded-none bg-slate-100 */}
                    <div className="flex justify-center w-full gap-1 lg:w-full">
                        {items.map((item, index) => (
                            <button
                                key={`dot-${index}`}
                                onClick={() => scrollTo(index)}
                                className={`relative pointer-events-auto transition-colors duration-300 leading-0 h-8.5 border w-8.5 overflow-hidden rounded-full ${
                                    index === selectedIndex ? "bg-primary border-primary" : "bg-white border-slate-300"
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            >
                                {/* Unselected label (regular weight, dark) */}
                                <span
                                    className={`absolute inset-0 flex items-center justify-center font-helvetica text-footer-bg transition-opacity duration-300 ${
                                        index === selectedIndex ? "opacity-0" : "opacity-100"
                                    }`}
                                >
                                    {item.title}
                                </span>

                                {/* Selected label (neue-roman, white) */}
                                <span
                                    className={`absolute inset-0 flex items-center justify-center font-helvetica-neue-roman text-white transition-opacity duration-300 ${
                                        index === selectedIndex ? "opacity-100" : "opacity-0"
                                    }`}
                                >
                                    {item.title}
                                </span>

                                {/* Spacer to preserve button's natural sizing since children are absolute */}
                                <span className="invisible font-helvetica">{item.title}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

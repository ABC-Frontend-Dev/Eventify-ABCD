"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
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

    const containerRef = useRef<HTMLDivElement | null>(null);
    const slidesRef = useRef<(HTMLDivElement | null)[]>([]);

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

    // Scroll-in reveal animation
    useEffect(() => {
        if (!containerRef.current || items.length === 0) return;

        const ctx = gsap.context(() => {
            const validSlides = slidesRef.current.filter(Boolean) as HTMLDivElement[];

            const durations = [1.6, 1.4, 1.8];

            validSlides.forEach((slide, index) => {
                const inner = slide.querySelector(".slide-reveal-inner");

                if (!inner) return;

                gsap.set(inner, {
                    clipPath: "inset(0 0 100% 0)",
                    transformOrigin: "center center",
                });

                gsap.to(inner, {
                    clipPath: "inset(0 0 0% 0)",
                    duration: durations[index] ?? 1.6,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                });
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
            {/* Title Pagination - Above Carousel */}
            {/* <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900">{items[selectedIndex]?.title}</h3>
                <p className="text-sm text-slate-500 mt-1">
                    {selectedIndex + 1} / {items.length}
                </p>
            </div> */}

            {/* Carousel Container */}
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
                                {/* React Compare Slider */}
                                <div className="h-96 sm:h-[500px] lg:h-[600px]">
                                    <ReactCompareSlider
                                        itemOne={<ReactCompareSliderImage src={item.beforeImage} alt={`${item.title} - Before`} />}
                                        itemTwo={<ReactCompareSliderImage src={item.afterImage} alt={`${item.title} - After`} />}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dots Pagination - Below Carousel */}
            {items.length > 1 && (
                <div className="mt-3 flex justify-center gap-2">
                    {items.map((item, index) => (
                        <button
                            key={`dot-${index}`}
                            onClick={() => scrollTo(index)}
                            className={`pointer-events-auto transition-all duration-300 rounded-full ${
                                index === selectedIndex ? "bg-primary text-white font-helvetica w-full h-12 px-3.5" : "bg-slate-300 text-footer-bg font-helvetica w-full h-12 px-3.5 hover:bg-slate-400"
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        >
                            {item.title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

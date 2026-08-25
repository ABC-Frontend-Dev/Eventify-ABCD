"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface CarouselItem {
    id: number;
    url: string;
    title: string;
    description: string;
    image: string;
}

const AUTOPLAY_DELAY = 2500;

export function EmblaCarousel() {
    // ── Autoplay plugin ───────────────────────────────────────────────────────
    // stopOnInteraction: false  → autoplay never permanently stops
    // stopOnMouseEnter: true    → pauses while hovering
    // After a manual button click we call autoplayPlugin.current.reset()
    // which restarts the full delay from 0 — so the timer never fires
    // 0.5s after a click because we reset it to the full 2500ms immediately.
    const autoplayPlugin = useRef(
        Autoplay({
            delay: AUTOPLAY_DELAY,
            stopOnInteraction: false, // ← key fix: never permanently stop
            stopOnMouseEnter: true, // pause on hover
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

    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [services, setServices] = useState<CarouselItem[]>([]);
    const [loading, setLoading] = useState(true);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
    const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
    const hoverTlsRef = useRef<(gsap.core.Timeline | null)[]>([]);

    // ── Fetch services ────────────────────────────────────────────────────────

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch("/api/services");
                const data = await response.json();
                if (data.success) {
                    setServices(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch services:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    // ── Navigation ────────────────────────────────────────────────────────────
    // After scrolling we call autoplayPlugin.current.reset() which:
    // 1. Stops the current tick
    // 2. Restarts the timer from the full AUTOPLAY_DELAY (2500ms)
    // This means clicking at t=2000ms resets to t=0, so the next
    // auto-scroll happens at t=2000+2500ms — never at t=2000+500ms.

    const scrollPrev = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollPrev();
        autoplayPlugin.current.reset(); // restart countdown from 0
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollNext();
        autoplayPlugin.current.reset(); // restart countdown from 0
    }, [emblaApi]);

    // ── Drag: also reset after drag ends ─────────────────────────────────────

    useEffect(() => {
        if (!emblaApi) return;

        const onPointerUp = () => {
            // Small timeout so embla finishes settling before we reset
            setTimeout(() => {
                autoplayPlugin.current.reset();
            }, 50);
        };

        emblaApi.on("pointerUp", onPointerUp);
        return () => {
            emblaApi.off("pointerUp", onPointerUp);
        };
    }, [emblaApi]);

    // ── Select state ──────────────────────────────────────────────────────────

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

    // ── Scroll-in reveal ──────────────────────────────────────────────────────

    useEffect(() => {
        if (!containerRef.current || services.length === 0) return;

        const ctx = gsap.context(() => {
            const validSlides = slidesRef.current.filter(Boolean) as HTMLDivElement[];
            const durations = [1.6, 1.4, 1.8, 1.5, 1.6, 1.1];

            validSlides.forEach((slide, index) => {
                const inner = slide.querySelector(".slide-reveal-inner");
                if (!inner) return;

                gsap.set(inner, {
                    clipPath: "inset(0 0 100% 0)",
                    transformOrigin: "center center",
                });

                gsap.to(inner, {
                    clipPath: "inset(0 0 0% 0)",
                    duration: durations[index] ?? 2.2,
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
    }, [services]);

    // ── Hover overlay effect ──────────────────────────────────────────────────

    useEffect(() => {
        const ctx = gsap.context(() => {
            overlayRefs.current.forEach((overlay, index) => {
                if (!overlay) return;

                gsap.set(overlay, { opacity: 0 });

                const tl = gsap.timeline({ paused: true }).to(overlay, {
                    opacity: 0.55,
                    duration: 0.45,
                    ease: "power2.out",
                });

                hoverTlsRef.current[index] = tl;
            });
        }, containerRef);

        return () => ctx.revert();
    }, [services]);

    const handleCardEnter = useCallback((index: number) => {
        hoverTlsRef.current[index]?.play();
    }, []);

    const handleCardLeave = useCallback((index: number) => {
        hoverTlsRef.current[index]?.reverse();
    }, []);

    // Reset hover states when window loses focus
    useEffect(() => {
        const resetAll = () => {
            hoverTlsRef.current.forEach((tl) => tl?.reverse());
        };
        window.addEventListener("blur", resetAll);
        document.addEventListener("visibilitychange", resetAll);
        return () => {
            window.removeEventListener("blur", resetAll);
            document.removeEventListener("visibilitychange", resetAll);
        };
    }, []);

    // ── Loading skeleton ──────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex-[0_0_100%] md:flex-[0_0_28.57%] h-130 bg-slate-200 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {services.map((item, index) => (
                        <div
                            key={item.id}
                            ref={(el) => {
                                slidesRef.current[index] = el;
                            }}
                            onMouseEnter={() => handleCardEnter(index)}
                            onMouseLeave={() => handleCardLeave(index)}
                            className="flex-[0_0_100%] px-1.25 h-100 sm:h-110 md:h-120 lg:h-130 sm:flex-[0_0_50%] lg:flex-[0_0_28.57%] group"
                        >
                            <Link href={`services/${item.url}`}>
                                <div className="slide-reveal-inner relative overflow-hidden h-full will-change-[clip-path,transform]">
                                    <div className="w-full h-full">
                                        <Image src={item.image} alt={item.title} width={1000} height={1000} className="w-full h-full object-cover" />
                                    </div>

                                    <div
                                        ref={(el) => {
                                            overlayRefs.current[index] = el;
                                        }}
                                        className="absolute inset-0 bg-black opacity-0 pointer-events-none"
                                    />

                                    <div className="absolute w-full h-82.5 bottom-0 bg-linear-to-t from-black to-black/0 text-white p-6 flex flex-col justify-end">
                                        <h3 className="mb-2 text-xl md:text-2xl leading-6.5 tracking-wide font-helvetica-medium text-white">{item.title}</h3>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-5 w-[111%] lg:w-[104%] h-fit flex items-center justify-between gap-4">
                <button
                    onClick={scrollPrev}
                    disabled={prevBtnDisabled}
                    className="w-8 md:w-12 h-8 md:h-12 rounded-full bg-white shadow-md cursor-pointer hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-[background-color,box-shadow,opacity] duration-200 flex items-center justify-center group hover:bg-primary disabled:hover:bg-white"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-200" />
                </button>

                <button
                    onClick={scrollNext}
                    disabled={nextBtnDisabled}
                    className="w-8 md:w-12 h-8 md:h-12 rounded-full bg-white shadow-md cursor-pointer hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-[background-color,box-shadow,opacity] duration-200 flex items-center justify-center group hover:bg-primary disabled:hover:bg-white"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-200" />
                </button>
            </div>
        </div>
    );
}

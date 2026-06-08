"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface CarouselItem {
    id: number;
    icon: React.ReactNode;
    title: string;
    description: string;
    image?: string;
}

const CAROUSEL_DATA: CarouselItem[] = [
    {
        id: 1,
        icon: "/images/icons/loud.png",
        title: "Conferences",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        image: "/images/our-services/slide-1.png",
    },
    {
        id: 2,
        icon: "/images/icons/tv.png",
        title: "Concerts & Festivals",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        image: "/images/our-services/slide-2.png",
    },
    {
        id: 3,
        icon: "/images/icons/mic.png",
        title: "Wedding Services",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        image: "/images/our-services/slide-3.png",
    },
    {
        id: 4,
        icon: "/images/icons/ticket.png",
        title: "Catering Services",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        image: "/images/our-services/slide-4.png",
    },
    {
        id: 5,
        icon: "/images/icons/rating.png",
        title: "Venue Decoration",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        image: "/images/our-services/slide-5.png",
    },
    {
        id: 6,
        icon: "/images/icons/party.png",
        title: "Audio & Lighting",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        image: "/images/our-services/slide-6.png",
    },
];

export function EmblaCarousel() {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: "start",
        containScroll: "trimSnaps",
        dragFree: false,
    });

    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    // Track whether the GSAP intro animation has completed
    const [gsapComplete, setGsapComplete] = useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const slidesRef = useRef<(HTMLDivElement | null)[]>([]);

    // Helper to clear all GSAP inline styles from slides
    const clearGsapStyles = useCallback(() => {
        const validSlides = slidesRef.current.filter(Boolean) as HTMLDivElement[];
        validSlides.forEach((slide) => {
            gsap.set(slide, {
                clearProps: "all", // Clear ALL gsap-set properties
            });
        });
        setGsapComplete(true);
    }, []);

    const scrollPrev = useCallback(() => {
        if (emblaApi) {
            // Clear GSAP styles before Embla navigates
            if (!gsapComplete) clearGsapStyles();
            emblaApi.scrollPrev();
        }
    }, [emblaApi, gsapComplete, clearGsapStyles]);

    const scrollNext = useCallback(() => {
        if (emblaApi) {
            // Clear GSAP styles before Embla navigates
            if (!gsapComplete) clearGsapStyles();
            emblaApi.scrollNext();
        }
    }, [emblaApi, gsapComplete, clearGsapStyles]);

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

        // Also clear GSAP styles on any drag/pointer-based scroll
        const handlePointerDown = () => {
            if (!gsapComplete) clearGsapStyles();
        };
        emblaApi.on("pointerDown", handlePointerDown);

        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
            emblaApi.off("pointerDown", handlePointerDown);
        };
    }, [emblaApi, onSelect, gsapComplete, clearGsapStyles]);

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const validSlides = slidesRef.current.filter(Boolean) as HTMLDivElement[];

            // Initial stacked state: each slide offset to the left
            validSlides.forEach((slide, index) => {
                gsap.set(slide, {
                    x: -(index * 60),
                    zIndex: CAROUSEL_DATA.length - index,
                });
            });

            gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                    end: "top 20%",
                    scrub: 1,
                    onLeave: () => {
                        // Fully scrolled past — clear everything
                        clearGsapStyles();
                        // Re-init Embla so it recalculates positions
                        emblaApi?.reInit();
                    },
                    onEnterBack: () => {
                        // Scrolling back up — re-apply stacked state
                        setGsapComplete(false);
                        validSlides.forEach((slide, index) => {
                            gsap.set(slide, {
                                x: -(index * 60),
                                zIndex: CAROUSEL_DATA.length - index,
                            });
                        });
                    },
                },
            }).to(validSlides, {
                x: 0,
                zIndex: 1,
                ease: "power2.out",
                stagger: 0.15,
            });
        }, containerRef);

        return () => ctx.revert();
    }, [clearGsapStyles, emblaApi]);

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Carousel Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {CAROUSEL_DATA.map((item, index) => (
                        <div
                            key={item.id}
                            ref={(el) => {
                                slidesRef.current[index] = el;
                            }}
                            className="flex-[0_0_100%] first:ml-0 ml-2.5 min-w-0 h-130 sm:flex-[0_0_50%] lg:flex-[0_0_28.57%] group will-change-transform"
                        >
                            <div className="relative overflow-hidden h-full">
                                <div className="w-full h-full">{item.image && <Image src={item.image} alt={item.title} width={1000} height={1000} className="w-full h-full object-cover" />}</div>

                                <div className="absolute w-full h-82.5 bottom-0 bg-linear-to-t from-black to-black/0 text-white p-6 flex flex-col justify-end">
                                    <figure>{item.icon && <img src={item.icon as string} alt={item.title} className="mb-2.5 w-12.5 h-12.5 object-contain" />}</figure>
                                    <h3 className="mb-2 text-2xl leading-5 tracking-tight font-product-sans-black font-bold text-white">{item.title}</h3>
                                    <p className="font-product-sans-medium text-sm leading-5">{item.description}</p>
                                </div>

                                <div className="absolute top-3.5 right-3.5 px-3.75 py-2.5 bg-slate-100 rounded-[4px] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer">
                                    <p className="text-sm font-product-sans-bold text-slate-950 capitalize flex items-center justify-center gap-2.5">
                                        read more
                                        <span className="w-3.5 h-3 inline-block">
                                            <Image src="/images/icons/arrow-right.png" alt="Read more" width={1000} height={1000} className="w-full h-full object-contain" />
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-5 w-[104%] h-fit flex items-center justify-between gap-4">
                <button
                    onClick={scrollPrev}
                    disabled={prevBtnDisabled}
                    className="w-12 h-12 rounded-full bg-white shadow-md cursor-pointer hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group hover:bg-primary disabled:hover:bg-white"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </button>

                <button
                    onClick={scrollNext}
                    disabled={nextBtnDisabled}
                    className="w-12 h-12 rounded-full bg-white shadow-md cursor-pointer hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group hover:bg-primary disabled:hover:bg-white"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </button>
            </div>
        </div>
    );
}

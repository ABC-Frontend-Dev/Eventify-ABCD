"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
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
    image?: string;
}

const CAROUSEL_DATA: CarouselItem[] = [
    {
        id: 1,
        url: "services/conferences",
        title: "Retail Activations",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        image: "/images/our-services/slide-1.png",
    },
    {
        id: 2,
        url: "services/conferences",
        title: "Live Event Production",
        description: "We have strong roots in live entertainment production and can effectively manage from as low as 500 and up to 50,000 guests at any event like Maroon Five at Coca-Cola Area.",
        image: "/images/our-services/slide-2.png",
    },
    {
        id: 3,
        url: "services/conferences",
        title: "Wedding Services",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        image: "/images/our-services/slide-3.png",
    },
    {
        id: 4,
        url: "services/conferences",
        title: "Festival & IP Management",
        description:
            "The team until very recently were directly involved in producing and managing Dubai's biggest festivals namely Virgin Radio Redfest DXB, Dubai Jazz Festival, Blended Music and Festival Sole DXB.",
        image: "/images/our-services/slide-4.png",
    },
    {
        id: 5,
        url: "services/conferences",
        title: "Brand Experiences",
        description: "Our out of the box approach brings alive Product Launches, Opening Events & Ceremonies, Media & PR Events like Porsche Taycan Launch, Caesars Palace Launch.",
        image: "/images/our-services/slide-5.png",
    },
    {
        id: 6,
        url: "services/conferences",
        title: "Special Events",
        description: "We are adept at planning and executing large cultural events for National Day, Flag Day or Other celebrations like Drone and Light Show DSF Drone and Light show.",
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

    const containerRef = useRef<HTMLDivElement | null>(null);
    const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
    const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
    const hoverTlsRef = useRef<(gsap.core.Timeline | null)[]>([]);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

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

    // Scroll-in reveal for each card (unchanged)
    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            const validSlides = slidesRef.current.filter(Boolean) as HTMLDivElement[];

            // Example fixed random-like durations per card
            const durations = [1.6, 1.4, 1.8, 1.5, 1.6, 1.1];

            validSlides.forEach((slide, index) => {
                const inner = slide.querySelector(".slide-reveal-inner");

                if (!inner) return;

                // Hide from bottom, so reveal goes top -> bottom
                gsap.set(inner, {
                    clipPath: "inset(0 0 100% 0)",
                    transformOrigin: "center center",
                });

                gsap.to(inner, {
                    clipPath: "inset(0 0 0% 0)",
                    duration: durations[index] ?? 2.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: containerRef.current, // all cards use same trigger
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Hover effect — a plain dark tint fades in over the image, nothing
    // else moves. One paused timeline per card, play() on enter /
    // reverse() on leave, same reasoning as the social icons: a
    // reversing timeline always unwinds correctly no matter how fast
    // you hover in and out.
    useEffect(() => {
        const ctx = gsap.context(() => {
            overlayRefs.current.forEach((overlay, index) => {
                if (!overlay) return;

                gsap.set(overlay, { opacity: 0 });

                const tl = gsap.timeline({ paused: true }).to(overlay, {
                    opacity: 0.4,
                    duration: 0.45,
                    ease: "power2.out",
                });

                hoverTlsRef.current[index] = tl;
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleCardEnter = useCallback((index: number) => {
        hoverTlsRef.current[index]?.play();
    }, []);

    const handleCardLeave = useCallback((index: number) => {
        hoverTlsRef.current[index]?.reverse();
    }, []);

    // Defensive reset: same safety net as the social icons — if the
    // window loses focus or the tab goes to the background mid-hover,
    // mouseleave may never fire, so force every card back to rest.
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
                            onMouseEnter={() => handleCardEnter(index)}
                            onMouseLeave={() => handleCardLeave(index)}
                            className="flex-[0_0_100%] first:ml-0 ml-2.5 min-w-0 h-130 sm:flex-[0_0_50%] lg:flex-[0_0_28.57%] group"
                        >
                            {/* This inner wrapper gets the clip-path reveal, and clips/masks the hover overlay below */}
                            <div className="slide-reveal-inner relative overflow-hidden h-full will-change-[clip-path,transform]">
                                <div className="w-full h-full">{item.image && <Image src={item.image} alt={item.title} width={1000} height={1000} className="w-full h-full object-cover" />}</div>

                                {/* Dark tint overlay — GSAP fades this in/out on hover */}
                                <div
                                    ref={(el) => {
                                        overlayRefs.current[index] = el;
                                    }}
                                    className="absolute inset-0 bg-black opacity-0 pointer-events-none"
                                />

                                <div className="absolute w-full h-82.5 bottom-0 bg-linear-to-t from-black to-black/0 text-white p-6 flex flex-col justify-end">
                                    <h3 className="mb-2 text-2xl leading-5 tracking-tight font-product-sans-black font-bold text-white">{item.title}</h3>
                                    <p className="font-helvetica tracking-[1px] text-sm leading-4.5">{item.description}</p>
                                </div>

                                <Link
                                    href={item.url}
                                    className="absolute top-3.5 right-3.5 px-3.75 py-2.5 bg-slate-100 rounded-[4px] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer group/link"
                                >
                                    <p className="text-sm font-product-sans-bold text-slate-950 capitalize flex items-center justify-center gap-2.5">
                                        read more
                                        <span className="w-3.5 h-3 inline-block">
                                            <Image
                                                src="/images/icons/arrow-right.png"
                                                alt="Read more"
                                                width={1000}
                                                height={1000}
                                                className="w-full h-full object-contain transition-transform duration-300 group-hover:translate-x-1 group-hover/link:-translate-x-0.5 group-hover/link:-rotate-45"
                                            />
                                        </span>
                                    </p>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-5 w-[111%] lg:w-[104%] h-fit flex items-center justify-between gap-4">
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

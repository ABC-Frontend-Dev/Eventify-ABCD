// components/layout/OurServices/Carousel.tsx

"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface CarouselItem {
    id: number;
    title: string;
    image: string[];
}

const CAROUSEL_DATA: CarouselItem[] = [
    {
        id: 1,
        title: "Conferences",
        image: ["/images/our-services/slide-1.png", "/images/our-services/slide-2.png", "/images/our-services/slide-3.png"],
    },
    {
        id: 1,
        title: "Conferences",
        image: ["/images/our-services/slide-1.png", "/images/our-services/slide-2.png", "/images/our-services/slide-3.png"],
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

    return (
        <div className="relative w-full">
            {/* Carousel Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {CAROUSEL_DATA.map((item) => (
                        <div key={item.id} className="flex-[0_0_100%] first:ml-0 ml-2.5 min-w-0 h-103 group">
                            <div className="relative overflow-hidden h-full">
                                {/* Image placeholder */}
                                <div className="w-full h-full">{item.image && <Image src={item.image[0]} alt={item.title} width={1000} height={1000} className="w-full h-full object-cover" />}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className=" absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[calc(97%+20px)] h-full flex items-center justify-between gap-4">
                <button
                    onClick={scrollPrev}
                    disabled={prevBtnDisabled}
                    className="w-15 h-15 bg-white shadow-md cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group hover:bg-primary disabled:hover:bg-white"
                    aria-label="Previous slide"
                >
                    <ChevronLeft className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </button>

                <button
                    onClick={scrollNext}
                    disabled={nextBtnDisabled}
                    className="w-15 h-15 bg-white shadow-md cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group hover:bg-primary disabled:hover:bg-white"
                    aria-label="Next slide"
                >
                    <ChevronRight className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </button>
                {/* Dots Indicator */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex gap-2">
                        {CAROUSEL_DATA.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => emblaApi?.scrollTo(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === selectedIndex ? "bg-primary w-8" : "bg-slate-300 hover:bg-slate-400"}`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

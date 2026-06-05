// components/layout/OurServices/Carousel.tsx

"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

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
                        <div key={item.id} className="flex-[0_0_100%] first:ml-0 ml-2.5 min-w-0 h-130 sm:flex-[0_0_50%] lg:flex-[0_0_28.57%] group">
                            <div className="relative overflow-hidden h-full">
                                {/* Image placeholder */}
                                <div className="w-full h-full">{item.image && <Image src={item.image} alt={item.title} width={1000} height={1000} className="w-full h-full object-cover" />}</div>

                                {/* Content */}
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

                {/* Dots Indicator */}
                {/* <div className="flex gap-2">
                    {CAROUSEL_DATA.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => emblaApi?.scrollTo(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === selectedIndex ? "bg-primary w-8" : "bg-slate-300 hover:bg-slate-400"}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div> */}

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

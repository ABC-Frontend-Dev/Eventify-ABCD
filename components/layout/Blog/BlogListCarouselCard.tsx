// components/layout/Blog/BlogListCarouselCard.tsx

"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface CarouselItem {
    id: number;
    category: React.ReactNode;
    title: string;
    description: string;
    authorName: string;
    authorImage: string;
    image: string;
    date: string;
    readTime: string;
}

const CAROUSEL_DATA: CarouselItem[] = [
    {
        id: 1,
        category: "Conferences",
        title: "UAE In-Focus – Dubai wins bids for 99 events in H1; Al Khair Initiative continues to help defaulters",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        authorName: "Maximus Wooten",
        authorImage: "/images/blogs/Ellipse 5.png",
        image: "/images/blogs/Group 48531.png",
        date: "Apr 12, 2026",
        readTime: "5 min",
    },
    {
        id: 2,
        category: "Conferences",
        title: "UAE In-Focus – Dubai wins bids for 99 events in H1; Al Khair Initiative continues to help defaulters",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        authorName: "Maximus Wooten",
        authorImage: "/images/blogs/Ellipse 5.png",
        image: "/images/blogs/Group 48531.png",
        date: "Apr 12, 2026",
        readTime: "5 min",
    },
    {
        id: 3,
        category: "Conferences",
        title: "UAE In-Focus – Dubai wins bids for 99 events in H1; Al Khair Initiative continues to help defaulters",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        authorName: "Maximus Wooten",
        authorImage: "/images/blogs/Ellipse 5.png",
        image: "/images/blogs/Group 48531.png",
        date: "Apr 12, 2026",
        readTime: "5 min",
    },
    {
        id: 4,
        category: "Conferences",
        title: "UAE In-Focus – Dubai wins bids for 99 events in H1; Al Khair Initiative continues to help defaulters",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        authorName: "Maximus Wooten",
        authorImage: "/images/blogs/Ellipse 5.png",
        image: "/images/blogs/Group 48531.png",
        date: "Apr 12, 2026",
        readTime: "5 min",
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
        <div className="hidden lg:block relative w-full">
            {/* Carousel Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-1.75">
                    {CAROUSEL_DATA.map((item) => (
                        <div key={item.id} className="flex-[0_0_calc(100%/1)] lg:flex-[0_0_calc((100%-14px)/3)] min-w-0 relative">
                            <div className="absolute top-5 right-5 z-40 border border-primary/80 bg-primary/80 rounded-[6px] p-2.5 capitalize text-xs lg:text-sm font-product-sans-medium font-light w-fit text-white">
                                {item.category}
                            </div>
                            <figure className="h-80 w-full overflow-hidden">
                                <Image src={item.image} alt={item.title} width={1000} height={1000} className="h-full w-full object-cover" />
                            </figure>
                            <div className="absolute w-full bottom-0 left-0 p-3.5 blog-page-gradient z-10">
                                <div className="text-sm lg:text-[16px] leading-4.5 lg:leading-5 font-product-sans-bold font-medium text-white">{item.title}</div>
                                {/* <div className="mt-2 text-sm leading-4 tracking-wide text-white font-helvetica font-light">The Emirates College for Advanced Education (ECAE) has</div> */}
                                <div className="mt-2 lg:mt-2.75 flex items-center gap-3">
                                    {/* <figure className="h-7.5 w-7.5 rounded-full overflow-hidden">
                                                                <Image src="/images/blogs/Ellipse 5.png" alt="blog1" width={1000} height={1000} className="h-full w-full object-cover" />
                                                            </figure> */}
                                    <ul className="flex items-center gap-1.5">
                                        <li className="">
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{item.authorName}</p>
                                        </li>
                                        <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                        <li className="">
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{item.date}</p>
                                        </li>
                                        <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                        <li className="">
                                            <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{item.readTime}</p>
                                        </li>
                                    </ul>
                                </div>
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

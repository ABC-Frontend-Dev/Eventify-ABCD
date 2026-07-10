// components/layout/Projects/Carousel.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface EmblaCarouselProps {
    media?: string[]; // Changed from 'images' to 'media' to support both
    className?: string;
}

// Helper function to check if URL is a video
const isVideo = (url: string): boolean => {
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some((ext) => lowerUrl.endsWith(ext)) || lowerUrl.includes("/videos/");
};

export function EmblaCarousel({ media = [], className = "" }: EmblaCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: "start",
        containScroll: "trimSnaps",
        dragFree: false,
    });

    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Fallback to default images if none provided
    const displayMedia =
        media.length > 0
            ? media
            : [
                  "/images/our-services/slide-1.png",
                  "/images/our-services/slide-2.png",
                  "/images/our-services/slide-3.png",
                  "/images/our-services/slide-4.png",
                  "/images/our-services/slide-5.png",
                  "/images/our-services/slide-6.png",
              ];

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

    return (
        <div className={`relative w-full ${className}`}>
            {/* Carousel Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {displayMedia.map((mediaUrl, index) => {
                        const isVideoFile = isVideo(mediaUrl);

                        return (
                            <div key={`slide-${index}`} className="flex-[0_0_100%] first:ml-0 ml-2.5 min-w-0 h-103 group">
                                <div className="relative overflow-hidden h-full">
                                    {isVideoFile ? (
                                        <video src={mediaUrl} className="w-full h-full object-cover" controls playsInline preload="metadata" />
                                    ) : (
                                        <Image src={mediaUrl} alt={`Slide ${index + 1}`} width={1000} height={1000} className="w-full h-full object-cover" priority={index === 0} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Buttons */}
            {displayMedia.length > 1 && (
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[calc(97%+20px)] h-full flex items-center justify-between gap-4 pointer-events-none">
                    <button
                        onClick={scrollPrev}
                        disabled={prevBtnDisabled}
                        className="w-15 h-15 bg-white shadow-md cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group hover:bg-primary disabled:hover:bg-white pointer-events-auto"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                    </button>

                    <button
                        onClick={scrollNext}
                        disabled={nextBtnDisabled}
                        className="w-15 h-15 bg-white shadow-md cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group hover:bg-primary disabled:hover:bg-white pointer-events-auto"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
                        <div className="flex gap-2">
                            {displayMedia.map((_, index) => (
                                <button
                                    key={`dot-${index}`}
                                    onClick={() => scrollTo(index)}
                                    className={`pointer-events-auto transition-all duration-300 ${
                                        index === selectedIndex ? "bg-primary w-8 h-2" : "bg-slate-300 hover:bg-slate-400 w-2 h-2"
                                    } rounded-full`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Media Counter with Type Indicator */}
            {/* <div className="absolute top-4 right-4 flex items-center gap-2">
                <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                    {selectedIndex + 1} / {displayMedia.length}
                </div>
                {isVideo(displayMedia[selectedIndex]) && <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">VIDEO</div>}
            </div> */}
        </div>
    );
}

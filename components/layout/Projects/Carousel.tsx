"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EmblaCarouselProps {
    media?: string[];
    className?: string;
}

const isVideo = (url: string): boolean => {
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some((ext) => lowerUrl.endsWith(ext)) || lowerUrl.includes("/videos/");
};

export function EmblaCarousel({ media = [], className = "" }: EmblaCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true, // enable looping for autoplay
        align: "start",
        containScroll: "trimSnaps",
        dragFree: false,
    });

    const autoplayRef = useRef<NodeJS.Timeout | null>(null);

    const [selectedIndex, setSelectedIndex] = useState(0);

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

    const scrollTo = useCallback(
        (index: number) => {
            emblaApi?.scrollTo(index);
        },
        [emblaApi],
    );

    const scrollPrev = useCallback(() => {
        emblaApi?.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        emblaApi?.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);

        onSelect();

        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    // -----------------------
    // Autoplay
    // -----------------------
    const startAutoplay = useCallback(() => {
        if (!emblaApi) return;

        stopAutoplay();

        autoplayRef.current = setInterval(() => {
            if (!emblaApi) return;

            emblaApi.scrollNext();
        }, 2500);
    }, [emblaApi]);

    const stopAutoplay = useCallback(() => {
        if (autoplayRef.current) {
            clearInterval(autoplayRef.current);
            autoplayRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        startAutoplay();

        return () => stopAutoplay();
    }, [emblaApi, startAutoplay, stopAutoplay]);

    return (
        <div className={`relative w-full ${className}`} onMouseEnter={stopAutoplay} onMouseLeave={startAutoplay}>
            {/* Carousel Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                    {displayMedia.map((mediaUrl, index) => {
                        const isVideoFile = isVideo(mediaUrl);

                        return (
                            <div key={`slide-${index}`} className="flex-[0_0_100%] first:ml-0 ml-2.5 min-w-0 h-80 sm:h-90 md:100 lg:h-110 group">
                                <div className="relative overflow-hidden">
                                    {isVideoFile ? (
                                        <video src={mediaUrl} className="w-full object-cover" controls playsInline preload="metadata" />
                                    ) : (
                                        <Image
                                            src={mediaUrl}
                                            alt={`Slide ${index + 1}`}
                                            width={1000}
                                            height={1000}
                                            className="w-full h-80 sm:h-90 md:100 lg:h-110 object-cover"
                                            priority={index === 0}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Arrows + Dots — grouped together, arrows flank the dots */}
            {displayMedia.length > 1 && (
                <div className="absolute bottom-2.5 sm:bottom-5 left-1/2 -translate-x-1/2 z-10">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={scrollPrev}
                            aria-label="Previous slide"
                            className="flex h-4 w-4 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-transparent hover:bg-white/80 text-slate-800 shadow-md transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 hover:text-primary transition-colors" />
                        </button>

                        <div className="flex gap-1 sm:gap-2">
                            {displayMedia.map((_, index) => (
                                <button
                                    key={`dot-${index}`}
                                    onClick={() => scrollTo(index)}
                                    className={`transition-all duration-300 ${
                                        index === selectedIndex ? "bg-primary w-3 sm:w-8 h-1 sm:h-2" : "bg-slate-300 hover:bg-slate-400 w-1 sm:w-2 h-1 sm:h-2"
                                    } rounded-full`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={scrollNext}
                            aria-label="Next slide"
                            className="flex h-4 w-4 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-transparent hover:bg-white/80 text-slate-800 shadow-md transition-colors"
                        >
                            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300 hover:text-primary transition-colors" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

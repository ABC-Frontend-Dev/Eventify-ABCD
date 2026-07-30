"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";

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
                            <div key={`slide-${index}`} className="flex-[0_0_100%] first:ml-0 ml-2.5 min-w-0 h-110 group">
                                <div className="relative overflow-hidden h-110">
                                    {isVideoFile ? (
                                        <video src={mediaUrl} className="w-full h-110 object-cover" controls playsInline preload="metadata" />
                                    ) : (
                                        <Image src={mediaUrl} alt={`Slide ${index + 1}`} width={1000} height={1000} className="w-full h-110 object-cover" priority={index === 0} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Dots */}
            {displayMedia.length > 1 && (
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-[calc(97%+0px)] h-full flex items-center justify-between gap-4 pointer-events-none">
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
        </div>
    );
}

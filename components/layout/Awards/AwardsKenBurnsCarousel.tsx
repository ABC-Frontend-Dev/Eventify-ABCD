// components/layout/Awards/AwardsKenBurnsCarousel.tsx
"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface AwardImage {
    id: number;
    url: string;
    imageAlt: string;
    title: string;
    description: string;
    categoryIcon?: string;
    categoryIconAlt?: string;
}

export default function AwardsKenBurnsCarousel({
    images,
    autoplayDelay = 250000,
}: {
    images: AwardImage[];
    autoplayDelay?: number;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const apply = () => setReducedMotion(mq.matches);

        apply();
        mq.addEventListener?.("change", apply);

        return () => mq.removeEventListener?.("change", apply);
    }, []);

    useEffect(() => {
        if (reducedMotion) return;
        if (images.length <= 1) return;

        intervalRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, autoplayDelay);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [images.length, autoplayDelay, reducedMotion]);

    if (!images.length) return null;

    const currentImage = images[currentIndex];

    return (
        <div className="relative h-full w-full overflow-hidden bg-black">
            {/* Slides track */}
            <div
                className={`flex h-full w-full ${
                    reducedMotion ? "" : "transition-transform duration-700 ease-in-out"
                }`}
                style={{
                    transform: `translateX(-${currentIndex * 100}%)`,
                }}
            >
                {images.map((image, index) => (
                    <div
                        key={image.id}
                        className="relative h-full w-full min-w-full flex-shrink-0"
                        aria-hidden={index !== currentIndex}
                    >
                        <Image
                            src={image.url}
                            alt={image.imageAlt || image.title}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority={index === 0}
                        />
                    </div>
                ))}
            </div>

            {/* Gradient overlay */}
            <div
                className="absolute right-0 bottom-0 w-full h-1/2 z-20 pointer-events-none"
                style={{
                    background:
                        "linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)",
                }}
            />

            {/* Title + Description */}
            {currentImage && (currentImage.title || currentImage.description) && (
                <div className="absolute left-1 sm:left-3 md:left-4 lg:left-6 xl:left-8 1-xl:left-10 bottom-1 sm:bottom-3 md:bottom-4 lg:bottom-6 xl:bottom-8 1-xl:bottom-10 z-30 max-w-44 w-full sm:max-w-120 md:min-w-61.25">
                    <div key={currentImage.id} className="transition-all duration-500">
                        {currentImage.title && (
                            <h3 className="font-abc-laica-a-italic-variable-trial text-xs sm:text-xl lg:text-xl xl:text-4xl leading-4 sm:leading-5.5 lg:leading-6 xl:leading-10 text-white">
                                {currentImage.title}
                            </h3>
                        )}
                        {currentImage.description && (
                            <p className="mt-0.5 sm:mt-0 lg:mt-0.75 font-helvetica-thin sm:font-helvetica text-[10px] sm:text-base lg:text-lg leading-3 sm:leading-4.5 xl:leading-5.5 text-[#E2E8F0] tracking-wide">
                                {currentImage.description}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Category icon */}
            {currentImage?.categoryIcon && (
                <div
                    key={`icon-${currentImage.id}`}
                    className="absolute right-1 sm:right-3 md:right-4 lg:right-6 xl:right-8 1-xl:right-10 bottom-1 sm:bottom-3 md:bottom-4 lg:bottom-6 xl:bottom-8 1-xl:bottom-10 z-30 transition-all duration-500"
                >
                    <Image
                        src={currentImage.categoryIcon}
                        alt={currentImage.categoryIconAlt || ""}
                        width={200}
                        height={80}
                        className="h-4 sm:h-5 lg:h-6.5 w-auto object-contain"
                    />
                </div>
            )}
        </div>
    );
}

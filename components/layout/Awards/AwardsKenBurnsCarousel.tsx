"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface AwardImage {
    id: number;
    url: string;
    imageAlt: string;
    title: string;
    description: string;
}

/**
 * Ken Burns carousel:
 * - Absolute-positioned slide stack; crossfade between slides via opacity.
 * - Each slide gets a unique CSS keyframe (scale + translate) chosen from
 *   four presets so the motion feels different on every image.
 * - Animation restarts whenever the slide becomes active (via `key` on the
 *   inner <Image> wrapper) so it doesn't jump back to the start mid-rotate.
 * - Honors `prefers-reduced-motion` by disabling the Ken Burns scale/translate
 *   and the autoplay advance.
 */
export default function AwardsKenBurnsCarousel({ images, autoplayDelay = 2500 }: { images: AwardImage[]; autoplayDelay?: number }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [reducedMotion, setReducedMotion] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /* ── Detect prefers-reduced-motion on mount ─────────────────────── */
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const apply = () => setReducedMotion(mq.matches);
        apply();
        mq.addEventListener?.("change", apply);
        return () => mq.removeEventListener?.("change", apply);
    }, []);

    /* ── Autoplay (skipped when user prefers reduced motion) ─────────── */
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

    /* Four preset motions so each slide feels different */
    const presets = [
        "kenburns-1", // zoom in, drift right
        "kenburns-2", // zoom in, drift left
        "kenburns-3", // zoom out, drift up
        "kenburns-4", // zoom out, drift down
    ];

    return (
        <div className="relative h-full w-full overflow-hidden bg-black">
            {/* ── Slide stack ─────────────────────────────────────────────── */}
            {images.map((image, index) => {
                const isActive = index === currentIndex;
                const motionClass = reducedMotion ? "kb-static" : `kb-${presets[index % presets.length]}`;

                return (
                    <div key={image.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}`} aria-hidden={!isActive}>
                        {/* `key` on the inner div restarts the CSS animation
                            every time this slide becomes the active one. */}
                        <div key={`${image.id}-${isActive ? "active" : "idle"}`} className={`relative w-full h-full ${motionClass}`}>
                            <Image
                                src={image.url}
                                alt={image.imageAlt || image.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1920px"
                                className="object-cover"
                                priority={index === 0}
                            />
                        </div>
                    </div>
                );
            })}

            {/* ── Gradient overlay (unchanged) ─────────────────────────────── */}
            <div
                className="absolute right-0 bottom-0 w-full h-1/2 z-20 pointer-events-none"
                style={{
                    background: "linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)",
                }}
            />

            {/* ── Title + Description (synced with active slide) ───────────── */}
            {currentImage && (currentImage.title || currentImage.description) && (
                <div className="absolute right-5 bottom-5 z-30 w-51.25">
                    <div key={currentImage.id} className="p-3 bg-white/10 backdrop-blur-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-all duration-500">
                        {currentImage.title && <h3 className="font-helvetica-neue-roman text-base leading-6 text-white">{currentImage.title}</h3>}
                        {currentImage.description && <p className="mt-0.75 font-helvetica text-[13px] leading-4 text-white tracking-wide">{currentImage.description}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { AwardsTabs, AwardsTabsList, TabsTrigger, TabsContent } from "@/components/ui/awards-bottom-tabs";
import { Carousel } from "@ark-ui/react/carousel";
import Image from "next/image";
import { useState } from "react";

interface AwardImage {
    id: number;
    url: string;
    imageAlt: string;
    title: string;
    description: string;
}

interface AwardCategory {
    id: number;
    name: string;
    icon: string;
    iconAlt: string;
    images: AwardImage[];
}

interface AwardsYearTabContentProps {
    categories: AwardCategory[];
}

// ─── Single panel per category ────────────────────────────────────────────────

function AwardYearPanel({ images }: { images: AwardImage[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentImage = images[currentIndex];

    if (!images.length) return null;

    return (
        <div className="relative h-full">
            {/* ── Carousel ── */}
            <Carousel.Root defaultPage={0} slideCount={images.length} autoplay={{ delay: 2500 }} className="w-full" onPageChange={(details) => setCurrentIndex(details.page)}>
                <Carousel.ItemGroup className="overflow-hidden">
                    {images.map((image, index) => (
                        <Carousel.Item key={image.id} index={index}>
                            <Image src={image.url} alt={image.imageAlt || image.title} width={1920} height={1080} className="w-full h-full lg:h-175 object-cover" priority={index === 0} />
                        </Carousel.Item>
                    ))}
                </Carousel.ItemGroup>
            </Carousel.Root>

            {/* ── Gradient overlay ── */}
            <div
                className="absolute right-0 bottom-0 w-full h-1/2 z-10 pointer-events-none"
                style={{
                    background: "linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)",
                }}
            />

            {/* ── Title + Description (synced with current slide) ── */}
            {currentImage && (currentImage.title || currentImage.description) && (
                <div className="absolute left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-2.5 lg:left-5 top-1 sm:top-auto sm:bottom-2.5 lg:bottom-5 z-20 max-w-full w-[98%] sm:max-w-120 min-w-61.25">
                    {/* w-51.25 backdrop-blur-lg shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] bg-white/10 */}
                    <div key={currentImage.id} className="transition-all duration-500">
                        {currentImage.title && <h3 className="font-helvetica-neue-roman text-sm sm:text-xl lg:text-xl leading-4 sm:leading-6 lg:leading-6 text-white">{currentImage.title}</h3>}
                        {currentImage.description && (
                            <p className="mt-0.75 sm:mt-0 lg:mt-0.75 font-helvetica-thin sm:font-helvetica text-xs sm:text-base lg:text-sm leading-3.5 sm:leading-4.5 text-[#E2E8F0] tracking-wide">
                                {currentImage.description}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ── Dot indicators (optional but helpful for UX) ── */}
            {/* {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                    {images.map((_, i) => (
                        <div key={i} className={`rounded-full transition-all duration-300 ${i === currentIndex ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"}`} />
                    ))}
                </div>
            )} */}
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AwardsYearTabContent({ categories }: AwardsYearTabContentProps) {
    const defaultValue = categories[0]?.id.toString() || "";

    return (
        <AwardsTabs defaultValue={defaultValue}>
            <div className="absolute right-1.25 bottom-1.25 z-100">
                <AwardsTabsList variant="underline">
                    {categories.map((category) => (
                        <TabsTrigger key={category.id} value={category.id.toString()}>
                            <Image src={category.icon} alt={category.iconAlt} width={1000} height={1000} className="h-4 sm:h-5 lg:h-8 w-auto object-contain" />
                        </TabsTrigger>
                    ))}
                </AwardsTabsList>
            </div>

            {categories.map((category) => (
                <TabsContent key={category.id} value={category.id.toString()}>
                    <AwardYearPanel images={category.images} />
                </TabsContent>
            ))}
        </AwardsTabs>
    );
}

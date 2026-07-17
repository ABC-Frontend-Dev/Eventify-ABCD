"use client";

import { AwardsTabs, AwardsTabsList, TabsTrigger, TabsContent } from "@/components/ui/awards-bottom-tabs";
import { Carousel } from "@ark-ui/react/carousel";
import Image from "next/image";

interface AwardItem {
    id: number;
    title: string;
    description: string;
}

interface CarouselImage {
    id: number;
    url: string;
}

interface AwardCategory {
    id: number;
    name: string;
    icon: string;
    iconAlt: string;
    items: AwardItem[];
    carouselImages: CarouselImage[];
    gradientWidthClass: string;
}

interface AwardsYearTabContentProps {
    categories: AwardCategory[];
}

function AwardYearPanel({ carouselImages, items, gradientWidthClass }: { carouselImages: CarouselImage[]; items: AwardItem[]; gradientWidthClass: string }) {
    return (
        <div className="relative">
            <Carousel.Root defaultPage={0} slideCount={carouselImages.length} autoplay={{ delay: 2500 }} className="w-full">
                <Carousel.ItemGroup className="overflow-hidden">
                    {carouselImages.map((image, index) => (
                        <Carousel.Item key={image.id} index={index}>
                            <Image src={image.url} alt={`Award slide ${index + 1}`} width={1920} height={1080} className="w-full h-175 object-cover" priority={index === 0} />
                        </Carousel.Item>
                    ))}
                </Carousel.ItemGroup>
            </Carousel.Root>

            <div className={`awards-slideshow-gradient absolute right-0 top-0 ${gradientWidthClass} h-full z-10 pointer-events-none`} />

            <div className="absolute right-5 top-5 z-20">
                <ul className="grid grid-cols-2 justify-center items-center gap-1.25">
                    {items.map((award) => (
                        <li key={award.id} className="p-3 bg-white/10 backdrop-blur-lg w-51.25 h-25 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                            <h3 className="font-product-sans-medium text-lg leading-6 text-white">{award.title}</h3>
                            <p className="mt-0.75 font-product-sans-light text-[13px] leading-4 text-white tracking-wide">{award.description}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default function AwardsYearTabContent({ categories }: AwardsYearTabContentProps) {
    const defaultValue = categories[0]?.id.toString() || "";

    return (
        <AwardsTabs defaultValue={defaultValue}>
            <div className="absolute left-1.25 bottom-1.25 z-100">
                <AwardsTabsList variant="underline">
                    {categories.map((category) => (
                        <TabsTrigger key={category.id} value={category.id.toString()}>
                            <Image src={category.icon} alt={category.iconAlt} width={1000} height={1000} className="h-8 w-auto object-contain" />
                        </TabsTrigger>
                    ))}
                </AwardsTabsList>
            </div>

            {categories.map((category) => (
                <TabsContent key={category.id} value={category.id.toString()}>
                    <AwardYearPanel carouselImages={category.carouselImages} items={category.items} gradientWidthClass={category.gradientWidthClass} />
                </TabsContent>
            ))}
        </AwardsTabs>
    );
}

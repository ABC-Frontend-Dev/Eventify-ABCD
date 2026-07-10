// components/layout/Awards/AwardsTabContents.tsx
import { AwardsTabs, AwardsTabsList, TabsTrigger, TabsContent } from "@/components/ui/awards-bottom-tabs";
import { Carousel } from "@ark-ui/react/carousel";
import Image from "next/image";
import { type AwardCategory, type YearAwards } from "@/lib/data/awards-data";

type AwardYearPanelProps = {
    carouselImages: string[];
    items: AwardCategory["items"];
    gradientWidthClass: string;
};

function AwardYearPanel({ carouselImages, items, gradientWidthClass }: AwardYearPanelProps) {
    return (
        <div className="relative">
            <Carousel.Root defaultPage={0} slideCount={carouselImages.length} autoplay={{ delay: 2500 }} className="w-full">
                <Carousel.ItemGroup className="overflow-hidden">
                    {carouselImages.map((image, index) => (
                        <Carousel.Item key={index} index={index}>
                            <Image src={image} alt={`Award slide ${index + 1}`} width={1920} height={1080} className="w-full h-175 object-cover" priority={index === 0} />
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

type AwardsYearTabContentProps = {
    yearData: YearAwards;
};

function AwardsYearTabContent({ yearData }: AwardsYearTabContentProps) {
    const defaultValue = yearData.categories[0]?.id || "";

    return (
        <AwardsTabs defaultValue={defaultValue}>
            <div className="absolute left-1.25 bottom-1.25 z-100">
                <AwardsTabsList variant="underline">
                    {yearData.categories.map((category) => (
                        <TabsTrigger key={category.id} value={category.id}>
                            <Image src={category.icon} alt={category.iconAlt} width={1000} height={1000} className="h-8 w-auto object-contain" />
                        </TabsTrigger>
                    ))}
                </AwardsTabsList>
            </div>

            {yearData.categories.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                    <AwardYearPanel carouselImages={category.carouselImages} items={category.items} gradientWidthClass={category.gradientWidthClass} />
                </TabsContent>
            ))}
        </AwardsTabs>
    );
}

// Export year-specific components
export function AwardsTabContent2025({ yearData }: AwardsYearTabContentProps) {
    return <AwardsYearTabContent yearData={yearData} />;
}

export function AwardsTabContent2024({ yearData }: AwardsYearTabContentProps) {
    return <AwardsYearTabContent yearData={yearData} />;
}

export function AwardsTabContent2023({ yearData }: AwardsYearTabContentProps) {
    return <AwardsYearTabContent yearData={yearData} />;
}

export function AwardsTabContent2022({ yearData }: AwardsYearTabContentProps) {
    return <AwardsYearTabContent yearData={yearData} />;
}

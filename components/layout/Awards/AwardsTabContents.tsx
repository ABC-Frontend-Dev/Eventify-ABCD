import { AwardsTabs, AwardsTabsList, TabsTrigger, TabsContent } from "@/components/ui/awards-bottom-tabs";
import { Carousel } from "@ark-ui/react/carousel";
import Image from "next/image";

type AwardItem = { id: number; title: string; description: string };

type YearTabDef = {
    id: string;
    icon: string;
    iconAlt: string;
    items: AwardItem[];
    carouselImages: string[];
    gradientWidthClass: string; // e.g. "w-4/5" or "w-full"
};

function AwardYearPanel({ carouselImages, items, gradientWidthClass }: Pick<YearTabDef, "carouselImages" | "items" | "gradientWidthClass">) {
    return (
        <div className="relative">
            <Carousel.Root defaultPage={0} slideCount={carouselImages.length} autoplay={{ delay: 2500 }} className="w-full">
                <Carousel.ItemGroup className="overflow-hidden">
                    {carouselImages.map((image, index) => (
                        <Carousel.Item key={index} index={index}>
                            <img src={image} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                        </Carousel.Item>
                    ))}
                </Carousel.ItemGroup>
            </Carousel.Root>

            <div className={`awards-slideshow-gradient absolute right-0 top-0 ${gradientWidthClass} h-full z-10 pointer-events-none`}></div>

            <div className="absolute right-5 top-5 z-20">
                <ul className="grid grid-cols-2 justify-center items-center gap-1.25">
                    {items.map((value) => (
                        <li key={value.id} className="p-3 bg-white/10 backdrop-blur-lg w-51.25 h-25 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                            <h3 className="font-product-sans-medium text-lg leading-6 text-white">{value.title}</h3>
                            <p className="mt-0.75 font-product-sans-light text-[13px] leading-4 text-white tracking-wide">{value.description}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

/** Renders one full year's award tabs using the AwardsTabs primitives consistently. */
function AwardsYearTabContent({ tabs, defaultValue }: { tabs: YearTabDef[]; defaultValue: string }) {
    return (
        <AwardsTabs defaultValue={defaultValue}>
            <div className="absolute left-1.25 bottom-1.25 z-100">
                <AwardsTabsList variant="underline">
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.id} value={tab.id}>
                            <Image src={tab.icon} alt={tab.iconAlt} width={1000} height={1000} className="h-8 w-auto object-contain" />
                        </TabsTrigger>
                    ))}
                </AwardsTabsList>
            </div>

            {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id}>
                    <AwardYearPanel carouselImages={tab.carouselImages} items={tab.items} gradientWidthClass={tab.gradientWidthClass} />
                </TabsContent>
            ))}
        </AwardsTabs>
    );
}

// ---------- shared award item lists ----------
const wowAwardsItems: AwardItem[] = [
    { id: 1, title: "Exeed Exlantix Launch", description: "Special Event Of The Year For Government / Federation / Association" },
    { id: 2, title: "Arab Media Summit", description: "Government Convention/ Business Event Of The Year" },
    { id: 3, title: "Hatta Winter Festival", description: "Special Event Of The Year For Government / Federation / Association" },
    { id: 4, title: "Sole DXB", description: "Public Special Event Of The Year" },
    { id: 5, title: "Arab Media Summit", description: "Government Convention/ Business Event Of The Year" },
    { id: 6, title: "Hatta Winter Festival", description: "Special Event Of The Year For Government / Federation / Association" },
    { id: 7, title: "Hatta Winter Festival", description: "Special Event Of The Year For Government / Federation / Association" },
    { id: 8, title: "Hatta Winter Festival", description: "Special Event Of The Year For Government / Federation / Association" },
    { id: 9, title: "Hatta Winter Festival", description: "Special Event Of The Year For Government / Federation / Association" },
    { id: 10, title: "Hatta Winter Festival", description: "Special Event Of The Year For Government / Federation / Association" },
    { id: 11, title: "Sole DXB", description: "Public Special Event Of The Year" },
    { id: 12, title: "Hatta Winter Festival", description: "Special Event Of The Year For Government" },
];

const middleEastEventItems: AwardItem[] = [
    { id: 1, title: "Arab Media Summit", description: "Government Convention/ Business Event Of The Year" },
    { id: 2, title: "Hatta Winter Festival", description: "Special Event Of The Year For Government / Federation / Association" },
    { id: 3, title: "Hatta Winter Festival", description: "Special Event Of The Year For Government / Federation / Association" },
    { id: 4, title: "Hatta Winter Festival", description: "Special Event Of The Year For Government / Federation / Association" },
];

const wowAwardsCarousel = Array(5).fill("/images/awards/wow-awards.png");
const middleEastEventCarousel = Array(4).fill("/images/awards/middle-east-event-award.png");

function buildYearTabs(yearSuffix: string): YearTabDef[] {
    return [
        {
            id: `wow-awards-middle-east-${yearSuffix}`,
            icon: "/images/awards/icons/wow-awards-middle-east.png",
            iconAlt: "WOW Awards Middle East",
            items: wowAwardsItems,
            carouselImages: wowAwardsCarousel,
            gradientWidthClass: "w-4/5",
        },
        {
            id: `middle-east-event-awards-${yearSuffix}`,
            icon: "/images/awards/icons/middle-east-event-awards.png",
            iconAlt: "Middle East Event Awards",
            items: middleEastEventItems,
            carouselImages: middleEastEventCarousel,
            gradientWidthClass: "w-full",
        },
    ];
}

// ---------- per-year exports ----------
export function AwardsTabContent2025() {
    const tabs = buildYearTabs("2025");
    return <AwardsYearTabContent tabs={tabs} defaultValue={tabs[0].id} />;
}

export function AwardsTabContent2024() {
    const tabs = buildYearTabs("2024");
    return <AwardsYearTabContent tabs={tabs} defaultValue={tabs[0].id} />;
}

export function AwardsTabContent2023() {
    const tabs = buildYearTabs("2023");
    return <AwardsYearTabContent tabs={tabs} defaultValue={tabs[0].id} />;
}

export function AwardsTabContent2022() {
    const tabs = buildYearTabs("2022");
    return <AwardsYearTabContent tabs={tabs} defaultValue={tabs[0].id} />;
}

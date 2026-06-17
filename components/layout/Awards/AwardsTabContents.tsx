import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AwardsTabs, AwardsTabsList, TabsTab, TabsPanel } from "@/components/ui/awards-bottom-tabs";
import { Carousel } from "@ark-ui/react/carousel";
import Image from "next/image";

const tabs2025Content1 = [
    {
        id: 1,
        title: "Exeed Exlantix Launch",
        description: "Special Event Of The Year For Government / Federation / Association",
    },
    {
        id: 2,
        title: "Arab Media Summit",
        description: "Government Convention/ Business Event Of The Year",
    },
    {
        id: 3,
        title: "Hatta Winter Festival",
        description: "Special Event Of The Year For Government / Federation / Association",
    },
    {
        id: 4,
        title: "Sole DXB",
        description: "Public Special Event Of The Year",
    },
    {
        id: 5,
        title: "Arab Media Summit",
        description: "Government Convention/ Business Event Of The Year",
    },
    {
        id: 6,
        title: "Hatta Winter Festival",
        description: "Special Event Of The Year For Government / Federation / Association",
    },
    {
        id: 7,
        title: "Hatta Winter Festival",
        description: "Special Event Of The Year For Government / Federation / Association",
    },
    {
        id: 8,
        title: "Hatta Winter Festival",
        description: "Special Event Of The Year For Government / Federation / Association",
    },
    {
        id: 9,
        title: "Hatta Winter Festival",
        description: "Special Event Of The Year For Government / Federation / Association",
    },
    {
        id: 10,
        title: "Hatta Winter Festival",
        description: "Special Event Of The Year For Government / Federation / Association",
    },
    {
        id: 11,
        title: "Sole DXB",
        description: "Public Special Event Of The Year",
    },
    {
        id: 12,
        title: "Hatta Winter Festival",
        description: "Special Event Of The Year For Government",
    },
];

// Images for WOW Awards carousel
const tabs2025Content1CarouselImages = [
    "/images/awards/wow-awards.png",
    "/images/awards/wow-awards.png",
    "/images/awards/wow-awards.png",
    "/images/awards/wow-awards.png",
    "/images/awards/wow-awards-5.png",
];

const tabs2025Content2 = [
    {
        id: 1,
        title: "Arab Media Summit",
        description: "Government Convention/ Business Event Of The Year",
    },
    {
        id: 2,
        title: "Hatta Winter Festival",
        description: "Special Event Of The Year For Government / Federation / Association",
    },
    {
        id: 3,
        title: "Hatta Winter Festival",
        description: "Special Event Of The Year For Government / Federation / Association",
    },
    {
        id: 4,
        title: "Hatta Winter Festival",
        description: "Special Event Of The Year For Government / Federation / Association",
    },
];

// Images for Middle East Event Awards carousel
const tabs2025Content2CarouselImages = [
    "/images/awards/middle-east-event-award.png",
    "/images/awards/middle-east-event-award.png",
    "/images/awards/middle-east-event-award.png",
    "/images/awards/middle-east-event-award.png",
];

const tabs2025 = [
    {
        id: "wow-awards-middle-east",
        label: <Image src="/images/awards/icons/wow-awards-middle-east.png" alt="WOW Awards Middle East" width={1000} height={1000} className="h-8 w-auto object-contain" />,
        content: (
            <div className="relative">
                {/* Carousel */}
                <Carousel.Root defaultPage={0} slideCount={tabs2025Content1CarouselImages.length} autoplay={{ delay: 2500 }} className="w-full">
                    <Carousel.ItemGroup className="">
                        {tabs2025Content1CarouselImages.map((image, index) => (
                            <Carousel.Item key={index} index={index}>
                                <img src={image} alt={`WOW Awards Slide ${index + 1}`} className="w-full h-full object-cover" />
                            </Carousel.Item>
                        ))}
                    </Carousel.ItemGroup>

                    {/* Optional: Add navigation controls */}
                    {/* <Carousel.Control className="flex items-center justify-between mt-4">
                        <Carousel.PrevTrigger className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-lg font-medium transition-colors text-white">Previous</Carousel.PrevTrigger>
                        <Carousel.NextTrigger className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-lg font-medium transition-colors text-white">Next</Carousel.NextTrigger>
                    </Carousel.Control> */}

                    {/* Optional: Add indicators */}
                    {/* <Carousel.IndicatorGroup className="flex justify-center items-center mt-4 gap-2">
                        {tabs2025Content1CarouselImages.map((_, index) => (
                            <Carousel.Indicator key={index} index={index} className="w-2 h-2 rounded-full bg-white/30 data-current:bg-white transition-colors cursor-pointer" />
                        ))}
                    </Carousel.IndicatorGroup> */}
                </Carousel.Root>

                {/* Gradient Overlay - z-10 (above image, below content) */}
                <div className="awards-slideshow-gradient absolute right-0 top-0 w-4/5 h-full z-10 pointer-events-none"></div>

                {/* Content Cards - z-20 (above gradient) */}
                <div className="absolute right-5 top-5 z-20">
                    <ul className="grid grid-cols-2 justify-center items-center gap-1.25">
                        {tabs2025Content1.map((value) => (
                            <li key={value.id} className="p-3 bg-white/10 backdrop-blur-lg w-51.25 h-25 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                                <h3 className="font-product-sans-medium text-lg leading-6 text-white">{value.title}</h3>
                                <p className="mt-0.75 font-product-sans-light text-[13px] leading-4 text-white tracking-wide">{value.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ),
    },
    {
        id: "middle-east-event-awards",
        label: <Image src="/images/awards/icons/middle-east-event-awards.png" alt="Middle East Event Awards" width={1000} height={1000} className="h-8 w-auto object-contain" />,
        content: (
            <div className="relative">
                {/* Carousel */}
                <Carousel.Root defaultPage={0} slideCount={tabs2025Content2CarouselImages.length} autoplay={{ delay: 2500 }} className="w-full">
                    <Carousel.ItemGroup className="overflow-hidden rounded-lg">
                        {tabs2025Content2CarouselImages.map((image, index) => (
                            <Carousel.Item key={index} index={index}>
                                <img src={image} alt={`Middle East Event Awards Slide ${index + 1}`} className="w-full h-auto object-cover" />
                            </Carousel.Item>
                        ))}
                    </Carousel.ItemGroup>

                    {/* Optional: Add navigation controls */}
                    {/* <Carousel.Control className="flex items-center justify-between mt-4">
                        <Carousel.PrevTrigger className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-lg font-medium transition-colors text-white">Previous</Carousel.PrevTrigger>
                        <Carousel.NextTrigger className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-lg font-medium transition-colors text-white">Next</Carousel.NextTrigger>
                    </Carousel.Control> */}

                    {/* Optional: Add indicators */}
                    {/* <Carousel.IndicatorGroup className="flex justify-center items-center mt-4 gap-2">
                        {tabs2025Content2CarouselImages.map((_, index) => (
                            <Carousel.Indicator key={index} index={index} className="w-2 h-2 rounded-full bg-white/30 data-current:bg-white transition-colors cursor-pointer" />
                        ))}
                    </Carousel.IndicatorGroup> */}
                </Carousel.Root>

                {/* Gradient Overlay - z-10 (above image, below content) */}
                <div className="awards-slideshow-gradient absolute right-0 top-0 w-full h-full z-10 pointer-events-none"></div>

                {/* Content Cards - z-20 (above gradient) */}
                <div className="absolute right-5 top-5 z-20">
                    <ul className="grid grid-cols-2 justify-center items-center gap-1.25">
                        {tabs2025Content2.map((value) => (
                            <li key={value.id} className="p-3 bg-white/10 backdrop-blur-lg w-51.25 h-25 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                                <h3 className="font-product-sans-medium text-lg leading-6 text-white">{value.title}</h3>
                                <p className="mt-0.75 font-product-sans-light text-[13px] leading-4 text-white tracking-wide">{value.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ),
    },
];

const tabs2024 = [
    {
        id: "overview",
        label: "Overview",
        content: <div>Overview Content</div>,
    },
    {
        id: "integrations",
        label: "Integrations",
        content: <div>Integrations Content</div>,
    },
    {
        id: "activity",
        label: "Activity",
        content: <div>Activity Content</div>,
    },
];

export function AwardsTabContent2025() {
    return (
        <Tabs defaultValue="wow-awards-middle-east">
            <div className="absolute left-1.25 bottom-1.25 z-100">
                <TabsList variant="underline">
                    {tabs2025.map((tab) => (
                        <TabsTab key={tab.id} value={tab.id}>
                            {tab.label}
                        </TabsTab>
                    ))}
                </TabsList>
            </div>

            {tabs2025.map((tab) => (
                <TabsPanel key={tab.id} value={tab.id}>
                    {tab.content}
                </TabsPanel>
            ))}
        </Tabs>
    );
}

export function AwardsTabContent2024() {
    return (
        <AwardsTabs defaultValue="overview">
            <AwardsTabsList>
                {tabs2024.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id}>
                        {tab.label}
                    </TabsTrigger>
                ))}
            </AwardsTabsList>
            {tabs2024.map((tab) => (
                <TabsContent key={tab.id} value={tab.id}>
                    {tab.content}
                </TabsContent>
            ))}
        </AwardsTabs>
    );
}

// components/layout/Awards/Awards.tsx
import HeaderDescription from "@/components/common/HeaderDescription";
import HeadingWithoutLogo from "@/components/common/HeadingWithoutLogo";
import SubHeading from "@/components/common/SubHeading";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { AwardsTabContent2025, AwardsTabContent2024, AwardsTabContent2023, AwardsTabContent2022 } from "./AwardsTabContents";
import { AWARDS_DATA, getAvailableYears } from "@/lib/data/awards-data";

interface YearTab {
    id: number;
    year: number;
}

export default function Awards() {
    const availableYears = getAvailableYears();

    const yearTabs: YearTab[] = availableYears.map((year, index) => ({
        id: availableYears.length - index,
        year,
    }));

    // Component mapping for each year
    const YearComponents = {
        2025: AwardsTabContent2025,
        2024: AwardsTabContent2024,
        2023: AwardsTabContent2023,
        2022: AwardsTabContent2022,
    };

    return (
        <section id="awards" className="hidden lg:block max-w-360 w-full mx-auto px-20 pt-9 lg:py-9 scroll-mt-14">
            <Tabs defaultValue={`tab-${yearTabs[0]?.id}`}>
                <header className="flex items-end justify-between">
                    <div>
                        <HeadingWithoutLogo title="Awards" />
                        <SubHeading title="Celebrated Achievements" />
                        <HeaderDescription description="Each recognition reflects the impact of our creative event experiences." scrollContainerRef={undefined} />
                    </div>

                    <TabsList className="p-1.25 rounded-none bg-slate-100 gap-2.5">
                        {yearTabs.map((tab) => (
                            <TabsTab key={tab.id} value={`tab-${tab.id}`} className="rounded-none text-sm py-4 px-6.75">
                                {tab.year}
                            </TabsTab>
                        ))}
                    </TabsList>
                </header>

                <div className="mt-9">
                    {yearTabs.map((tab) => {
                        const YearComponent = YearComponents[tab.year as keyof typeof YearComponents];
                        const yearData = AWARDS_DATA[tab.year];

                        if (!YearComponent || !yearData) return null;

                        return (
                            <TabsPanel key={tab.id} value={`tab-${tab.id}`}>
                                <YearComponent yearData={yearData} />
                            </TabsPanel>
                        );
                    })}
                </div>
            </Tabs>
        </section>
    );
}

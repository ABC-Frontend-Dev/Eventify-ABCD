import HeaderDescription from "@/components/common/HeaderDescription";
import HeadingWithoutLogo from "@/components/common/HeadingWithoutLogo";
import SubHeading from "@/components/common/SubHeading";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { AwardsTabContent2025, AwardsTabContent2024 } from "./AwardsTabContents";

interface yearTabsProps {
    id: number;
    years: number;
}
export default function Awards() {
    const yearTabs: yearTabsProps[] = [
        { id: 4, years: 2025 },
        { id: 3, years: 2024 },
        { id: 2, years: 2023 },
        { id: 1, years: 2022 },
    ];
    return (
        <section id="awards" className="hidden lg:block max-w-360 w-full mx-auto px-20 pt-9 lg:py-9 scroll-mt-14">
            <Tabs defaultValue="tab-1">
                <header className="flex items-end justify-between">
                    <div>
                        <HeadingWithoutLogo title="Awards" />
                        <SubHeading title="Celebrated Achievements" />
                        <HeaderDescription description="Each recognition reflects the impact of our creative event experiences." scrollContainerRef={undefined} />
                    </div>

                    {/* Now visually outside but still inside Tabs */}
                    <TabsList className="p-1.25 rounded-none bg-slate-100 gap-2.5">
                        {yearTabs.map((value, key) => (
                            <TabsTab key={key} value={`tab-${value.id}`} className={"rounded-none text-sm py-4 px-6.75"}>
                                {value.years}
                            </TabsTab>
                        ))}
                        {/* <TabsTab value="tab-2">Tab 2</TabsTab>
                        <TabsTab value="tab-3">Tab 3</TabsTab> */}
                    </TabsList>
                </header>

                <div className="mt-9">
                    <TabsPanel value="tab-1">
                        <AwardsTabContent2025 />
                    </TabsPanel>

                    <TabsPanel value="tab-2">
                        <AwardsTabContent2024 />
                    </TabsPanel>

                    <TabsPanel value="tab-3">
                        <p className="p-4 text-center text-muted-foreground text-xs">Tab 3 content</p>
                    </TabsPanel>
                </div>
            </Tabs>
        </section>
    );
}

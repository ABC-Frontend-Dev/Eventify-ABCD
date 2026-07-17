"use client";

import { useEffect, useState } from "react";
import HeaderDescription from "@/components/common/HeaderDescription";
import HeadingWithoutLogo from "@/components/common/HeadingWithoutLogo";
import SubHeading from "@/components/common/SubHeading";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import AwardsYearTabContent from "./AwardsYearTabContent";

interface AwardCategory {
    id: number;
    name: string;
    icon: string;
    iconAlt: string;
    items: Array<{ id: number; title: string; description: string }>;
    carouselImages: Array<{ id: number; url: string }>;
    gradientWidthClass: string;
}

interface Award {
    id: number;
    year: number;
    categories: AwardCategory[];
}

interface YearTab {
    id: number;
    year: number;
}

export default function Awards() {
    const [awards, setAwards] = useState<Award[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAwards = async () => {
            try {
                const response = await fetch("/api/awards");
                const data = await response.json();
                if (data.success) {
                    setAwards(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch awards:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAwards();
    }, []);

    if (loading) {
        return (
            <section id="awards" className="hidden lg:block max-w-360 w-full mx-auto px-20 pt-9 lg:py-9 scroll-mt-14">
                <header className="flex items-end justify-between">
                    <div>
                        <HeadingWithoutLogo title="Awards" />
                        <SubHeading title="Celebrated Achievements" />
                        <HeaderDescription description="Each recognition reflects the impact of our creative event experiences." scrollContainerRef={undefined} />
                    </div>
                </header>
                <div className="mt-9 flex items-center justify-center py-20">
                    <p className="text-slate-400">Loading awards...</p>
                </div>
            </section>
        );
    }

    if (awards.length === 0) {
        return null;
    }

    const yearTabs: YearTab[] = awards.map((award, index) => ({
        id: award.id,
        year: award.year,
    }));

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
                    {awards.map((award) => (
                        <TabsPanel key={award.id} value={`tab-${award.id}`}>
                            <AwardsYearTabContent categories={award.categories} />
                        </TabsPanel>
                    ))}
                </div>
            </Tabs>
        </section>
    );
}

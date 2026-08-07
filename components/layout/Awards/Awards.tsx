"use client";

import { useEffect, useState } from "react";
import HeadingWithoutLogo from "@/components/common/HeadingWithoutLogo";
import SubHeading from "@/components/common/SubHeading";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import AwardsYearTabContent from "./AwardsYearTabContent";

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

interface Award {
    id: number;
    year: number;
    categories: AwardCategory[];
}

export default function Awards() {
    const [awards, setAwards] = useState<Award[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/awards")
            .then((r) => r.json())
            .then((data) => {
                if (data.success) setAwards(data.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section id="awards" className="hidden lg:block max-w-360 w-full mx-auto px-20 pt-9 lg:py-9 scroll-mt-14">
                <header className="flex items-end justify-between">
                    <div>
                        <HeadingWithoutLogo title="Awards" />
                        <SubHeading sectionType="AWARD" showDescription />
                    </div>
                </header>
                <div className="mt-5 flex items-center justify-center py-20">
                    <p className="text-slate-400">Loading awards…</p>
                </div>
            </section>
        );
    }

    if (awards.length === 0) return null;

    return (
        <section id="awards" className="hidden lg:block max-w-360 w-full mx-auto px-20 pt-9 lg:py-9 scroll-mt-14">
            <Tabs defaultValue={`tab-${awards[0]?.id}`}>
                <header className="flex items-end justify-between">
                    <div>
                        <HeadingWithoutLogo title="Awards" />
                        <SubHeading sectionType="AWARD" showDescription />
                    </div>

                    <TabsList className="p-1.25 rounded-none bg-slate-100 gap-2.5">
                        {awards.map((award) => (
                            <TabsTab key={award.id} value={`tab-${award.id}`} className="rounded-none text-sm py-4 px-6.75">
                                {award.year}
                            </TabsTab>
                        ))}
                    </TabsList>
                </header>

                <div className="mt-5">
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

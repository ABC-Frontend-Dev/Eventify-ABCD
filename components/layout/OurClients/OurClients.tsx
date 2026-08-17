// components/layout/OurClients/OurClients.tsx
"use client";

import HeadingWithLogo from "@/components/common/HeadingWithLogo";
import HeaderDescription from "@/components/common/HeaderDescription";
import SubHeading from "@/components/common/SubHeading";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import CloudMarquee from "@/components/ui/logo-clouds";

interface Client {
    id: number;
    name: string;
    image: string;
    order: number;
}

interface MarqueeItem {
    src: string;
    alt: string;
}

export default function OurClients() {
    const [row1, setRow1] = useState<MarqueeItem[]>([]);
    const [row2, setRow2] = useState<MarqueeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const sectionRef = useRef<HTMLElement | null>(null);

    async function getClients() {
        try {
            const response = await axios.get("/api/clients");

            // API already returns clients sorted by `order: asc`
            const clientsData: Client[] = response.data.data;

            // Distribute into two rows while preserving the arranged order:
            // Even indexes  (0, 2, 4…) → row 1
            // Odd  indexes  (1, 3, 5…) → row 2
            setRow1(clientsData.filter((_, index) => index % 2 === 0).map((client) => ({ src: client.image, alt: client.name })));

            setRow2(clientsData.filter((_, index) => index % 2 !== 0).map((client) => ({ src: client.image, alt: client.name })));
        } catch (error) {
            console.error("Failed to get clients:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getClients();
    }, []);

    return (
        <section id="our-clients" ref={sectionRef} className="max-w-360 w-full mx-auto px-3.5 lg:px-20 pt-9 lg:py-9 scroll-mt-1">
            <header>
                <HeadingWithLogo titlePart1="Our" titlePart2_1="Cli" titlePart2_2="nts" />
                <SubHeading sectionType="CLIENT" showDescription />
            </header>

            <div className="mt-9">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loading our amazing clients...</p>
                        </div>
                    </div>
                ) : row1.length === 0 && row2.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-sm text-gray-400">No clients to display yet.</p>
                    </div>
                ) : (
                    <CloudMarquee row1={row1} row2={row2} speed={28} />
                )}
            </div>
        </section>
    );
}

"use client";

import HeadingWithLogo from "@/components/common/HeadingWithLogo";
import HeaderDescription from "@/components/common/HeaderDescription";
import SubHeading from "@/components/common/SubHeading";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import CloudMarquee from "@/components/ui/logo-clouds";

export default function OurClients() {
    const [clients, setClients] = useState([]);
    const [row1, setRow1] = useState([]);
    const [row2, setRow2] = useState([]);
    const sectionRef = useRef<HTMLElement | null>(null);

    async function getClients() {
        try {
            const response = await axios.get("/api/clients");
            const clientsData = response.data.data;
            setClients(clientsData);

            // Distribute clients alternately between two rows
            const firstRow = clientsData
                .filter((_: any, index: number) => index % 2 === 0)
                .map((client: any) => ({
                    src: client.image,
                    alt: client.name,
                }));

            const secondRow = clientsData
                .filter((_: any, index: number) => index % 2 !== 0)
                .map((client: any) => ({
                    src: client.image,
                    alt: client.name,
                }));

            setRow1(firstRow);
            setRow2(secondRow);
        } catch (error) {
            console.log("Failed to get clients.");
        }
    }

    useEffect(() => {
        getClients();
    }, []);

    return (
        <section id="our-clients" ref={sectionRef} className="max-w-360 w-full mx-auto px-5 lg:px-20 pt-9 lg:py-9 scroll-mt-14">
            <header>
                <HeadingWithLogo titlePart1="Our" titlePart2_1="Cli" titlePart2_2="nts" />
                <SubHeading title="Brands that believe in us" />
                <HeaderDescription description="From startups to established companies, our clients trust us to bring their ideas to life." scrollContainerRef={undefined} />
            </header>

            <div className="mt-9">
                {clients.length > 0 ? (
                    <CloudMarquee row1={row1} row2={row2} speed={28} />
                ) : (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loading our amazing clients...</p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

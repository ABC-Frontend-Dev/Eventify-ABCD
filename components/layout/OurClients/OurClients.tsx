"use client";

import HeadingWithLogo from "@/components/common/HeadingWithLogo";
import HeaderDescription from "@/components/common/HeaderDescription";
import SubHeading from "@/components/common/SubHeading";
import Image from "next/image";
import axios from "axios";
import { useEffect, useState } from "react";

export default function OurClients() {
    const [clients, setClients] = useState([]);

    async function getClients() {
        try {
            const response = await axios.get("/api/clients");

            console.log(response.data);

            setClients(response.data.data);
        } catch (error) {
            console.log("Failed to get clients.");
        }
    }

    useEffect(() => {
        getClients();
    }, []);

    return (
        <section className="max-w-360 w-full mx-auto px-20 py-9">
            <header>
                <HeadingWithLogo titlePart1="Our" titlePart2_1="Cli" titlePart2_2="nts" />

                <SubHeading title="Brands that believe in us" />

                <HeaderDescription description="From startups to established companies, our clients trust us to bring their ideas to life." scrollContainerRef={undefined} />
            </header>

            <div className="mt-9">
                <ul className="grid grid-cols-4 gap-y-10">
                    {clients.map((client: any) => (
                        <li key={client.id} className="flex items-center justify-center group">
                            <Image
                                src={client.image}
                                alt={client.name}
                                width={1000}
                                height={1000}
                                className="w-61.25 h-24 object-contain grayscale-100 group-hover:grayscale-0 transition-all duration-200 cursor-pointer"
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

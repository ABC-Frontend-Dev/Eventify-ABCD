"use client";

import HeadingWithLogo from "@/components/common/HeadingWithLogo";
import HeaderDescription from "@/components/common/HeaderDescription";
import SubHeading from "@/components/common/SubHeading";
import Image from "next/image";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function OurClients() {
    const [clients, setClients] = useState([]);
    const sectionRef = useRef<HTMLElement | null>(null);
    const cardsRef = useRef<(HTMLLIElement | null)[]>([]);

    async function getClients() {
        try {
            const response = await axios.get("/api/clients");
            setClients(response.data.data);
        } catch (error) {
            console.log("Failed to get clients.");
        }
    }

    useEffect(() => {
        getClients();
    }, []);

    // Single useEffect that handles everything after clients load
    // Single useEffect that handles everything after clients load
    useEffect(() => {
        if (!clients.length || !sectionRef.current) return;

        const cards = gsap.utils.toArray<HTMLElement>(sectionRef.current.querySelectorAll("li"));

        // Set initial state immediately to prevent flash
        gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 });

        cards.forEach((card, i) => {
            gsap.to(card, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 88%",
                    end: "top 20%",
                    toggleActions: "play none none reverse", // play once, no restart jank
                },
                delay: (i % 4) * 0.08, // stagger per column position
            });
        });

        return () => {
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, [clients]);

    return (
        <section id="our-clients" ref={sectionRef} className="max-w-360 w-full mx-auto px-5 lg:px-20 pt-9 lg:py-9">
            <header>
                <HeadingWithLogo titlePart1="Our" titlePart2_1="Cli" titlePart2_2="nts" />
                <SubHeading title="Brands that believe in us" />
                <HeaderDescription description="From startups to established companies, our clients trust us to bring their ideas to life." scrollContainerRef={undefined} />
            </header>

            <div className="mt-9">
                <ul className="grid grid-cols-2 lg:grid-cols-4 gap-y-10">
                    {clients.map((client: any, index: number) => (
                        <li
                            key={client.id}
                            ref={(el) => {
                                cardsRef.current[index] = el;
                            }}
                            className="flex items-center justify-center group will-change-transform"
                        >
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

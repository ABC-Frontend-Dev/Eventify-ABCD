// components/layout/OurServices/OurServices.tsx
"use client";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeadingWithLogo from "@/components/common/HeadingWithLogo";
import HeaderDescription from "@/components/common/HeaderDescription";
import SubHeading from "@/components/common/SubHeading";
import { EmblaCarousel } from "./Carousel";

export default function OurServices() {
    useEffect(() => {
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <section className="max-w-360 w-full mx-auto px-20 py-9">
            <header>
                <HeadingWithLogo titlePart1="Our" titlePart2_1="S" titlePart2_2="rvices" />
                <SubHeading title="What we offer" />
                <HeaderDescription description="Expertise-driven services designed to elevate your projects." scrollContainerRef={undefined} />
            </header>

            <div className="mt-9">
                <EmblaCarousel />
            </div>
        </section>
    );
}

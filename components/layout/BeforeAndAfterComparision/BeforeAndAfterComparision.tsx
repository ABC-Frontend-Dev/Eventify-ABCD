// components/layout/OurServices/OurServices.tsx
"use client";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeaderDescription from "@/components/common/HeaderDescription";
import SubHeading from "@/components/common/SubHeading";
import { ComparisonCarousel } from "./Carousel";
import HeadingWithoutLogo from "@/components/common/HeadingWithoutLogo";

export default function BeforeAndAfterComparision() {
    useEffect(() => {
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <section id="our-services" className="max-w-360 w-full mx-auto px-5 lg:px-20 pt-9 lg:py-9 scroll-mt-14">
            <header>
                <HeadingWithoutLogo title="Transformation" />
                <SubHeading title="See the Remarkable Difference" />
                <HeaderDescription
                    description="Compare the before and after results to witness the quality, precision, and attention to detail behind every transformation."
                    scrollContainerRef={undefined}
                />
            </header>

            <div className="mt-9">
                <ComparisonCarousel />
            </div>
        </section>
    );
}

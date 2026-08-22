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
        <section id="our-services" className="max-w-360 w-full mx-auto px-3.5 lg:px-20 pt-9 lg:py-9 scroll-mt-1">
            {/* <header>
                <HeadingWithoutLogo title="Transformation" />
                <SubHeading title="From Render to Reality" />
                <HeaderDescription
                    description="Compare the before and after results to witness the quality, precision, and attention to detail behind every transformation."
                    scrollContainerRef={undefined}
                />
            </header> */}

            <div className="mt-3 lg:mt-7.5 flex gap-20 items-center">
                <div className="w-2/3 shrink-0">
                    <ComparisonCarousel />
                </div>
                <div className="w-1/3">
                    <p className="text-base font-helvetica-neue-roman leading-5 text-footer-bg text-left">
                        We transform creative concepts into extraordinary event environments through detailed 3D visualization, expert fabrication, and precision execution. Every element is crafted to
                        reflect the original vision with exceptional accuracy.
                    </p>
                </div>
            </div>
        </section>
    );
}

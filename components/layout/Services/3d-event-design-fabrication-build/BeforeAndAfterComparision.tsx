// components/layout/OurServices/OurServices.tsx
"use client";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeaderDescription from "@/components/common/HeaderDescription";
import SubHeading from "@/components/common/SubHeading";
import { ComparisonCarousel } from "./Carousel";
import HeadingWithoutLogo from "@/components/common/HeadingWithoutLogo";
import Breadcrumb from "@/components/common/Breadcrumb";

export default function BeforeAndAfterComparision() {
    useEffect(() => {
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <section id="our-services" className="max-w-360 w-full mx-auto mt-16 lg:mt-26 px-3.5 lg:px-20 pb-13  scroll-mt-6 md:scroll-mt-1">
            {/* <header>
                <HeadingWithoutLogo title="Transformation" />
                <SubHeading title="From Render to Reality" />
                <HeaderDescription
                    description="Compare the before and after results to witness the quality, precision, and attention to detail behind every transformation."
                    scrollContainerRef={undefined}
                />
            </header> */}
            <Breadcrumb props={{ className: "mt-1.5 md:mt-3.5 text-white" }} />

            <div className="mt-3 lg:mt-7.5 flex gap-20 items-center">
                <div className="w-2/3 shrink-0">
                    <ComparisonCarousel />
                </div>
                <div className="w-1/3">
                    <h1 className="text-xl md:text-2xl lg:text-3xl leading-6 md:leading-7 lg:leading-8.5 font-medium font-abc-laica-a-italic-variable-trial mb-2">
                        3D Event Design, Fabrication & Build
                    </h1>
                    <p className="text-base font-helvetica-neue-roman leading-5 text-footer-bg text-left">
                        We transform creative concepts into extraordinary event environments through detailed 3D visualization, expert fabrication, and precision execution. Every element is crafted to
                        reflect the original vision with exceptional accuracy.
                    </p>
                </div>
            </div>
        </section>
    );
}

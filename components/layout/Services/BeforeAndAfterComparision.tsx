// components/layout/OurServices/OurServices.tsx
"use client";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeaderDescription from "@/components/common/HeaderDescription";
import SubHeading from "@/components/common/SubHeading";
import { ComparisonCarousel } from "./Carousel";
import HeadingWithoutLogo from "@/components/common/HeadingWithoutLogo";
import Breadcrumb from "@/components/common/ServicesBreadcrumb";
import SectionPageHeader from "@/components/common/SectionPageHeader";

export default function BeforeAndAfterComparision() {
    useEffect(() => {
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);

        return () => clearTimeout(timer);
    }, []);


    const servicesBreadcrumb = [
    {
        label: "Home",
        href: "/",
    },
    {
        label: "Services",
        href: "/#services",
    },
    {
        label: "3D Event Design, Fabrication & Build",
    },
];
    return (
        <section id="our-services" className="max-w-360 w-full mx-auto mt-16 lg:mt-26 px-3.5 lg:px-20 pb-9 xl:pb-13 scroll-mt-6 md:scroll-mt-1 lg:mb-22 xl:mb-0">
            {/* <header>
                <HeadingWithoutLogo title="Transformation" />
                <SubHeading title="From Render to Reality" />
                <HeaderDescription
                    description="Compare the before and after results to witness the quality, precision, and attention to detail behind every transformation."
                    scrollContainerRef={undefined}
                />
            </header> */}
            <Breadcrumb items={servicesBreadcrumb} />

            <div className="mt-3 lg:mt-7.5 flex flex-col xl:flex-row gap-y-5 xl: gap-x-8 1-xl:gap-x-16 2xl:gap-x-20 items-center">
                <div className="w-full xl:w-2/3 shrink-0">
                    <ComparisonCarousel />
                </div>
                <SectionPageHeader title={"3D Event Design, Fabrication & Build"} description="We transform creative concepts into extraordinary event environments through detailed 3D visualization, expert fabrication, and precision execution. Every element is crafted to
                        reflect the original vision with exceptional accuracy."/>
            </div>
        </section>
    );
}

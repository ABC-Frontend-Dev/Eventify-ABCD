// components/layout/OurServices/OurServices.tsx
"use client";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Breadcrumb from "@/components/common/Breadcrumb";
import SectionPageHeader from "@/components/common/SectionPageHeader";

export default function TechnicalDeliveryAV() {
    useEffect(() => {
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <section id="our-services" className="max-w-360 w-full mx-auto mt-16 lg:mt-26 px-3.5 lg:px-20 pb-9 xl:pb-13  scroll-mt-6 md:scroll-mt-1 lg:mb-22 xl:mb-0">
            {/* <header>
                <HeadingWithoutLogo title="Transformation" />
                <SubHeading title="From Render to Reality" />
                <HeaderDescription
                    description="Compare the before and after results to witness the quality, precision, and attention to detail behind every transformation."
                    scrollContainerRef={undefined}
                />
            </header> */}
            <Breadcrumb props={{ className: "mt-1.5 md:mt-3.5 text-white" }} />

            <div className="mt-3 lg:mt-7.5 flex flex-col xl:flex-row gap-y-5 xl: gap-x-8 1-xl:gap-x-16 2xl:gap-x-20 items-center">
                <div className="w-full xl:w-2/3 shrink-0">
                   <video 
    className="w-full h-full object-cover"
    autoPlay
    loop
    muted
    playsInline
    preload="metadata"
    poster="https://res.cloudinary.com/afdhm38k/image/upload/v1787833659/technical-delivery-av_l5ufkn.jpg"
>
    <source
        src="https://res.cloudinary.com/afdhm38k/video/upload/v1787832702/technical-delivery-av_abrwcv.mp4"
        type="video/mp4"
    />
    Your browser does not support the video tag.
</video>
                </div>
                <SectionPageHeader title={"Technical Delivery & AV"} description="We provide seamless technical production with state-of-the-art audiovisual solutions, lighting, staging, and live event technology to ensure every moment is delivered flawlessly."/>
            </div>
        </section>
    );
}

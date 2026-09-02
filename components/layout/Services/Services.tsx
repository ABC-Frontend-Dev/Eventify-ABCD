"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Breadcrumb from "@/components/common/ServicesBreadcrumb";
import { DynamicComparisonCarousel } from "./DynamicCarousel";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ComparisonImage {
    id: number;
    beforeImage: string;
    beforeAlt: string | null;
    afterImage: string;
    afterAlt: string | null;
    order: number;
}

interface Service {
    id: number;
    title: string;
    breadcrumb: string;
    description: string | null;
    content: string;
    bannerImage: string;
    bannerImageAlt: string | null;
    mediaType: string;
    videoUrl: string | null;
    videoPoster: string | null;
    comparisonImages: ComparisonImage[];
}

interface ServicesPageContentProps {
    service: Service;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ServicesPageContent({ service }: ServicesPageContentProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: "Services", href: "/#services" },
        { label: service.breadcrumb },
    ];

    return (
        <section
            id="our-services"
            className="max-w-360 w-full mx-auto mt-16 lg:mt-26 px-3.5 lg:px-20 pb-9 xl:pb-13 scroll-mt-6 md:scroll-mt-1 lg:mb-22 xl:mb-0"
        >
            <Breadcrumb items={breadcrumbItems} />

            <div className="mt-3 lg:mt-7.5 flex flex-col xl:flex-row gap-y-5 xl:gap-x-8 1-xl:gap-x-16 2xl:gap-x-20 items-center">

                {/* ── Left: media ── */}
                <div className="w-full xl:w-2/3 shrink-0">
                    {service.mediaType === "video" && service.videoUrl ? (
                        <ServicesVideo
                            src={service.videoUrl}
                            poster={service.videoPoster || undefined}
                        />
                    ) : service.mediaType === "image" && service.comparisonImages.length > 0 ? (
                        <DynamicComparisonCarousel
                            items={service.comparisonImages.map((img, i) => ({
                                id: img.id,
                                title: String(i + 1),
                                beforeImage: img.beforeImage,
                                afterImage: img.afterImage,
                                beforeAlt: img.beforeAlt || `${service.title} — Before`,
                                afterAlt: img.afterAlt || `${service.title} — After`,
                            }))}
                        />
                    ) : (
                        service.bannerImage && (
                            <img
                                src={service.bannerImage}
                                alt={service.bannerImageAlt || service.title}
                                className="w-full h-full object-cover"
                            />
                        )
                    )}
                </div>

                {/* ── Right: title + rich text content ── */}
                <div className="w-full xl:w-1/3">
                    <h1 className="text-xl md:text-2xl lg:text-3xl leading-6 md:leading-7 lg:leading-8.5 font-medium font-abc-laica-a-italic-variable-trial mb-4">
                        {service.title}
                    </h1>

                    {/* Rich text content from TipTap editor */}
                    {service.content && (
                        <div
                            className="
                                text-base font-helvetica-neue-roman leading-5
                                text-footer-bg text-left
                                prose prose-sm max-w-none
                                prose-p:text-footer-bg prose-p:font-helvetica-neue-roman
                                prose-headings:font-abc-laica-a-italic-variable-trial
                                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                                prose-strong:font-helvetica-medium
                                prose-ul:list-disc prose-ul:pl-5
                                prose-ol:list-decimal prose-ol:pl-5
                                prose-li:text-footer-bg prose-li:font-helvetica-neue-roman
                            "
                            dangerouslySetInnerHTML={{ __html: service.content }}
                        />
                    )}

                    {/* description — commented out, using content instead */}
                    {/* <p className="text-base font-helvetica-neue-roman leading-5 text-footer-bg text-left">
                        {service.description}
                    </p> */}
                </div>
            </div>
        </section>
    );
}

// ─── Video sub-component ──────────────────────────────────────────────────────

function ServicesVideo({ src, poster }: { src: string; poster?: string }) {
    return (
        <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={poster}
        >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
}
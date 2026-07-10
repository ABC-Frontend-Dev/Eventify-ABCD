"use client";

import Image from "next/image";
import ServicesBannerReveal from "./ServicesBannerReveal";

interface ServicesImages {
    id: number;
    image: string;
    title: string;
}

const Services_Images_Data: ServicesImages[] = [
    {
        id: 1,
        image: "/images/services/conferences/Rectangle 344.png",
        title: "Image 1",
    },
    {
        id: 2,
        image: "/images/services/conferences/Rectangle 344-1.png",
        title: "Image 1",
    },
    {
        id: 3,
        image: "/images/services/conferences/Rectangle 344-2.png",
        title: "Image 2",
    },
    {
        id: 4,
        image: "/images/services/conferences/Rectangle 344-3.png",
        title: "Image 3",
    },
    {
        id: 5,
        image: "/images/services/conferences/Rectangle 344-4.png",
        title: "Image 4",
    },
    {
        id: 6,
        image: "/images/services/conferences/Rectangle 344-5.png",
        title: "Image 5",
    },
    {
        id: 7,
        image: "/images/services/conferences/Rectangle 344-6.png",
        title: "Image 6",
    },
    {
        id: 8,
        image: "/images/services/conferences/Rectangle 344-7.png",
        title: "Image 7",
    },
];

export default function ServicesContent() {
    return (
        <>
            <ServicesBannerReveal desktopSrc={""} mobileSrc={""} alt={""} />
            <article className="bg-slate-50 p-5 lg:p-7.5">
                <header>
                    <h1 className="text-4xl font-helvetica-medium leading-8 text-primary">Conferences</h1>
                </header>

                <div className="mt-3.5 flex flex-col lg:flex-row gap-3.5 lg:gap-12.5 items-start">
                    <p className="shrink-0 max-w-152.5 w-full font-product-sans-regular text-base text-footer-bg leading-5.5 tracking-wide">
                        We have the ability to bring disruption in all aspects of the conference or the seminar that we host for our clients. Managing this large format conferences and seminars is our
                        core strength, the founders presently and in their previous roles have individually and collectively delivered note-worthy corporate events and the most prestigious government
                        summits over the years for clients such as Dubai Chamber of Commerce, Dubai International Chamber, Dubai Digital Chamber, International Chamber of Commerce and Industry,
                        Government of Dubai Media Office, Dubai Press Club, Brand Dubai and DP World
                    </p>

                    <div className="">
                        <p className="font-product-sans-medium text-xl text-footer-bg leading-6">Key Conferences executed by the team are:</p>

                        <ul className="mt-2.5 ml-4.25 space-y-1 list-disc">
                            <li>
                                <p className="w-full font-product-sans-regular text-base text-footer-bg leading-5.5 tracking-wide">World chamber congress</p>
                            </li>
                            <li>
                                <p className="w-full font-product-sans-regular text-base text-footer-bg leading-5.5 tracking-wide">Dubai digital economy retreat</p>
                            </li>
                            <li>
                                <p className="w-full font-product-sans-regular text-base text-footer-bg leading-5.5 tracking-wide">Arab Media Forum (AMF) & Arab Journalism Awards (AJA)</p>
                            </li>
                            <li>
                                <p className="w-full font-product-sans-regular text-base text-footer-bg leading-5.5 tracking-wide">Arab Social Media Influencers Summit (ASMIS)</p>
                            </li>
                            <li>
                                <p className="w-full font-product-sans-regular text-base text-footer-bg leading-5.5 tracking-wide">Emirati Media Forum (EMF)</p>
                            </li>
                            <li>
                                <p className="w-full font-product-sans-regular text-base text-footer-bg leading-5.5 tracking-wide">
                                    Global Business Forum (GBF) for <strong>ASEAN, LATAM & AFRICA</strong>
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>

                <p className="mt-3.5 lg:mt-11.5 w-full font-product-sans-regular text-base text-footer-bg leading-5.5 tracking-wide">
                    We have the ability to bring disruption in all aspects of the conference or the seminar that we host for our clients. Managing this large format conferences and seminars is our
                    core strength, the founders presently and in their previous roles have individually and collectively delivered note-worthy corporate events and the most prestigious government
                    summits over the years for clients such as Dubai Chamber of Commerce, Dubai International Chamber, Dubai Digital Chamber, International Chamber of Commerce and Industry, Government
                    of Dubai Media Office, Dubai Press Club, Brand Dubai and DP World
                </p>

                <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 mt-3.5 gap-2.5">
                    {Services_Images_Data.map((item) => (
                        <li className="w-37.5 h-25 px-4 py-2.5 bg-white">
                            <figure>
                                <Image src={item.image} alt={item.title} width={1000} height={1000} className="w-full h-full object-contain" />
                            </figure>
                        </li>
                    ))}
                </ul>
            </article>
        </>
    );
}

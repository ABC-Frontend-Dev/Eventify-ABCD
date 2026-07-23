"use client";

import Image from "next/image";
import Breadcrumb from "@/components/common/Breadcrumb";

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
        <div className="relative bg-[linear-gradient(90deg,_rgba(255,255,255,1)_45%,_rgba(16,132,179,0)_100%)] py-15">
            <div className="max-w-360 w-full mx-auto px-5 lg:px-20 pb-0">
                <div>
                    <div className="text-[40px] leading-10 font-helvetica font-bold tracking-wide">Our services</div>
                    <Breadcrumb props={{ className: "mt-3.5" }} />
                </div>

                {/* <ServicesBannerReveal desktopSrc={""} mobileSrc={""} alt={""} /> */}
                <article className="mt-7.5">
                    <header>
                        <h1 className="text-xl lg:text-4xl font-helvetica-medium leading-8 text-primary uppercase">Design Concept & Strategic Direction</h1>
                    </header>

                    <div className="mt-3.5 flex flex-row gap-0">
                        <div className="w-[70%] pr-10">
                            {/* <div className=""></div> */}
                            <p className="shrink-0 max-w-152.5 w-full font-helvetica text-base text-footer-bg leading-5.5 tracking-wide">
                                We have the ability to bring disruption in all aspects of the conference or the seminar that we host for our clients. Managing this large format conferences and
                                seminars is our core strength, the founders presently and in their previous roles have individually and collectively delivered note-worthy corporate events and the most
                                prestigious government summits over the years for clients such as Dubai Chamber of Commerce, Dubai International Chamber, Dubai Digital Chamber, International Chamber
                                of Commerce and Industry, Government of Dubai Media Office, Dubai Press Club, Brand Dubai and DP World
                            </p>

                            <p className="mt-1.5 lg:mt-4.5 font-product-sans-medium text-xl text-footer-bg leading-6">Key Conferences executed by the team are:</p>

                            <ul className="mt-1.5 lg:mt-2.5 ml-4.25 space-y-1 list-disc">
                                <li>
                                    <p className="w-full font-helvetica text-base text-footer-bg leading-5.5 tracking-wide">World chamber congress</p>
                                </li>
                                <li>
                                    <p className="w-full font-helvetica text-base text-footer-bg leading-5.5 tracking-wide">Dubai digital economy retreat</p>
                                </li>
                                <li>
                                    <p className="w-full font-helvetica text-base text-footer-bg leading-5.5 tracking-wide">Arab Media Forum (AMF) & Arab Journalism Awards (AJA)</p>
                                </li>
                                <li>
                                    <p className="w-full font-helvetica text-base text-footer-bg leading-5.5 tracking-wide">Arab Social Media Influencers Summit (ASMIS)</p>
                                </li>
                                <li>
                                    <p className="w-full font-helvetica text-base text-footer-bg leading-5.5 tracking-wide">Emirati Media Forum (EMF)</p>
                                </li>
                                <li>
                                    <p className="w-full font-helvetica text-base text-footer-bg leading-5.5 tracking-wide">
                                        Global Business Forum (GBF) for <strong>ASEAN, LATAM & AFRICA</strong>
                                    </p>
                                </li>
                            </ul>

                            <p className="mt-1.5 lg:mt-4.5 w-full font-helvetica text-base text-footer-bg leading-5.5 tracking-wide">
                                We have the ability to bring disruption in all aspects of the conference or the seminar that we host for our clients. Managing this large format conferences and
                                seminars is our core strength, the founders presently and in their previous roles have individually and collectively delivered note-worthy corporate events and the most
                                prestigious government summits over the years for clients such as Dubai Chamber of Commerce, Dubai International Chamber, Dubai Digital Chamber, International Chamber
                                of Commerce and Industry, Government of Dubai Media Office, Dubai Press Club, Brand Dubai and DP World
                            </p>
                        </div>

                        <div className="w-[40%]">
                            <ul className="grid grid-cols-2 mt-3.5 gap-2.5">
                                {Services_Images_Data.map((item) => (
                                    <li className="w-full h-20 md:h-33 px-4 py-2.5 bg-white">
                                        <figure>
                                            <Image src={item.image} alt={item.title} width={1000} height={1000} className="w-full h-fit object-cover" />
                                        </figure>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </article>
            </div>
            <figure className="absolute right-0 top-0 w-[55%] h-full -z-1">
                <Image
                    src="https://res.cloudinary.com/afdhm38k/image/upload/v1784200695/eventify/services/qob9obp93p0fjtsmjkpv.webp"
                    alt=""
                    width={1000}
                    height={1000}
                    className="w-full h-full object-cover"
                />
            </figure>
        </div>
    );
}

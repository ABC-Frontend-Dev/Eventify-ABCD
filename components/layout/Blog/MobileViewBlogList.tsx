// components/layout/Blog/BlogListCarouselCard.tsx

"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface CarouselItem {
    id: number;
    url: string;
    category: React.ReactNode;
    title: string;
    description: string;
    authorName: string;
    authorImage: string;
    image: string;
    date: string;
    readTime: string;
}

const CAROUSEL_DATA: CarouselItem[] = [
    {
        id: 1,
        url: "/blog/best-first-copy-watches-for-him-under-rs-3-000",
        category: "Conferences",
        title: "UAE In-Focus – Dubai wins bids for 99 events in H1; Al Khair Initiative continues to help defaulters",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        authorName: "Maximus Wooten",
        authorImage: "/images/blogs/Ellipse 5.png",
        image: "/images/blogs/Group 48531.png",
        date: "Apr 12, 2026",
        readTime: "5 min",
    },
    {
        id: 2,
        url: "/blog/best-first-copy-watches-for-him-under-rs-3-000",
        category: "Conferences",
        title: "UAE In-Focus – Dubai wins bids for 99 events in H1; Al Khair Initiative continues to help defaulters",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        authorName: "Maximus Wooten",
        authorImage: "/images/blogs/Ellipse 5.png",
        image: "/images/blogs/Group 48531.png",
        date: "Apr 12, 2026",
        readTime: "5 min",
    },
    {
        id: 3,
        url: "/blog/best-first-copy-watches-for-him-under-rs-3-000",
        category: "Conferences",
        title: "UAE In-Focus – Dubai wins bids for 99 events in H1; Al Khair Initiative continues to help defaulters",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        authorName: "Maximus Wooten",
        authorImage: "/images/blogs/Ellipse 5.png",
        image: "/images/blogs/Group 48531.png",
        date: "Apr 12, 2026",
        readTime: "5 min",
    },
    {
        id: 4,
        url: "/blog/best-first-copy-watches-for-him-under-rs-3-000",
        category: "Conferences",
        title: "UAE In-Focus – Dubai wins bids for 99 events in H1; Al Khair Initiative continues to help defaulters",
        description: "Managing large format conferences and seminars is our strength, the founders in their previous roles have individually and collectively delivered note-worthy corporate events.",
        authorName: "Maximus Wooten",
        authorImage: "/images/blogs/Ellipse 5.png",
        image: "/images/blogs/Group 48531.png",
        date: "Apr 12, 2026",
        readTime: "5 min",
    },
];

export function MobileViewBlogList() {
    return (
        <div className="block lg:hidden relative w-full">
            {/* Carousel Viewport */}
            <div className="overflow-hidden">
                <div className="space-y-2.5">
                    {CAROUSEL_DATA.map((item) => (
                        <div key={item.id} className="flex flex-row gap-2.5 min-w-0 relative">
                            <Link href={item.url}>
                                <figure className="w-30 h-22 overflow-hidden shrink-0">
                                    <Image src={item.image} alt={item.title} width={1000} height={1000} className="h-full w-full object-cover" />
                                </figure>
                                <div className="">
                                    <p className="font-product-sans-medium font-normal text-slate-600 text-xs italic leading-3.5"> {item.category}</p>
                                    <div
                                        className="mt-1 text-sm leading-4.5 font-product-sans-bold font-medium text-footer-bg"
                                        style={{
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {item.title}
                                    </div>
                                    {/* <div className="mt-2 text-sm leading-4 tracking-wide text-white font-helvetica font-light">The Emirates College for Advanced Education (ECAE) has</div> */}
                                    <div className="mt-2 lg:mt-2.75 flex items-center gap-3">
                                        {/* <figure className="h-7.5 w-7.5 rounded-full overflow-hidden">
                                                                        <Image src="/images/blogs/Ellipse 5.png" alt="blog1" width={1000} height={1000} className="h-full w-full object-cover" />
                                                                    </figure> */}
                                        <ul className="flex items-center flex-wrap gap-1.5">
                                            <li className="">
                                                <p className="font-product-sans-medium font-normal text-footer-bg text-xs leading-3.5">{item.authorName}</p>
                                            </li>
                                            <li className="w-1 h-1 rounded-full bg-footer-bg shrink-0"></li>
                                            <li className="">
                                                <p className="font-product-sans-medium font-normal text-footer-bg text-xs leading-3.5">{item.date}</p>
                                            </li>
                                            <li className="w-1 h-1 rounded-full bg-footer-bg shrink-0"></li>
                                            <li className="">
                                                <p className="font-product-sans-medium font-normal text-footer-bg text-xs leading-3.5">{item.readTime}</p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

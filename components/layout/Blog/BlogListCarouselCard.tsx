// components/layout/Blog/BlogListCarouselCard.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface BlogItem {
    id: number;
    slug: string;
    title: string;
    description: string;
    thumbnail: string;
    thumbnailAlt: string | null;
    author: {
        name: string;
    };
    category: {
        name: string;
    };
    createdAt: string;
    timeToRead: string | null;
}

interface EmblaCarouselProps {
    blogs?: BlogItem[];
    loading?: boolean;
}

export function EmblaCarousel({ blogs = [], loading = false }: EmblaCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: blogs.length > 3,
        align: "start",
        containScroll: "trimSnaps",
        dragFree: false,
    });

    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setPrevBtnDisabled(!emblaApi.canScrollPrev());
        setNextBtnDisabled(!emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);

        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
        };
    }, [emblaApi, onSelect]);

    if (loading) {
        return (
            <div className="hidden lg:flex items-center justify-center w-full h-80">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="hidden lg:flex items-center justify-center w-full h-80 bg-slate-50 rounded-lg">
                <p className="text-slate-500">No blogs available</p>
            </div>
        );
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="hidden lg:block relative w-full">
            {/* Carousel Viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-1.75">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="flex-[0_0_calc(100%/1)] lg:flex-[0_0_calc((100%-14px)/3)] min-w-0 relative">
                            <Link href={`/blogs/${blog.slug}`}>
                                <div className="absolute top-3 right-3 z-40 border border-primary/80 bg-primary/80 rounded-[6px] px-2 py-1 capitalize text-xs lg:text-sm font-helvetica tracking-wide font-light w-fit text-white">
                                    {blog.category.name}
                                </div>
                                <figure className="h-80 w-full overflow-hidden">
                                    <Image src={blog.thumbnail} alt={blog.thumbnailAlt || blog.title} width={1000} height={1000} className="h-full w-full object-cover" />
                                </figure>
                                <div className="absolute w-full bottom-0 left-0 p-3.5 blog-page-gradient z-10">
                                    <div className="text-sm lg:text-[16px] leading-4.5 lg:leading-5 font-product-sans-bold font-medium text-white line-clamp-2">{blog.title}</div>
                                    <div className="mt-2 lg:mt-2.75 flex items-center gap-3">
                                        <ul className="flex items-center gap-1.5">
                                            <li>
                                                <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{blog.author.name}</p>
                                            </li>
                                            <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                            <li>
                                                <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{formatDate(blog.createdAt)}</p>
                                            </li>
                                            <li className="w-1.5 h-1.5 rounded-full bg-white"></li>
                                            <li>
                                                <p className="font-product-sans-medium font-normal text-white text-xs leading-3.5">{blog.timeToRead}</p>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Buttons - Only show if more than 3 blogs */}
            {blogs.length > 3 && (
                <div className="absolute top-1/2 -translate-y-1/2 -left-5 w-[111%] lg:w-[104%] h-fit flex items-center justify-between gap-4">
                    <button
                        onClick={scrollPrev}
                        disabled={prevBtnDisabled}
                        className="w-12 h-12 rounded-full bg-white shadow-md cursor-pointer hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group hover:bg-primary"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                    </button>

                    <button
                        onClick={scrollNext}
                        disabled={nextBtnDisabled}
                        className="w-12 h-12 rounded-full bg-white shadow-md cursor-pointer hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group hover:bg-primary"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                    </button>
                </div>
            )}
        </div>
    );
}

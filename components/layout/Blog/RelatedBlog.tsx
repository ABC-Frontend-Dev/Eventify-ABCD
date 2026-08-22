"use client";

import { Fragment, useRef, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Blog {
    id: number;
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    thumbnailAlt?: string | null;
    createdAt: string;
    timeToRead?: string | null;
    author?: { name: string } | null;
    category?: { name: string } | null;
}

interface RelatedBlogListProps {
    blogs: Blog[];
}

const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

const AUTOPLAY_DELAY = 2500;

// ─── Blog card (shared between carousel and grid) ─────────────────────────────

function BlogCard({ blog }: { blog: Blog }) {
    const metaItems = [formatDate(blog.createdAt)].filter(Boolean) as string[];

    return (
        <Link href={`/blogs/${blog.slug}`} className="group block h-full">
            {/* Category badge */}
            {/* <div className="absolute top-3 right-3 z-40 border border-primary/80 bg-primary/80 rounded-[6px] px-2 py-1 capitalize text-xs lg:text-sm font-helvetica tracking-wide font-light w-fit text-white">
                {blog.category?.name ?? "Blog"}
            </div> */}

            {/* Thumbnail */}
            <figure className="h-60 sm:h-65 md:h-70 lg:h-80 w-full overflow-hidden">
                <Image
                    src={blog.thumbnail}
                    alt={blog.thumbnailAlt || blog.title}
                    width={1000}
                    height={1000}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </figure>

            {/* Overlay */}
            <div className="absolute w-full bottom-0 left-0 p-3.5 blog-page-gradient z-10">
                <div className="mt-2 lg:mt-2.75 flex items-center gap-3">
                    <ul className="flex flex-wrap items-center gap-1.5 mb-1">
                        {metaItems.map((item, index) => (
                            <Fragment key={`${blog.id}-${item}-${index}`}>
                                <li>
                                    <p className="font-helvetica-neue-roman font-normal text-white text-xs leading-3.5">{item}</p>
                                </li>
                                {index < metaItems.length - 1 && <li className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </Fragment>
                        ))}
                    </ul>
                </div>
                <div className="text-sm lg:text-[16px] leading-4.5 lg:leading-5 font-helvetica-medium font-medium text-white line-clamp-2">{blog.title}</div>
            </div>
        </Link>
    );
}

// ─── Embla carousel (mobile: 1 slide | tablet: 2 slides) ─────────────────────

function RelatedBlogCarousel({ blogs }: { blogs: Blog[] }) {
    const autoplayPlugin = useRef(
        Autoplay({
            delay: AUTOPLAY_DELAY,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            stopOnFocusIn: false,
            playOnInit: true,
        }),
    );

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: "start",
            dragFree: false,
            skipSnaps: false,
            containScroll: false,
        },
        [autoplayPlugin.current],
    );

    const [prevDisabled, setPrevDisabled] = useState(false);
    const [nextDisabled, setNextDisabled] = useState(false);
    const [canScroll, setCanScroll] = useState(true);

    const scrollPrev = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollPrev();
        autoplayPlugin.current.reset();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.scrollNext();
        autoplayPlugin.current.reset();
    }, [emblaApi]);

    // Reset autoplay after drag
    useEffect(() => {
        if (!emblaApi) return;
        const onPointerUp = () => {
            setTimeout(() => autoplayPlugin.current.reset(), 50);
        };
        emblaApi.on("pointerUp", onPointerUp);
        return () => {
            emblaApi.off("pointerUp", onPointerUp);
        };
    }, [emblaApi]);

    // Sync button states
    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevDisabled(!emblaApi.canScrollPrev());
        setNextDisabled(!emblaApi.canScrollNext());
        // Hide buttons when all slides are visible (nothing to scroll)
        setCanScroll(emblaApi.canScrollPrev() || emblaApi.canScrollNext());
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

    return (
        <div className="relative">
            {/* Embla viewport */}
            <div className="overflow-hidden" ref={emblaRef}>
                <ul className="flex space-x-2">
                    {blogs.map((blog) => (
                        <li
                            key={blog.id}
                            className={[
                                "min-w-0 relative shrink-0",
                                // mobile: 1 at a time | tablet sm→lg: 2 at a time
                                "flex-[0_0_100%] sm:flex-[0_0_50%]",
                                // gap between slides via padding
                                "",
                            ].join(" ")}
                        >
                            <BlogCard blog={blog} />
                        </li>
                    ))}
                </ul>
            </div>

            {/* Buttons — only shown when there is something to scroll */}
            {canScroll && (
                <div className="absolute -top-8.25 md:-top-10 right-0 w-fit flex items-center gap-x-1 pointer-events-none">
                    <button
                        onClick={scrollPrev}
                        disabled={prevDisabled}
                        className="pointer-events-auto w-7 md:w-8 lg:w-9 h-7 md:h-8 lg:h-9 rounded-full bg-white shadow-md hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group/btn hover:bg-primary disabled:hover:bg-white"
                        aria-label="Previous blog"
                    >
                        <ChevronLeft className="w-4 h-4 text-primary group-hover/btn:text-white transition-colors duration-200" />
                    </button>
                    <button
                        onClick={scrollNext}
                        disabled={nextDisabled}
                        className="pointer-events-auto w-7 md:w-8 lg:w-9 h-7 md:h-8 lg:h-9 rounded-full bg-white shadow-md hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group/btn hover:bg-primary disabled:hover:bg-white"
                        aria-label="Next blog"
                    >
                        <ChevronRight className="w-4 h-4 text-primary group-hover/btn:text-white transition-colors duration-200" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function RelatedBlogList({ blogs }: RelatedBlogListProps) {
    if (!blogs.length) {
        return (
            <div className="mt-2 sm:mt-2.5 md:mt-3.25 lg:mt-3.75">
                <p className="text-sm text-slate-600 font-helvetica">No related blogs available</p>
            </div>
        );
    }

    return (
        <div className="mt-2 sm:mt-2.5 md:mt-3.25 lg:mt-3.75">
            {/* Mobile + Tablet: Embla carousel
                - Mobile (< sm):  1 slide at a time
                - Tablet (sm→lg): 2 slides at a time
                Buttons auto-hide when all slides fit (canScroll = false) */}
            <div className="lg:hidden">
                <RelatedBlogCarousel blogs={blogs} />
            </div>

            {/* Desktop (lg+): plain 3-col grid, no carousel, no buttons */}
            <div className="hidden lg:block">
                <ul className="grid grid-cols-3 gap-4">
                    {blogs.map((blog) => (
                        <li key={blog.id} className="min-w-0 relative">
                            <BlogCard blog={blog} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

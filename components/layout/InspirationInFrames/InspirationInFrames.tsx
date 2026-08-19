// components/layout/InspirationInFrames/InspirationInFrames.tsx
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SubHeading from "@/components/common/SubHeading";
import Image from "next/image";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

interface InstagramPost {
    id: string;
    permalink: string;
    image: string;
    caption: string | null;
    isVideo: boolean;
}

const AUTOPLAY_DELAY = 2500;

// ─── Shared FrameItem (desktop grid + mobile bento) ───────────────────────────
interface FrameItemProps {
    index: number;
    post: InstagramPost;
    onMouseEnter?: (index: number, e: React.MouseEvent<HTMLLIElement>) => void;
}

function FrameItem({ index, post, onMouseEnter }: FrameItemProps) {
    const [hovered, setHovered] = useState(false);
    const [ratio, setRatio] = useState(1); // fallback square until real image loads

    return (
        <li
            className="frame-item group w-full h-87.5 flex items-center justify-center relative overflow-hidden cursor-pointer"
            style={{ aspectRatio: ratio }}
            onMouseEnter={(e) => {
                setHovered(true);
                onMouseEnter?.(index, e);
            }}
            onMouseLeave={() => setHovered(false)}
        >
            <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-40" aria-label={post.caption ?? `Instagram post ${index + 1}`} />

            <Image
                src={post.image}
                alt={post.caption ?? `Inspiration frame ${index + 1}`}
                width={1000}
                height={1000}
                className="frame-image w-full h-full object-cover will-change-transform"
                unoptimized
                onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth && img.naturalHeight) {
                        setRatio(img.naturalWidth / img.naturalHeight);
                    }
                }}
            />

            {post.isVideo && (
                <div className="absolute top-2 right-2 z-20 pointer-events-none">
                    <Play className="w-4 h-4 text-white fill-white drop-shadow" />
                </div>
            )}

            {/* Overlay */}
            <div
                className="absolute inset-0 z-10 pointer-events-none bg-black/25"
                style={{
                    transform: hovered ? "translateY(0%)" : "translateY(100%)",
                    transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s",
                }}
            />

            {/* Instagram icon */}
            <div
                className="absolute top-1/2 left-1/2 z-30 pointer-events-none"
                style={{
                    transform: hovered ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.5)",
                    opacity: hovered ? 1 : 0,
                    transition: hovered ? "transform 0.45s cubic-bezier(0.22,1,0.36,1) 0.3s, opacity 0.35s ease 0.3s" : "transform 0.25s ease 0s, opacity 0.2s ease 0s",
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 lg:w-10.5 h-7 lg:h-10.5" viewBox="0 0 24 24">
                    <path
                        fill="#fff"
                        d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"
                    />
                </svg>
            </div>
        </li>
    );
}

// ─── FrameItemInner (inside Embla tablet carousel) ────────────────────────────
function FrameItemInner({ post, index }: { post: InstagramPost; index: number }) {
    const [hovered, setHovered] = useState(false);
    const [ratio, setRatio] = useState(1);

    return (
        <div
            className="w-full relative overflow-hidden h-87.5 flex items-center justify-center bg-slate-50"
            style={{ aspectRatio: ratio }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-40" aria-label={post.caption ?? `Instagram post ${index + 1}`} />

            <Image
                src={post.image}
                alt={post.caption ?? `Inspiration frame ${index + 1}`}
                width={1000}
                height={1000}
                className="w-full h-full object-cover will-change-transform"
                unoptimized
                onLoad={(e) => {
                    const img = e.currentTarget;
                    if (img.naturalWidth && img.naturalHeight) {
                        setRatio(img.naturalWidth / img.naturalHeight);
                    }
                }}
            />

            {post.isVideo && (
                <div className="absolute top-2 right-2 z-20 pointer-events-none">
                    <Play className="w-4 h-4 text-white fill-white drop-shadow" />
                </div>
            )}

            <div
                className="absolute inset-0 z-10 pointer-events-none bg-black/25"
                style={{
                    transform: hovered ? "translateY(0%)" : "translateY(100%)",
                    transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s",
                }}
            />

            <div
                className="absolute top-1/2 left-1/2 z-30 pointer-events-none"
                style={{
                    transform: hovered ? "translate(-50%, -50%) scale(1)" : "translate(-50%, -50%) scale(0.5)",
                    opacity: hovered ? 1 : 0,
                    transition: hovered ? "transform 0.45s cubic-bezier(0.22,1,0.36,1) 0.3s, opacity 0.35s ease 0.3s" : "transform 0.25s ease 0s, opacity 0.2s ease 0s",
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24">
                    <path
                        fill="#fff"
                        d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"
                    />
                </svg>
            </div>
        </div>
    );
}

// ─── Tablet Carousel ──────────────────────────────────────────────────────────
function TabletCarousel({ posts }: { posts: InstagramPost[] }) {
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
            align: "center",
            dragFree: false,
            skipSnaps: false,
            containScroll: false,
        },
        [autoplayPlugin.current],
    );

    const [prevDisabled, setPrevDisabled] = useState(false);
    const [nextDisabled, setNextDisabled] = useState(false);

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

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevDisabled(!emblaApi.canScrollPrev());
        setNextDisabled(!emblaApi.canScrollNext());
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
        <div className="relative w-full">
            <div className="overflow-hidden" ref={emblaRef}>
                <ul className="flex items-start">
                    {posts.map((post, index) => (
                        <li key={post.id} className="flex-[0_0_33.333%] min-w-0 h-87.5 px-0.75">
                            <FrameItemInner post={post} index={index} />
                        </li>
                    ))}
                </ul>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 -left-3.25 w-[103%] h-fit flex items-center justify-between pointer-events-none">
                <button
                    onClick={scrollPrev}
                    disabled={prevDisabled}
                    className="pointer-events-auto w-10 h-10 rounded-full bg-white shadow-md cursor-pointer hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group/btn hover:bg-primary disabled:hover:bg-white"
                    aria-label="Previous"
                >
                    <ChevronLeft className="w-5 h-5 text-primary group-hover/btn:text-white transition-colors duration-200" />
                </button>
                <button
                    onClick={scrollNext}
                    disabled={nextDisabled}
                    className="pointer-events-auto w-10 h-10 rounded-full bg-white shadow-md cursor-pointer hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group/btn hover:bg-primary disabled:hover:bg-white"
                    aria-label="Next"
                >
                    <ChevronRight className="w-5 h-5 text-primary group-hover/btn:text-white transition-colors duration-200" />
                </button>
            </div>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function InspirationSkeleton() {
    return (
        <div className="hidden lg:grid lg:grid-cols-5 gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-square bg-slate-100 animate-pulse rounded-sm" />
            ))}
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function InspirationInFrames() {
    const sectionRef = useRef<HTMLElement>(null);
    const desktopGridRef = useRef<HTMLUListElement>(null);
    const mobileRow1Ref = useRef<HTMLUListElement>(null);
    const mobileRow2Ref = useRef<HTMLUListElement>(null);

    const [posts, setPosts] = useState<InstagramPost[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch latest posts from the official Instagram Graph API (via our proxy route)
    useEffect(() => {
        fetch("/api/instagram/latest")
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    // show up to 5, same cap as before
                    setPosts((data.data as InstagramPost[]).slice(0, 5));
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleCardHover = useCallback((index: number, e: React.MouseEvent<HTMLLIElement>) => {
        // Keep existing gsap overlay logic intact
    }, []);

    useEffect(() => {
        if (loading || posts.length === 0) return;

        let ctx: gsap.Context | undefined;
        const timer = setTimeout(() => {
            ctx = gsap.context(() => {
                const header = sectionRef.current?.querySelector("header");
                if (header) {
                    gsap.from(header, {
                        opacity: 0,
                        y: 30,
                        duration: 0.8,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: header,
                            start: "top 88%",
                            toggleActions: "play none none none",
                        },
                    });
                }

                const animateGrid = (grid: HTMLUListElement | null) => {
                    if (!grid) return;
                    const cards = grid.querySelectorAll(".frame-item");
                    if (!cards.length) return;

                    cards.forEach((card, i) => {
                        const img = card.querySelector(".frame-image");
                        if (!img) return;

                        gsap.set(card, { opacity: 0, y: 60 });
                        gsap.set(img, { scale: 1.35 });

                        const tl = gsap.timeline({
                            scrollTrigger: {
                                trigger: grid,
                                start: "top 85%",
                                toggleActions: "play none none none",
                            },
                            onComplete: () => {
                                gsap.set(card, { clearProps: "all" });
                                gsap.set(img, { clearProps: "all" });
                            },
                        });

                        tl.to(card, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, i * 0.1);
                        tl.to(img, { scale: 1, duration: 1.2, ease: "power2.out" }, i * 0.1 + 0.05);
                    });
                };

                animateGrid(desktopGridRef.current);
                animateGrid(mobileRow1Ref.current);
                animateGrid(mobileRow2Ref.current);
            }, sectionRef);
        }, 100);

        return () => {
            clearTimeout(timer);
            ctx?.revert();
        };
    }, [loading, posts]);

    // Don't render section at all if no posts
    if (!loading && posts.length === 0) return null;

    return (
        <section ref={sectionRef} className="max-w-360 w-full mx-auto px-5 lg:px-20 pb-9 lg:py-9 scroll-mt-1">
            <header>
                <SubHeading sectionType="SYL" showDescription />
            </header>

            <div className="mt-4 sm:mt-7.5">
                {loading ? (
                    <InspirationSkeleton />
                ) : (
                    <>
                        {/* Desktop 5-col grid */}
                        <ul ref={desktopGridRef} className="hidden lg:grid lg:grid-cols-5 gap-1.5 relative items-start">
                            {posts.map((post, index) => (
                                <FrameItem key={post.id} index={index} post={post} onMouseEnter={handleCardHover} />
                            ))}
                        </ul>

                        {/* Tablet carousel */}
                        <div className="hidden sm:block lg:hidden relative">
                            <TabletCarousel posts={posts} />
                        </div>

                        {/* Mobile bento */}
                        <div className="flex flex-col gap-1.5 sm:hidden">
                            <ul ref={mobileRow1Ref} className="grid grid-cols-2 gap-1.5 items-start">
                                {posts.slice(0, 2).map((post, index) => (
                                    <FrameItem key={post.id} index={index} post={post} />
                                ))}
                            </ul>
                            <ul ref={mobileRow2Ref} className="grid grid-cols-3 gap-1.5 items-start">
                                {posts.slice(2).map((post, index) => (
                                    <FrameItem key={post.id} index={index + 2} post={post} />
                                ))}
                            </ul>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

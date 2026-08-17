"use client";

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ChevronUp, ChevronDown } from "lucide-react";
import gsap from "gsap";

interface Blog {
    id: number;
    slug: string;
    title: string;
    description: string;
    thumbnail: string;
    thumbnailAlt: string | null;
    createdAt: string;
    timeToRead: string | null;
    author: { name: string };
    category: { name: string };
}

// ─── Visible rows per breakpoint ──────────────────────────────────────────────
const VISIBLE_MOBILE = 3;
const VISIBLE_DESKTOP = 4;
const LG_BREAKPOINT = 1024; // matches Tailwind's `lg:`

// ─── Single blog card row ─────────────────────────────────────────────────────

function BlogRow({ blog }: { blog: Blog }) {
    const truncatedDescription = blog.description?.substring(0, 80) + (blog.description?.length > 80 ? "..." : "");

    return (
        <div className="blog-card group relative w-full h-28 lg:h-41 overflow-hidden cursor-pointer">
            <Link href={`/blogs/${blog.slug}`} className="block w-full h-full">
                {/* Thumbnail */}
                <figure className="w-full h-full">
                    <Image
                        src={blog.thumbnail}
                        alt={blog.thumbnailAlt || blog.title}
                        width={800}
                        height={600}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-101"
                    />
                </figure>

                {/* Hover overlay with title + description */}
                <div className="absolute inset-0 z-20 translate-y-full opacity-100 transition-transform duration-500 ease-in-out group-hover:translate-y-0" style={{ willChange: "transform" }}>
                    <div className="relative flex h-full w-full flex-col items-center justify-center bg-black/60 px-4 py-4 lg:px-12.75 lg:py-7.5">
                        <p className="text-center text-sm lg:text-xl leading-4.5 lg:leading-6 tracking-wide font-helvetica-medium text-white">{blog.title}</p>
                        <p className="mt-3 text-center text-xs lg:text-sm leading-4 lg:leading-4.5 tracking-wider font-helvetica text-white">{truncatedDescription}</p>
                    </div>
                </div>
            </Link>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TopReads() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    // How many cards are visible — changes with viewport width
    const [visibleCount, setVisibleCount] = useState<number>(VISIBLE_DESKTOP);

    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const animating = useRef(false);
    const stepRef = useRef(0);
    const reducedMotionRef = useRef(false);

    // ── Fetch ─────────────────────────────────────────────────────────────────

    useEffect(() => {
        fetch("/api/blogs?status=PUBLISHED&sortBy=latest&limit=20")
            .then((r) => r.json())
            .then((res) => {
                if (res.success) setBlogs(res.data.slice(1));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // ── Reduced motion ────────────────────────────────────────────────────────

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        reducedMotionRef.current = mq.matches;
        const apply = () => (reducedMotionRef.current = mq.matches);
        mq.addEventListener?.("change", apply);
        return () => mq.removeEventListener?.("change", apply);
    }, []);

    // ── Measure visible count + row step on resize ────────────────────────────

    const measureAll = useCallback(() => {
        // 1. Update visible count based on window width
        const isLg = window.innerWidth >= LG_BREAKPOINT;
        const nextVisible = isLg ? VISIBLE_DESKTOP : VISIBLE_MOBILE;
        setVisibleCount(nextVisible);

        // 2. Measure row step (height + gap)
        if (!trackRef.current) return;
        const firstRow = trackRef.current.querySelector<HTMLElement>("[data-blog-row]");
        if (!firstRow) return;
        const styles = window.getComputedStyle(trackRef.current);
        const rowH = firstRow.getBoundingClientRect().height;
        const gap = parseFloat(styles.rowGap || styles.gap || "0") || 0;
        stepRef.current = rowH + gap;
    }, []);

    useLayoutEffect(() => {
        measureAll();
        window.addEventListener("resize", measureAll);
        return () => window.removeEventListener("resize", measureAll);
    }, [measureAll, blogs]);

    // ── When visibleCount changes, clamp currentIndex so it never overflows ──

    const maxIndex = Math.max(0, blogs.length - visibleCount);

    useEffect(() => {
        if (currentIndex > maxIndex) {
            const clampedIndex = maxIndex;
            setCurrentIndex(clampedIndex);
            if (trackRef.current) {
                gsap.set(trackRef.current, {
                    y: -clampedIndex * stepRef.current,
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [maxIndex]);

    // ── Slide ─────────────────────────────────────────────────────────────────

    const slide = useCallback(
        (direction: "up" | "down") => {
            if (!trackRef.current) return;

            const nextIndex = direction === "down" ? currentIndex + 1 : currentIndex - 1;

            if (nextIndex < 0 || nextIndex > maxIndex) return;

            gsap.killTweensOf(trackRef.current);

            const targetY = -nextIndex * stepRef.current;

            if (reducedMotionRef.current || stepRef.current === 0) {
                gsap.set(trackRef.current, { y: targetY });
                setCurrentIndex(nextIndex);
                return;
            }

            animating.current = true;

            gsap.to(trackRef.current, {
                y: targetY,
                duration: 0.45,
                ease: "power3.out",
                overwrite: "auto",
                onComplete: () => {
                    animating.current = false;
                },
            });

            setCurrentIndex(nextIndex);
        },
        [currentIndex, maxIndex],
    );

    const canScrollUp = currentIndex > 0;
    const canScrollDown = currentIndex < maxIndex;

    // ── Viewport height — 3 rows on mobile/tablet, 4 on desktop ─────────────
    // Row heights: mobile h-28 (112px), desktop h-41 (164px)
    // Gap: gap-1.5 = 6px
    // mobile  : 3 × 112 + 2 × 6 = 348px
    // desktop : 4 × 164 + 3 × 6 = 674px
    // We drive this purely with Tailwind classes so SSR matches client.

    // ── Loading / empty ───────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="w-full lg:flex-1 h-[348px] lg:h-[674px] flex items-center justify-center bg-slate-50">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="w-full lg:flex-1 h-[348px] lg:h-[674px] flex items-center justify-center bg-slate-50">
                <p className="text-slate-400 text-sm">No more blogs available</p>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-full md:max-w-75 lg:max-w-122.5 w-full relative">
            {/* ── Top bar ── */}
            <div className="flex items-center justify-between">
                <div className="absolute md:-top-9 lg:-top-12 w-full flex items-end justify-between">
                    <h2 className="shrink-0 text-xl lg:text-4xl leading-8 font-helvetica-medium tracking-tight text-footer-bg">Top reads</h2>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => slide("up")}
                            disabled={!canScrollUp}
                            aria-label="Scroll up"
                            className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            <ChevronUp className="w-3 sm:w-4 h-3 sm:h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => slide("down")}
                            disabled={!canScrollDown}
                            aria-label="Scroll down"
                            className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            <ChevronDown className="w-3 sm:w-4 h-3 sm:h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Carousel viewport ── */}
            {/*
                Height calculation (Tailwind h-* = 4px per unit):
                Mobile  (h-28 rows, gap-1.5=6px): 3×112 + 2×6 = 348px  → h-[348px]
                Desktop (h-41 rows, gap-1.5=6px): 4×164 + 3×6 = 674px  → lg:h-[674px]
            */}
            <div ref={viewportRef} className="relative overflow-hidden h-[348px] lg:h-[674px]">
                <div ref={trackRef} className="absolute top-0 left-0 right-0 flex flex-col gap-1.5 will-change-transform" style={{ transform: "translate3d(0,0,0)" }}>
                    {blogs.map((blog) => (
                        <div key={blog.id} data-blog-row className="shrink-0">
                            <BlogRow blog={blog} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

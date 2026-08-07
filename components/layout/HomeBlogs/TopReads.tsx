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

// ─── How many cards visible at a time in the right column ────────────────────
const VISIBLE = 4;

// ─── Single blog card row ─────────────────────────────────────────────────────

function BlogRow({ blog }: { blog: Blog }) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);

    const truncatedDescription = blog.description?.substring(0, 80) + (blog.description?.length > 80 ? "..." : "");

    const handleEnter = useCallback(() => {
        setHovered(true);
        if (!overlayRef.current) return;
        gsap.to(overlayRef.current, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
        });
    }, []);

    const handleLeave = useCallback(() => {
        setHovered(false);
        if (!overlayRef.current) return;
        gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
        });
    }, []);

    return (
        <div className="blog-card group relative w-full h-28 lg:h-41 overflow-hidden cursor-pointer" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
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

                {/* Always-visible bottom gradient with title */}
                <div className="absolute inset-0 z-20 translate-y-full opacity-100 transition-transform duration-500 ease-in-out group-hover:translate-y-0" style={{ willChange: "transform" }}>
                    <div className="relative flex h-full w-full flex-col items-center justify-center bg-black/60 px-4 py-4 lg:px-12.75 lg:py-7.5">
                        <p className="text-center text-sm lg:text-xl leading-4.5 lg:leading-6 tracking-wide font-helvetica-medium text-white">{blog.title}</p>
                        <p className="mt-3 text-center text-xs lg:text-sm leading-4 lg:leading-4.5 tracking-wider font-helvetica text-white">{truncatedDescription}</p>
                    </div>
                </div>

                {/* Hover overlay */}
                {/* <div
                    ref={overlayRef}
                    className="absolute inset-0 z-20 opacity-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
                    style={{ willChange: "opacity" }}
                >
                    <div className="px-3 py-1 border border-white/60 text-white text-xs font-helvetica rounded-sm">Read More</div>
                </div> */}
            </Link>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TopReads() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    // currentIndex = index of the first visible card in the right column
    const [currentIndex, setCurrentIndex] = useState(0);

    const viewportRef = useRef<HTMLDivElement>(null); // fixed-height window
    const trackRef = useRef<HTMLDivElement>(null); // contains ALL rows, absolutely positioned
    const animating = useRef(false);

    // measured row step (height + gap) so the math stays right at every breakpoint
    const stepRef = useRef(0);

    // ── Fetch latest published blogs (skip first — that's in FeaturedBlogsCard)
    useEffect(() => {
        fetch("/api/blogs?status=PUBLISHED&sortBy=latest&limit=20")
            .then((r) => r.json())
            .then((res) => {
                if (res.success) {
                    // Skip index 0 — that's the featured card on the left
                    setBlogs(res.data.slice(1));
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    /* ── Measure one row's height + gap after mount and on resize ─────────── */
    const measureStep = useCallback(() => {
        if (!trackRef.current) return;
        const firstRow = trackRef.current.querySelector<HTMLElement>("[data-blog-row]");
        if (!firstRow) return;
        const styles = window.getComputedStyle(trackRef.current);
        const rowH = firstRow.getBoundingClientRect().height;
        const gap = parseFloat(styles.rowGap || styles.gap || "0") || 0;
        stepRef.current = rowH + gap;
    }, []);

    useLayoutEffect(() => {
        measureStep();
        window.addEventListener("resize", measureStep);
        return () => window.removeEventListener("resize", measureStep);
    }, [measureStep, blogs]);

    /* ── Reduced motion preference ─────────────────────────────────────────── */
    const reducedMotionRef = useRef(false);
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        reducedMotionRef.current = mq.matches;
        const apply = () => (reducedMotionRef.current = mq.matches);
        mq.addEventListener?.("change", apply);
        return () => mq.removeEventListener?.("change", apply);
    }, []);

    /* ── Animate vertical slide ─────────────────────────────────────────────── */

    // Last real row must land flush at the window bottom — so the most we can
    // ever advance is (realCount - VISIBLE). Clamp to ≥0 so it stays safe when
    // there are fewer than VISIBLE blogs (in that case the buttons disable).
    const maxIndex = Math.max(0, blogs.length - VISIBLE);

    const slide = useCallback(
        (direction: "up" | "down") => {
            if (!trackRef.current) return;

            const nextIndex = direction === "down" ? currentIndex + 1 : currentIndex - 1;
            if (nextIndex < 0 || nextIndex > maxIndex) return;

            // kill any in-flight tween so rapid clicks don't fight each other
            gsap.killTweensOf(trackRef.current);

            const targetY = -nextIndex * stepRef.current;

            if (reducedMotionRef.current || stepRef.current === 0) {
                // jump instantly with no animation
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

    // ── Loading ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="w-full lg:flex-1 h-[466px] lg:h-[674px] flex items-center justify-center bg-slate-50">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="w-full lg:flex-1 h-[466px] lg:h-[674px] flex items-center justify-center bg-slate-50">
                <p className="text-slate-400 text-sm">No more blogs available</p>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="max-w-full md:max-w-75 lg:max-w-122.5 w-full relative">
            {/* ── Top bar: label + carousel nav buttons ──────────────────────── */}
            <div className="flex items-center justify-between">
                <div className="absolute -top-12 w-full flex items-end justify-between">
                    <h2 className="shrink-0 text-xl lg:text-4xl leading-8 font-helvetica-medium tracking-tight text-footer-bg">Top reads</h2>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => slide("up")}
                            disabled={!canScrollUp}
                            aria-label="Scroll up"
                            className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => slide("down")}
                            disabled={!canScrollDown}
                            aria-label="Scroll down"
                            className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Carousel: fixed-height viewport + absolutely positioned track ── */}
            {/* Viewport is clipped at exactly 4 rows worth of height.
                Track is `absolute`, so its full intrinsic height never pushes the
                surrounding layout — the column ends at the viewport height. */}
            <div ref={viewportRef} className="relative overflow-hidden h-[466px] lg:h-[674px]">
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

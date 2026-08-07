"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

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
                        className="w-full h-41 object-cover object-center transition-transform duration-500 group-hover:scale-101"
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
    // Right column shows blogs[currentIndex] … blogs[currentIndex + VISIBLE - 1]
    const [currentIndex, setCurrentIndex] = useState(0);

    const listRef = useRef<HTMLDivElement>(null);
    const animating = useRef(false);

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

    // ── Animate vertical slide ────────────────────────────────────────────────

    const slide = useCallback(
        (direction: "up" | "down") => {
            if (animating.current || !listRef.current) return;

            const nextIndex = direction === "down" ? currentIndex + 1 : currentIndex - 1;

            if (nextIndex < 0 || nextIndex + VISIBLE > blogs.length) return;

            animating.current = true;

            const yFrom = direction === "down" ? 40 : -40;

            gsap.fromTo(
                listRef.current,
                { opacity: 0.4, y: yFrom },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.45,
                    ease: "power3.out",
                    onComplete: () => {
                        animating.current = false;
                    },
                },
            );

            setCurrentIndex(nextIndex);
        },
        [currentIndex, blogs.length],
    );

    const canScrollUp = currentIndex > 0;
    const canScrollDown = currentIndex + VISIBLE < blogs.length;

    // ── Loading ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="w-full lg:flex-1 h-168.5 flex items-center justify-center bg-slate-50">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    if (blogs.length === 0) {
        return (
            <div className="w-full lg:flex-1 flex items-center justify-center h-168.5 bg-slate-50">
                <p className="text-slate-400 text-sm">No more blogs available</p>
            </div>
        );
    }

    const visibleBlogs = blogs.slice(currentIndex, currentIndex + VISIBLE);

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
                            className="w-8 h-8 rounded-full border border-slate-200 bg-white
                            flex items-center justify-center
                            hover:border-primary hover:text-primary
                            disabled:opacity-30 disabled:cursor-not-allowed
                            transition-colors duration-200"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => slide("down")}
                            disabled={!canScrollDown}
                            aria-label="Scroll down"
                            className="w-8 h-8 rounded-full border border-slate-200 bg-white
                            flex items-center justify-center
                            hover:border-primary hover:text-primary
                            disabled:opacity-30 disabled:cursor-not-allowed
                            transition-colors duration-200"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {/* <span className="text-sm font-helvetica-medium text-slate-700 uppercase tracking-widest">Latest Blogs</span> */}
            </div>

            {/* ── Carousel list ───────────────────────────────────────────────── */}
            <div ref={listRef} className="flex flex-col gap-1.5 flex-1" style={{ minHeight: 0 }}>
                {visibleBlogs.map((blog) => (
                    <BlogRow key={blog.id} blog={blog} />
                ))}

                {/* Fill empty slots so height stays stable */}
                {visibleBlogs.length < VISIBLE && Array.from({ length: VISIBLE - visibleBlogs.length }).map((_, i) => <div key={`empty-${i}`} className="flex-1 bg-slate-50 min-h-0" />)}
            </div>

            {/* ── Page indicator ─────────────────────────────────────────────── */}
            {/* {blogs.length > VISIBLE && (
                <div className="flex items-center justify-center gap-1 mt-3">
                    {Array.from({
                        length: Math.ceil(blogs.length / VISIBLE),
                    }).map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => {
                                if (!animating.current) {
                                    setCurrentIndex(Math.min(i * VISIBLE, blogs.length - VISIBLE));
                                }
                            }}
                            className={`h-1 rounded-full transition-all duration-300 ${Math.floor(currentIndex / VISIBLE) === i ? "w-6 bg-primary" : "w-2 bg-slate-200"}`}
                            aria-label={`Go to page ${i + 1}`}
                        />
                    ))}
                </div>
            )} */}
        </div>
    );
}

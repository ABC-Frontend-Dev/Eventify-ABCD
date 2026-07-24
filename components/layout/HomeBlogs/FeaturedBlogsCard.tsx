// components/layout/HomeBlogs/FeaturedBlogsCard.tsx
"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { GoesOutComesInUnderline } from "@/components/ui/underline-animation";
import { Loader2 } from "lucide-react";

interface TopBlog {
    id: number;
    slug: string;
    title: string;
    description: string;
    thumbnail: string;
    thumbnailAlt: string | null;
    banner_image: string;
    bannerImageAlt: string | null;
    viewCount: number;
    author: {
        name: string;
    };
    category: {
        name: string;
    };
}

export default function FeaturedBlogsCard() {
    const cardRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [blog, setBlog] = useState<TopBlog | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedBlog();
    }, []);

    const fetchFeaturedBlog = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/blogs/top-reads?limit=1&days=0"); // Get #1 all-time
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                setBlog(result.data[0]);
            } else {
                console.error("Failed to fetch featured blog");
                setLoading(false);
            }
        } catch (error) {
            console.error("Error fetching featured blog:", error);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const handleEnter = useCallback(() => {
        setIsHovered(true);
        const overlay = overlayRef.current;
        if (!overlay) return;

        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
    }, []);

    const handleLeave = useCallback(() => {
        setIsHovered(false);
        const overlay = overlayRef.current;
        if (!overlay) return;

        gsap.to(overlay, {
            opacity: 0,
            duration: 0.25,
            ease: "power2.in",
        });
    }, []);

    if (loading) {
        return (
            <div className="max-w-3xl max-full lg:min-h-168.5 h-full lg:h-168.5 w-full relative mb-16 lg:mb-0 flex items-center justify-center bg-slate-100 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="max-w-3xl max-full lg:min-h-168.5 h-full lg:h-168.5 w-full relative mb-16 lg:mb-0 flex items-center justify-center bg-slate-100 rounded-lg">
                <p className="text-slate-500">No featured blog available</p>
            </div>
        );
    }

    const featuredImage = blog.banner_image || blog.thumbnail;
    const altText = blog.bannerImageAlt || blog.thumbnailAlt || blog.title;
    const truncatedDescription = blog.description.substring(0, 120) + (blog.description.length > 120 ? "..." : "");

    return (
        <div ref={cardRef} className="max-w-3xl max-full lg:min-h-168.5 h-full lg:h-168.5 w-full relative mb-16 lg:mb-0" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            <Link href={`/blogs/${blog.slug}`} className="block">
                <figure className="w-full h-full">
                    <Image src={featuredImage} width={1000} height={1000} alt={altText} className="w-full h-full object-cover object-center" priority />
                </figure>
            </Link>

            {/* Floating overlay (GSAP animated) */}
            <div ref={overlayRef} className="absolute inset-0 z-10 opacity-0 pointer-events-none" style={{ willChange: "opacity" }}>
                <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
                <div className="relative w-full h-full flex flex-col items-center justify-center px-5 lg:px-7.5 py-5 lg:py-7.5">
                    <p className="text-center text-base lg:text-xl leading-5.5 lg:leading-6 tracking-wide font-helvetica-medium text-white">{blog.title}</p>

                    <p className="mt-2 text-center text-xs text-white/90">
                        By {blog.author.name} • {blog.category.name} • {blog.viewCount.toLocaleString()} views
                    </p>

                    <p className="absolute px-7.5 w-full bottom-5 left-1/2 -translate-x-1/2 text-center text-xs lg:text-sm leading-4 lg:leading-5 tracking-wider font-helvetica text-white">
                        {truncatedDescription}
                        <span className="block mt-2">
                            <GoesOutComesInUnderline label="Read More" direction="right" />
                        </span>
                    </p>
                </div>
            </div>

            {/* Make overlay clickable when visible */}
            {isHovered && <Link href={`/blogs/${blog.slug}`} className="absolute inset-0 z-20" />}
        </div>
    );
}

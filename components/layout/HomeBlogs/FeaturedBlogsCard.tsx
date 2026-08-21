"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { GoesOutComesInUnderline } from "@/components/ui/underline-animation";
import { Loader2 } from "lucide-react";

interface Blog {
    id: number;
    slug: string;
    title: string;
    description: string;
    thumbnail: string;
    thumbnailAlt: string | null;
    banner_image: string;
    bannerImageAlt: string | null;
    createdAt: string;
    author: { name: string };
    category: { name: string };
}

export default function FeaturedBlogsCard() {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/blogs?status=PUBLISHED&sortBy=latest&limit=1")
            .then((r) => r.json())
            .then((res) => {
                if (res.success && res.data.length > 0) {
                    setBlog(res.data[0]);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleEnter = useCallback(() => {
        setIsHovered(true);
        if (!overlayRef.current) return;
        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
    }, []);

    const handleLeave = useCallback(() => {
        setIsHovered(false);
        if (!overlayRef.current) return;
        gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.25,
            ease: "power2.in",
        });
    }, []);

    if (loading) {
        return (
            <div className="w-full lg:flex-1 h-46 lg:h-168.5 flex items-center justify-center bg-slate-100">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="w-full lg:flex-1 h-46 lg:h-168.5 flex items-center justify-center bg-slate-100">
                <p className="text-slate-500 text-sm">No blog available</p>
            </div>
        );
    }

    const featuredImage = blog.banner_image || blog.thumbnail;
    const altText = blog.bannerImageAlt || blog.thumbnailAlt || blog.title;
    const truncatedDescription = blog.description.substring(0, 120) + (blog.description.length > 120 ? "..." : "");

    return (
        <div className="w-full lg:flex-1 h-46 md:h-87 lg:h-168.5 relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            <Link href={`/blogs/${blog.slug}`} className="block w-full h-full">
                <figure className="w-full h-full">
                    <Image src={featuredImage} width={1000} height={1000} alt={altText} className="w-full h-full object-cover object-center" priority />
                </figure>
            </Link>

            {/* GSAP overlay */}
            <div ref={overlayRef} className="absolute inset-0 z-10 opacity-0 pointer-events-none" style={{ willChange: "opacity" }}>
                <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
                <div className="relative w-full h-full flex flex-col gap-5 items-center justify-center px-2.5 lg:px-7.5 xl:px-30 py-5 lg:py-7.5">
                    <p className="text-center text-base lg:text-xl xl:text-2xl leading-5.5 lg:leading-6 xl:leading-7 font-abc-laica-a-italic-variable-trial font-normal text-white">{blog.title}</p>
                    <p className="relative lg:absolute px-7.5 w-full lg:bottom-5 xl:bottom-10 lg:left-1/2 lg:-translate-x-1/2 text-center text-xs lg:text-sm leading-4 lg:leading-5 tracking-wider font-helvetica text-white">
                        {/* {truncatedDescription} */}
                        <span className="border-b border-white/60 hover:border-white">Read More</span>
                    </p>
                </div>
            </div>

            {isHovered && <Link href={`/blogs/${blog.slug}`} className="absolute inset-0 z-20" />}
        </div>
    );
}

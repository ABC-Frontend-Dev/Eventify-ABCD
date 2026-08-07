"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import axios from "axios";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_ALT = "Eventify Entertainment";

interface HeroImage {
    id: number;
    imageUrl: string;
    altText: string | null;
    title: string | null;
    description: string | null;
    isActive: boolean;
}

interface HeroData {
    mediaType: "video" | "image";
    videoUrl: string | null;
    videoTitle: string | null;
    videoDesc: string | null;
    images: HeroImage[];
}

export default function HeroSection() {
    const h1Ref = useRef(null);
    const pRef = useRef(null);

    const [hero, setHero] = useState<HeroData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHero = async () => {
            try {
                const res = await axios.get("/api/hero-section");
                if (res.data.success) {
                    setHero(res.data.data);
                }
            } catch (error) {
                console.error("Failed to fetch hero section:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHero();
    }, []);

    const activeImage = hero?.images.find((img) => img.isActive) ?? null;

    const showVideo = hero?.mediaType === "video" && !!hero.videoUrl;
    const showImage = hero?.mediaType === "image" && !!activeImage;

    const title = showVideo ? hero?.videoTitle : showImage ? activeImage?.title : null;
    const description = showVideo ? hero?.videoDesc : showImage ? activeImage?.description : null;
    const hasText = !!(title || description);

    useEffect(() => {
        if (loading) return;

        const ctx = gsap.context(() => {
            if (h1Ref.current) {
                gsap.from(h1Ref.current, {
                    yPercent: 100,
                    opacity: 0,
                    duration: 0.9,
                    delay: 0.2,
                    ease: "power3.out",
                });
            }

            if (pRef.current) {
                gsap.from(pRef.current, {
                    yPercent: 100,
                    opacity: 0,
                    duration: 0.9,
                    delay: 0.5,
                    ease: "power3.out",
                });
            }
        });

        return () => ctx.revert();
    }, [loading, hasText]);

    if (loading) {
        return <section className="" id="home" />;
    }

    return (
        <section className="" id="home">
            <div className="">
                {showVideo && (
                    <video key={hero!.videoUrl} className="w-full h-[95vh] lg:h-screen object-cover" autoPlay loop muted playsInline preload="none">
                        <source src={hero!.videoUrl!} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                )}

                {showImage && (
                    <div className="relative w-full h-[95vh] lg:h-screen">
                        <Image src={activeImage!.imageUrl} alt={activeImage!.altText || activeImage!.title || DEFAULT_ALT} fill priority className="object-cover" />
                    </div>
                )}
            </div>

            <div className="relative max-w-360 w-full mx-auto">
                {hasText && (
                    <div className="absolute left-0 lg:left-7.5 bottom-30 max-w-360 w-full mx-auto pl-5 lg:pl-12 pr-20 lg:pr-12 overflow-hidden">
                        {title && (
                            <div className="overflow-hidden">
                                <h1 ref={h1Ref} className="font-helvetica-neue-roman font-medium text-3xl lg:text-[70px] leading-8 lg:leading-20 text-white mb-4 tracking-tight">
                                    {title}
                                </h1>
                            </div>
                        )}
                        {description && (
                            <div className="overflow-hidden">
                                <p ref={pRef} className="font-helvetica font-medium text-base lg:text-xl leading-5 lg:leading-6.5 tracking-wider text-white mt-3">
                                    {description}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div className="absolute left-1/2 lg:left-1/2 bottom-2.5 lg:bottom-4 -translate-x-1/2">
                    <Link href={"#about-us"}>
                        <figure className="w-6.5 lg:w-10 h-10 mt2.5 lg:mt-3 animate-bounce mx-auto">
                            <Image src="/images/icons/arrow-down.png" alt="Down Arrow Icon" width={20} height={20} className="w-full h-full object-contain" />
                        </figure>
                        <p className="font-helvetica-medium font-medium text-xs lg:text-base leading-4 lg:leading-6 tracking-wider text-white">Let's Eventify</p>
                    </Link>
                </div>
            </div>
        </section>
    );
}

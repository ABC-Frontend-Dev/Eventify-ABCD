"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
    const h1Ref = useRef(null);
    const pRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(h1Ref.current, {
                yPercent: 100,
                opacity: 0,
                duration: 0.9,
                delay: 0.2,
                ease: "power3.out",
            });

            gsap.from(pRef.current, {
                yPercent: 100,
                opacity: 0,
                duration: 0.9,
                delay: 0.5,
                ease: "power3.out",
            });
        });

        return () => ctx.revert();
    }, []);

    return (
        <section className="">
            <div className="">
                <video className="w-full h-[95vh] lg:h-screen object-cover" autoPlay loop muted playsInline preload="none">
                    <source src="/images/videos/home-banner-videos/banner-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
            <div className="relative max-w-360 w-full mx-auto">
                <div className="absolute left-3 lg:left-7.5 bottom-17.5 max-w-360 w-full mx-auto pr-40 overflow-hidden">
                    <div className="overflow-hidden">
                        <h1 ref={h1Ref} className="font-product-sans-light font-medium text-3xl lg:text-[70px] leading-8 lg:leading-20 text-white mb-4 tracking-tight">
                            Turning Moments Into, Spectacular Experiences
                        </h1>
                    </div>
                    <div className="overflow-hidden">
                        <p ref={pRef} className="font-helvetica font-medium text-base lg:text-xl leading-5 lg:leading-6.5 tracking-wider text-white mt-3">
                            We transform ideas into world-class events from brand launches and corporate summits to large-scale live productions.
                        </p>
                    </div>
                </div>

                <div className="absolute right-4 lg:right-12 bottom-2.5 lg:bottom-18">
                    <p className="font-helvetica-medium font-medium text-xs lg:text-base leading-4 lg:leading-6 tracking-wider text-white">Scroll down</p>

                    <figure className="w-6.5 lg:w-10 h-10 mt2.5 lg:mt-6.5 animate-bounce mx-auto">
                        <Image src="/images/icons/arrow-down.png" alt="Down Arrow Icon" width={20} height={20} className="w-full h-full object-contain" />
                    </figure>
                </div>
            </div>
        </section>
    );
}

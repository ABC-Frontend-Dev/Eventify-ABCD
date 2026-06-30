"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

export default function HeroPageLoader() {
    const loaderRef = useRef<HTMLDivElement>(null);
    const barsGroupRef = useRef<SVGGElement>(null);
    const barRefs = useRef<(SVGGElement | null)[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewport, setViewport] = useState({ width: 1920, height: 1080 });

    useEffect(() => {
        const updateViewport = () => {
            setViewport({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateViewport();
        window.addEventListener("resize", updateViewport);

        return () => window.removeEventListener("resize", updateViewport);
    }, []);

    const bars = useMemo(() => {
        const { width, height } = viewport;

        const barHeight = 45;
        const gap1 = 72;
        const gap2 = 44;

        const totalHeight = barHeight * 3 + gap1 + gap2;
        const startY = height / 2 - totalHeight / 2;

        const data = [
            {
                width: 213,
                height: barHeight,
                x: width / 2 - 213 / 2,
                y: startY,
            },
            {
                width: 216,
                height: barHeight,
                x: width / 2 - 216 / 2,
                y: startY + barHeight + gap1,
            },
            {
                width: 213,
                height: barHeight,
                x: width / 2 - 213 / 2,
                y: startY + barHeight + gap1 + barHeight + gap2,
            },
        ];

        return data.map((bar) => ({
            ...bar,
            cx: bar.x + bar.width / 2,
            cy: bar.y + bar.height / 2,
        }));
    }, [viewport]);

    useEffect(() => {
        const loader = loaderRef.current;
        const barsGroup = barsGroupRef.current;
        const currentBars = barRefs.current.filter(Boolean) as SVGGElement[];

        if (!loader || !barsGroup || currentBars.length !== 3) return;

        // ── Lock scroll completely ────────────────────────
        const scrollY = window.scrollY;
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";

        // Block wheel, touch, and keyboard scroll on the loader
        const preventScroll = (e: Event) => {
            e.preventDefault();
        };
        const preventKey = (e: KeyboardEvent) => {
            const scrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
            if (scrollKeys.includes(e.key)) {
                e.preventDefault();
            }
        };

        loader.addEventListener("wheel", preventScroll, { passive: false });
        loader.addEventListener("touchmove", preventScroll, { passive: false });
        document.addEventListener("keydown", preventKey);

        // ── GSAP setup ────────────────────────────────────
        currentBars.forEach((bar, index) => {
            gsap.set(bar, {
                rotation: 0,
                svgOrigin: `${bars[index].cx} ${bars[index].cy}`,
            });
        });

        gsap.set(barsGroup, {
            scale: 1,
            svgOrigin: `${viewport.width / 2} ${viewport.height / 2}`,
        });

        const tl = gsap.timeline({
            onComplete: () => {
                // ── Unlock scroll ─────────────────────────
                document.body.style.overflow = "";
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.width = "";
                window.scrollTo(0, scrollY);

                loader.removeEventListener("wheel", preventScroll);
                loader.removeEventListener("touchmove", preventScroll);
                document.removeEventListener("keydown", preventKey);

                setIsLoading(false);
            },
        });

        tl.to({}, { duration: 1.8 })
            .to(currentBars, {
                rotation: (index) => [-20, 11, 0][index],
                duration: 0.6,
                ease: "power2.inOut",
            })
            .to({}, { duration: 1.2 })
            .to(barsGroup, {
                scale: 80,
                duration: 1,
                ease: "power4.inOut",
            })
            .to(
                loader,
                {
                    opacity: 0,
                    duration: 0.35,
                    ease: "power2.out",
                },
                "-=0.2",
            );

        return () => {
            tl.kill();
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            window.scrollTo(0, scrollY);
            loader.removeEventListener("wheel", preventScroll);
            loader.removeEventListener("touchmove", preventScroll);
            document.removeEventListener("keydown", preventKey);
        };
    }, [bars, viewport]);

    if (!isLoading) return null;

    return (
        <div ref={loaderRef} className="fixed inset-0 z-[9999] h-screen w-screen overflow-hidden">
            {/* SVG overlay with bar cutouts — video visible through cutouts */}
            <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${viewport.width} ${viewport.height}`} preserveAspectRatio="none">
                <defs>
                    <mask id="hero-loader-mask">
                        <rect width={viewport.width} height={viewport.height} fill="white" />

                        <g ref={barsGroupRef}>
                            {bars.map((bar, index) => (
                                <g
                                    key={index}
                                    ref={(el) => {
                                        barRefs.current[index] = el;
                                    }}
                                >
                                    <rect x={bar.x} y={bar.y} width={bar.width} height={bar.height} fill="black" />
                                </g>
                            ))}
                        </g>
                    </mask>
                </defs>

                <rect width={viewport.width} height={viewport.height} fill="white" mask="url(#hero-loader-mask)" />
            </svg>
        </div>
    );
}

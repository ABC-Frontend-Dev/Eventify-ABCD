"use client";

import React, { useState } from "react";

type Logo = {
    src: string;
    alt: string;
};

type CloudMarqueeProps = {
    row1?: Logo[];
    row2?: Logo[];
    speed?: number; // seconds for one full cycle
};

function LogoItem({ logo }: { logo: Logo }) {
    return (
        <div className="group mx-3 shrink-0 flex items-center justify-center w-fit h-20 bg-white dark:bg-white/5 duration-300">
            <img
                src={logo.src}
                alt={logo.alt}
                width={32}
                height={32}
                draggable={false}
                className="w-full h-18 object-contain select-none pointer-events-none
          grayscale opacity-40
          transition-all duration-300
          group-hover:grayscale-0 group-hover:opacity-100"
            />
        </div>
    );
}

function MarqueeRow({ logos, direction = "left", duration = 1 }: { logos: Logo[]; direction?: "left" | "right"; duration?: number }) {
    const [paused, setPaused] = useState(false);

    // CSS keyframe name is defined in the <style> block below.
    // We animate translateX(0 → -50%) on a flex row of 2 identical copies.
    // -50% of the total width = exactly one copy's width → perfectly seamless.
    const animationName = direction === "left" ? "marquee-left" : "marquee-right";

    return (
        <div className="relative overflow-hidden py-2" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            {/*
        Container holds exactly 2 identical copies.
        CSS animates it by -50% (= one copy) so the seam is invisible.
      */}
            <div
                className="flex w-max items-center gap-8"
                style={{
                    animationName,
                    animationDuration: `${duration}s`,
                    animationTimingFunction: "linear",
                    animationIterationCount: "infinite",
                    animationPlayState: paused ? "paused" : "running",
                }}
            >
                {/* Copy A */}
                {logos.map((logo, i) => (
                    <LogoItem key={`a-${i}`} logo={logo} />
                ))}
                {logos.map((logo, i) => (
                    <LogoItem key={`b-${i}`} logo={logo} />
                ))}
            </div>
        </div>
    );
}

export default function CloudMarquee({ row1 = [], row2 = [], speed = 1 }: CloudMarqueeProps) {
    return (
        <section className="relative overflow-hidden">
            {/* Keyframes injected once */}
            <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="marquee"] { animation: none !important; }
        }
      `}</style>

            <div className="pointer-events-none" />

            <div className="relative mx-auto max-w-full">
                {/* Rows */}
                <div className="space-y-4">
                    <MarqueeRow logos={row1} direction="left" duration={speed} />
                    <MarqueeRow logos={row2} direction="right" duration={speed} />
                </div>
            </div>
        </section>
    );
}

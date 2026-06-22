"use client";

import { useRef, useCallback } from "react";
import gsap from "gsap";
import Link from "next/link";

interface SocialIconProps {
    href: string;
    children: React.ReactNode;
    /** Background ring color on hover (default: white/20) */
    ringColor?: string;
    label?: string;
}

export default function SocialIcon({ href, children, ringColor = "rgba(255,255,255,0.2)", label = "Social link" }: SocialIconProps) {
    const linkRef = useRef<HTMLAnchorElement>(null);
    const iconRef = useRef<HTMLSpanElement>(null);
    const ringRef = useRef<HTMLSpanElement>(null);

    const handleEnter = useCallback(() => {
        const icon = iconRef.current;
        const ring = ringRef.current;

        if (icon) {
            gsap.to(icon, {
                y: -6,
                scale: 1.15,
                rotation: 5,
                duration: 0.4,
                ease: "back.out(3)",
            });
        }

        if (ring) {
            gsap.fromTo(
                ring,
                { scale: 0, opacity: 0 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.35,
                    ease: "power2.out",
                },
            );
        }
    }, []);

    const handleLeave = useCallback(() => {
        const icon = iconRef.current;
        const ring = ringRef.current;

        if (icon) {
            gsap.to(icon, {
                y: 0,
                scale: 1,
                rotation: 0,
                duration: 0.3,
                ease: "power2.inOut",
            });
        }

        if (ring) {
            gsap.to(ring, {
                scale: 0,
                opacity: 0,
                duration: 0.25,
                ease: "power2.in",
            });
        }
    }, []);

    return (
        <Link
            ref={linkRef}
            href={href}
            target="_blank"
            aria-label={label}
            className="relative inline-flex items-center justify-center w-[34px] h-[34px]"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            {/* Background ring */}
            <span
                ref={ringRef}
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                    backgroundColor: ringColor,
                    transform: "scale(0)",
                    opacity: 0,
                    willChange: "transform, opacity",
                }}
            />

            {/* Icon */}
            <span ref={iconRef} className="relative z-10 flex items-center justify-center" style={{ willChange: "transform" }}>
                {children}
            </span>
        </Link>
    );
}

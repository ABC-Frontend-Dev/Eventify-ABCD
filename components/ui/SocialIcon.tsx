"use client";

import { useEffect, useRef, useCallback } from "react";
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
    const tlRef = useRef<gsap.core.Timeline | null>(null);

    useEffect(() => {
        const icon = iconRef.current;
        const ring = ringRef.current;
        if (!icon || !ring) return;

        // One paused timeline = the entire "hovered" state.
        // play() runs it forward, reverse() always unwinds it back to
        // exactly the start state — no matter how fast or how many
        // times you toggle, or where in the animation you interrupt it.
        // That's what makes this immune to the "stuck hover" bug:
        // two separate to()/fromTo() calls per direction depend on
        // GSAP correctly auto-overwriting the right tweens every time;
        // play()/reverse() on one timeline never has that ambiguity.
        const tl = gsap
            .timeline({ paused: true })
            .to(icon, { y: -6, scale: 1.15, rotation: 5, duration: 0.4, ease: "back.out(3)" }, 0)
            .fromTo(ring, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" }, 0);

        tlRef.current = tl;

        return () => {
            tl.kill();
            tlRef.current = null;
        };
    }, []);

    const handleEnter = useCallback(() => {
        tlRef.current?.play();
    }, []);

    const handleLeave = useCallback(() => {
        tlRef.current?.reverse();
    }, []);

    // Defensive reset: mouseleave can simply never fire if the cursor
    // leaves the whole browser window, the tab loses focus (alt-tab),
    // or a fast trackpad gesture gets coalesced by the browser. Without
    // this, the icon can stay visually "hovered" with no event left to
    // ever reverse it.
    useEffect(() => {
        const reset = () => tlRef.current?.reverse();
        window.addEventListener("blur", reset);
        document.addEventListener("visibilitychange", reset);
        return () => {
            window.removeEventListener("blur", reset);
            document.removeEventListener("visibilitychange", reset);
        };
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
            onPointerCancel={handleLeave}
            onBlur={handleLeave}
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

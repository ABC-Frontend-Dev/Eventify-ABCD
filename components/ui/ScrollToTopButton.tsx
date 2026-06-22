"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";

export interface ScrollToTopButtonProps {
    /** Scroll distance (px) before the button appears. Default: 300 */
    threshold?: number;
    /** Scroll fraction (0-1) past which the "near bottom" glow kicks in. Default: 0.92 */
    nearBottomThreshold?: number;
    /** Button diameter in px. Default: 56 */
    size?: number;
    /** Progress ring thickness in px. Default: 3 */
    strokeWidth?: number;
    /** Tailwind position classes, e.g. "bottom-6 right-6". Default: "bottom-6 right-6" */
    position?: string;
    /** Extra classes merged onto the button (colors, shadows, etc.) */
    className?: string;
    /** Extra classes merged onto the arrow icon */
    iconClassName?: string;
}

export default function ScrollToTopButton({
    threshold = 300,
    nearBottomThreshold = 0.92,
    size = 56,
    strokeWidth = 3,
    position = "bottom-6 right-6",
    className = "",
    iconClassName = "",
}: ScrollToTopButtonProps) {
    const [visible, setVisible] = useState(false);
    const [nearBottom, setNearBottom] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [percent, setPercent] = useState(0);
    const [rippleKey, setRippleKey] = useState(0);

    const tickingRef = useRef(false);
    const prefersReducedMotion = useReducedMotion();

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    // Same rAF-throttled scroll math as the vanilla version, just lifted into state
    const updateScrollState = useCallback(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

        setVisible(scrollTop > threshold);
        setNearBottom(pct > nearBottomThreshold);
        setPercent(Math.round(pct * 100));
        tickingRef.current = false;
    }, [threshold, nearBottomThreshold]);

    useEffect(() => {
        const onScroll = () => {
            if (!tickingRef.current) {
                tickingRef.current = true;
                requestAnimationFrame(updateScrollState);
            }
        };

        updateScrollState();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [updateScrollState]);

    const handleClick = () => {
        setRippleKey((k) => k + 1);
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? "auto" : "smooth",
        });
    };

    const showTransition = prefersReducedMotion ? { duration: 0.01 } : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const };

    const crossfadeTransition = prefersReducedMotion ? { duration: 0.01 } : { duration: 0.18 };

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    type="button"
                    aria-label="Scroll to top"
                    onClick={handleClick}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    onFocus={() => setHovered(true)}
                    onBlur={() => setHovered(false)}
                    initial={{ opacity: 0, scale: 0.6, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.6, y: 16 }}
                    transition={showTransition}
                    style={{ width: size, height: size }}
                    className={`fixed ${position} z-50 grid place-items-center rounded-full
                        bg-white text-neutral-900 shadow-lg ring-1 ring-black/5
                        transition-shadow duration-300 ease-out
                        dark:bg-neutral-900 dark:text-white dark:ring-white/10
                        ${nearBottom ? "shadow-[0_0_0_5px_rgba(99,102,241,0.25)]" : ""}
                        ${className}`}
                >
                    {/* Click ripple — keying a fresh element re-triggers the animation each click */}
                    {rippleKey > 0 && !prefersReducedMotion && (
                        <motion.span
                            key={rippleKey}
                            initial={{ opacity: 0.35, scale: 0.4 }}
                            animate={{ opacity: 0, scale: 1.6 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="pointer-events-none absolute inset-0 rounded-full bg-indigo-400/40"
                        />
                    )}

                    {/* Progress ring */}
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
                        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} className="stroke-black/10 dark:stroke-white/10" />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            className="stroke-indigo-500 transition-[stroke-dashoffset] duration-150 ease-linear"
                            style={{ strokeDasharray: circumference, strokeDashoffset }}
                        />
                    </svg>

                    {/* Arrow <-> percentage crossfade, percentage only on hover/focus */}
                    <span className="relative grid h-5 w-9 place-items-center overflow-hidden">
                        <AnimatePresence mode="wait" initial={false}>
                            {hovered ? (
                                <motion.span
                                    key="pct"
                                    initial={{ opacity: 0, scale: 0.7 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.7 }}
                                    transition={crossfadeTransition}
                                    className="text-xs font-product-sans-regular font-semibold tabular-nums"
                                >
                                    {percent}%
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="arrow"
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={crossfadeTransition}
                                    className="grid place-items-center"
                                >
                                    <ArrowUp className={`h-5 w-5 ${iconClassName}`} />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </span>
                </motion.button>
            )}
        </AnimatePresence>
    );
}

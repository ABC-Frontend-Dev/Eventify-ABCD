"use client";

import React, { useState } from "react";
import { motion, useTransform, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Single item — owns its own motion values ─────────────────────────────────

function TooltipItem({
    item,
}: {
    item: {
        id: number;
        name: string;
        designation: string;
        image: React.ReactNode;
    };
}) {
    const [hovered, setHovered] = useState(false);

    const springConfig = { stiffness: 100, damping: 5 };
    const x = useMotionValue(0);
    const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig);
    const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), springConfig);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const halfWidth = rect.width / 2;
        x.set(event.clientX - rect.left - halfWidth);
    };

    return (
        // -mr-4
        <div
            className="relative group"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => {
                setHovered(false);
                // reset so next hover starts fresh
                x.set(0);
            }}
            onMouseMove={handleMouseMove}
        >
            {/* ── Tooltip ──────────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {hovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.6 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            transition: {
                                type: "spring",
                                stiffness: 260,
                                damping: 10,
                            },
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.6 }}
                        style={{
                            translateX,
                            rotate,
                            whiteSpace: "nowrap",
                        }}
                        className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center bg-foreground z-50 shadow-xl px-2 py-1 pointer-events-none"
                    >
                        {/* Bottom gradient lines */}
                        <div className="absolute inset-x-10 z-30 w-[20%] -bottom-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent h-px" />
                        <div className="absolute left-0 w-[40%] z-30 -bottom-px bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px" />

                        {item.name && <div className="font-helvetica tracking-wide text-background relative z-30 text-xs">{item.name}</div>}
                        {item.designation && <div className="text-muted-foreground text-xs">{item.designation}</div>}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Icon / Image ──────────────────────────────────────────────── */}
            <div
                className={cn(
                    "!m-0 !p-0 rounded-full h-8 w-8 bg-footer-bg",
                    "border-background relative transition duration-500",
                    "group-hover:scale-105 group-hover:z-30",
                    "flex items-center justify-center overflow-hidden",
                    // if image is a string treat it as a photo — make it circular
                    typeof item.image === "string" ? "object-cover object-top" : "",
                )}
            >
                {typeof item.image === "string" ? <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" /> : item.image}
            </div>
        </div>
    );
}

// ─── Public component ─────────────────────────────────────────────────────────

export const AnimatedTooltip = ({
    items,
    className,
}: {
    items: {
        id: number;
        name: string;
        designation: string;
        image: React.ReactNode;
    }[];
    className?: string;
}) => {
    return (
        <div className={cn("flex items-center gap-1", className)}>
            {items.map((item) => (
                <TooltipItem key={item.id} item={item} />
            ))}
        </div>
    );
};

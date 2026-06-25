"use client";

import * as React from "react";
import { AnimatePresence, motion, Transition } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MenuBarItem {
    label: string;
    icon: React.ReactNode;
}

interface MenuBarProps extends React.HTMLAttributes<HTMLDivElement> {
    items: MenuBarItem[];
}

const springConfig: Transition = {
    type: "spring",
    stiffness: 400,
    damping: 30,
};

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export function MenuBar({ items, className, ...props }: MenuBarProps) {
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
    const [cursorX, setCursorX] = React.useState(0);
    const [tooltipWidth, setTooltipWidth] = React.useState(0);

    const menuRef = React.useRef<HTMLDivElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);

    const updateCursorPosition = (e: React.MouseEvent<HTMLElement>, index: number) => {
        if (!menuRef.current) return;

        const menuRect = menuRef.current.getBoundingClientRect();
        const x = e.clientX - menuRect.left;

        setActiveIndex(index);
        setCursorX(x);
    };

    React.useLayoutEffect(() => {
        if (!tooltipRef.current) return;
        setTooltipWidth(tooltipRef.current.getBoundingClientRect().width);
    }, [activeIndex]);

    const menuWidth = menuRef.current?.getBoundingClientRect().width ?? 0;

    const tooltipX = clamp(cursorX - tooltipWidth / 2, 0, Math.max(0, menuWidth - tooltipWidth));

    return (
        <div className={cn("relative w-fit", className)} {...props}>
            {/* Tooltip - now directly under the relative parent */}
            <AnimatePresence>
                {activeIndex !== null && (
                    <motion.div
                        ref={tooltipRef}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0, x: tooltipX }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={springConfig}
                        className={cn(
                            "absolute -top-6 left-0 h-7 px-3 rounded-lg inline-flex items-center justify-center whitespace-nowrap pointer-events-none z-50",
                            "bg-background/95 backdrop-blur",
                            "border border-border/50",
                            "shadow-[0_0_0_1px_rgba(0,0,0,0.08)]",
                            "dark:border-border/50 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
                        )}
                    >
                        <span className="text-[13px] font-product-sans-regular font-medium leading-tight">{items[activeIndex].label}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Menu Bar */}
            <div
                ref={menuRef}
                onMouseLeave={() => setActiveIndex(null)}
                className={cn(
                    "h-10 px-1.5 inline-flex items-center gap-[3px]",
                    "rounded-full bg-background/95 backdrop-blur",
                    "border border-border/50",
                    "dark:border-border/50 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_16px_-4px_rgba(0,0,0,0.2)]",
                )}
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        onMouseEnter={(e) => updateCursorPosition(e, index)}
                        onMouseMove={(e) => updateCursorPosition(e, index)}
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                        {item.icon}
                        <span className="sr-only">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, Code2, Copy, Rocket, Zap } from "lucide-react";
import { useState } from "react";

export interface CardFlipProps {
    title?: string;
    description?: string;
    bgColor?: string;
    className?: string;
}

export default function CardFlip({ title: title, description: description, bgColor = "#000", className = "" }: CardFlipProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            style={{
                ["--primary" as any]: bgColor ?? "#2563eb",
            }}
            className={`${className}group relative [perspective:2000px]`}
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <div
                className={cn(
                    "relative h-full w-full",
                    "[transform-style:preserve-3d]",
                    // Dynamic transition: slower when flipping back to front
                    "transition-all",
                    isFlipped ? "duration-700" : "duration-[1500ms]",
                    isFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]",
                )}
            >
                {/* Front of card */}
                <div
                    className={cn(
                        "absolute inset-0 h-full w-full",
                        "[transform:rotateY(0deg)] [backface-visibility:hidden]",
                        "dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-800",
                        "border-2 border-slate-300 dark:border-zinc-800/50",
                        // Front opacity transition matches the flip direction
                        "transition-opacity",
                        isFlipped ? "duration-700" : "duration-[1500ms]",
                        "group-hover:shadow-xl dark:group-hover:shadow-2xl",
                        "group-hover:border-primary/20 dark:group-hover:border-primary/30",
                        isFlipped ? "opacity-0" : "opacity-100",
                    )}
                >
                    {/* Background gradient effect */}
                    <div className="w-full h-full flex items-center justify-center">
                        {/* Bottom content */}
                        <h2 className="w-56.75 text-base md:text-lg text-center leading-5 md:leading-6 font-bold font-product-sans-bold uppercase text-zinc-900 dark:text-white">{title}</h2>
                    </div>
                </div>

                {/* Back of card */}
                <div
                    className={cn(
                        "absolute inset-0 h-full w-full bg-primary",
                        "[transform:rotateY(180deg)] [backface-visibility:hidden]",
                        "dark:from-zinc-900 dark:via-zinc-900/95 dark:to-zinc-800",
                        "border border-slate-200 dark:border-zinc-800",
                        "shadow-lg dark:shadow-xl",
                        "flex flex-col",
                        // Back opacity transition matches the flip direction
                        "transition-opacity",
                        isFlipped ? "duration-700" : "duration-[1500ms]",
                        "group-hover:shadow-xl dark:group-hover:shadow-2xl",
                        "group-hover:border-primary/20 dark:group-hover:border-primary/30",
                        !isFlipped ? "opacity-0" : "opacity-100",
                    )}
                >
                    {/* Background gradient */}
                    <div className="w-full h-full flex items-center justify-center">
                        <h3 className="w-56.75 text-center text-sm leading-5 tracking-wider font-helvetica font-medium text-white">{description}</h3>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slideIn {
                    0% {
                        transform: translateX(-100px);
                        opacity: 0;
                    }
                    50% {
                        transform: translateX(0);
                        opacity: 0.8;
                    }
                    100% {
                        transform: translateX(100px);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}

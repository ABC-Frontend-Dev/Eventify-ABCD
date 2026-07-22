"use client";

import { easeOut, motion } from "motion/react";
import * as React from "react";
import Image from "next/image";

export interface FlipCardData {
    title: string;
    description: string;
    defaultImage: string;
    hoverImage: string;
    imageAlt: string;
}

interface FlipCardProps {
    data: FlipCardData;
    className?: string;
    /** When true, the card stays on its front face — no hover/click flip. */
    disableFlip?: boolean;
}

export function FlipCard({ data, className, disableFlip = false }: FlipCardProps) {
    const [isFlipped, setIsFlipped] = React.useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;

    const handleClick = () => {
        if (disableFlip) return;
        if (isTouchDevice) setIsFlipped(!isFlipped);
    };

    const handleMouseEnter = () => {
        if (disableFlip) return;
        if (!isTouchDevice) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            setIsFlipped(true);
        }
    };

    const handleMouseLeave = () => {
        if (disableFlip) return;
        if (!isTouchDevice) {
            timeoutRef.current = setTimeout(() => {
                setIsFlipped(false);
            }, 100);
        }
    };

    React.useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const cardVariants = {
        front: {
            rotateY: 0,
            transition: {
                duration: 0.5,
                ease: easeOut,
            },
        },
        back: {
            rotateY: 180,
            transition: {
                duration: 0.5,
                ease: easeOut,
            },
        },
    };

    // Flip is always considered "off" when disabled, regardless of any prior state.
    const effectiveFlipped = disableFlip ? false : isFlipped;

    return (
        <div
            className={`relative w-full h-full perspective-1000 ${disableFlip ? "" : "cursor-pointer"} ${className || ""}`}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* FRONT: Default Image */}
            <motion.div className="absolute inset-0 backface-hidden overflow-hidden" animate={effectiveFlipped ? "back" : "front"} variants={cardVariants} style={{ transformStyle: "preserve-3d" }}>
                <Image src={data.defaultImage} alt={data.imageAlt} fill className="object-cover object-top" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
            </motion.div>

            {/* BACK: Hover Image + Title + Description — never shown when disableFlip is true */}
            {!disableFlip && (
                <motion.div
                    className="absolute inset-0 backface-hidden overflow-hidden"
                    initial={{ rotateY: 180 }}
                    animate={effectiveFlipped ? "front" : "back"}
                    variants={cardVariants}
                    style={{ transformStyle: "preserve-3d", rotateY: 180 }}
                >
                    {/* Background Image */}
                    <Image src={data.hoverImage} alt={data.imageAlt} fill className="object-cover object-top" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />

                    {/* Overlay with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 px-3.5 py-2 flex flex-col justify-end text-white bg-gradient-to-t from-black/80 to-transparent">
                        <h3 className="text-white font-helvetica-medium font-bold text-base capitalize">{data.title}</h3>
                        <p className="text-white font-helvetica text-sm uppercase">{data.description}</p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

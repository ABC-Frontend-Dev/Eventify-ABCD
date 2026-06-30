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
}

export function FlipCard({ data, className }: FlipCardProps) {
    const [isFlipped, setIsFlipped] = React.useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in window;

    const handleClick = () => {
        if (isTouchDevice) setIsFlipped(!isFlipped);
    };

    const handleMouseEnter = () => {
        if (!isTouchDevice) {
            // Clear any pending flip-back animation
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            setIsFlipped(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isTouchDevice) {
            // Delay the flip-back by 300ms
            timeoutRef.current = setTimeout(() => {
                setIsFlipped(false);
            }, 100);
        }
    };

    // Cleanup timeout on unmount
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

    return (
        <div className={`relative w-full h-80 md:h-31.5 perspective-1000 cursor-pointer ${className || ""}`} onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {/* FRONT: Default Image */}
            <motion.div className="absolute inset-0 backface-hidden overflow-hidden" animate={isFlipped ? "back" : "front"} variants={cardVariants} style={{ transformStyle: "preserve-3d" }}>
                <Image src={data.defaultImage} alt={data.imageAlt} fill className="object-cover" />
            </motion.div>

            {/* BACK: Hover Image + Title + Description */}
            <motion.div
                className="absolute inset-0 backface-hidden overflow-hidden"
                initial={{ rotateY: 180 }}
                animate={isFlipped ? "front" : "back"}
                variants={cardVariants}
                style={{ transformStyle: "preserve-3d", rotateY: 180 }}
            >
                {/* Background Image */}
                <Image src={data.hoverImage} alt={data.imageAlt} fill className="object-cover" />

                {/* Overlay with gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content */}
                <div className="absolute bg-primary inset-0 bottom-3.5 left-0 w-full h-31.5 px-3.5 py-2 flex flex-col justify-end text-white">
                    <h3 className="text-white font-product-sans-bold font-bold text-base uppercase">{data.title}</h3>
                    <p className="text-white font-product-sans-light text-sm uppercase">{data.description}</p>
                </div>
            </motion.div>
        </div>
    );
}

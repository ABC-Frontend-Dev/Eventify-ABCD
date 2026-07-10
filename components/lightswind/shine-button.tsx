// components/lightswind/shine-button.tsx
import React from "react";
import { motion, type MotionProps } from "framer-motion";
import { PhoneIconForHeader } from "../icons/PhoneIconForHeader";

type ShineButtonProps = Omit<MotionProps, "children"> & {
    label?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    className?: string;
    size?: "sm" | "md" | "lg";
    bgColor?: string;
};

const sizeStyles: Record<NonNullable<ShineButtonProps["size"]>, { padding: string; fontSize: string }> = {
    sm: { padding: "0.5rem 1rem", fontSize: "0.875rem" },
    md: { padding: "0.6rem 1.4rem", fontSize: "14px" },
    lg: { padding: "0.8rem 1.8rem", fontSize: "1.125rem" },
};

export const ShineButton = React.forwardRef<HTMLButtonElement, ShineButtonProps>(function ShineButton(
    { label = "Shine now", onClick, className = "", size = "md", bgColor = "linear-gradient(325deg, hsl(217 100% 56%) 0%, hsl(194 100% 69%) 55%, hsl(217 100% 56%) 90%)", ...motionProps },
    ref,
) {
    const { padding, fontSize } = sizeStyles[size];
    const innerRef = React.useRef<HTMLButtonElement | null>(null);

    const setBgPos = (pos: string) => {
        if (innerRef.current) innerRef.current.style.backgroundPosition = pos;
    };

    const backgroundImage = bgColor.startsWith("linear-gradient") ? bgColor : `linear-gradient(to right, ${bgColor}, ${bgColor})`;

    return (
        <motion.button
            ref={(node) => {
                innerRef.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
            }}
            type="button"
            onClick={onClick}
            onMouseEnter={() => setBgPos("right top")}
            onMouseLeave={() => setBgPos("left top")}
            {...motionProps}
            className={`relative overflow-hidden inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] px-3.5 py-2 text-sm text-white font-product-sans-regular will-change-transform hover:opacity-95 ${className}`}
            style={{
                backgroundImage,
                backgroundSize: "280% auto",
                backgroundPosition: "left top",
                transition: "background-position 0.8s ease, opacity 0.2s",
                fontSize,
                padding,
            }}
        >
            <span>{label}</span>
            <PhoneIconForHeader />
            <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-3/4 w-1/2 bg-white/40 -skew-x-12 opacity-0 group-hover:opacity-100 motion-safe:animate-shine" />
        </motion.button>
    );
});

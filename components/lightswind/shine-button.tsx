import React from "react";
import { PhoneIconForHeader } from "../icons/PhoneIconForHeader";

interface ShineButtonProps {
    label?: string;
    onClick?: () => void;
    className?: string;
    size?: "sm" | "md" | "lg";
    bgColor?: string; // Can be hex or gradient
}

const sizeStyles: Record<NonNullable<ShineButtonProps["size"]>, { padding: string; fontSize: string }> = {
    sm: { padding: "0.5rem 1rem", fontSize: "0.875rem" },
    md: { padding: "0.6rem 1.4rem", fontSize: "14px" },
    lg: { padding: "0.8rem 1.8rem", fontSize: "1.125rem" },
};

export const ShineButton: React.FC<ShineButtonProps> = ({
    label = "Shine now",
    onClick,
    className = "",
    size = "md",
    bgColor = "linear-gradient(325deg, hsl(217 100% 56%) 0%, hsl(194 100% 69%) 55%, hsl(217 100% 56%) 90%)",
}) => {
    const { padding, fontSize } = sizeStyles[size];

    // Determine whether to use solid color or gradient
    const backgroundImage = bgColor.startsWith("linear-gradient") ? bgColor : `linear-gradient(to right, ${bgColor}, ${bgColor})`;

    return (
        <button
            onClick={onClick}
            className={`flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[5px]  px-3.5 py-2 text-sm text-white font-product-sans-regular transition-opacity duration-200 will-change-transform hover:opacity-95 ${className}`}
            style={{
                backgroundImage,
                backgroundSize: "280% auto",
                backgroundPosition: "initial",
                color: "hsl(0 0% 100%)",
                fontSize,
                padding,
                transition: "0.8s",
            }}
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.backgroundPosition = "right top")}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundPosition = "initial")}
        >
            {label}

            <PhoneIconForHeader />
            {/* Shine effect */}
            <div
                className="absolute top-0 left-[-75%] w-[200%] 
      h-full bg-white/40 skew-x-[-20deg] opacity-0 
      group-hover:opacity-100 animate-shine pointer-events-none z-20"
            />
        </button>
    );
};

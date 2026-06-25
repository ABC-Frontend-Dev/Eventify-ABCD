"use client";

import React, { PropsWithChildren, useRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, MotionValue, useMotionValue, useSpring, useTransform } from "motion/react";
import type { MotionProps } from "motion/react";

import { cn } from "@/lib/utils";

export interface DockProps extends VariantProps<typeof dockVariants> {
    className?: string;
    iconSize?: number;
    iconMagnification?: number;
    disableMagnification?: boolean;
    iconDistance?: number;
    direction?: "top" | "middle" | "bottom";
    children: React.ReactNode;
}

const DEFAULT_SIZE = 40;
const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;
const DEFAULT_DISABLEMAGNIFICATION = false;

const dockVariants = cva(
    "supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 mx-auto mt-8 flex h-[58px] w-max items-center justify-center gap-2 rounded-2xl border p-2 backdrop-blur-md",
);

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
    (
        {
            className,
            children,
            iconSize = DEFAULT_SIZE,
            iconMagnification = DEFAULT_MAGNIFICATION,
            disableMagnification = DEFAULT_DISABLEMAGNIFICATION,
            iconDistance = DEFAULT_DISTANCE,
            direction = "middle",
            ...props
        },
        ref,
    ) => {
        const mouseX = useMotionValue(Infinity);

        const renderChildren = () => {
            return React.Children.map(children, (child) => {
                if (React.isValidElement<DockIconProps>(child) && child.type === DockIcon) {
                    return React.cloneElement(child, {
                        ...child.props,
                        mouseX: mouseX,
                        size: iconSize,
                        magnification: iconMagnification,
                        disableMagnification: disableMagnification,
                        distance: iconDistance,
                    });
                }
                return child;
            });
        };

        return (
            <motion.div
                ref={ref}
                onMouseMove={(e) => mouseX.set(e.pageX)}
                onMouseLeave={() => mouseX.set(Infinity)}
                {...props}
                className={cn(dockVariants({ className }), {
                    "items-start": direction === "top",
                    "items-center": direction === "middle",
                    "items-end": direction === "bottom",
                })}
            >
                {renderChildren()}
            </motion.div>
        );
    },
);

Dock.displayName = "Dock";

export interface DockIconProps extends Omit<MotionProps & React.HTMLAttributes<HTMLDivElement>, "children"> {
    size?: number;
    magnification?: number;
    disableMagnification?: boolean;
    distance?: number;
    mouseX?: MotionValue<number>;
    className?: string;
    children?: React.ReactNode;

    // New props for supporting image elements
    src?: string;
    alt?: string;
    name?: string;
    href?: string;
}

const DockIcon = ({
    size = DEFAULT_SIZE,
    magnification = DEFAULT_MAGNIFICATION,
    disableMagnification,
    distance = DEFAULT_DISTANCE,
    mouseX,
    className,
    children,
    src,
    alt,
    name,
    href,
    ...props
}: DockIconProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const padding = Math.max(6, size * 0.2);
    const defaultMouseX = useMotionValue(Infinity);

    const distanceCalc = useTransform(mouseX ?? defaultMouseX, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const targetSize = disableMagnification ? size : magnification;

    const sizeTransform = useTransform(distanceCalc, [-distance, 0, distance], [size, targetSize, size]);

    const scaleSize = useSpring(sizeTransform, {
        mass: 0.1,
        stiffness: 150,
        damping: 12,
    });

    // Render content based on what props are provided
    const renderContent = () => {
        // If children are provided, use them
        if (children) {
            return <div className="w-full h-full flex items-center justify-center">{children}</div>;
        }

        // If src is provided, render an image
        if (src) {
            return <img src={src} alt={alt || name || "Dock icon"} className="w-full h-full object-contain" />;
        }

        // If name is provided without src, render text
        if (name) {
            return <div className="w-full h-full flex items-center justify-center text-xs font-medium">{name.charAt(0).toUpperCase()}</div>;
        }

        return null;
    };

    const content = (
        <motion.div
            ref={ref}
            style={{ width: scaleSize, height: scaleSize, padding }}
            className={cn("flex aspect-square cursor-pointer items-center justify-center rounded-full", disableMagnification && "hover:bg-muted-foreground transition-colors", className)}
            {...props}
        >
            {renderContent()}
        </motion.div>
    );

    // If href is provided and it's a string URL, wrap in anchor tag
    if (href && typeof href === "string") {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer">
                {content}
            </a>
        );
    }

    return content;
};

DockIcon.displayName = "DockIcon";

export { Dock, DockIcon, dockVariants };

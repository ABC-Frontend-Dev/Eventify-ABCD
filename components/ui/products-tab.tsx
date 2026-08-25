// components/ui/products-tab.tsx
"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "@/lib/utils";
import type React from "react";

export type TabsVariant = "default" | "underline";

export function Tabs({ className, ...props }: TabsPrimitive.Root.Props): React.ReactElement {
    return <TabsPrimitive.Root className={cn("flex flex-col gap-0 md:gap-0 data-[orientation=vertical]:flex-row", className)} data-slot="tabs" {...props} />;
}

export function TabsList({
    variant = "default",
    className,
    children,
    ...props
}: TabsPrimitive.List.Props & {
    variant?: TabsVariant;
}): React.ReactElement {
    return (
        <TabsPrimitive.List
            className={cn(
                // ── Layout ───────────────────────────────────────────────────
                // Wraps into rows instead of scrolling horizontally:
                // mobile → 2 columns per row, desktop (md+) → 3 columns per row.
                // A 4th (or 7th, etc.) item naturally starts the next row at
                // column 1 — no extra logic needed, that's how CSS grid wraps.
                "relative z-0",
                "grid grid-cols-2 md:grid-cols-3",
                // ── Sizing & spacing ──────────────────────────────────────────
                "min-w-0 w-full max-w-full",
                "items-stretch justify-start",
                "py-8 px-[11.1px]",
                // ── Appearance ────────────────────────────────────────────────
                "bg-black/10 backdrop-blur-sm opacity-100",
                // ── Vertical orientation ──────────────────────────────────────
                "data-[orientation=vertical]:flex data-[orientation=vertical]:flex-col",
                // ── Variant overrides ─────────────────────────────────────────
                variant === "underline" ? "data-[orientation=vertical]:px-1 data-[orientation=horizontal]:py-8 data-[orientation=horizontal]:opacity-100" : "",
                className,
            )}
            data-slot="tabs-list"
            {...props}
        >
            {children}
            <TabsPrimitive.Indicator
                className={cn(
                    "absolute bottom-0 left-0 pointer-events-none",
                    "h-(--active-tab-height) w-(--active-tab-width)",
                    "translate-x-(--active-tab-left) -translate-y-(--active-tab-bottom)",
                    // Smooth slide + resize between tabs
                    "transition-[width,height,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    "will-change-[width,height,transform]",
                    variant === "underline"
                        ? "z-10 bg-current data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-0.5 data-[orientation=vertical]:-translate-x-px data-[orientation=horizontal]:translate-y-px"
                        : "z-0 bg-primary",
                )}
                data-slot="tab-indicator"
            />
        </TabsPrimitive.List>
    );
}

export function TabsTab({ className, ...props }: TabsPrimitive.Tab.Props): React.ReactElement {
    return (
        <TabsPrimitive.Tab
            className={cn(
                "relative z-10 font-helvetica flex h-full shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap px-[calc(--spacing(2.5)-1px)] font-medium text-sm outline-none border border-slate-300 focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start data-active:font-helvetica-medium data-active:text-white data-disabled:opacity-64 sm:h-8 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
                // Fallback background so the active tab is always visible even if
                // the sliding indicator's position/size measurement (which was
                // designed for a single-row flex layout) misfires in this grid,
                // multi-row layout. This is intentionally redundant with the
                // indicator — belt and suspenders.
                "data-active:bg-primary data-active:border-primary",
                "transition-[color,transform,background-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
                "active:scale-[0.97]",
                className,
            )}
            data-slot="tabs-tab"
            {...props}
        />
    );
}

export function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props): React.ReactElement {
    return (
        <TabsPrimitive.Panel
            className={cn(
                "[&[hidden]]:!block [&[hidden]]:absolute [&[hidden]]:inset-x-0 [&[hidden]]:top-0",
                "[&[hidden]]:opacity-0 [&[hidden]]:translate-y-2 [&[hidden]]:pointer-events-none",
                "opacity-100 translate-y-0",
                "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                "will-change-[opacity,transform]",
                "flex-1 outline-none relative",
                className,
            )}
            data-slot="tabs-content"
            {...props}
        />
    );
}

export { TabsPrimitive, TabsTab as TabsTrigger, TabsPanel as TabsContent };

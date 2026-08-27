// components/ui/tabs.tsx
"use client";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { useEffect, useState } from "react";
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
    // Suppresses the indicator transition until after mount/hydration,
    // so it never animates from (0, 0) on first paint.
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <TabsPrimitive.List
            className={cn(
                // Named group: lets the indicator below disable its transition pre-mount
                "group/tabs-list",
                // ── Layout ───────────────────────────────────────────────────
                "relative z-0",
                "flex flex-nowrap",
                "overflow-x-auto",
                "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                // ── Sizing & spacing ──────────────────────────────────────────
                "min-w-0 w-max max-w-full",
                "items-center justify-start",
                "py-8 px-[11.1px]",
                // ── Appearance ────────────────────────────────────────────────
                "bg-black/10 backdrop-blur-sm opacity-100",
                // ── Vertical orientation ──────────────────────────────────────
                "data-[orientation=vertical]:flex-col",
                // ── Variant overrides ─────────────────────────────────────────
                variant === "underline" ? "data-[orientation=vertical]:px-1 data-[orientation=horizontal]:py-8 data-[orientation=horizontal]:opacity-100" : "",
                className,
            )}
            data-slot="tabs-list"
            data-mounted={mounted}
            {...props}
        >
            {children}
            <TabsPrimitive.Indicator
                // Render the indicator before React hydrates so there's no
                // "missing underline" gap right after server-side rendering
                renderBeforeHydration
                className={cn(
                    "absolute bottom-0 left-0 pointer-events-none",
                    "h-(--active-tab-height) w-(--active-tab-width) max-w-full max-h-full",
                    "translate-x-(--active-tab-left) -translate-y-(--active-tab-bottom)",
                    // Smooth slide + resize between tabs.
                    // Tailwind v4 turns translate-x-*/translate-y-* into the native
                    // `translate` property, so it MUST be in the transition list —
                    // animating `transform` instead is what made the slide instant.
                    "transition-[width,height,translate] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    // Keep it static while initializing, then animate on user clicks
                    "group-data-[mounted=false]/tabs-list:transition-none",
                    "will-change-[width,height,translate]",
                    variant === "underline"
                        ? "z-10 bg-current data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-0.5 data-[orientation=vertical]:-translate-x-px data-[orientation=horizontal]:translate-y-px"
                        : "z-0 bg-primary border border-primary",
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
                // z-10 keeps text above the sliding pill indicator
                "relative z-10 font-helvetica flex h-full shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap px-[calc(--spacing(2.5)-1px)] font-medium text-sm outline-none border border-slate-300 focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start data-active:font-helvetica-medium data-active:text-white data-disabled:opacity-64 sm:h-8 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
                // When this tab is active, its OWN border turns primary too —
                // so if the sliding indicator underneath is off by a px or two,
                // there's no contrasting slate-300 edge peeking out to reveal it.
                "data-active:border-primary",
                // Smooth text color + border color change + subtle press feedback
                "transition-[color,border-color,transform] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]",
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
                // Same root-cause fix as the indicator: the slide uses the native
                // `translate` property in v4, so it must be transitioned too.
                "transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                "will-change-[opacity,translate]",
                "flex-1 outline-none relative",
                className,
            )}
            data-slot="tabs-content"
            {...props}
        />
    );
}

export { TabsPrimitive, TabsTab as TabsTrigger, TabsPanel as TabsContent };

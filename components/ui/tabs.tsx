"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cn } from "@/lib/utils";
import type React from "react";

export type TabsVariant = "default" | "underline";

export function Tabs({ className, ...props }: TabsPrimitive.Root.Props): React.ReactElement {
    return <TabsPrimitive.Root className={cn("flex flex-col gap-5 data-[orientation=vertical]:flex-row", className)} data-slot="tabs" {...props} />;
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
                "relative z-0 flex w-fit items-center justify-center py-8 px-[11.1px] bg-black/10 backdrop-blur-sm opacity-60",
                "data-[orientation=vertical]:flex-col",
                variant === "default" ? "" : "data-[orientation=vertical]:px-1 data-[orientation=horizontal]:py-8 data-[orientation=horizontal]:opacity-100 ",
                className,
            )}
            data-slot="tabs-list"
            {...props}
        >
            {children}
            <TabsPrimitive.Indicator
                className={cn(
                    "absolute bottom-0 left-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) -translate-y-(--active-tab-bottom) transition-[width,translate] duration-200 ease-in-out",
                    variant === "underline"
                        ? "z-10 bg-white data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-0.5 data-[orientation=vertical]:-translate-x-px data-[orientation=horizontal]:translate-y-px"
                        : "-z-1 bg-white dark:bg-input",
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
                "relative font-product-sans-regular flex h-full shrink-0 grow cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap border border-transparent px-[calc(--spacing(2.5)-1px)] font-medium text-sm outline-none transition-[color,background-color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start data-active:font-product-sans-bold data-active:border-slate-200 data-active:shadow data-disabled:opacity-64 sm:h-8 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
                className,
            )}
            data-slot="tabs-tab"
            {...props}
        />
    );
}

export function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props): React.ReactElement {
    return <TabsPrimitive.Panel className={cn("flex-1 outline-none relative", className)} data-slot="tabs-content" {...props} />;
}

export { TabsPrimitive, TabsTab as TabsTrigger, TabsPanel as TabsContent };

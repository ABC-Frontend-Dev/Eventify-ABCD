// components/ui/tabs.tsx
"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type React from "react";

export type TabsVariant = "default" | "underline";

// useLayoutEffect on the client (runs before paint), useEffect on the server.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// The indicator has a fixed base size and is stretched with scale.
// Animating transform (instead of width/height) runs on the GPU compositor,
// so it stays smooth even while React re-renders the project grid and
// motion's layout animations are busy on the main thread.
const BASE = 100;

const ACTIVE_TAB_SELECTOR = '[data-slot="tabs-tab"][data-active]';
const TAB_SELECTOR = '[data-slot="tabs-tab"]';

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
    const listRef = useRef<HTMLDivElement>(null);
    const indicatorRef = useRef<HTMLSpanElement>(null);

    // false until the indicator has been placed once. Until then:
    // • the indicator doesn't animate (no slide in from 0,0)
    // • the active tab paints its own purple background (covers SSR / pre-hydration)
    const [ready, setReady] = useState(false);

    useIsoLayoutEffect(() => {
        const list = listRef.current;
        const indicator = indicatorRef.current;
        if (!list || !indicator) return;

        let placedOnce = false;
        let readyFrame = 0;

        const measure = () => {
            const tab = list.querySelector<HTMLElement>(ACTIVE_TAB_SELECTOR);
            if (!tab) {
                indicator.style.opacity = "0";
                return;
            }

            // getBoundingClientRect keeps sub-pixel precision (offsetLeft/offsetWidth
            // round to whole pixels, which caused the thin white sliver before).
            // Press feedback scales the tab's CONTENT, not the tab, so this rect
            // is always the tab's real size.
            const listRect = list.getBoundingClientRect();
            const tabRect = tab.getBoundingClientRect();
            const x = tabRect.left - listRect.left - list.clientLeft + list.scrollLeft;
            const y = tabRect.top - listRect.top - list.clientTop + list.scrollTop;
            const vertical = list.getAttribute("data-orientation") === "vertical";

            let transform: string;
            if (variant === "underline") {
                if (vertical) {
                    indicator.style.width = "2px";
                    indicator.style.height = `${BASE}px`;
                    transform = `translate3d(${x - 1}px, ${y}px, 0) scaleY(${tabRect.height / BASE})`;
                } else {
                    indicator.style.width = `${BASE}px`;
                    indicator.style.height = "4px";
                    transform = `translate3d(${x}px, ${y + tabRect.height - 3}px, 0) scaleX(${tabRect.width / BASE})`;
                }
            } else if (vertical) {
                indicator.style.width = `${tabRect.width}px`;
                indicator.style.height = `${BASE}px`;
                transform = `translate3d(${x}px, ${y}px, 0) scaleY(${tabRect.height / BASE})`;
            } else {
                indicator.style.width = `${BASE}px`;
                indicator.style.height = `${tabRect.height}px`;
                transform = `translate3d(${x}px, ${y}px, 0) scaleX(${tabRect.width / BASE})`;
            }

            indicator.style.transform = transform;
            indicator.style.opacity = "1";

            if (!placedOnce) {
                placedOnce = true;
                // Enable transitions on the next frame, after the first
                // position has been painted without animation.
                readyFrame = requestAnimationFrame(() => setReady(true));
            }
        };

        // Re-measure when sizes change (fonts loading, viewport resize, tabs
        // added after the projects fetch). ResizeObserver fires before paint.
        const resizeObserver = new ResizeObserver(measure);
        const observeTabs = () => {
            resizeObserver.disconnect();
            resizeObserver.observe(list);
            list.querySelectorAll<HTMLElement>(TAB_SELECTOR).forEach((t) => resizeObserver.observe(t));
        };

        // Re-measure the instant a tab becomes active. MutationObserver
        // callbacks run as microtasks, i.e. in the same frame as the click,
        // so the slide starts immediately with the correct target.
        const mutationObserver = new MutationObserver((records) => {
            if (records.some((r) => r.type === "childList")) observeTabs();
            measure();
        });
        mutationObserver.observe(list, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ["data-active"],
        });

        observeTabs();
        measure();
        document.fonts?.ready.then(measure).catch(() => {});

        return () => {
            cancelAnimationFrame(readyFrame);
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [variant]);

    return (
        <TabsPrimitive.List
            {...props}
            ref={listRef}
            className={cn(
                // Named group: lets children react to data-ready
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
            data-variant={variant}
            data-ready={ready}
        >
            {children}
            <span
                ref={indicatorRef}
                aria-hidden="true"
                className={cn(
                    "absolute top-0 left-0 pointer-events-none opacity-0 origin-top-left",
                    // Transform-only animation = compositor-only = no jank
                    "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "will-change-transform",
                    // No animation until the first position has been painted
                    "group-data-[ready=false]/tabs-list:transition-none",
                    "motion-reduce:transition-none",
                    variant === "underline" ? "z-10 bg-current" : "z-0 bg-primary",
                )}
                data-slot="tab-indicator"
            />
        </TabsPrimitive.List>
    );
}

export function TabsTab({ className, children, ...props }: TabsPrimitive.Tab.Props): React.ReactElement {
    return (
        <TabsPrimitive.Tab
            className={cn(
                // z-10 keeps text above the sliding pill indicator
                "relative z-10 font-helvetica flex h-full shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap px-[calc(--spacing(2.5)-1px)] font-medium text-sm outline-none border border-slate-300 focus-visible:ring-2 focus-visible:ring-ring data-disabled:pointer-events-none data-[orientation=vertical]:w-full data-[orientation=vertical]:justify-start data-active:font-helvetica-medium data-active:text-white data-disabled:opacity-64 sm:h-8 sm:text-sm [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
                // Active tab's own border turns primary so no slate edge peeks
                // out around the indicator.
                "data-active:border-primary",
                // Before the indicator is placed (SSR / first paint), the active
                // tab paints its own purple so white text is never on white.
                "group-data-[ready=false]/tabs-list:group-data-[variant=default]/tabs-list:data-active:bg-primary",
                // Text color follows the 300ms indicator slide:
                // • the tab being left goes dark right away (the pill is leaving it)
                // • the tab being entered waits 100ms, then turns white over 200ms,
                //   finishing exactly when the pill arrives (100 + 200 = 300ms)
                "transition-[color,border-color] duration-150 ease-out delay-0",
                "data-active:duration-200 data-active:delay-100",
                // Press feedback on the CONTENT, not the tab box, so the indicator
                // always measures the tab at its real size.
                "*:transition-[scale] *:duration-150 *:ease-out",
                "active:*:scale-[0.94]",
                "motion-reduce:transition-none motion-reduce:*:transition-none",
                className,
            )}
            data-slot="tabs-tab"
            {...props}
        >
            {/* Width lock: both copies share one grid cell. The invisible copy is
                always in the medium (active) font, so a tab's width never changes
                when it becomes active and its neighbours never shift. */}
            <span className="grid place-items-center">
                <span
                    aria-hidden="true"
                    className="invisible col-start-1 row-start-1 inline-flex items-center gap-1.5 font-helvetica-medium select-none"
                >
                    {children}
                </span>
                <span className="col-start-1 row-start-1 inline-flex items-center gap-1.5">
                    {children}
                </span>
            </span>
        </TabsPrimitive.Tab>
    );
}

export function TabsPanel({ className, ...props }: TabsPrimitive.Panel.Props): React.ReactElement {
    return (
        <TabsPrimitive.Panel
            className={cn(
                "[&[hidden]]:!block [&[hidden]]:absolute [&[hidden]]:inset-x-0 [&[hidden]]:top-0",
                "[&[hidden]]:opacity-0 [&[hidden]]:translate-y-2 [&[hidden]]:pointer-events-none",
                "opacity-100 translate-y-0",
                "transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "will-change-[opacity,translate]",
                "motion-reduce:transition-none",
                "flex-1 outline-none relative",
                className,
            )}
            data-slot="tabs-content"
            {...props}
        />
    );
}

export { TabsPrimitive, TabsTab as TabsTrigger, TabsPanel as TabsContent };
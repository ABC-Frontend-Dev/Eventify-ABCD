"use client";

import { useState, useEffect, useLayoutEffect, useMemo, useRef, type CSSProperties } from "react";
import axios from "axios";
import ReactGridLayout, { useContainerWidth, noCompactor } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { FlipCard } from "@/components/animate-ui/components/community/flip-card";
import TeamsSkeleton from "./TeamsSkeleton";

interface GridItem {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
    content: {
        img: string;
        name: string;
        role: string;
    };
}

const COLS = 10;
const ROW_HEIGHT = 60;

/** Returns true only if the string contains at least one a-z / A-Z letter */
function hasLetters(str: string): boolean {
    return /[a-zA-Z]/.test(str);
}

/**
 * Flip is enabled only when BOTH name and role
 * contain at least one real alphabetic character.
 * If either is a placeholder like ".", "-", "..." → disable flip.
 */
function shouldEnableFlip(name: string, role: string): boolean {
    return hasLetters(name) && hasLetters(role);
}

/**
 * Responsive wrapper style.
 * - 1024 <= screenWidth < 1100  -> smaller scale, more negative translate, more top margin
 * - 1100 <= screenWidth < 1200  -> slightly larger scale, less translate, less top margin
 * - screenWidth >= 1200 (or below 1024, though hidden by lg:block) -> full size (100%), no transform
 */
function getResponsiveStyle(screenWidth: number): CSSProperties {
    if (screenWidth >= 1024 && screenWidth < 1100) {
        return { transform: "scale(0.65) translate(-28%, -28%)" };
    }

    if (screenWidth >= 1100 && screenWidth < 1150) {
        return { transform: "scale(0.7) translate(-22%, -22%)" };
    }

    if (screenWidth >= 1150 && screenWidth < 1200) {
        return { transform: "scale(0.725) translate(-20%, -20%)" };
    }

    if (screenWidth >= 1200 && screenWidth < 1250) {
        return { transform: "scale(0.825) translate(-12%, -12%)" };
    }

    if (screenWidth >= 1250 && screenWidth < 1275) {
        return { transform: "scale(0.86) translate(-8%, -8%)" };
    }

    if (screenWidth >= 1275 && screenWidth < 1300) {
        return { transform: "scale(0.91) translate(-6%, -6%)" };
    }

    if (screenWidth >= 1300 && screenWidth < 1325) {
        return { transform: "scale(0.91) translate(-6%, -6%)" };
    }

    if (screenWidth >= 1325 && screenWidth < 1350) {
        return { transform: "scale(0.95) translate(-3%, -3%)" };
    }

    if (screenWidth >= 1350 && screenWidth < 1375) {
        return { transform: "scale(0.965) translate(-3%, -3%)" };
    }

    if (screenWidth >= 1375 && screenWidth < 1400) {
        return { transform: "scale(0.975) translate(-2%, -2%)" };
    }

    if (screenWidth >= 1400 && screenWidth < 1425) {
        return { transform: "scale(1) translate(-1%, -1%)" };
    }

    return { transform: "none", marginTop: 0 };
}

export default function Teams() {
    const [items, setItems] = useState<GridItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { width, containerRef, mounted } = useContainerWidth();

    // Tracks the actual browser viewport width so we can pick the correct
    // transform/margin combo at the 1024 / 1100 breakpoints.
    const [screenWidth, setScreenWidth] = useState<number>(0);

    useEffect(() => {
        const updateScreenWidth = () => setScreenWidth(window.innerWidth);

        updateScreenWidth();
        window.addEventListener("resize", updateScreenWidth);

        return () => window.removeEventListener("resize", updateScreenWidth);
    }, []);

    const wrapperStyle = useMemo(() => getResponsiveStyle(screenWidth), [screenWidth]);

    // ---- Collapse the extra space left behind by the scale() transform ----
    // transform: scale() only changes how the element is PAINTED, not the
    // space it reserves in normal flow — its offsetHeight is unchanged, so
    // the parent section still allocates room for the FULL, unscaled grid.
    // We measure the real, post-transform size with getBoundingClientRect()
    // and apply that as an explicit height on the outer wrapper below, so
    // the wrapper only ever reserves the actual visual footprint.
    const scaledContentRef = useRef<HTMLDivElement>(null);
    const [visualHeight, setVisualHeight] = useState<number | undefined>(undefined);

    useLayoutEffect(() => {
        const el = scaledContentRef.current;
        if (!el) return;

        const measure = () => {
            setVisualHeight(el.getBoundingClientRect().height);
        };

        measure();

        const ro = new ResizeObserver(measure);
        ro.observe(el);
        window.addEventListener("resize", measure);

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", measure);
        };
        // Re-measure whenever the scale/margin changes, the grid width
        // changes, or the item list (and therefore grid height) changes.
    }, [wrapperStyle, width, items]);

    useEffect(() => {
        fetchLayout();
    }, []);

    const fetchLayout = async () => {
        try {
            const response = await axios.get("/api/team/layout");
            if (response.data.success) {
                setItems(response.data.data ?? []);
            }
        } catch (error) {
            console.error("Error fetching team layout:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <TeamsSkeleton />;
    if (!items.length) return null;

    const layout = items.map(({ content: _content, ...layoutItem }) => ({
        ...layoutItem,
        static: true,
        isDraggable: false,
        isResizable: false,
    }));

    return (
        <div className="hidden lg:block relative overflow-hidden" style={{ height: visualHeight }}>
            <div ref={containerRef} className="w-full">
                <div ref={scaledContentRef} style={wrapperStyle}>
                    {mounted && width > 0 && (
                        <ReactGridLayout
                            layout={layout}
                            width={width}
                            gridConfig={{ cols: COLS, rowHeight: ROW_HEIGHT }}
                            compactor={noCompactor}
                            dragConfig={{ enabled: false }}
                            resizeConfig={{ enabled: false }}
                            onLayoutChange={() => undefined}
                        >
                            {items.map((item) => {
                                const flipEnabled = shouldEnableFlip(item.content.name, item.content.role);

                                return (
                                    <div key={item.i} style={{ height: "100%", overflow: "hidden" }}>
                                        <FlipCard
                                            disableFlip={!flipEnabled}
                                            data={{
                                                title: item.content.name,
                                                description: item.content.role,
                                                defaultImage: item.content.img,
                                                hoverImage: item.content.img,
                                                imageAlt: item.content.name,
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </ReactGridLayout>
                    )}
                </div>
            </div>
        </div>
    );
}

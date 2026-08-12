"use client";

import { useState, useEffect } from "react";
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

export default function Teams() {
    const [items, setItems] = useState<GridItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { width, containerRef, mounted } = useContainerWidth();

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
        <div className="hidden lg:block" ref={containerRef}>
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
    );
}

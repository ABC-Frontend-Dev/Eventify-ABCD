import Link from "next/link";
import { useState } from "react";
import { motion, MotionConfig } from "framer-motion";
import * as React from "react";
import { usePathname } from "next/navigation";

export type IMenu = {
    id: number;
    title: string;
    url: string;
    dropdown?: boolean;
    items?: IMenu[];
};

type MenuProps = {
    list: IMenu[];
    currentPath?: string;
    isScrolled?: boolean;
};

const Menu = ({ list, currentPath, isScrolled }: MenuProps) => {
    const [hovered, setHovered] = useState<number | null>(null);
    const pathname = usePathname();

    // Check if the current path matches the menu item
    const isActive = (url: string) => {
        if (url === "/" && currentPath === "/") return true;
        if (url !== "/" && currentPath?.startsWith(url)) return true;
        return false;
    };

    // Define pages that should always have black text (regardless of scroll)
    const getColorForPage = () => {
        // Pages that should have black text always (both scrolled and not scrolled)
        if (pathname.startsWith("/blog")) {
            return {
                default: "font-helvetica-medium text-black/90 hover:text-black",
                scrolled: "font-helvetica-medium text-black/90 hover:text-black",
            };
        }

        // You can add more pages with always-black text here
        // if (pathname.startsWith("/about")) {
        //     return {
        //         default: "font-helvetica-medium text-black/90 hover:text-black",
        //         scrolled: "font-helvetica-medium text-black/90 hover:text-black",
        //     };
        // }

        // Default behavior: white when not scrolled, black when scrolled
        return {
            default: "font-helvetica-medium text-white/90 hover:text-white",
            scrolled: "font-helvetica-medium text-black/90 hover:text-black",
        };
    };

    const colorConfig = getColorForPage();

    // Get indicator color based on current page and scroll state
    const getIndicatorColor = () => {
        // For blog pages, always use black indicators
        if (pathname.startsWith("/blog")) {
            return {
                active: "bg-black",
                hover: "bg-black/50",
            };
        }

        // Default: white when not scrolled, black when scrolled
        return isScrolled ? { active: "bg-black", hover: "bg-black/50" } : { active: "bg-white", hover: "bg-white/50" };
    };

    const indicatorColor = getIndicatorColor();

    return (
        <MotionConfig transition={{ bounce: 0, type: "tween", duration: 0.3 }}>
            <nav className={"relative"}>
                <ul className={"flex items-center gap-2"}>
                    {list?.map((item) => {
                        const active = isActive(item.url);

                        return (
                            <li key={item.id} className={"relative"}>
                                <Link
                                    className={`relative px-3.5 py-2 transition-all block ${active ? "text-primary font-helvetica-bold" : isScrolled ? colorConfig.scrolled : colorConfig.default}`}
                                    onMouseEnter={() => setHovered(item.id)}
                                    onMouseLeave={() => setHovered(null)}
                                    href={item?.url}
                                >
                                    {item?.title}
                                </Link>

                                {/* Active indicator - always visible for active links */}
                                {active && !item?.dropdown && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className={`absolute left-1/2 -translate-x-1/2 bottom-0 h-0.75 w-1/2 rounded-full ${indicatorColor.active}`}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                {/* Hover indicator - only for non-active links */}
                                {hovered === item?.id && !active && !item?.dropdown && (
                                    <motion.div layout layoutId="hover-cursor" className={`absolute left-1/2 -translate-x-1/2 bottom-0 h-0.75 w-1/2 rounded-full ${indicatorColor.hover}`} />
                                )}

                                {/* Dropdown menu */}
                                {item?.dropdown && hovered === item?.id && (
                                    <div className="absolute left-0 top-full" onMouseEnter={() => setHovered(item.id)} onMouseLeave={() => setHovered(null)}>
                                        <motion.div
                                            layout
                                            transition={{ bounce: 0 }}
                                            initial={{ y: 10, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: 10, opacity: 0 }}
                                            style={{
                                                borderRadius: "8px",
                                            }}
                                            className="mt-4 flex w-64 flex-col rounded bg-white border shadow-lg"
                                            layoutId="dropdown-cursor"
                                        >
                                            {item?.items?.map((nav) => {
                                                const isSubActive = isActive(nav.url);
                                                return (
                                                    <motion.a
                                                        key={`link-${nav?.id}`}
                                                        href={`${nav?.url}`}
                                                        className={`w-full p-4 hover:bg-muted transition-colors ${isSubActive ? "bg-muted font-medium" : ""}`}
                                                    >
                                                        {nav?.title}
                                                    </motion.a>
                                                );
                                            })}
                                        </motion.div>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </MotionConfig>
    );
};

export default Menu;

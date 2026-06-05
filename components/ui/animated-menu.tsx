"use client";

import type { Variants } from "motion/react";
import * as motion from "motion/react-client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Variants() {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dimensions = useDimensions(containerRef);
    const pathname = usePathname();

    const menus = [
        { id: 1, title: "Home", name: "Home", url: "/", dropdown: false },
        { id: 2, title: "About Us", name: "About Us", url: "/about", dropdown: false },
        { id: 3, title: "Projects", name: "Projects", url: "/projects", dropdown: false },
        { id: 4, title: "Clients", name: "Clients", url: "/clients", dropdown: false },
        { id: 5, title: "Services", name: "Services", url: "/services", dropdown: false },
        { id: 6, title: "Teams", name: "Teams", url: "/teams", dropdown: false },
        { id: 7, title: "Awards", name: "Awards", url: "/awards", dropdown: false },
        { id: 8, title: "Blogs", name: "Blogs", url: "/blog", dropdown: false },
    ];

    return (
        <div>
            <div className="h-screen">
                <motion.nav initial={false} animate={isOpen ? "open" : "closed"} custom={dimensions} ref={containerRef}>
                    <motion.div style={background} variants={sidebarVariants} />
                    <Navigation menus={menus} currentPath={pathname} />
                    <MenuToggle toggle={() => setIsOpen(!isOpen)} />
                </motion.nav>
            </div>
        </div>
    );
}

const navVariants = {
    open: {
        transition: { staggerChildren: 0.07, delayChildren: 0.2 },
    },
    closed: {
        transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
};

const Navigation = ({ menus, currentPath }: { menus: Array<{ id: number; title: string; name: string; url: string; dropdown: boolean }>; currentPath: string }) => (
    <motion.ul style={list} variants={navVariants}>
        {menus.map((menu, i) => (
            <MenuItem key={menu.id} menu={menu} i={i} isActive={currentPath === menu.url} />
        ))}
    </motion.ul>
);

const itemVariants = {
    open: {
        y: 0,
        opacity: 1,
        transition: {
            y: { stiffness: 1000, velocity: -100 },
        },
    },
    closed: {
        y: 50,
        opacity: 0,
        transition: {
            y: { stiffness: 1000 },
        },
    },
};

const MenuItem = ({ menu, i, isActive }: { menu: { title: string; name: string; url: string }; i: number; isActive: boolean }) => {
    return (
        <motion.li style={listItem} variants={itemVariants} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link href={menu.url} style={linkStyle}>
                <div style={{ ...textPlaceholder }}>
                    <span style={{ fontSize: 16, fontWeight: isActive ? "bold" : "normal", color: "#000" }}>{menu.name}</span>
                </div>
            </Link>
        </motion.li>
    );
};

const sidebarVariants: Variants = {
    open: (dimensions = { height: 1000, width: 1000 }) => ({
        clipPath: `circle(${Math.max(dimensions.height, dimensions.width) * 2 + 200}px at calc(100% - 40px) 40px)`,
        transition: {
            type: "spring",
            stiffness: 20,
            restDelta: 2,
        },
    }),
    closed: {
        clipPath: "circle(30px at calc(100% - 40px) 40px)",
        transition: {
            delay: 0.2,
            type: "spring",
            stiffness: 400,
            damping: 40,
        },
    },
};

interface PathProps {
    d?: string;
    variants: Variants;
    transition?: { duration: number };
}

const Path = (props: PathProps) => <motion.path fill="transparent" strokeWidth="3" stroke="hsl(0, 0%, 18%)" strokeLinecap="round" {...props} />;

const MenuToggle = ({ toggle }: { toggle: () => void }) => (
    <button style={toggleContainer} onClick={toggle}>
        <svg width="23" height="23" viewBox="0 0 23 23">
            <Path
                variants={{
                    closed: { d: "M 2 2.5 L 20 2.5" },
                    open: { d: "M 3 16.5 L 17 2.5" },
                }}
            />
            <Path
                d="M 2 9.423 L 20 9.423"
                variants={{
                    closed: { opacity: 1 },
                    open: { opacity: 0 },
                }}
                transition={{ duration: 0.1 }}
            />
            <Path
                variants={{
                    closed: { d: "M 2 16.346 L 20 16.346" },
                    open: { d: "M 3 2.5 L 17 16.346" },
                }}
            />
        </svg>
    </button>
);

/**
 * ==============   Styles   ================
 */

const background: React.CSSProperties = {
    backgroundColor: "#f5f5f5",
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 300,
};

const toggleContainer: React.CSSProperties = {
    outline: "none",
    border: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    cursor: "pointer",
    position: "absolute",
    top: 18,
    right: 27,
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "transparent",
    zIndex: 10,
};

const list: React.CSSProperties = {
    listStyle: "none",
    padding: 25,
    margin: 0,
    position: "absolute",
    top: 80,
    right: 0,
    width: 230,
};

const listItem: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 0,
    margin: 0,
    listStyle: "none",
    marginBottom: 20,
    cursor: "pointer",
};

const textPlaceholder: React.CSSProperties = {
    borderRadius: 5,
    width: 200,
    height: 20,
    flex: 1,
    display: "flex",
    alignItems: "center",
    paddingRight: 10,
    justifyContent: "flex-end",
    textAlign: "right",
};

const linkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    width: "100%",
    justifyContent: "flex-end",
};

const useDimensions = (ref: React.RefObject<HTMLDivElement | null>) => {
    const dimensions = useRef({ width: 0, height: 0 });

    useEffect(() => {
        if (ref.current) {
            dimensions.current.width = ref.current.offsetWidth;
            dimensions.current.height = ref.current.offsetHeight;
        }
    }, [ref]);

    return dimensions.current;
};

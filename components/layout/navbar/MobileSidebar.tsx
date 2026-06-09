// components/ui/MenuSidebar.tsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
    id: number;
    title: string;
    name: string;
    url: string;
    dropdown: boolean;
}

interface MenuSidebarProps {
    menus?: MenuItem[];
}

export default function MenuSidebar({ menus }: MenuSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const defaultMenus: MenuItem[] = [
        { id: 1, title: "Home", name: "Home", url: "/", dropdown: false },
        { id: 2, title: "About Us", name: "About Us", url: "/about", dropdown: false },
        { id: 3, title: "Projects", name: "Projects", url: "/projects", dropdown: false },
        { id: 4, title: "Clients", name: "Clients", url: "/clients", dropdown: false },
        { id: 5, title: "Services", name: "Services", url: "/services", dropdown: false },
        { id: 6, title: "Teams", name: "Teams", url: "/teams", dropdown: false },
        { id: 7, title: "Awards", name: "Awards", url: "/awards", dropdown: false },
        { id: 8, title: "Blogs", name: "Blogs", url: "/blog", dropdown: false },
    ];

    const menuItems = menus || defaultMenus;

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={toggleMenu}
                className="fixed top-6 right-6 z-50 flex flex-col justify-center items-center w-8 h-8 bg-white hover:bg-gray-100 rounded-full transition-colors duration-300"
                aria-label="Toggle menu"
            >
                <motion.span animate={isOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3 }} className="block w-5 h-0.5 bg-gray-800 mb-1" />
                <motion.span animate={isOpen ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.2 }} className="block w-5 h-0.5 bg-gray-800 mb-1" />
                <motion.span animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3 }} className="block w-5 h-0.5 bg-gray-800" />
            </button>

            {/* Circular Background Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ clipPath: "circle(0px at calc(100% - 40px) 40px)" }}
                        animate={{ clipPath: "circle(150% at calc(100% - 40px) 40px)" }}
                        exit={{ clipPath: "circle(0px at calc(100% - 40px) 40px)" }}
                        transition={{
                            type: "spring",
                            stiffness: 20,
                            restDelta: 2,
                            duration: 0.6,
                        }}
                        className="fixed w-[80%] right-0 top-0 bg-white z-40"
                    >
                        {/* Menu Items */}
                        <nav className="h-screen flex items-start justify-center">
                            <ul className="space-y-0 mt-14">
                                {menuItems.map((menu, index) => (
                                    <motion.li
                                        key={menu.id}
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 50, opacity: 0 }}
                                        transition={{
                                            delay: index * 0.05 + 0.2,
                                            duration: 0.4,
                                            ease: "easeOut",
                                        }}
                                        className="text-center"
                                    >
                                        <Link
                                            href={menu.url}
                                            onClick={toggleMenu}
                                            className={`relative block py-3 px-8 text-lg tracking-wide font-helvetica font-semibold rounded-lg after:absolute after:left-1/2 after:-translate-x-1/2 after:bottom-0 after:w-1/2 after:rounded-full after:bg-black transition-all duration-200 ${
                                                pathname === menu.url ? "text-primary scale-110 after:h-0.75 mb-1" : "text-gray-700 hover:text-primary hover:scale-105 after:h-0 mb-0"
                                            }`}
                                        >
                                            {menu.name}
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

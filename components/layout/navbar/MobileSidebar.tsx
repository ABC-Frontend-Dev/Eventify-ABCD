"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ContactModal from "../Contact/ContactModal";

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
    const [contactOpen, setContactOpen] = useState(false);
    const pathname = usePathname();

    const defaultMenus: MenuItem[] = [
        { id: 1, title: "Home", name: "Home", url: "/", dropdown: false },
        { id: 2, title: "About Us", name: "About Us", url: "#about-us", dropdown: false },
        { id: 3, title: "Projects", name: "Projects", url: "#", dropdown: false },
        { id: 4, title: "Clients", name: "Clients", url: "#our-clients", dropdown: false },
        { id: 5, title: "Services", name: "Services", url: "#our-services", dropdown: false },
        { id: 6, title: "Teams", name: "Teams", url: "#teams", dropdown: false },
        { id: 7, title: "Awards", name: "Awards", url: "#awards", dropdown: false },
        { id: 8, title: "Blogs", name: "Blogs", url: "#blogs", dropdown: false },
    ];

    const menuItems = menus || defaultMenus;

    const toggleMenu = () => setIsOpen((prev) => !prev);
    const closeMenu = () => setIsOpen(false);

    return (
        <>
            {/* ── Hamburger Button ─────────────────────────────────────────── */}
            <button onClick={toggleMenu} className="z-50 flex flex-col justify-center items-center w-5.5 h-5.5 bg-transparent rounded-full transition-colors duration-300" aria-label="Toggle menu">
                <motion.span animate={isOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3 }} className="block w-5 h-0.5 bg-gray-800 mb-1" />
                <motion.span animate={isOpen ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.2 }} className="block w-5 h-0.5 bg-gray-800 mb-1" />
                <motion.span animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} transition={{ duration: 0.3 }} className="block w-5 h-0.5 bg-gray-800" />
            </button>

            {/* ── Backdrop ─────────────────────────────────────────────────── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/30 z-30"
                        onClick={closeMenu}
                    />
                )}
            </AnimatePresence>

            {/* ── Sliding Sidebar Panel ─────────────────────────────────────── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="sidebar"
                        initial={{ clipPath: "circle(0px at calc(100% - 40px) 40px)" }}
                        animate={{ clipPath: "circle(150% at calc(100% - 40px) 40px)" }}
                        exit={{ clipPath: "circle(0px at calc(100% - 40px) 40px)" }}
                        transition={{
                            type: "spring",
                            stiffness: 20,
                            restDelta: 2,
                            duration: 0.6,
                        }}
                        className="fixed w-[70%] right-0 top-0 bg-white z-40 shadow-xl"
                    >
                        {/* ── Close Button ─────────────────────────────────── */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: 0.2, duration: 0.2 }}
                            onClick={closeMenu}
                            className="absolute top-4 right-4 z-50 flex items-center justify-center
                                w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200
                                text-gray-600 hover:text-gray-900 transition-colors duration-200"
                            aria-label="Close menu"
                        >
                            <X className="h-4 w-4" />
                        </motion.button>

                        {/* ── Nav Content ──────────────────────────────────── */}
                        <nav className="h-screen pl-6 pr-6 flex flex-col items-start justify-between">
                            <div className="w-full">
                                <div className="mt-14 w-full">
                                    <p className="pb-1 border-b border-b-gray-600 text-sm text-gray-600">Menu</p>
                                </div>
                                {/* Menu Items */}
                                <ul className="space-y-3.5 mt-4 w-full">
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
                                        >
                                            <Link
                                                href={menu.url}
                                                onClick={closeMenu}
                                                className={`relative block py-0 px-0 text-sm sm:text-lg text-left
                                                tracking-wide font-helvetica transition-all duration-200
                                                ${pathname === menu.url ? "font-helvetica-medium text-footer-bg" : "text-gray-600 font-helvetica"}`}
                                            >
                                                {menu.name}
                                            </Link>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>
                            {/* ── Let's Connect Button ──────────────────────── */}
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 30, opacity: 0 }}
                                transition={{
                                    delay: menuItems.length * 0.05 + 0.3,
                                    duration: 0.4,
                                    ease: "easeOut",
                                }}
                                className="mb-4"
                            >
                                <button
                                    className="group relative overflow-hidden inline-flex cursor-pointer w-full items-center justify-center gap-1.5 rounded-[5px]
                                        font-helvetica-neue-roman will-change-transform hover:opacity-95
                                        border border-gray-200"
                                    style={{
                                        fontSize: "14px",
                                        padding: "0.6rem 1.75rem",
                                        height: "40px",
                                        backgroundColor: "white",
                                        color: "black",
                                        transition: "background-color 0.3s ease, color 0.3s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = "#7e0acb";
                                        e.currentTarget.style.color = "white";
                                        e.currentTarget.style.borderColor = "#7e0acb";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "white";
                                        e.currentTarget.style.color = "black";
                                        e.currentTarget.style.borderColor = "#e5e7eb";
                                    }}
                                    onClick={() => {
                                        closeMenu();
                                        // small delay so sidebar closes before modal opens
                                        setTimeout(() => setContactOpen(true), 300);
                                    }}
                                >
                                    <span className="relative block overflow-hidden whitespace-nowrap text-center" style={{ minWidth: "110px" }}>
                                        <span
                                            className="block transition-transform duration-500
                                                ease-[cubic-bezier(0.76,0,0.24,1)]
                                                group-hover:-translate-x-full"
                                        >
                                            Let's Connect
                                        </span>
                                        <span
                                            aria-hidden="true"
                                            className="absolute inset-0 flex items-center justify-center
                                                translate-x-full transition-transform duration-500
                                                ease-[cubic-bezier(0.76,0,0.24,1)]
                                                group-hover:translate-x-0"
                                        >
                                            Let's Connect
                                        </span>
                                    </span>
                                </button>
                            </motion.div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Contact Modal ─────────────────────────────────────────────── */}
            <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
        </>
    );
}

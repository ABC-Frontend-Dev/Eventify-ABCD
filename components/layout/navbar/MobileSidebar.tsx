"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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

declare global {
    interface Window {
        __pendingHash?: string;
    }
}

export default function MenuSidebar({ menus }: MenuSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>("");
    const pathname = usePathname();

    const defaultMenus: MenuItem[] = [
        { id: 1, title: "Home", name: "Home", url: "/", dropdown: false },
        { id: 2, title: "About Us", name: "About Us", url: "/#about-us", dropdown: false },
        { id: 3, title: "Clients", name: "Clients", url: "/#our-clients", dropdown: false },
        { id: 4, title: "Services", name: "Services", url: "/#our-services", dropdown: false },
        { id: 5, title: "Teams", name: "Teams", url: "/#teams", dropdown: false },
        { id: 6, title: "Projects", name: "Projects", url: "/#projects", dropdown: false },
        { id: 7, title: "Awards", name: "Awards", url: "/#awards", dropdown: false },
        { id: 8, title: "Blogs", name: "Blogs", url: "/#blogs", dropdown: false },
    ];

    const menuItems = menus || defaultMenus;

    /* ── 1. Lock body scroll while sidebar is open (iOS-safe) ─────────── */
    useEffect(() => {
        if (typeof document === "undefined") return;
        if (!isOpen) return;

        const scrollY = window.scrollY;
        const body = document.body;

        body.style.position = "fixed";
        body.style.top = `-${scrollY}px`;
        body.style.left = "0";
        body.style.right = "0";
        body.style.width = "100%";
        body.style.overflow = "hidden";
        body.style.touchAction = "none";

        return () => {
            body.style.position = "";
            body.style.top = "";
            body.style.left = "";
            body.style.right = "";
            body.style.width = "";
            body.style.overflow = "";
            body.style.touchAction = "";
            window.scrollTo(0, scrollY);
        };
    }, [isOpen]);

    /* ── 2. Scroll-spy via IntersectionObserver ───────────────────────── */
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Parse ids from BOTH "#id" and "/#id" forms so the observer matches
        // the same hash strings the menu URLs produce.
        const ids = menuItems
            .map((m) => {
                const i = m.url.indexOf("#");
                return i >= 0 ? m.url.slice(i + 1) : "";
            })
            .filter(Boolean);

        if (ids.length === 0) return;

        const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
        if (elements.length === 0) return;

        const visible = new Map<string, number>();

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        visible.set(entry.target.id, entry.intersectionRatio);
                    } else {
                        visible.delete(entry.target.id);
                    }
                });

                if (visible.size > 0) {
                    let topId = "";
                    let topRatio = 0;
                    visible.forEach((ratio, id) => {
                        if (ratio > topRatio) {
                            topRatio = ratio;
                            topId = id;
                        }
                    });
                    setActiveSection(topId);
                } else {
                    const allBelowViewportTop = elements.every((el) => el.getBoundingClientRect().top > window.innerHeight * 0.35);
                    if (allBelowViewportTop) {
                        setActiveSection(""); // Home
                    } else {
                        const last = elements.map((el) => ({ id: el.id, top: el.getBoundingClientRect().top })).sort((a, b) => b.top - a.top)[0];
                        setActiveSection(last?.id ?? "");
                    }
                }
            },
            { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [menuItems]);

    const toggleMenu = () => setIsOpen((prev) => !prev);
    const closeMenu = () => setIsOpen(false);

    /* ── 3. Determine which menu item is "active" right now ───────────── */
    const hashOf = (url: string) => {
        const i = url.indexOf("#");
        return i >= 0 ? url.slice(i + 1) : "";
    };

    const isActive = (menu: MenuItem): boolean => {
        // On a non-home route, fall back to pathname comparison
        if (pathname !== "/" && pathname !== "") {
            return pathname === menu.url;
        }

        // On the home route
        if (menu.url === "/") return activeSection === "";
        const hash = hashOf(menu.url);
        if (!hash) return false;
        return activeSection === hash;
    };

    /* ── 4. Stash the hash on click so the loader can pick it up on cross-page nav */
    const handleNavClick = (url: string) => {
        const hash = hashOf(url);
        if (hash) window.__pendingHash = hash;
        closeMenu();
    };

    return (
        <>
            {/* ── Hamburger Button ─────────────────────────────────────────── */}
            <button
                onClick={toggleMenu}
                className="z-50 flex flex-col justify-center items-center w-5.5 h-5.5 bg-transparent rounded-full transition-colors duration-300"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
            >
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
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "tween", duration: 0.45, ease: [0.76, 0, 0.24, 1] }}
                        className="fixed w-full left-0 top-0 bg-white z-40 shadow-xl overflow-y-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: 0.15, duration: 0.3 }}
                            className="absolute top-4.5 left-6 z-50"
                        >
                            <Image
                                src="https://res.cloudinary.com/afdhm38k/image/upload/v1785754539/logo-dark_ymjn39.png"
                                alt="Eventify Logo"
                                width={140}
                                height={25}
                                className="h-6.25 w-auto object-contain"
                                priority
                            />
                        </motion.div>

                        <motion.button
                            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                            transition={{
                                delay: 0.2,
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                            }}
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={closeMenu}
                            className="absolute top-5 right-4 z-50 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-primary text-gray-600 hover:text-white cursor-pointer group"
                            aria-label="Close menu"
                        >
                            <X className="h-4 w-4 text-footer-bg group-hover:text-white transition-colors duration-200" />
                        </motion.button>

                        <nav className="min-h-screen pl-6 pr-6 flex flex-col items-start justify-between">
                            <div className="w-full">
                                <ul className="space-y-3 mt-18 w-full">
                                    {menuItems.map((menu, index) => {
                                        const active = isActive(menu);
                                        return (
                                            <motion.li
                                                key={menu.id}
                                                initial={{ y: 50, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                exit={{ y: 50, opacity: 0 }}
                                                transition={{ delay: index * 0.05 + 0.2, duration: 0.4, ease: "easeOut" }}
                                                className="relative"
                                            >
                                                <Link
                                                    href={menu.url}
                                                    onClick={() => handleNavClick(menu.url)}
                                                    className={`relative block py-1 text-sm sm:text-lg text-center tracking-wide transition-all duration-300 hover:text-primary ${active ? "font-helvetica-medium text-primary" : "text-gray-600 font-helvetica"}`}
                                                >
                                                    {menu.name}
                                                </Link>
                                            </motion.li>
                                        );
                                    })}
                                </ul>

                                <motion.div
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 30, opacity: 0 }}
                                    transition={{ delay: menuItems.length * 0.05 + 0.3, duration: 0.4, ease: "easeOut" }}
                                    className="mb-4"
                                >
                                    <button
                                        className="mt-6 group relative overflow-hidden inline-flex cursor-pointer max-w-full w-full sm:max-w-3xs sm:mx-auto sm:block items-center justify-center gap-1.5 rounded-[5px] font-helvetica-neue-roman will-change-transform hover:opacity-95 border border-gray-200"
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
                                            setTimeout(() => setContactOpen(true), 300);
                                        }}
                                    >
                                        <span className="relative block overflow-hidden whitespace-nowrap text-center" style={{ minWidth: "110px" }}>
                                            <span className="block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-x-full">Let&apos;s Connect</span>
                                            <span
                                                aria-hidden="true"
                                                className="absolute inset-0 flex items-center justify-center translate-x-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0"
                                            >
                                                Let&apos;s Connect
                                            </span>
                                        </span>
                                    </button>
                                </motion.div>
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
        </>
    );
}

// // components/layout/navbar/NavbarMenu.tsx
"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/ui/navbar";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import ContactModal from "../Contact/ContactModal";
import { ShineButton } from "@/components/lightswind/shine-button";

type NavbarMenuProps = {
    isScrolled: boolean;
    activeSection: string | null;
};

const morphTransition = {
    type: "spring" as const,
    stiffness: 380,
    damping: 38,
    mass: 0.9,
    bounce: 0,
};

export default function NavbarMenu({ isScrolled, activeSection }: NavbarMenuProps) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const menus = [
        { id: 1, title: "Home", name: "Home", url: "/", dropdown: false },
        {
            id: 2,
            title: "About Us",
            name: "About Us",
            url: "/#about-us",
            sectionId: "about-us",
            dropdown: false,
        },
        {
            id: 3,
            title: "Clients",
            name: "Clients",
            url: "/#our-clients",
            sectionId: "our-clients",
            dropdown: false,
        },
        {
            id: 4,
            title: "Services",
            name: "Services",
            url: "/#our-services",
            sectionId: "our-services",
            dropdown: false,
        },
        {
            id: 5,
            title: "Teams",
            name: "Teams",
            url: "/#teams",
            sectionId: "teams",
            dropdown: false,
        },
        { id: 6, title: "Projects", name: "Projects", sectionId: "projects", url: "/#projects", dropdown: false },
        {
            id: 7,
            title: "Awards",
            name: "Awards",
            url: "/#awards",
            sectionId: "awards",
            dropdown: false,
        },
        { id: 8, title: "Blogs", name: "Blogs", sectionId: "blogs", url: "/#blogs", dropdown: false },
    ];

    return (
        <LayoutGroup id={`contact-modal-flow-${pathname}`}>
            <div className="flex gap-2">
                <NavBar list={menus} currentPath={pathname} isScrolled={isScrolled} activeSection={activeSection} />

                <AnimatePresence initial={false} mode="popLayout">
                    {!open && (
                        <motion.div key="contact-trigger" layoutId="contact-modal-shell" transition={{ layout: morphTransition }} whileTap={{ scale: 0.985 }}>
                            {/* <ShineButton label="Let's Connect" size="md" bgColor="linear-gradient(325deg, #57068C 0%, #bd76eb 55%, #57068C 90%)" onClick={() => setOpen(true)} /> */}
                            <button
                                className="group relative overflow-hidden inline-flex cursor-pointer items-center justify-center gap-1.5 font-helvetica-neue-roman will-change-transform hover:opacity-95 border border-footer-bg/20"
                                style={{
                                    backgroundSize: "280% auto",
                                    backgroundPosition: "left top",
                                    transition: "background-position 0.8s ease, opacity 0.2s",
                                    fontSize: "14px",
                                    padding: "0.4rem 1.75rem",
                                    height: "40px",
                                    backgroundColor: "white",
                                    color: "black",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#7e0acb";
                                    e.currentTarget.style.color = "white";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "white";
                                    e.currentTarget.style.color = "black";
                                }}
                                onClick={() => setOpen(true)}
                            >
                                <span className="relative block overflow-hidden whitespace-nowrap text-center" style={{ minWidth: "90px" }}>
                                    <span className="block transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-x-full"><span className="translate-y-px">Let's Connect</span></span>
                                    <span
                                        aria-hidden="true"
                                        className="absolute inset-0 flex items-center justify-center translate-x-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-0"
                                    >
                                        <span className="translate-y-px">Let's Connect</span>
                                    </span>
                                </span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ContactModal isOpen={open} onClose={() => setOpen(false)} />
            </div>
        </LayoutGroup>
    );
}

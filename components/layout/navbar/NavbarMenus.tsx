"use client";

import { usePathname } from "next/navigation";
import NavBar from "@/components/ui/navbar";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import ContactModal from "../Contact/ContactModal";
import { PhoneIconForHeader } from "@/components/icons/PhoneIconForHeader";

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
            url: "#about-us",
            sectionId: "about-us",
            dropdown: false,
        },
        { id: 3, title: "Projects", name: "Projects", url: "#", dropdown: false },
        {
            id: 4,
            title: "Clients",
            name: "Clients",
            url: "#our-clients",
            sectionId: "our-clients",
            dropdown: false,
        },
        {
            id: 5,
            title: "Services",
            name: "Services",
            url: "#our-services",
            sectionId: "our-services",
            dropdown: false,
        },
        {
            id: 6,
            title: "Teams",
            name: "Teams",
            url: "#teams",
            sectionId: "teams",
            dropdown: false,
        },
        {
            id: 7,
            title: "Awards",
            name: "Awards",
            url: "#awards",
            sectionId: "awards",
            dropdown: false,
        },
        { id: 8, title: "Blogs", name: "Blogs", url: "/blogs", dropdown: false },
    ];

    return (
        <LayoutGroup id="contact-modal-flow">
            <div className="flex gap-2">
                <NavBar list={menus} currentPath={pathname} isScrolled={isScrolled} activeSection={activeSection} />

                <AnimatePresence initial={false} mode="popLayout">
                    {!open && (
                        <motion.button
                            key="contact-trigger"
                            layoutId="contact-modal-shell"
                            onClick={() => setOpen(true)}
                            transition={{ layout: morphTransition }}
                            className="flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[5px]
    bg-[linear-gradient(0deg,#6009F0_0%,#8105F0_100%)]
    shadow-[inset_2px_2px_2px_0_rgba(255,255,255,0.5),7px_7px_20px_0_rgba(0,0,0,0.1),4px_4px_5px_0_rgba(0,0,0,0.1)] px-3.5 py-2 text-sm text-white font-product-sans-regular transition-opacity duration-200 will-change-transform hover:opacity-95"
                            whileTap={{ scale: 0.985 }}
                        >
                            <span>Begin Your Project</span>
                            <span className="shrink-0">
                                <PhoneIconForHeader />
                            </span>
                        </motion.button>
                    )}
                </AnimatePresence>

                <ContactModal isOpen={open} onClose={() => setOpen(false)} />
            </div>
        </LayoutGroup>
    );
}

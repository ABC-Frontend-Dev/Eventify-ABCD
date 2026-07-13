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
        <LayoutGroup id={`contact-modal-flow-${pathname}`}>
            {" "}
            {/* 👈 scoped per route */}
            <div className="flex gap-2">
                <NavBar list={menus} currentPath={pathname} isScrolled={isScrolled} activeSection={activeSection} />

                <AnimatePresence initial={false} mode="popLayout">
                    {!open && (
                        <motion.div key="contact-trigger" layoutId="contact-modal-shell" transition={{ layout: morphTransition }} whileTap={{ scale: 0.985 }}>
                            <ShineButton label="Begin Your Project" size="md" bgColor="linear-gradient(325deg, #57068C 0%, #bd76eb 55%, #57068C 90%)" onClick={() => setOpen(true)} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <ContactModal isOpen={open} onClose={() => setOpen(false)} />
            </div>
        </LayoutGroup>
    );
}

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
        { id: 3, title: "Projects", name: "Projects", url: "#projects", dropdown: false },
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
        { id: 8, title: "Blogs", name: "Blogs", url: "#blogs", dropdown: false },
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
                            {/* <ShineButton label="Let's Connect" size="md" bgColor="linear-gradient(325deg, #57068C 0%, #bd76eb 55%, #57068C 90%)" onClick={() => setOpen(true)} /> */}
                            <button
                                className="relative overflow-hidden inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] px-3.5 py-2 text-sm text-white bg-primary hover:bg-primary/80 transition-colors font-helvetica-neue-roman will-change-transform hover:opacity-95 "
                                style={{
                                    // backgroundImage: "linear-gradient(325deg, #57068C 0%, #bd76eb 55%, #57068C 90%)",
                                    backgroundSize: "280% auto",
                                    backgroundPosition: "left top",
                                    transition: "background-position 0.8s ease, opacity 0.2s",
                                    fontSize: "14px",
                                    padding: "0.6rem 1.4rem",
                                }}
                            >
                                Let's Connect
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M15.6002 14.5215C13.2052 17.0421 7.09606 10.9878 9.50019 8.45753C10.9681 6.91263 9.30988 5.14707 8.39205 3.84934C6.66948 1.41378 2.88796 4.77641 3.0028 6.91544C3.36497 13.6609 10.6618 21.6546 17.7278 20.9574C19.9383 20.7393 22.4781 16.7471 19.9426 15.2882C18.6747 14.5587 16.9345 13.1172 15.6002 14.5215Z"
                                        stroke="white"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    ></path>
                                    <path d="M14 3C15.8565 3 17.637 3.7375 18.9497 5.05025C20.2625 6.36301 21 8.14348 21 10" stroke="white" stroke-linecap="round" stroke-linejoin="round"></path>
                                    <path d="M14 7C14.7956 7 15.5587 7.31607 16.1213 7.87868C16.6839 8.44129 17 9.20435 17 10" stroke="white" stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ContactModal isOpen={open} onClose={() => setOpen(false)} />
            </div>
        </LayoutGroup>
    );
}

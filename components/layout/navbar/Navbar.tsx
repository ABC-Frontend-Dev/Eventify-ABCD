// components/layout/navbar/Navbar.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import NavbarMenu from "./NavbarMenus";
import MobileSidebar from "./MobileSidebar";
import Link from "next/link";
import { useActiveSection } from "@/hooks/useActiveSection";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();

    const sectionIds = useMemo(() => ["about-us", "our-clients", "our-services", "teams", "awards", "projects", "blogs"], []);

    const activeSection = useActiveSection(sectionIds);

    useEffect(() => {
        console.log("Navbar mounted");
        return () => console.log("Navbar unmounted");
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        console.log("Navbar mounted");
        return () => console.log("Navbar unmounted");
    }, []);

    const defaultLogos = {
        default: "https://res.cloudinary.com/afdhm38k/image/upload/v1787295544/eventify-light-logo-with-uae-ksa_m8nbd3.png",
        scrolled: "https://res.cloudinary.com/afdhm38k/image/upload/v1787295544/eventify-dark-logo-with-uae-ksa_ht3x8v.png",
    };

    const getLogosForPage = () => {
        if (pathname.startsWith("/blog")) {
            return {
                default: "https://res.cloudinary.com/afdhm38k/image/upload/v1787295544/eventify-dark-logo-with-uae-ksa_ht3x8v.png",
                scrolled: "https://res.cloudinary.com/afdhm38k/image/upload/v1787295544/eventify-dark-logo-with-uae-ksa_ht3x8v.png",
            };
        }
        if (pathname.startsWith("/services")) {
            return {
                default: "https://res.cloudinary.com/afdhm38k/image/upload/v1787295544/eventify-dark-logo-with-uae-ksa_ht3x8v.png",
                scrolled: "https://res.cloudinary.com/afdhm38k/image/upload/v1787295544/eventify-dark-logo-with-uae-ksa_ht3x8v.png",
            };
        }
        return defaultLogos;
    };

    const logo = getLogosForPage();

    return (
        <header
            className={`fixed top-0 left-0 w-[99.9999%] h-16 lg:h-fit flex items-center justify-between px-4 sm:px-2.5 lg:px-10 xl:px-20 py-4 lg:py-3 z-[100] transition-all duration-300 ${
                isScrolled ? "bg-white/50 backdrop-blur-xs" : "bg-transparent"
            }`}
        >
            <div className="shrink-0 max-w-40 sm:max-w-48 md:max-w-52">
                <Link href={"/"} className="w-full h-12 block">
                    <Image
                        src={isScrolled ? logo.scrolled || logo.default : logo.default}
                        alt="Logo"
                        width={1000}
                        height={1000}
                        className="w-full h-full object-contain transition-all duration-300"
                        priority
                    />
                </Link>
            </div>
            <nav className="shrink-0">
                <div className="hidden xl:block overflow-hidden">
                    <NavbarMenu isScrolled={isScrolled} activeSection={activeSection} />
                </div>
                <div className="xl:hidden">
                    <MobileSidebar />
                </div>
            </nav>
        </header>
    );
}

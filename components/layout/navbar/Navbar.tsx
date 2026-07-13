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

    const sectionIds = useMemo(() => ["about-us", "our-clients", "our-services", "teams", "awards"], []);

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
        default: "/images/logo-light.png",
        scrolled: "/images/logo-dark.png",
    };

    const getLogosForPage = () => {
        if (pathname.startsWith("/blog")) {
            return {
                default: "/images/logo-dark.png",
                scrolled: "/images/logo-dark.png",
            };
        }
        if (pathname.startsWith("/services")) {
            return {
                default: "/images/logo-dark.png",
                scrolled: "/images/logo-dark.png",
            };
        }
        return defaultLogos;
    };

    const logo = getLogosForPage();

    return (
        <header
            className={`fixed top-0 left-0 w-full h-16 lg:h-fit flex items-center justify-between px-4 sm:px-6 lg:px-20 py-4 lg:py-3 z-[100] transition-all duration-300 ${
                isScrolled ? "bg-white/50 backdrop-blur-xs" : "bg-transparent"
            }`}
        >
            <div className="shrink-0 max-w-[150px] sm:max-w-[180px]">
                <Link href={"/"}>
                    <Image
                        src={isScrolled ? logo.scrolled || logo.default : logo.default}
                        alt="Logo"
                        width={156}
                        height={34}
                        className="w-full h-auto object-contain transition-all duration-300"
                        priority
                    />
                </Link>
            </div>
            <nav className="shrink-0">
                <div className="hidden lg:block overflow-hidden">
                    <NavbarMenu isScrolled={isScrolled} activeSection={activeSection} />
                </div>
                <div className="lg:hidden">
                    <MobileSidebar />
                </div>
            </nav>
        </header>
    );
}
